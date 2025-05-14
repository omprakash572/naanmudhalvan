from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
import databases
import sqlalchemy
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database setup
DATABASE_URL = "sqlite:///./energy_monitor.db"
database = databases.Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

# Define database models
users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String, unique=True),
    sqlalchemy.Column("hashed_password", sqlalchemy.String),
)

devices = sqlalchemy.Table(
    "devices",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("name", sqlalchemy.String),
    sqlalchemy.Column("type", sqlalchemy.String),
    sqlalchemy.Column("status", sqlalchemy.Boolean),
    sqlalchemy.Column("power_usage", sqlalchemy.Float),
    sqlalchemy.Column("user_id", sqlalchemy.ForeignKey("users.id")),
)

energy_usage = sqlalchemy.Table(
    "energy_usage",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("device_id", sqlalchemy.ForeignKey("devices.id")),
    sqlalchemy.Column("timestamp", sqlalchemy.DateTime),
    sqlalchemy.Column("usage_value", sqlalchemy.Float),
)

# Create database engine
engine = sqlalchemy.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
metadata.create_all(engine)

# FastAPI app setup
app = FastAPI(title="Energy Monitor API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security setup
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class User(BaseModel):
    username: str
    password: str

class Device(BaseModel):
    name: str
    type: str
    status: bool = False
    power_usage: float = 0.0

class EnergyUsage(BaseModel):
    device_id: int
    usage_value: float
    timestamp: datetime

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    query = users.select().where(users.c.username == token_data.username)
    user = await database.fetch_one(query)
    if user is None:
        raise credentials_exception
    return user

# Database connection
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Authentication endpoints
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    query = users.select().where(users.c.username == form_data.username)
    user = await database.fetch_one(query)
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register")
async def register(user: User):
    query = users.select().where(users.c.username == user.username)
    existing_user = await database.fetch_one(query)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    query = users.insert().values(username=user.username, hashed_password=hashed_password)
    await database.execute(query)
    return {"message": "User created successfully"}

# Device endpoints
@app.post("/devices")
async def create_device(device: Device, current_user: dict = Depends(get_current_user)):
    query = devices.insert().values(
        name=device.name,
        type=device.type,
        status=device.status,
        power_usage=device.power_usage,
        user_id=current_user["id"]
    )
    device_id = await database.execute(query)
    return {"id": device_id, **device.dict()}

@app.get("/devices")
async def get_devices(current_user: dict = Depends(get_current_user)):
    query = devices.select().where(devices.c.user_id == current_user["id"])
    return await database.fetch_all(query)

@app.put("/devices/{device_id}/status")
async def update_device_status(
    device_id: int,
    status: bool,
    current_user: dict = Depends(get_current_user)
):
    query = devices.update()\
        .where(devices.c.id == device_id)\
        .where(devices.c.user_id == current_user["id"])\
        .values(status=status)
    await database.execute(query)
    return {"message": "Device status updated"}

# Energy usage endpoints
@app.post("/energy-usage")
async def record_energy_usage(
    usage: EnergyUsage,
    current_user: dict = Depends(get_current_user)
):
    # Verify device belongs to user
    query = devices.select()\
        .where(devices.c.id == usage.device_id)\
        .where(devices.c.user_id == current_user["id"])
    device = await database.fetch_one(query)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    query = energy_usage.insert().values(
        device_id=usage.device_id,
        usage_value=usage.usage_value,
        timestamp=usage.timestamp
    )
    usage_id = await database.execute(query)
    return {"id": usage_id, **usage.dict()}

@app.get("/energy-usage/{device_id}")
async def get_device_energy_usage(
    device_id: int,
    start_date: datetime,
    end_date: datetime,
    current_user: dict = Depends(get_current_user)
):
    # Verify device belongs to user
    query = devices.select()\
        .where(devices.c.id == device_id)\
        .where(devices.c.user_id == current_user["id"])
    device = await database.fetch_one(query)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    query = energy_usage.select()\
        .where(energy_usage.c.device_id == device_id)\
        .where(energy_usage.c.timestamp >= start_date)\
        .where(energy_usage.c.timestamp <= end_date)
    return await database.fetch_all(query)

@app.get("/total-energy-usage")
async def get_total_energy_usage(
    start_date: datetime,
    end_date: datetime,
    current_user: dict = Depends(get_current_user)
):
    query = sqlalchemy.select([sqlalchemy.func.sum(energy_usage.c.usage_value)])\
        .select_from(
            energy_usage.join(devices, energy_usage.c.device_id == devices.c.id)
        )\
        .where(devices.c.user_id == current_user["id"])\
        .where(energy_usage.c.timestamp >= start_date)\
        .where(energy_usage.c.timestamp <= end_date)
    result = await database.fetch_one(query)
    return {"total_usage": result[0] or 0}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 

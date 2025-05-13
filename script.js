// Navigation functionality
document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and sections
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('main section').forEach(section => section.classList.add('hidden'));
        
        // Add active class to clicked button and corresponding section
        button.classList.add('active');
        document.getElementById(button.dataset.section).classList.remove('hidden');
    });
});

// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-message');
const minimizeButton = document.getElementById('minimize-chat');

// Chatbot responses
const botResponses = {
    'hello': 'Hello! How can I help you optimize your home\'s energy usage today?',
    'energy': 'I can help you monitor and optimize your energy usage. Would you like to see your current consumption or get energy-saving tips?',
    'tips': 'Here are some energy-saving tips:\n1. Set your thermostat to 22°C for optimal comfort and efficiency\n2. Use LED bulbs instead of traditional ones\n3. Unplug devices when not in use\n4. Use natural light during the day',
    'usage': 'Your current energy usage is 2.4 kWh. This is 15% lower than yesterday!',
    'default': 'I\'m here to help you optimize your home\'s energy usage. You can ask me about:\n- Current energy consumption\n- Energy-saving tips\n- Device control\n- Energy analytics'
};

// Function to add a message to the chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isUser ? 'user' : 'bot');
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to get bot response
function getBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(botResponses)) {
        if (message.includes(key)) {
            return response;
        }
    }
    
    return botResponses.default;
}

// Send message function
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        
        // Simulate bot thinking
        setTimeout(() => {
            const response = getBotResponse(message);
            addMessage(response);
        }, 1000);
    }
}

// Event listeners for chat
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Minimize chat
let isMinimized = false;
minimizeButton.addEventListener('click', () => {
    const chatContainer = document.querySelector('.chat-container');
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input');
    
    if (isMinimized) {
        chatMessages.style.display = 'block';
        chatInput.style.display = 'flex';
        minimizeButton.innerHTML = '<i class="fas fa-minus"></i>';
    } else {
        chatMessages.style.display = 'none';
        chatInput.style.display = 'none';
        minimizeButton.innerHTML = '<i class="fas fa-plus"></i>';
    }
    
    isMinimized = !isMinimized;
});

// Energy Chart
const ctx = document.getElementById('energyChart').getContext('2d');
const energyChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
        datasets: [{
            label: 'Energy Usage (kWh)',
            data: [1.2, 0.8, 0.6, 1.5, 2.1, 2.4, 2.8, 2.2],
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Daily Energy Consumption'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'kWh'
                }
            }
        }
    }
});

// Simulate real-time energy data updates
function updateEnergyData() {
    const currentUsage = document.querySelector('.stat-card:nth-child(1) .value');
    const solarGeneration = document.querySelector('.stat-card:nth-child(2) .value');
    const temperature = document.querySelector('.stat-card:nth-child(3) .value');
    
    // Simulate random fluctuations
    const newUsage = (2.4 + (Math.random() - 0.5) * 0.4).toFixed(1);
    const newSolar = (1.8 + (Math.random() - 0.5) * 0.3).toFixed(1);
    const newTemp = (22 + (Math.random() - 0.5) * 2).toFixed(1);
    
    currentUsage.textContent = `${newUsage} kWh`;
    solarGeneration.textContent = `${newSolar} kWh`;
    temperature.textContent = `${newTemp}°C`;
}

// Update data every 5 seconds
setInterval(updateEnergyData, 5000);

// Device control functionality
document.querySelectorAll('.device-card input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
        const deviceName = e.target.closest('.device-card').querySelector('h3').textContent;
        const status = e.target.checked ? 'on' : 'off';
        addMessage(`I've turned ${deviceName} ${status}.`);
    });
});

// Temperature control functionality
function adjustTemp(change) {
    const tempValue = document.querySelector('.temp-value');
    const currentTemp = parseInt(tempValue.textContent);
    const newTemp = currentTemp + change;
    
    if (newTemp >= 16 && newTemp <= 30) {
        tempValue.textContent = `${newTemp}°C`;
        updateEnergyData();
        addMessage(`Temperature adjusted to ${newTemp}°C.`);
    }
}

// Enhanced device status updates
function updateDeviceStatus() {
    document.querySelectorAll('.device-card').forEach(card => {
        const checkbox = card.querySelector('input[type="checkbox"]');
        const statusDot = card.querySelector('.status-dot');
        const powerUsage = card.querySelector('.power-usage');
        const deviceName = card.querySelector('h3').textContent;
        
        if (checkbox.checked) {
            statusDot.classList.remove('offline');
            statusDot.classList.add('online');
            
            // Simulate power usage based on device type
            let usage = 0;
            switch(deviceName) {
                case 'Living Room Lights':
                    usage = Math.floor(Math.random() * 20) + 40; // 40-60W
                    break;
                case 'AC Unit':
                    usage = Math.floor(Math.random() * 500) + 1000; // 1000-1500W
                    break;
                case 'Smart TV':
                    usage = Math.floor(Math.random() * 50) + 100; // 100-150W
                    break;
                case 'Security Camera':
                    usage = Math.floor(Math.random() * 5) + 5; // 5-10W
                    break;
            }
            powerUsage.textContent = `${usage}W`;
        } else {
            statusDot.classList.remove('online');
            statusDot.classList.add('offline');
            powerUsage.textContent = '0W';
        }
    });
}

// Enhanced chatbot responses with device control
const enhancedBotResponses = {
    ...botResponses,
    'temperature': 'I can help you adjust the temperature. The optimal range is 20-24°C for energy efficiency.',
    'devices': 'Here are your connected devices:\n- Living Room Lights\n- AC Unit\n- Smart TV\n- Smart Thermostat\n- Smart Door Lock\n- Security Camera',
    'savings': 'Your current daily savings are $2.50, which is 15% better than yesterday!',
    'carbon': 'Your current carbon footprint is 2.1 kg, which is 8% lower than yesterday.',
    'schedule': 'Would you like to set up an energy-saving schedule for your devices?',
    'help': 'I can help you with:\n- Temperature control\n- Device management\n- Energy savings\n- Carbon footprint\n- Security settings\n- Energy scheduling',
    'turn on': 'Which device would you like to turn on?',
    'turn off': 'Which device would you like to turn off?',
    'status': 'I\'ll check the status of all devices for you.',
    'bill': 'Your current month\'s energy bill is $85.50, which is 12% lower than last month.',
    'cost': 'The average daily energy cost is $2.85.',
    'yearly': 'Your year-to-date energy cost is $256.50, which is 8% lower than last year.'
};

// Device control through chatbot
function controlDevice(deviceName, action) {
    const deviceCards = document.querySelectorAll('.device-card');
    let deviceFound = false;

    deviceCards.forEach(card => {
        const cardDeviceName = card.querySelector('h3').textContent;
        if (cardDeviceName.toLowerCase() === deviceName.toLowerCase()) {
            const checkbox = card.querySelector('input[type="checkbox"]');
            const statusDot = card.querySelector('.status-dot');
            const powerUsage = card.querySelector('.power-usage');
            
            if (action === 'on') {
                checkbox.checked = true;
                statusDot.classList.remove('offline');
                statusDot.classList.add('online');
                updateDeviceStatus();
                addMessage(`I've turned on the ${cardDeviceName}.`);
            } else if (action === 'off') {
                checkbox.checked = false;
                statusDot.classList.remove('online');
                statusDot.classList.add('offline');
                powerUsage.textContent = '0W';
                addMessage(`I've turned off the ${cardDeviceName}.`);
            }
            deviceFound = true;
        }
    });

    if (!deviceFound) {
        addMessage(`I couldn't find a device named "${deviceName}". Available devices are:\n- Living Room Lights\n- AC Unit\n- Smart TV\n- Smart Thermostat\n- Smart Door Lock\n- Security Camera`);
    }
}

// Enhanced getBotResponse function with device control
function getBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Check for device control commands
    if (message.includes('turn on')) {
        const deviceName = message.replace('turn on', '').trim();
        if (deviceName) {
            controlDevice(deviceName, 'on');
            return null; // Response is handled by controlDevice
        }
        return enhancedBotResponses['turn on'];
    }
    
    if (message.includes('turn off')) {
        const deviceName = message.replace('turn off', '').trim();
        if (deviceName) {
            controlDevice(deviceName, 'off');
            return null; // Response is handled by controlDevice
        }
        return enhancedBotResponses['turn off'];
    }
    
    if (message.includes('status')) {
        const statusMessage = getDeviceStatus();
        addMessage(statusMessage);
        return null;
    }
    
    // Check other responses
    for (const [key, response] of Object.entries(enhancedBotResponses)) {
        if (message.includes(key)) {
            return response;
        }
    }
    
    return enhancedBotResponses.help;
}

// Get status of all devices
function getDeviceStatus() {
    const deviceCards = document.querySelectorAll('.device-card');
    let statusMessage = 'Current device status:\n';
    
    deviceCards.forEach(card => {
        const deviceName = card.querySelector('h3').textContent;
        const checkbox = card.querySelector('input[type="checkbox]');
        const powerUsage = card.querySelector('.power-usage');
        const status = checkbox.checked ? 'ON' : 'OFF';
        
        statusMessage += `- ${deviceName}: ${status} (${powerUsage.textContent})\n`;
    });
    
    return statusMessage;
}

// Enhanced send message function
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        
        // Simulate bot thinking
        setTimeout(() => {
            const response = getBotResponse(message);
            if (response) {
                addMessage(response);
            }
        }, 1000);
    }
}

// Update energy insights
function updateEnergyInsights() {
    const savings = document.querySelector('.insight-card:nth-child(1) .value');
    const carbon = document.querySelector('.insight-card:nth-child(2) .value');
    const peakHours = document.querySelector('.insight-card:nth-child(3) .value');
    
    // Simulate random fluctuations
    const newSavings = (2.5 + (Math.random() - 0.5) * 0.5).toFixed(2);
    const newCarbon = (2.1 + (Math.random() - 0.5) * 0.3).toFixed(1);
    
    savings.textContent = `$${newSavings}`;
    carbon.textContent = `${newCarbon} kg`;
}

// Update all data periodically
setInterval(() => {
    updateEnergyData();
    updateDeviceStatus();
    updateEnergyInsights();
}, 5000);

// Initialize device status
updateDeviceStatus();

// Bills section functionality
document.querySelectorAll('.bills-tabs .tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        document.querySelectorAll('.bills-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.bills-content .tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}-bills`).classList.add('active');
    });
});

// Generate random bill data
function generateRandomBillData(days) {
    const data = [];
    const labels = [];
    let currentDate = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        data.push((Math.random() * 5 + 1).toFixed(2)); // Random value between 1 and 6
    }
    
    return { labels, data };
}

// Generate monthly bill data
function generateMonthlyBillData() {
    const { labels, data } = generateRandomBillData(30);
    const ctx = document.getElementById('monthlyBillsChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Energy Cost ($)',
                data: data,
                backgroundColor: 'rgba(33, 150, 243, 0.5)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Energy Costs'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cost ($)'
                    }
                }
            }
        }
    });
}

// Generate yearly bill data
function generateYearlyBillData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(() => (Math.random() * 30 + 60).toFixed(2)); // Random values between 60 and 90
    
    const ctx = document.getElementById('yearlyBillsChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Monthly Energy Cost ($)',
                data: data,
                borderColor: 'rgba(33, 150, 243, 1)',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Yearly Energy Costs'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Cost ($)'
                    }
                }
            }
        }
    });
}

// Update bill data periodically
function updateBillData() {
    const currentMonth = document.querySelector('#monthly-bills .bill-card:nth-child(1) .amount');
    const dailyAverage = document.querySelector('#monthly-bills .bill-card:nth-child(2) .amount');
    const peakDay = document.querySelector('#monthly-bills .bill-card:nth-child(3) .amount');
    const yearToDate = document.querySelector('#yearly-bills .bill-card:nth-child(1) .amount');
    const monthlyAverage = document.querySelector('#yearly-bills .bill-card:nth-child(2) .amount');
    const highestMonth = document.querySelector('#yearly-bills .bill-card:nth-child(3) .amount');
    
    // Generate random fluctuations
    const newCurrentMonth = (85.50 + (Math.random() - 0.5) * 10).toFixed(2);
    const newDailyAverage = (2.85 + (Math.random() - 0.5) * 0.5).toFixed(2);
    const newPeakDay = (4.20 + (Math.random() - 0.5) * 0.8).toFixed(2);
    const newYearToDate = (256.50 + (Math.random() - 0.5) * 20).toFixed(2);
    const newMonthlyAverage = (85.50 + (Math.random() - 0.5) * 8).toFixed(2);
    const newHighestMonth = (95.20 + (Math.random() - 0.5) * 5).toFixed(2);
    
    currentMonth.textContent = `$${newCurrentMonth}`;
    dailyAverage.textContent = `$${newDailyAverage}`;
    peakDay.textContent = `$${newPeakDay}`;
    yearToDate.textContent = `$${newYearToDate}`;
    monthlyAverage.textContent = `$${newMonthlyAverage}`;
    highestMonth.textContent = `$${newHighestMonth}`;
}

// Initialize bill charts
generateMonthlyBillData();
generateYearlyBillData();

// Update bill data every 5 seconds
setInterval(updateBillData, 5000);

// Time range selection
document.querySelectorAll('.time-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        updateCharts(button.dataset.range);
    });
});

// Generate random data based on time range
function generateDataForRange(range) {
    const data = [];
    const labels = [];
    let baseValue, variance;

    switch(range) {
        case 'day':
            for (let i = 0; i < 24; i++) {
                baseValue = i >= 6 && i <= 21 ? 2.5 : 1.5; // Higher during day
                variance = Math.random() * 0.5;
                data.push(+(baseValue + variance).toFixed(2));
                labels.push(`${i}:00`);
            }
            break;
        case 'week':
            for (let i = 0; i < 7; i++) {
                baseValue = i >= 5 ? 3 : 2; // Higher on weekends
                variance = Math.random() * 1;
                data.push(+(baseValue + variance).toFixed(2));
                labels.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]);
            }
            break;
        case 'month':
            const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            for (let i = 1; i <= daysInMonth; i++) {
                baseValue = 2.5;
                variance = Math.random() * 1.5;
                data.push(+(baseValue + variance).toFixed(2));
                labels.push(i.toString());
            }
            break;
        case 'year':
            for (let i = 0; i < 12; i++) {
                baseValue = i >= 11 || i <= 1 ? 3.5 : 2.5; // Higher in winter
                variance = Math.random() * 1;
                data.push(+(baseValue + variance).toFixed(2));
                labels.push(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]);
            }
            break;
    }
    return { data, labels };
}

// Update all charts
function updateCharts(range) {
    const { data, labels } = generateDataForRange(range);
    
    // Main Energy Chart
    updateEnergyChart(data, labels, range);
    
    // Distribution Chart
    updateDistributionChart();
    
    // Cost Chart
    updateCostChart(data, labels, range);
    
    // Peak Hours Chart
    updatePeakHoursChart();
    
    // Update Efficiency Score
    updateEfficiencyScore();
    
    // Update Insights
    updateInsights(data, range);
}

// Update main energy chart
function updateEnergyChart(data, labels, range) {
    const ctx = document.getElementById('energyChart').getContext('2d');
    if (window.energyChart) window.energyChart.destroy();
    
    window.energyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Energy Usage (kWh)',
                data: data,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: {
                    display: true,
                    text: `Energy Usage - ${range.charAt(0).toUpperCase() + range.slice(1)}ly View`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'kWh' }
                }
            }
        }
    });
}

// Update distribution chart
function updateDistributionChart() {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    if (window.distributionChart) window.distributionChart.destroy();
    
    window.distributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Heating', 'Lighting', 'Appliances', 'Other'],
            datasets: [{
                data: [35, 25, 30, 10],
                backgroundColor: [
                    '#2196F3',
                    '#4CAF50',
                    '#FFC107',
                    '#9E9E9E'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

// Update cost chart
function updateCostChart(data, labels, range) {
    const ctx = document.getElementById('costChart').getContext('2d');
    if (window.costChart) window.costChart.destroy();
    
    const costData = data.map(value => +(value * 0.15).toFixed(2)); // $0.15 per kWh
    
    window.costChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cost ($)',
                data: costData,
                backgroundColor: 'rgba(76, 175, 80, 0.5)',
                borderColor: 'rgba(76, 175, 80, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Cost ($)' }
                }
            }
        }
    });
}

// Update peak hours chart
function updatePeakHoursChart() {
    const ctx = document.getElementById('peakHoursChart').getContext('2d');
    if (window.peakHoursChart) window.peakHoursChart.destroy();
    
    window.peakHoursChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['00:00-06:00', '06:00-12:00', '12:00-18:00', '18:00-24:00'],
            datasets: [{
                label: 'Average Usage (kWh)',
                data: [1.2, 2.1, 2.8, 3.5],
                backgroundColor: 'rgba(255, 193, 7, 0.5)',
                borderColor: 'rgba(255, 193, 7, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'kWh' }
                }
            }
        }
    });
}

// Update efficiency score
function updateEfficiencyScore() {
    const score = Math.floor(Math.random() * 20) + 80; // Random score between 80-100
    const trend = Math.random() > 0.5 ? 'positive' : 'negative';
    const change = (Math.random() * 5).toFixed(1);
    
    document.getElementById('efficiencyScore').textContent = score;
    const trendElement = document.querySelector('.score-trend');
    trendElement.textContent = `${trend === 'positive' ? '↑' : '↓'} ${change}% from last month`;
    trendElement.className = `score-trend ${trend}`;
    
    const description = score >= 90 ? 'Excellent energy efficiency' :
                       score >= 80 ? 'Good energy efficiency' :
                       score >= 70 ? 'Average energy efficiency' :
                       'Needs improvement';
    document.querySelector('.score-description').textContent = description;
}

// Update insights
function updateInsights(data, range) {
    const total = data.reduce((a, b) => a + b, 0);
    const avg = total / data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);
    
    // Update usage patterns
    const usageList = document.querySelector('.insight-card:nth-child(1) .insight-list');
    usageList.innerHTML = `
        <li>Highest usage: ${max.toFixed(1)} kWh</li>
        <li>Lowest usage: ${min.toFixed(1)} kWh</li>
        <li>Average usage: ${avg.toFixed(1)} kWh</li>
    `;
    
    // Update cost analysis
    const costList = document.querySelector('.insight-card:nth-child(2) .insight-list');
    const dailyCost = avg * 0.15;
    const monthlyCost = dailyCost * 30;
    const yearlyCost = monthlyCost * 12;
    costList.innerHTML = `
        <li>Daily average: $${dailyCost.toFixed(2)}</li>
        <li>Monthly projection: $${monthlyCost.toFixed(2)}</li>
        <li>Year-to-date: $${(yearlyCost * (new Date().getMonth() + 1) / 12).toFixed(2)}</li>
    `;
}

// Initialize charts with daily view
updateCharts('day');

// Update data every 5 seconds
setInterval(() => {
    const activeRange = document.querySelector('.time-btn.active').dataset.range;
    updateCharts(activeRange);
}, 5000);

// Advanced Analytics Functions
function generateDeviceUsageData() {
    const devices = ['AC Unit', 'Lighting', 'Appliances', 'Smart TV', 'Water Heater'];
    const data = devices.map(device => ({
        name: device,
        usage: Math.random() * 100
    }));
    return data;
}

function generateCostBreakdownData() {
    return {
        baseRate: 45.00,
        peakHours: 25.50,
        taxes: 15.00
    };
}

function generateSavingsData() {
    return {
        daily: 2.50,
        monthly: 75.00,
        yearly: 900.00,
        trends: {
            daily: 15,
            monthly: 12,
            yearly: 8
        }
    };
}

function generateEnvironmentalData() {
    return {
        treesSaved: 12,
        milesDriven: 450,
        homesPowered: 3,
        carbonReduction: 2.1
    };
}

function updateQuickStats() {
    const totalEnergy = (Math.random() * 50 + 20).toFixed(1);
    const totalCost = (totalEnergy * 0.15).toFixed(2);
    const carbonFootprint = (totalEnergy * 0.4).toFixed(1);
    const solarGeneration = (Math.random() * 20 + 5).toFixed(1);

    document.getElementById('totalEnergy').textContent = `${totalEnergy} kWh`;
    document.getElementById('totalCost').textContent = `$${totalCost}`;
    document.getElementById('carbonFootprint').textContent = `${carbonFootprint} kg`;
    document.getElementById('solarGeneration').textContent = `${solarGeneration} kWh`;
}

function updateDeviceUsageChart() {
    const ctx = document.getElementById('deviceUsageChart').getContext('2d');
    const data = generateDeviceUsageData();
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(d => d.name),
            datasets: [{
                label: 'Usage %',
                data: data.map(d => d.usage),
                backgroundColor: 'rgba(33, 150, 243, 0.5)',
                borderColor: 'rgba(33, 150, 243, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Update progress bars
    data.forEach(device => {
        const progressBar = document.querySelector(`.device-stat:has(.device-name:contains('${device.name}')) .progress`);
        if (progressBar) {
            progressBar.style.width = `${device.usage}%`;
        }
    });
}

function updateCostBreakdownChart() {
    const ctx = document.getElementById('costBreakdownChart').getContext('2d');
    const data = generateCostBreakdownData();
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Base Rate', 'Peak Hours', 'Taxes & Fees'],
            datasets: [{
                data: [data.baseRate, data.peakHours, data.taxes],
                backgroundColor: [
                    'rgba(33, 150, 243, 0.5)',
                    'rgba(76, 175, 80, 0.5)',
                    'rgba(255, 152, 0, 0.5)'
                ],
                borderColor: [
                    'rgba(33, 150, 243, 1)',
                    'rgba(76, 175, 80, 1)',
                    'rgba(255, 152, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateSavingsChart() {
    const ctx = document.getElementById('savingsChart').getContext('2d');
    const data = generateSavingsData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Savings',
                data: Array.from({length: 6}, () => Math.random() * 100 + 50),
                borderColor: 'rgba(76, 175, 80, 1)',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateEnvironmentalChart() {
    const ctx = document.getElementById('environmentalChart').getContext('2d');
    const data = generateEnvironmentalData();
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Carbon Reduction', 'Energy Efficiency', 'Renewable Usage', 'Water Savings', 'Waste Reduction'],
            datasets: [{
                label: 'Environmental Impact',
                data: [
                    data.carbonReduction * 10,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100,
                    Math.random() * 100
                ],
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                borderColor: 'rgba(76, 175, 80, 1)',
                pointBackgroundColor: 'rgba(76, 175, 80, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(76, 175, 80, 1)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateAdvancedAnalytics() {
    updateDeviceUsageChart();
    updateCostBreakdownChart();
    updateSavingsChart();
    updateEnvironmentalChart();
}

// Initialize advanced analytics
document.addEventListener('DOMContentLoaded', function() {
    // Update quick stats every 5 seconds
    setInterval(updateQuickStats, 5000);
    
    // Update advanced analytics every 30 seconds
    setInterval(updateAdvancedAnalytics, 30000);
    
    // Initial updates
    updateQuickStats();
    updateAdvancedAnalytics();
}); 
// Store monthly data
let monthlyDataStore = {};

// Generate random daily costs for a specific month
function generateMonthlyData(month) {
    if (monthlyDataStore[month]) {
        return monthlyDataStore[month];
    }

    const year = new Date().getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data = [];
    const labels = [];
    let peakValue = 0;
    let peakDay = 1;
    let total = 0;

    // Generate base value for the month (different months have different base costs)
    const baseValue = 2 + (month * 0.2); // Winter months have higher base costs

    for (let i = 1; i <= daysInMonth; i++) {
        // Add some randomness to the base value
        const value = +(baseValue + Math.random() * 3).toFixed(2);
        data.push(value);
        labels.push(i.toString());
        total += value;
        if (value > peakValue) {
            peakValue = value;
            peakDay = i;
        }
    }

    const monthData = { data, labels, peakValue, peakDay, total };
    monthlyDataStore[month] = monthData;
    return monthData;
}

function updateSummary({ data, peakValue, peakDay, total }, month) {
    const avg = (total / data.length).toFixed(2);
    const currentMonth = total.toFixed(2);
    
    // Get previous month's data for comparison
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthData = generateMonthlyData(prevMonth);
    const lastMonth = prevMonthData.total.toFixed(2);
    
    const trend = currentMonth < lastMonth ? 'positive' : (currentMonth > lastMonth ? 'negative' : 'neutral');
    const trendText = trend === 'positive' ? 
        `↓ ${(100 - (currentMonth / lastMonth) * 100).toFixed(1)}% from last month` : 
        (trend === 'negative' ? 
            `↑ ${((currentMonth / lastMonth) * 100 - 100).toFixed(1)}% from last month` : 
            'Same as last month');

    document.getElementById('currentMonthAmount').textContent = `$${currentMonth}`;
    document.getElementById('currentMonthTrend').textContent = trendText;
    document.getElementById('currentMonthTrend').className = 'trend ' + trend;

    document.getElementById('avgDailyAmount').textContent = `$${avg}`;
    document.getElementById('avgDailyTrend').textContent = '—';
    document.getElementById('avgDailyTrend').className = 'trend neutral';

    document.getElementById('peakDayAmount').textContent = `$${peakValue.toFixed(2)}`;
    const peakDate = new Date(new Date().getFullYear(), month, peakDay);
    document.getElementById('peakDayDate').textContent = peakDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function renderChart({ data, labels }, month) {
    const ctx = document.getElementById('monthlyBillsChart').getContext('2d');
    if (window.monthlyBillsChart) window.monthlyBillsChart.destroy();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    window.monthlyBillsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Daily Energy Cost for ${monthNames[month]} ($)`,
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
                legend: { position: 'top' },
                title: { 
                    display: true, 
                    text: `${monthNames[month]} Energy Costs` 
                }
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

function updateAll(month) {
    const monthlyData = generateMonthlyData(month);
    updateSummary(monthlyData, month);
    renderChart(monthlyData, month);
}

// Initialize with current month
const currentMonth = new Date().getMonth();
document.getElementById('monthSelect').value = currentMonth;
updateAll(currentMonth);

// Add event listener for month selection
document.getElementById('monthSelect').addEventListener('change', (e) => {
    const selectedMonth = parseInt(e.target.value);
    updateAll(selectedMonth);
});

// Update current month's data every 5 seconds
setInterval(() => {
    const currentMonth = new Date().getMonth();
    const selectedMonth = parseInt(document.getElementById('monthSelect').value);
    
    // Only update if current month is selected
    if (selectedMonth === currentMonth) {
        // Clear stored data for current month to force regeneration
        delete monthlyDataStore[currentMonth];
        updateAll(currentMonth);
    }
}, 5000); 
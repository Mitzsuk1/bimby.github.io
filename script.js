// ===== REAL-TIME CHART =====
const ctx = document.getElementById("powerChart").getContext("2d");
let chartData = [];

const powerChart = new Chart(ctx, {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Power (W)",
            data: [],
            borderWidth: 2,
            borderColor: "white",
            tension: 0.3,
        }]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        }
    }
});

// ===== LIVE DATA HANDLING =====

// API endpoint for ESP32 POST
const API_URL = "update.json";  
// You can replace this with a Firebase endpoint later if needed.

async function fetchData() {
    try {
        const response = await fetch(API_URL + "?t=" + Date.now());
        const data = await response.json();

        updateUI(data);
        updateChart(data.power);
        logEvent(data);

    } catch (err) {
        console.log("Waiting for ESP32 data...");
    }
}

function updateUI(data) {
    document.getElementById("voltage").innerText = data.voltage + " V";
    document.getElementById("current").innerText = data.current + " A";
    document.getElementById("power").innerText = data.power + " W";

    const statusEl = document.getElementById("status");
    statusEl.innerText = data.status;

    statusEl.className = "status " + data.status.toLowerCase();
}

function updateChart(power) {
    const time = new Date().toLocaleTimeString();

    chartData.push(power);
    powerChart.data.labels.push(time);
    powerChart.data.datasets[0].data.push(power);

    if (chartData.length > 20) {
        chartData.shift();
        powerChart.data.labels.shift();
    }

    powerChart.update();
}

function logEvent(data) {
    const logBox = document.getElementById("logBox");
    const line = `[${new Date().toLocaleTimeString()}] V:${data.voltage}  A:${data.current}  W:${data.power}  Status:${data.status}`;

    logBox.innerHTML = line + "<br>" + logBox.innerHTML;
}

// Fetch data every second
setInterval(fetchData, 1000);
function renderDevices(data) {
    const container = document.getElementById("pzem-container");
    container.innerHTML = ""; // reset

    Object.keys(data).forEach(device => {
        const d = data[device];

        container.innerHTML += `
            <div class="device-card">
                <h3>${device.toUpperCase()}</h3>
                <p><strong>Voltage:</strong> ${d.voltage} V</p>
                <p><strong>Current:</strong> ${d.current} A</p>
                <p><strong>Power:</strong> ${d.power} W</p>
                <canvas id="chart_${device}" height="100"></canvas>
            </div>
        `;
    });
}


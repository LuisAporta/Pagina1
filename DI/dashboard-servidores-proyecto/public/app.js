// JS Dashboard Logic - "Don Viejo" Rules applied where possible (No frameworks like React, just Vanilla + Chart.js lib)

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnRam = document.getElementById('btn-ram');
const btnCpu = document.getElementById('btn-cpu');
const consoleOutput = document.getElementById('console-output');
const coreCircle = document.getElementById('core-circle');
const statusMsg = document.getElementById('status-msg');
const statusIndicator = document.getElementById('traffic-light-text');

// --- CHART.JS CONFIG ---
const ctx = document.getElementById('metricsChart').getContext('2d');
const metricsChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'CPU LOAD (%)',
            borderColor: '#00f3ff',
            backgroundColor: 'rgba(0, 243, 255, 0.1)',
            data: [],
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }, {
            label: 'RAM USAGE (%)',
            borderColor: '#9d00ff',
            backgroundColor: 'rgba(157, 0, 255, 0.1)',
            data: [],
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#333' },
                ticks: { color: '#888' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#888' }
            }
        },
        plugins: {
            legend: { labels: { color: '#fff' } }
        }
    }
});

// --- FUNCIONES UTILIDAD ---

function log(msg, type = 'info') {
    const span = document.createElement('span');
    span.classList.add('log-line');

    // Timestamp
    const date = new Date();
    const time = date.toLocaleTimeString();

    if (type === 'error') span.classList.add('log-error');
    if (type === 'info') span.classList.add('log-info');

    span.innerHTML = `[${time}] > ${msg}`;
    consoleOutput.appendChild(span);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// --- CORE FUNCTIONS ---

function updateStatus() {
    fetch('/status')
        .then(res => res.json())
        .then(data => {
            // Limpiar clases
            coreCircle.classList.remove('green', 'red', 'yellow');

            if (data.status === 'ok') {
                coreCircle.classList.add('green');
                statusMsg.innerText = "SYSTEM: OPTIMAL";
                statusMsg.style.color = "#00ff41";
                statusIndicator.innerText = "ONLINE";
                statusIndicator.style.color = "#00ff41";
            } else if (data.status === 'error' || data.status === 'offline') {
                coreCircle.classList.add('red');
                statusMsg.innerText = "SYSTEM: CRITICAL / OFFLINE";
                statusMsg.style.color = "#ff003c";
                statusIndicator.innerText = "OFFLINE";
                statusIndicator.style.color = "#ff003c";
            } else if (data.status === 'warning') {
                coreCircle.classList.add('yellow');
                statusMsg.innerText = "SYSTEM: PROCESSING...";
                statusMsg.style.color = "#fcee0a";
                statusIndicator.innerText = "BUSY";
                statusIndicator.style.color = "#fcee0a";
            }
        })
        .catch(err => {
            console.log(err);
        });
}

function updateStats() {
    fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
            // Actualizar grafico
            metricsChart.data.labels = data.labels;
            metricsChart.data.datasets[0].data = data.cpu;
            metricsChart.data.datasets[1].data = data.ram;
            metricsChart.update();
        });
}

function controlSystem(action) {
    log(`INITIATING SEQUENCE: ${action.toUpperCase()}...`, 'info');

    fetch(`/control/${action}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            log(`SERVER RESPONSE: ${data.msg}`, 'info');
            updateStatus();
        })
        .catch(err => {
            log(`COMMAND FAILED: ${err}`, 'error');
        });
}

// --- EVENT LISTENERS ---

btnStart.addEventListener('click', () => controlSystem('start'));
btnStop.addEventListener('click', () => controlSystem('stop'));

btnRam.addEventListener('click', () => {
    log("SCANNING PHYSICAL MEMORY...", 'info');
    fetch('/api/ram')
        .then(res => res.text())
        .then(text => {
            log("MEMORY SCAN RESULT:", 'info');
            // Formatear salida un poco
            let lines = text.split('\n');
            lines.forEach(l => {
                if (l.trim() !== "") log(l.trim());
            });
        });
});

btnCpu.addEventListener('click', () => {
    log("ANALYZING CPU THREADS...", 'info');
    fetch('/api/cpu')
        .then(res => res.text())
        .then(text => {
            log(`CPU LOAD: ${text.trim()}%`);
        });
});

// --- LOOPS DE ACTUALIZACION ---
setInterval(updateStatus, 2000); // Check status cada 2s
setInterval(updateStats, 5000);  // Update graficos cada 5s

// Inicial
log("DASHBOARD INITIALIZED. CONNECTING TO CORE...", 'info');
updateStatus();
updateStats();

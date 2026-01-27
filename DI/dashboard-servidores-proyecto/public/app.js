// JS Dashboard Logic - "Don Viejo" Rules applied where possible

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnRam = document.getElementById('btn-ram');
const btnCpu = document.getElementById('btn-cpu');
const consoleOutput = document.getElementById('console-output');
const coreCircle = document.getElementById('core-circle');
const statusMsg = document.getElementById('status-msg');
const statusIndicator = document.getElementById('traffic-light-text');

// --- CHART.JS CONFIG ---
// Setup inicial seguro
let metricsChart;
const ctxElement = document.getElementById('metricsChart');

if (ctxElement) {
    const ctx = ctxElement.getContext('2d');
    metricsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU LOAD (%)',
                borderColor: '#00f3ff',
                backgroundColor: 'rgba(0, 243, 255, 0.15)',
                data: [],
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true
            }, {
                label: 'RAM USAGE (%)',
                borderColor: '#bc13fe',
                backgroundColor: 'rgba(188, 19, 254, 0.15)',
                data: [],
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false, // Mejor rendimiento
            interaction: { intersect: false, mode: 'index' },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#666', font: { family: 'Share Tech Mono' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff', font: { family: 'Orbitron' } } }
            }
        }
    });
}

// --- FUNCIONES UTILIDAD ---

function log(msg, type = 'info') {
    if (!consoleOutput) return;

    const div = document.createElement('div');
    div.classList.add('log-line');

    // Timestamp
    const date = new Date();
    const time = date.toLocaleTimeString([], { hour12: false });

    if (type === 'error') div.classList.add('log-error');
    if (type === 'success') div.classList.add('log-success');
    if (type === 'sys') div.classList.add('log-sys');
    else div.classList.add('log-info');

    div.innerHTML = `<span style="opacity:0.5">[${time}]</span> ${msg}`;
    consoleOutput.appendChild(div);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

// --- CORE FUNCTIONS ---

function updateStatus() {
    fetch('/status')
        .then(res => res.json())
        .then(data => {
            // Limpiar clases
            coreCircle.classList.remove('green', 'red', 'yellow');
            const btns = document.querySelectorAll('.tech-btn');

            if (data.status === 'ok') {
                coreCircle.classList.add('green');
                statusMsg.innerText = "SYSTEM: ONLINE";
                statusMsg.style.color = "#0aff0a";
                statusIndicator.innerText = "ONLINE";
                statusIndicator.style.color = "#0aff0a";

                // Habilitar botones de comandos
                btns.forEach(b => b.classList.remove('disabled'));

            } else if (data.status === 'error' || data.status === 'offline') {
                coreCircle.classList.add('red');
                statusMsg.innerText = "SYSTEM: OFFLINE";
                statusMsg.style.color = "#ff2a2a";
                statusIndicator.innerText = "OFFLINE";
                statusIndicator.style.color = "#ff2a2a";

                // Deshabilitar botones de comandos
                btns.forEach(b => b.classList.add('disabled'));

            } else if (data.status === 'warning') {
                coreCircle.classList.add('yellow');
                statusMsg.innerText = "PROCESSING...";
                statusMsg.style.color = "#fcee0a";
                statusIndicator.innerText = "BUSY";
                statusIndicator.style.color = "#fcee0a";
            }
        })
        .catch(err => {
            console.log("Fetch Error (Server Offline?):", err);
            statusIndicator.innerText = "CONNECTION LOST";
            statusIndicator.style.color = "#555";
        });
}

function updateStats() {
    if (!metricsChart) return;

    fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
            // Actualizar grafico
            metricsChart.data.labels = data.labels;
            metricsChart.data.datasets[0].data = data.cpu;
            metricsChart.data.datasets[1].data = data.ram;
            metricsChart.update();
        })
        .catch(() => { }); // Silencio si falla
}

function controlSystem(action) {
    if (action === 'start') log(`> INITIATING START SEQUENCER...`, 'sys');
    if (action === 'stop') log(`> INITIATING SHUTDOWN PROTOCOL...`, 'sys');

    fetch(`/control/${action}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            log(`ACK: ${data.msg}`, 'success');
            setTimeout(updateStatus, 1000);
        })
        .catch(err => {
            log(`ERR: COMMAND FAILED. IS SERVER RUNNING?`, 'error');
        });
}

// --- EVENT LISTENERS ---

if (btnStart) btnStart.addEventListener('click', () => controlSystem('start'));
if (btnStop) btnStop.addEventListener('click', () => controlSystem('stop'));

if (btnRam) btnRam.addEventListener('click', (e) => {
    if (e.target.classList.contains('disabled')) return;
    log("> EXEC: wmic memory check", 'info');
    fetch('/api/ram')
        .then(res => res.text())
        .then(text => {
            // Formatear salida
            let clean = text.replace(/\s+/g, ' ').trim();
            log(`RESULT: ${clean.substring(0, 50)}...`, 'success');
        });
});

if (btnCpu) btnCpu.addEventListener('click', (e) => {
    if (e.target.classList.contains('disabled')) return;
    log("> EXEC: wmic cpu load", 'info');
    fetch('/api/cpu')
        .then(res => res.text())
        .then(text => {
            log(`CPU LOAD: ${text.trim()}%`, 'success');
        });
});

// --- LOOPS DE ACTUALIZACION ---
setInterval(updateStatus, 2000); // Check status cada 2s
setInterval(updateStats, 3000);  // Update graficos cada 3s (rapido)

// Inicial
log("INTERFACE INITIALIZED.", 'sys');
log("CONNECTING TO LOCALHOST:3000...", 'sys');
updateStatus();
updateStats();

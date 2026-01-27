// JS Dashboard Logic - MULTI-DEVICE SUPPORT

const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const btnRam = document.getElementById('btn-ram');
const btnCpu = document.getElementById('btn-cpu');
const consoleOutput = document.getElementById('console-output');
const coreCircle = document.getElementById('core-circle');
const statusMsg = document.getElementById('status-msg');
const statusIndicator = document.getElementById('traffic-light-text');
const nodesList = document.getElementById('nodes-list');
const nodesCount = document.getElementById('nodes-count');

// GLOBAL STATE
let IS_SIMULATION = false;
let simStatus = 'offline';
let selectedClientId = 'HOST'; // 'HOST' or Agent ID

// --- CHART.JS CONFIG ---
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
            animation: false,
            interaction: { intersect: false, mode: 'index' },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#666', font: { family: 'Share Tech Mono' } }
                },
                x: { grid: { display: false }, ticks: { display: false } }
            },
            plugins: {
                legend: { labels: { color: '#fff', font: { family: 'Orbitron' } } }
            }
        }
    });
}

// --- LOGGING ---
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

// --- VISUAL HELPERS ---
function setVisualStatus(status) {
    coreCircle.classList.remove('green', 'red', 'yellow');
    const btns = document.querySelectorAll('.tech-btn');

    if (status === 'online') {
        coreCircle.classList.add('green');
        statusMsg.innerText = "SYSTEM: ONLINE";
        statusMsg.style.color = "#0aff0a";
        statusIndicator.innerText = "ONLINE";
        statusIndicator.style.color = "#0aff0a";
        btns.forEach(b => b.classList.remove('disabled'));
    } else {
        coreCircle.classList.add('red');
        statusMsg.innerText = "SYSTEM: OFFLINE";
        statusMsg.style.color = "#ff2a2a";
        statusIndicator.innerText = "OFFLINE";
        statusIndicator.style.color = "#ff2a2a";
        btns.forEach(b => b.classList.add('disabled'));
    }
}

// --- CLIENT LIST LOGIC ---
function updateClientList() {
    if (IS_SIMULATION) return;

    fetch('/api/clients')
        .then(res => res.json())
        .then(clients => {
            nodesCount.innerText = `[${clients.length}]`;

            // Clear list (except Host? No, rebuild all to keep simple for now)
            nodesList.innerHTML = '';

            // 1. HOST ITEM (Always there)
            const hostDiv = document.createElement('div');
            hostDiv.className = `node-item ${selectedClientId === 'HOST' ? 'selected' : ''}`;
            hostDiv.innerHTML = `<div class="node-led on"></div><div class="node-name">HOST (LOCAL)</div>`;
            hostDiv.onclick = () => { selectedClientId = 'HOST'; updateClientList(); log("SWITCHING VIEW: LOCALHOST", 'sys'); };
            nodesList.appendChild(hostDiv);

            // 2. REMOTE CLIENTS
            clients.forEach(c => {
                const div = document.createElement('div');
                div.className = `node-item ${selectedClientId === c.id ? 'selected' : ''}`;
                div.innerHTML = `<div class="node-led on"></div><div class="node-name">${c.id}</div>`;
                div.onclick = () => { selectedClientId = c.id; updateClientList(); log(`SWITCHING VIEW: ${c.id}`, 'sys'); };
                nodesList.appendChild(div);
            });
        })
        .catch(err => console.log("Error fetching clients", err));
}


// --- CORE FUNCTIONS ---

function updateStatus() {
    if (IS_SIMULATION) return;

    fetch('/status')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') setVisualStatus('online');
            else setVisualStatus('offline');
        })
        .catch(err => {
            if (!IS_SIMULATION) {
                console.warn("Backend Unreachable. Switching to SIMULATION MODE.");
                IS_SIMULATION = true;
                log("WARNING: CONNECTION LOST. SWITCHING TO SIMULATION MODE.", 'error');
                setVisualStatus(simStatus);
            }
        });
}

function updateStats() {
    if (!metricsChart) return;

    if (IS_SIMULATION) {
        // Generar datos falsos
        if (simStatus === 'online') {
            const cpu = Math.floor(Math.random() * 60) + 20;
            const ram = Math.floor(Math.random() * 40) + 30;
            updateChartData(cpu, ram);
        }
        return;
    }

    // REAL FETCH
    fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
            // Reemplazar historial completo (simple)
            metricsChart.data.labels = data.labels;
            metricsChart.data.datasets[0].data = data.cpu;
            metricsChart.data.datasets[1].data = data.ram;
            metricsChart.update();
        })
        .catch(() => { });
}

function updateChartData(cpu, ram) {
    const labels = metricsChart.data.labels;
    const dataCpu = metricsChart.data.datasets[0].data;
    const dataRam = metricsChart.data.datasets[1].data;

    if (labels.length > 20) { labels.shift(); dataCpu.shift(); dataRam.shift(); }

    labels.push(new Date().toLocaleTimeString());
    dataCpu.push(cpu);
    dataRam.push(ram);
    metricsChart.update();
}

function controlSystem(action) {
    if (action === 'start') log(`> INITIATING START SEQUENCER...`, 'sys');
    if (action === 'stop') log(`> INITIATING SHUTDOWN PROTOCOL...`, 'sys');

    if (IS_SIMULATION) {
        setTimeout(() => {
            if (action === 'start') {
                simStatus = 'online';
                log("ACK: SYSTEM STARTED (SIMULATED)", 'success');
            } else {
                simStatus = 'offline';
                log("ACK: SYSTEM STOPPED (SIMULATED)", 'success');
            }
            setVisualStatus(simStatus);
        }, 1000);
        return;
    }

    fetch(`/control/${action}`, { method: 'POST' })
        .then(res => res.json())
        .then(data => {
            log(`ACK: ${data.msg}`, 'success');
            setTimeout(updateStatus, 1000);
        })
        .catch(err => {
            log(`ERR: COMMAND FAILED.`, 'error');
        });
}

// --- EVENT LISTENERS ---

if (btnStart) btnStart.addEventListener('click', () => controlSystem('start'));
if (btnStop) btnStop.addEventListener('click', () => controlSystem('stop'));

if (btnRam) {
    btnRam.addEventListener('click', (e) => {
        if (e.target.classList.contains('disabled')) return;
        log("> EXEC: wmic memory check", 'info');

        if (IS_SIMULATION) {
            setTimeout(() => {
                log(`RESULT: FreePhysicalMemory=${Math.floor(Math.random() * 9000000)}`, 'success');
            }, 500);
            return;
        }

        fetch('/api/ram')
            .then(res => res.text())
            .then(text => {
                let clean = text.replace(/\s+/g, ' ').trim();
                log(`RESULT: ${clean.substring(0, 50)}...`, 'success');
            });
    });
}

if (btnCpu) {
    btnCpu.addEventListener('click', (e) => {
        if (e.target.classList.contains('disabled')) return;
        log("> EXEC: wmic cpu load", 'info');

        if (IS_SIMULATION) {
            setTimeout(() => {
                log(`CPU LOAD: ${Math.floor(Math.random() * 100)}%`, 'success');
            }, 500);
            return;
        }

        fetch('/api/cpu')
            .then(res => res.text())
            .then(text => {
                log(`CPU LOAD: ${text.trim()}%`, 'success');
            });
    });
}

// --- LOOPS ---
setInterval(updateStatus, 2000);
setInterval(updateStats, 2000);
setInterval(updateClientList, 2000); // Poll de nuevos clientes

// Inicial
log("INTERFACE INITIALIZED.", 'sys');
log("SCANNING NETWORK FOR NODES...", 'sys');

// Force check immediately
updateStatus();
updateClientList();

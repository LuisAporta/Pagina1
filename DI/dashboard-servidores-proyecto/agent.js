const http = require('http');
const os = require('os');
const { exec } = require('child_process');

// CONFIGURACIÓN DEL AGENTE
const SERVER_URL = 'http://localhost:3000'; // IP del servidor central
const AGENT_ID = 'NODE-' + os.hostname().toUpperCase(); // Nombre único (e.g., NODE-DESKTOP-UK82)

console.log(`
╔════════════════════════════════════════╗
║     NEON SYSTEM AGENT v1.0             ║
║     ID: ${AGENT_ID}             ║
║     TARGET: ${SERVER_URL}      ║
╚════════════════════════════════════════╝
`);

// Función auxiliar para obtener datos reales
function getSystemStats() {
    return new Promise((resolve) => {
        // CPU Load (Simulado para compatibilidad multi-OS rápida, o usar wmic en windows)
        // En un agente real usaríamos librerías como 'systeminformation'
        // Aquí hacemos un cálculo básico o simulación creíble si falla wmic

        let cpuLoad = 0;
        const cpus = os.cpus();

        // Cálculo básico de carga (muy simple)
        let totalIdle = 0, totalTick = 0;
        cpus.forEach(c => { totalIdle += c.times.idle; totalTick += Object.values(c.times).reduce((a, b) => a + b, 0); });
        const idle = totalIdle / cpus.length;
        const total = totalTick / cpus.length;
        // (Nota: para carga real instantanea se necesita comparar T1 y T2, aquí simulamos variación sobre una base)
        cpuLoad = Math.floor(Math.random() * 30) + 10; // Placeholder dinámico

        // RAM Usage
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const ramUsage = Math.floor((usedMem / totalMem) * 100);

        resolve({
            id: AGENT_ID,
            os: os.platform(),
            cpu: cpuLoad,
            ram: ramUsage
        });
    });
}

function sendHeartbeat() {
    getSystemStats().then(stats => {
        const data = JSON.stringify(stats);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/heartbeat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            // console.log(`[LINK] Heartbeat sent. Status logic: ${res.statusCode}`);
            process.stdout.write("."); // Feedback minimalista
        });

        req.on('error', (error) => {
            console.error(`\n[ERROR] No se puede conectar al Hub (${SERVER_URL}). Reintentando...`);
        });

        req.write(data);
        req.end();
    });
}

// Loop principal
console.log("[AGENT] Iniciando secuencia de enlace...");
setInterval(sendHeartbeat, 2000); // Enviar datos cada 2 segundos

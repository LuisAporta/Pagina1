const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Servir archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// --- ESTADO INTERNO DEL SISTEMA SIMULADO ---
let systemStatus = 'running'; // 'running', 'stopped', 'starting', 'stopping'
let activeServices = {
    database: true,
    webserver: true,
    firewall: true
};

// --- ENDPOINTS ---

// 1. Estado del Servidor
app.get('/status', (req, res) => {
    // Si el sistema esta parado, devolvemos error
    if (systemStatus === 'stopped') {
        return res.json({ status: 'offline', message: 'SISTEMA APAGADO' });
    }
    
    if (systemStatus === 'starting') {
        return res.json({ status: 'warning', message: 'INICIANDO SECUENCIA...' });
    }

    if (systemStatus === 'stopping') {
        return res.json({ status: 'warning', message: 'DETENIENDO SERVICIOS...' });
    }

    // Estado normal
    // Probabilidad de error aleatorio bajo para realismo
    let randomVal = Math.random();
    if (randomVal > 0.95) {
        res.json({ status: 'error', message: 'FALLO CRITICO EN NUCLEO' });
    } else {
        res.json({ status: 'ok', message: 'SISTEMA OPERATIVO Y ESTABLE' });
    }
});

// 2. Control del Sistema (Start/Stop)
app.post('/control/:action', (req, res) => {
    const action = req.params.action;

    if (action === 'start') {
        if (systemStatus === 'running') return res.json({ msg: 'Sistema ya esta activo.' });
        
        systemStatus = 'starting';
        // Simular tiempo de arranque
        setTimeout(() => {
            systemStatus = 'running';
        }, 3000); 
        
        return res.json({ msg: 'Iniciando secuencia de arranque...' });
    } 
    
    else if (action === 'stop') {
        if (systemStatus === 'stopped') return res.json({ msg: 'Sistema ya esta apagado.' });

        systemStatus = 'stopping';
        // Simular tiempo de apagado
        setTimeout(() => {
            systemStatus = 'stopped';
        }, 3000);

        return res.json({ msg: 'Iniciando secuencia de apagado...' });
    }

    else {
        res.status(400).json({ error: 'Comando desconocido' });
    }
});

// 3. API de Estadisticas (Simuladas para graficos)
app.get('/api/stats', (req, res) => {
    // Generamos datos para las ultimas 10 lecturas
    let cpuHistory = [];
    let ramHistory = [];
    let labels = [];

    let now = new Date();

    for (let i = 0; i < 10; i++) {
        // CPU aleatorio entre 10% y 90%
        cpuHistory.push(Math.floor(Math.random() * 80) + 10);
        // RAM mas estable
        ramHistory.push(Math.floor(Math.random() * 30) + 40);
        
        let timeLabel = new Date(now.getTime() - (9 - i) * 5000); // Pasos de 5 seg
        labels.push(timeLabel.getHours() + ':' + timeLabel.getMinutes() + ':' + timeLabel.getSeconds());
    }

    res.json({
        labels: labels,
        cpu: cpuHistory,
        ram: ramHistory
    });
});

// 4. Comandos Reales (RAM)
app.get('/api/ram', (req, res) => {
    if (systemStatus !== 'running') return res.send('ERROR: SISTEMA OFFLINE. INICIE EL SERVIDOR.');

    let comando = 'wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value';
    exec(comando, (error, stdout, stderr) => {
        if (error) return res.send('Error CMD: ' + error.message);
        res.send(stdout);
    });
});

// 5. Comandos Reales (CPU)
app.get('/api/cpu', (req, res) => {
    if (systemStatus !== 'running') return res.send('ERROR: SISTEMA OFFLINE. INICIE EL SERVIDOR.');

    let comando = 'wmic cpu get loadpercentage';
    exec(comando, (error, stdout, stderr) => {
        if (error) return res.send('Error CMD: ' + error.message);
        res.send(stdout);
    });
});

// Iniciar servidor express
app.listen(PORT, () => {
    console.log(`[NEON SERVER] Online en puerto ${PORT}`);
    console.log(`[ACCESS] http://localhost:${PORT}`);
});

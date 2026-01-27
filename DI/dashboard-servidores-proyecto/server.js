const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Servir archivos estaticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint de estado simulado
app.get('/status', (req, res) => {
    // Simulamos un estado aleatorio para el semaforo
    // 0 = Rojo (Error), 1 = Verde (OK)
    let estado = 0;
    let randomVal = Math.random();

    if (randomVal > 0.5) {
        estado = 1;
    } else {
        estado = 0;
    }

    if (estado === 1) {
        res.json({ status: 'ok', message: 'Servidor Operativo' });
    } else {
        res.json({ status: 'error', message: 'Servidor con Problemas' });
    }
});

// Endpoint para ver la RAM
app.get('/api/ram', (req, res) => {
    // Comando para ver memoria en Windows (systeminfo es lento, usaremos wmic)
    // wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value
    let comando = 'wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value';
    
    exec(comando, (error, stdout, stderr) => {
        let resultado = '';
        if (error) {
            resultado = 'Error al ejecutar comando: ' + error.message;
        } else {
            if (stderr) {
                resultado = 'Error estandar: ' + stderr;
            } else {
                resultado = stdout;
            }
        }
        res.send(resultado);
    });
});

// Endpoint para ver la CPU
app.get('/api/cpu', (req, res) => {
    // Comando para ver carga de CPU en Windows
    // wmic cpu get loadpercentage
    let comando = 'wmic cpu get loadpercentage';

    exec(comando, (error, stdout, stderr) => {
        let resultado = '';
        if (error) {
            resultado = 'Error al ejecutar comando: ' + error.message;
        } else {
            if (stderr) {
                resultado = 'Error estandar: ' + stderr;
            } else {
                resultado = stdout;
            }
        }
        res.send(resultado);
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('Servidor escuchando en el puerto ' + PORT);
    console.log('Accede a http://localhost:' + PORT);
});

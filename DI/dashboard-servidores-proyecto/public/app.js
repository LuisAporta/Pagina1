// Logica del Dashboard
// Regla: Javascript Vanilla, sin logica asincrona compleja

const btnRam = document.getElementById('btn-ram');
const btnCpu = document.getElementById('btn-cpu');
const consoleOutput = document.getElementById('console-output');
const light = document.getElementById('light');
const statusText = document.getElementById('status-text');

// Funcion para actualizar estado del semaforo
function actualizarSemaforo() {
    fetch('/status')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Limpiamos clases previas
            light.classList.remove('green', 'red');

            if (data.status === 'ok') {
                light.classList.add('green');
                statusText.innerText = data.message;
                statusText.style.color = '#00ff00';
            } else {
                light.classList.add('red');
                statusText.innerText = data.message;
                statusText.style.color = '#ff0000';
            }
        })
        .catch(function (error) {
            console.log('Error al obtener estado: ' + error);
        });
}

// Inicializar semaforo
actualizarSemaforo();
// Actualizar cada 5 segundos
setInterval(actualizarSemaforo, 5000);

// Manejadores de eventos para botones
btnRam.addEventListener('click', function () {
    consoleOutput.innerText = 'Ejecutando verificacion de RAM...';

    fetch('/api/ram')
        .then(function (response) {
            return response.text();
        })
        .then(function (texto) {
            consoleOutput.innerText = texto;
        })
        .catch(function (error) {
            consoleOutput.innerText = 'Error: ' + error;
        });
});

btnCpu.addEventListener('click', function () {
    consoleOutput.innerText = 'Ejecutando verificacion de CPU...';

    fetch('/api/cpu')
        .then(function (response) {
            return response.text();
        })
        .then(function (texto) {
            consoleOutput.innerText = texto;
        })
        .catch(function (error) {
            consoleOutput.innerText = 'Error: ' + error;
        });
});

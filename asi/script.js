const files = [
    { name: "GenerateDataSet.html", type: "HTML" },
    { name: "InferenceExplicacion.html", type: "HTML" },
    { name: "MEMORIA_PROYECTO.md", type: "Markdown" },
    { name: "MemoriaProyecto.html", type: "HTML" },
    { name: "RecetasExtendedExplicacion.html", type: "HTML" },
    { name: "TrainFromScratchExplicacion.html", type: "HTML" },
    { name: "generate_dataset.py", type: "Python" },
    { name: "inference_scratch.py", type: "Python" },
    { name: "recetas_extended.jsonl", type: "JSONL" },
    { name: "train_from_scratch.py", type: "Python" }
];

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('file-grid');
    if (grid) {
        renderGrid(grid);
    }

    const codeContainer = document.getElementById('code-content');
    if (codeContainer) {
        loadCode(codeContainer);
    }
});

function renderGrid(container) {
    files.forEach(file => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let actions = `
            <a href="assets/${file.name}" download class="btn btn-secondary">Descargar</a>
            <a href="view.html?file=${encodeURIComponent(file.name)}" class="btn btn-primary">Ver Código</a>
        `;

        // If it's an HTML file, allow viewing it directly
        if (file.type === 'HTML') {
            actions += `
                <a href="assets/${file.name}" target="_blank" class="btn btn-secondary" style="margin-top: 8px; flex-basis: 100%;">Abrir Página</a>
            `;
        }

        card.innerHTML = `
            <div class="card-header">
                <span class="card-type">${file.type}</span>
                <h3 class="card-title">${file.name}</h3>
            </div>
            <div class="card-actions">
                ${actions}
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadCode(container) {
    const params = new URLSearchParams(window.location.search);
    const fileName = params.get('file');
    
    if (!fileName) {
        container.textContent = 'Archivo no especificado.';
        return;
    }

    document.getElementById('file-name-display').textContent = fileName;
    
    // Set a download link for the viewed file
    const downloadLink = document.getElementById('download-current-file');
    if(downloadLink) {
        downloadLink.href = `assets/${fileName}`;
    }

    try {
        const response = await fetch(`assets/${fileName}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const text = await response.text();
        
        // Simple HTML escaping to prevent rendering
        const safeText = text.replace(/&/g, "&amp;")
                             .replace(/</g, "&lt;")
                             .replace(/>/g, "&gt;")
                             .replace(/"/g, "&quot;")
                             .replace(/'/g, "&#039;");
                             
        container.innerHTML = `<code class="language-${getExtension(fileName)}">${safeText}</code>`;
        
        // Trigger Prism highlight if available
        if (window.Prism) {
            Prism.highlightElement(container.querySelector('code'));
        }
    } catch (err) {
        container.textContent = `Error cargando el archivo: ${err.message}`;
    }
}

function getExtension(filename) {
    return filename.split('.').pop();
}

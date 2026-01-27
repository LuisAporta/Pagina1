const PDFDocument = require('pdfkit');
const fs = require('fs');

// Crear documento
const doc = new PDFDocument();

// Pipe al archivo de salida
doc.pipe(fs.createWriteStream('Entrega_Proyecto.pdf'));

// Titulo
doc.fontSize(25).text('Entrega de Proyecto: Dashboard Servidores', {
    align: 'center'
});

doc.moveDown();

// Enlaces Requeridos
doc.fontSize(16).text('Enlaces Requeridos:', { underline: true });
doc.moveDown();

// 1. Web Local
doc.fontSize(12).fillColor('blue').text('1. Web Local (Dashboard)', {
    link: 'http://localhost:3000',
    underline: true
});
doc.moveDown();

// 2. Repositorio GitHub
doc.text('2. Repositorio GitHub', {
    link: 'https://github.com/luisaporta/Pagina1',
    underline: true
});
doc.moveDown();

// 3. Placeholder
doc.text('3. Proceso de Resolucion (Placeholder)', {
    link: 'https://www.google.com/search?q=google.com',
    underline: true
});
doc.moveDown();
doc.fillColor('black');

// Explicacion del Proceso
doc.fontSize(16).text('Explicacion del Proceso:', { underline: true });
doc.moveDown();

doc.fontSize(12).text(`
Este proyecto ha sido construido siguiendo la metodologia "Don Viejo" y un diseno "Premium". 

1. Backend (Node.js + Express):
   - Se configuro un servidor Express en 'server.js'.
   - Se implementaron 3 endpoints principales: 
     * /status: Simula el estado del servidor.
     * /api/ram: Ejecuta 'wmic' mediante child_process.exec para obtener datos reales de memoria.
     * /api/cpu: Ejecuta 'wmic' para la carga de CPU.
   - Todo el codigo evita el uso prematuro de 'return' y utiliza variables de control.

2. Frontend (Vanilla JS + CSS):
   - 'index.html' estructura la aplicacion en paneles semanticos.
   - 'style.css' aplica un tema oscuro con efectos neon y glassmorphism.
   - 'app.js' consume la API mediante fetch y actualiza el DOM sin frameworks.

3. Despliegue y Documentacion:
   - Se inicializo un repositorio Git local.
   - Se subio a GitHub utilizando credenciales proporcionadas.
   - Este PDF fue generado programaticamente con 'pdfkit'.
`, {
    align: 'justify'
});

// Finalizar PDF
doc.end();

console.log('PDF Generado exitosamente: Entrega_Proyecto.pdf');

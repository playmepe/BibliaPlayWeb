document.getElementById('cargar').addEventListener('click', async function() {
    const [fileHandle] = await window.showOpenFilePicker({
        types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] }
        }]
    });

    const file = await fileHandle.getFile();
    const text = await file.text();
    const jsonData = JSON.parse(text);

    // Coloca el contenido en el textarea
    const letras = jsonData.letras.map(line => line === '' ? "" : line).join('\n');
    document.getElementById('texto').value = letras;

    // Toma la primera línea como nombre del archivo, si está presente
    const firstLine = jsonData.letras[0] || '';
    document.getElementById('nombreArchivo').value = firstLine;
});

document.getElementById('guardar').addEventListener('click', async function() {
    const texto = document.getElementById('texto').value.split('\n').map(line => line === '' ? "" : line);
    const jsonData = { letras: texto };

    // Toma la primera línea como nombre del archivo, si no hay uno especificado
    const nombreArchivo = document.getElementById('nombreArchivo').value || (texto[0] || 'texto');

    try {
        const handle = await window.showDirectoryPicker();
        const fileHandle = await handle.getFileHandle(`${nombreArchivo}.json`, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(jsonData, null, 2));
        await writable.close();
        alert(`Archivo guardado como ${nombreArchivo}.json`);
    } catch (error) {
        console.error('Error al guardar el archivo:', error);
    }
});

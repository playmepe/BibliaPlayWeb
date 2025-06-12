document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
const searchValue = 'exhortarles con abundancia de palabras'


    let version; // Asegúrate de que esté definido en un ámbito accesible.
    let books = [];
    let chapters = [];
    let verses = [];
    let chapterCache = {};
    let selectedVersion = ''; // Definir la variable en el ámbito adecuado
    let selectedBook = '';
    let selectedChapter = '';




const versionSelect = document.getElementById('versionSelect'); // Suponiendo que tienes un select para las versiones
/*
versionSelect.addEventListener('change', (event) => {
    selectedVersion = event.target.value; // Actualiza selectedVersion con el valor seleccionado
});
*/
 // Función para cargar las versiones en un combo box
async function loadVersions() {
    try {
        const response = await fetch('/api/versions');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const versions = await response.json();
        const select = document.getElementById('versionSelect');

        // Limpiar el select antes de agregar las versiones
        select.innerHTML = '<option value="">-- Elige una versión --</option>';

        // Log para verificar las versiones que se están cargando
       // console.log('Versiones cargadas:', versions);

        versions.forEach(version => {
            const option = document.createElement('option');
            option.value = version;  // Asegúrate de que esto sea el valor correcto
            option.textContent = version; // Asegúrate de que esto sea el texto correcto
            select.appendChild(option);
        });

        // Intentar cargar la versión guardada en localStorage
        const savedVersion = localStorage.getItem('selectedVersion');
        console.log('Cargando la Versión guardada en localStorage:', savedVersion);

        if (savedVersion) {
            // Verificar las opciones en el combo box
            //console.log('Opciones en el combo box:', Array.from(select.options).map(option => option.value));

            // Establecer la versión en el select si existe en las opciones
            if (Array.from(select.options).some(option => option.value === savedVersion)) {
                select.value = savedVersion;
                console.log('Estableciendo versión seleccionada:', savedVersion);

                // Cargar libros para la versión guardada
                loadBooks(savedVersion);
            } else {
                console.warn('La versión guardada no está en las opciones del combo box.');
            }
        }

    } catch (error) {
        console.error('Error al cargar las versiones:', error);
    }
}

/***********
// Listener para el botón de búsqueda
    searchButton.addEventListener('click', () => {
        //searchInput.value = searchValue
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });
******************/

/*
async function performSearch(query) {
    try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        console.log(`Resultado de fetch: ${response}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const results = await response.json();
        console.log('Resultados de búsqueda:', results); // Log los resultados aquí
        displaySearchResults(results);
    } catch (error) {
        console.error('Error al obtener resultados de búsqueda:', error);
    }
}
*/
/*
document.getElementById('searchButton').addEventListener('click', function() {
    const searchTerm = document.getElementById('searchInput').value;
    loadVerses(version, searchTerm);
});

async function loadVerses(version, searchTerm) {
    try {
        const response = await fetch(`http://localhost:4000/api/search/${encodeURIComponent(version)}/${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        displayVerses(data); // Muestra los resultados de la búsqueda
console.log('Resultados de búsquedass:', data);
        if (data.length > 0) {
            displayResultContent(data); // Muestra solo los resultados de la búsqueda
        } else {
            resultContent.textContent = 'No se encontraron resultados.';
        }

        // Preparar los resultados para el envío
        return data.map(item => `${item["0"]}: ${item["1"]}`).join('\n');
    } catch (error) {
        console.error('Error en la búsqueda', error);
        resultContent.textContent = 'Error en la búsqueda.';
        return ''; // Devuelve una cadena vacía en caso de error
    }
}
*/
document.getElementById('searchButton').addEventListener('click', function() {
    const version = document.getElementById('versionSelect').value;
    const searchTerm = document.getElementById('searchInput').value.trim();

    if (version && searchTerm) {
        console.log(`Buscando con versión: ${version}, término: ${searchTerm}`);
        performSearch(version, searchTerm);
    } else {
        alert('Por favor, selecciona una versión y escribe un término de búsqueda.');
    }
});

async function performSearch(version, searchTerm) {
    try {
        const response = await fetch(`http://localhost:4000/api/search/${encodeURIComponent(version)}/${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        displayResultContent(data); // Muestra los resultados de la búsqueda

    } catch (error) {
        console.error('Error en la búsqueda', error);
        document.getElementById('resultContent').textContent = 'Error en la búsqueda.';
    }
}

function displayResultContent(verses) {
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = ''; // Limpiar el contenido anterior

    if (verses.length === 0) {
        resultContent.textContent = 'No se encontraron resultados.';
        return;
    }

    verses.forEach((verse) => {
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse-item';
        verseDiv.setAttribute('data-verse', verse["0"]); // Atributo para identificación
        verseDiv.textContent = `${verse["0"]}: ${verse["1"]}`; // Formato "número: texto"
        verseDiv.tabIndex = 0;
        verseDiv.onclick = () => {
            selectVerse(verse); // Manejar la selección del versículo
            verseDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); // Desplazarse al versículo
        };
        resultContent.appendChild(verseDiv); // Añadir al contenedor resultContent
    });
}


/*
    // Listener para el botón de búsqueda
    searchButton.addEventListener('click', () => {
        searchInput.value = searchValue;
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });
*/
    // Listener para la tecla Enter
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });

});

function displayVerses(verses) {
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = ''; // Limpiar resultados previos

    verses.forEach(verse => {
        const verseElement = document.createElement('div');
        verseElement.innerHTML = `<strong>${verse.book} ${verse.chapter}:${verse.verseNumber}</strong>: ${verse.text}`;
        resultsContainer.appendChild(verseElement);
    });
}

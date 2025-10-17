
        document.addEventListener('DOMContentLoaded', function() {
            const desktop = document.getElementById('desktop');
            const menuBtn = document.getElementById('menu-btn');
            const addBtn = document.getElementById('add-btn');
            const resetBtn = document.getElementById('reset-btn');
            const saveBtn = document.getElementById('save-btn');
            const exportBtn = document.getElementById('export-btn');
            const importBtn = document.getElementById('import-btn');
            const proyectarBtn = document.getElementById('proyectar-btn');
            const importFile = document.getElementById('import-file');
            const menuPanel = document.getElementById('menu-panel');
            const windowCount = document.getElementById('window-count');
            const minimizedWindows = document.getElementById('minimized-windows');
            const menuItemsContainer = document.getElementById('menu-items-container');
            const addUrlBtn = document.getElementById('add-url-btn');
            const urlModal = document.getElementById('url-modal');
            const customUrlModal = document.getElementById('custom-url-modal');
            const cancelUrlBtn = document.getElementById('cancel-url');
            const confirmUrlBtn = document.getElementById('confirm-url');
            const cancelCustomBtn = document.getElementById('cancel-custom');
            const confirmCustomBtn = document.getElementById('confirm-custom');
            const newUrlInput = document.getElementById('new-url');
            const newTitleInput = document.getElementById('new-title');
            const customUrlInput = document.getElementById('custom-url');
            const customTitleInput = document.getElementById('custom-title');
       const wsWss = new WebSocket(`wss://${window.location.hostname}:8082`);
            let iframeCount = 0;
            let zIndex = 10;
            let activeWindow = null;
            let minimizedWindowsList = [];
            let isResizing = false;
            let currentResizeHandle = null;
//let wsWss = null;
            // Cargar iframes y menú guardados al iniciar
            loadIframes();
            loadMenuItems();
            updateWindowCount();

            // Event listeners
            menuBtn.addEventListener('click', function() {
                menuPanel.style.display = menuPanel.style.display === 'block' ? 'none' : 'block';
            });

            addBtn.addEventListener('click', function() {
                customUrlInput.value = '';
                customTitleInput.value = '';
                customUrlModal.style.display = 'flex';
            });

            resetBtn.addEventListener('click', function() {
                if (confirm('¿Estás seguro de que quieres eliminar todas las ventanas?')) {
                    localStorage.removeItem('savedIframes');
                    desktop.innerHTML = '';
                    minimizedWindows.innerHTML = '';
                    iframeCount = 0;
                    minimizedWindowsList = [];
                    updateWindowCount();
                }
            });

// Añade esta variable al inicio con las otras
//const sendAutoProjectBtn = document.getElementById('sendAutoProject');


// Función para inicializar la conexión WebSocket
function initializeWebSocket() {
    console.log('🔌 Conectando a WebSocket en puerto 8082...');

    //wsWss = new WebSocket(`ws://${window.location.hostname}:8082`);

    wsWss.onopen = () => {
        console.log('✅ WebSocket conectado correctamente al puerto 8082');
        initializeDefaultSource();
    };

    wsWss.onmessage = (ev) => {
        console.log('📨 Mensaje WebSocket recibido:', ev.data);

      /*  try {
            const msg = JSON.parse(ev.data);

            // PROCESAR MENSAJE DE AUTO-PROYECCIÓN
            if (msg.type === 'auto-project-startup') {
                console.log('🚀 Recibida solicitud de proyección automática desde servidor');
                handleAutoProjectionRequest();
                return;
            }

            if (['displays-changed', 'sources-changed', 'projection-opened', 'projection-closed'].includes(msg.type)) {
                console.log('🔄 Recargando UI por:', msg.type);
                loadUI();
            }

            // Procesar comandos de control de pantallas
            if (msg.type === 'control-command') {
                handleControlCommand(msg.command, msg.data);
            }

        } catch (error) {
            // Si no es JSON, podría ser un mensaje de proyector
            if (ev.data.startsWith('font-size:')) {
                console.log('Mensaje de proyector ignorado por control:', ev.data);
            } else {
                handleControlCommand(ev.data);
            }
        } */
    };

    wsWss.onerror = (error) => {
        console.error('❌ Error de WebSocket:', error);
    };

    wsWss.onclose = () => {
        console.log('🔌 WebSocket cerrado');
    };
}


// Añade este event listener con los otros
proyectarBtn.addEventListener('click', () => {
    console.log('📤 Enviando mensaje auto-project-startup por WebSocket...');
    sendAutoProjectMessage();
    // Evento para desactivar el botón al hacer clic
    proyectarBtn.addEventListener('click', desactivarBoton);
});

// FUNCIÓN: Enviar mensaje WebSocket de auto-proyección
function sendAutoProjectMessage() {
    wsWss.onopen = () => {
        console.log('✅ WebSocket conectado correctamente al puerto 8082');
        //initializeDefaultSource();
    };

    if (!wsWss || wsWss.readyState !== WebSocket.OPEN) {
        console.error('❌ WebSocket no conectado');
        sendMessage('❌ Error: WebSocket no conectado');
        return;
    }

    try {
        const message = JSON.stringify({
            type: 'auto-project-startup',
            timestamp: new Date().toISOString(),
            message: 'Solicitud de proyección automática',
            source: 'manual-button', // Identificar que viene del botón manual
            requestedBy: 'control-panel'
        });

        wsWss.send(message);
        desactivarBoton();
        console.log('✅ Mensaje auto-project-startup enviado por WebSocket');
        sendMessage('✅ Solicitud de auto-proyección enviada');

    } catch (error) {
        console.error('❌ Error enviando mensaje WebSocket:', error);
        sendMessage('❌ Error enviando solicitud');
    }
}

// FUNCIÓN: Enviar mensaje de respuesta
function sendMessage(message) {
    console.log('💬 Mensaje del sistema:', message);

    // Enviar respuesta por WebSocket si el servidor lo soporta
    if (wsWss && wsWss.readyState === WebSocket.OPEN) {
        wsWss.send(JSON.stringify({
            type: 'system-message',
            message: message
        }));
    }
}

// Comprobar si el estado se guardó previamente en localStorage
const isDisabled = localStorage.getItem('proyectarBtnDisabled');

if (isDisabled === 'true') {
    proyectarBtn.disabled = true; // Desactivar el botón
}
// Función para desactivar el botón y guardar el estado
function desactivarBoton() {
    proyectarBtn.disabled = true;
    localStorage.setItem('proyectarBtnDisabled', 'true');
}

// Evento para desactivar el botón al hacer clic
//proyectarBtn.addEventListener('click', desactivarBoton);

            saveBtn.addEventListener('click', function() {
                saveIframes();
                saveMenuItems();
                alert('Configuración guardada correctamente');
            });

            exportBtn.addEventListener('click', function() {
                exportConfiguration();
            });

            importBtn.addEventListener('click', function() {
                importFile.click();
            });

            importFile.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const config = JSON.parse(e.target.result);
                            importConfiguration(config);
                        } catch (error) {
                            alert('Error al importar el archivo: Formato inválido');
                        }
                    };
                    reader.readAsText(file);
                }
            });

            addUrlBtn.addEventListener('click', function() {
                newUrlInput.value = '';
                newTitleInput.value = '';
                urlModal.style.display = 'flex';
            });

            cancelUrlBtn.addEventListener('click', function() {
                urlModal.style.display = 'none';
            });

            confirmUrlBtn.addEventListener('click', function() {
                const url = newUrlInput.value.trim();
                const title = newTitleInput.value.trim();

                if (url && title) {
                    addMenuItem(url, title);
                    urlModal.style.display = 'none';
                    saveMenuItems();
                } else {
                    alert('Por favor, completa ambos campos');
                }
            });

            cancelCustomBtn.addEventListener('click', function() {
                customUrlModal.style.display = 'none';
            });

            confirmCustomBtn.addEventListener('click', function() {
                const url = customUrlInput.value.trim();
                const title = customTitleInput.value.trim() || 'Nueva Ventana';

                if (url) {
                    createIframe(url, title);
                    customUrlModal.style.display = 'none';
                } else {
                    alert('Por favor, introduce una URL válida');
                }
            });

            // Cerrar menú al hacer clic fuera de él
            document.addEventListener('click', function(e) {
                if (!menuPanel.contains(e.target) && e.target !== menuBtn && !menuPanel.contains(e.target)) {
                    menuPanel.style.display = 'none';
                }
            });

            // Cerrar modal al hacer clic fuera
            window.addEventListener('click', function(e) {
                if (e.target === urlModal) {
                    urlModal.style.display = 'none';
                }
                if (e.target === customUrlModal) {
                    customUrlModal.style.display = 'none';
                }
            });

            // Delegación de eventos para elementos del menú y botones de eliminar
            menuItemsContainer.addEventListener('click', function(e) {
                // Si se hace clic en un elemento del menú
                if (e.target.classList.contains('menu-item') || e.target.parentElement.classList.contains('menu-item')) {
                    const menuItem = e.target.classList.contains('menu-item') ? e.target : e.target.parentElement;
                    const url = menuItem.getAttribute('data-url');
                    const name = menuItem.querySelector('span').textContent;
                    createIframe(url, name);
                    menuPanel.style.display = 'none';
                }

                // Si se hace clic en un botón de eliminar
                if (e.target.classList.contains('delete-url-btn')) {
                    const menuItem = e.target.parentElement;
                    if (confirm('¿Eliminar este elemento del menú?')) {
                        menuItem.remove();
                        saveMenuItems();
                    }
                    e.stopPropagation();
                }
            });

            function createIframe(url, title, isMinimized = false, width = 600, height = 800, x = 50, y = 50) {
                iframeCount++;
                const iframeId = `iframe-${iframeCount}`;

                // Crear elementos
                const iframeWindow = document.createElement('div');
                iframeWindow.className = isMinimized ? 'iframe-window minimized' : 'iframe-window';
                iframeWindow.id = iframeId;
                iframeWindow.style.width = `${width}px`;
                iframeWindow.style.height = `${height}px`;
                iframeWindow.style.left = `${x}px`;
                iframeWindow.style.top = `${y}px`;
                iframeWindow.style.zIndex = zIndex++;

                const windowHeader = document.createElement('div');
                windowHeader.className = 'window-header';

                const windowTitle = document.createElement('div');
                windowTitle.className = 'window-title';

                const windowIcon = document.createElement('div');
                windowIcon.className = 'window-icon';
                windowIcon.innerHTML = '<i class="fas fa-window-restore"></i>';

                const titleText = document.createElement('span');
                titleText.textContent = title;

                const windowControls = document.createElement('div');
                windowControls.className = 'window-controls';

                const minimizeBtn = document.createElement('button');
                minimizeBtn.className = 'window-btn minimize-btn';
                minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
                minimizeBtn.addEventListener('click', function() {
                    iframeWindow.classList.add('minimized');
                    addToMinimizedWindows(iframeWindow, title);
                    saveIframes();
                });

                const maximizeBtn = document.createElement('button');
                maximizeBtn.className = 'window-btn maximize-btn';
                maximizeBtn.innerHTML = '<i class="fas fa-expand"></i>';
                maximizeBtn.addEventListener('click', function() {
                    iframeWindow.classList.toggle('maximized');
                    saveIframes();
                });

                const closeBtn = document.createElement('button');
                closeBtn.className = 'window-btn close-btn';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.addEventListener('click', function() {
                    iframeWindow.remove();
                    removeFromMinimizedWindows(iframeWindow.id);
                    iframeCount--;
                    updateWindowCount();
                    saveIframes();
                });

                const windowContent = document.createElement('div');
                windowContent.className = 'window-content';

                const iframe = document.createElement('iframe');
                iframe.src = url;

                // Construir estructura
                windowTitle.appendChild(windowIcon);
                windowTitle.appendChild(titleText);

                windowControls.appendChild(minimizeBtn);
                windowControls.appendChild(maximizeBtn);
                windowControls.appendChild(closeBtn);

                windowHeader.appendChild(windowTitle);
                windowHeader.appendChild(windowControls);

                windowContent.appendChild(iframe);

                iframeWindow.appendChild(windowHeader);
                iframeWindow.appendChild(windowContent);

                // Añadir handles de redimensionamiento en los 8 puntos
                addResizeHandles(iframeWindow);

                // Añadir a escritorio
                desktop.appendChild(iframeWindow);

                // Hacer la ventana arrastrable
                makeDraggable(iframeWindow, windowHeader);

                // Traer al frente al hacer clic
                iframeWindow.addEventListener('mousedown', function() {
                    this.style.zIndex = zIndex++;
                    activeWindow = this;
                });


                updateWindowCount();
                saveIframes();

                return iframeWindow;
            }

            function addResizeHandles(element) {
                const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

                directions.forEach(dir => {
                    const handle = document.createElement('div');
                    handle.className = `resize-handle resize-handle-${dir}`;
                    element.appendChild(handle);

                    handle.addEventListener('mousedown', function(e) {
                        e.preventDefault();
                        startResize(element, dir);
                    });
                });
            }

            function startResize(element, direction) {
                isResizing = true;
                currentResizeHandle = direction;

                const startX = event.clientX;
                const startY = event.clientY;
                const startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);
                const startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);
                const startLeft = parseInt(document.defaultView.getComputedStyle(element).left, 10);
                const startTop = parseInt(document.defaultView.getComputedStyle(element).top, 10);

                function resize(e) {
                    if (!isResizing) return;

                    // Calcular el cambio
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;

                    // Aplicar el redimensionamiento según la dirección
                    switch(direction) {
                        case 'n':
                            element.style.height = Math.max(100, startHeight - dy) + 'px';
                            element.style.top = startTop + dy + 'px';
                            break;
                        case 's':
                            element.style.height = Math.max(100, startHeight + dy) + 'px';
                            break;
                        case 'e':
                            element.style.width = Math.max(200, startWidth + dx) + 'px';
                            break;
                        case 'w':
                            element.style.width = Math.max(200, startWidth - dx) + 'px';
                            element.style.left = startLeft + dx + 'px';
                            break;
                        case 'ne':
                            element.style.width = Math.max(200, startWidth + dx) + 'px';
                            element.style.height = Math.max(100, startHeight - dy) + 'px';
                            element.style.top = startTop + dy + 'px';
                            break;
                        case 'nw':
                            element.style.width = Math.max(200, startWidth - dx) + 'px';
                            element.style.height = Math.max(100, startHeight - dy) + 'px';
                            element.style.left = startLeft + dx + 'px';
                            element.style.top = startTop + dy + 'px';
                            break;
                        case 'se':
                            element.style.width = Math.max(200, startWidth + dx) + 'px';
                            element.style.height = Math.max(100, startHeight + dy) + 'px';
                            break;
                        case 'sw':
                            element.style.width = Math.max(200, startWidth - dx) + 'px';
                            element.style.height = Math.max(100, startHeight + dy) + 'px';
                            element.style.left = startLeft + dx + 'px';
                            break;
                    }
                }

                function stopResize() {
                    isResizing = false;
                    currentResizeHandle = null;
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
                    saveIframes();
                }

                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
            }

            function addToMinimizedWindows(window, title) {
                const windowId = window.id;

                // Crear botón para restaurar ventana minimizada
                const button = document.createElement('button');
                button.className = 'minimized-window-btn';
                button.textContent = title;
                button.setAttribute('data-window-id', windowId);

                button.addEventListener('click', function() {
                    window.classList.remove('minimized');
                    removeFromMinimizedWindows(windowId);
                    // Traer al frente
                    window.style.zIndex = zIndex++;
                });

                minimizedWindows.appendChild(button);
                minimizedWindowsList.push(windowId);
                updateWindowCount();
            }

            function removeFromMinimizedWindows(windowId) {
                const button = document.querySelector(`.minimized-window-btn[data-window-id="${windowId}"]`);
                if (button) {
                    button.remove();
                }
                minimizedWindowsList = minimizedWindowsList.filter(id => id !== windowId);
                updateWindowCount();
            }

            function makeDraggable(element, handle) {
                let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

                handle.onmousedown = dragMouseDown;

                function dragMouseDown(e) {
                    if (isResizing) return;

                    e.preventDefault();
                    // Obtener la posición del cursor
                    pos3 = e.clientX;
                    pos4 = e.clientY;

                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;

                    // Traer al frente
                    element.style.zIndex = zIndex++;
                }

                function elementDrag(e) {
                    if (isResizing) return;

                    e.preventDefault();
                    // Calcular la nueva posición
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;

                    // Establecer la nueva posición
                    element.style.top = (element.offsetTop - pos2) + "px";
                    element.style.left = (element.offsetLeft - pos1) + "px";
                }

                function closeDragElement() {
                    document.onmouseup = null;
                    document.onmousemove = null;
                    saveIframes();
                }
            }

            function addMenuItem(url, title) {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.setAttribute('data-url', url);

                // Elegir icono según el título o URL
                let iconClass = 'fas fa-link';
                if (title.toLowerCase().includes('youtube')) iconClass = 'fab fa-youtube';
                else if (title.toLowerCase().includes('player')) iconClass = 'fas fa-play-circle';
                else if (title.toLowerCase().includes('biblia')) iconClass = 'fas fa-bible';
                else if (title.toLowerCase().includes('panel')) iconClass = 'fas fa-sliders-h';
                else if (title.toLowerCase().includes('temporizador')) iconClass = 'fas fa-clock';
                else if (title.toLowerCase().includes('busqueda')) iconClass = 'fas fa-search';
                else if (title.toLowerCase().includes('editor')) iconClass = 'fas fa-edit';
                else if (title.toLowerCase().includes('historial')) iconClass = 'fas fa-history';
                else if (title.toLowerCase().includes('multimedia')) iconClass = 'fas fa-photo-video';
                else if (title.toLowerCase().includes('cancionero')) iconClass = 'fas fa-music';
                else if (title.toLowerCase().includes('monitor')) iconClass = 'fas fa-tv';
                else if (title.toLowerCase().includes('pantalla')) iconClass = 'fas fa-desktop';

                menuItem.innerHTML = `
                    <i class="${iconClass}"></i>
                    <span>${title}</span>
                    <button class="delete-url-btn">&times;</button>
                `;

                menuItemsContainer.appendChild(menuItem);
            }

            function saveMenuItems() {
                const menuItems = [];
                document.querySelectorAll('.menu-item').forEach(item => {
                    menuItems.push({
                        url: item.getAttribute('data-url'),
                        title: item.querySelector('span').textContent
                    });
                });

                localStorage.setItem('savedMenuItems', JSON.stringify(menuItems));
            }

            function loadMenuItems() {
                const savedMenuItems = JSON.parse(localStorage.getItem('savedMenuItems'));

                // Si hay elementos guardados, reemplazar los predeterminados
                if (savedMenuItems && savedMenuItems.length > 0) {
                    menuItemsContainer.innerHTML = '';
                    savedMenuItems.forEach(item => {
                        addMenuItem(item.url, item.title);
                    });
                }
            }

            function saveIframes() {
                const iframes = [];
                document.querySelectorAll('.iframe-window').forEach(window => {
                    const iframe = window.querySelector('iframe');
                    const title = window.querySelector('.window-title span').textContent;

                    iframes.push({
                        url: iframe.src,
                        title: title,
                        isMinimized: window.classList.contains('minimized'),
                        isMaximized: window.classList.contains('maximized'),
                        width: window.style.width,
                        height: window.style.height,
                        x: window.style.left,
                        y: window.style.top
                    });
                });

                localStorage.setItem('savedIframes', JSON.stringify(iframes));
            }

            function loadIframes() {
                const savedIframes = JSON.parse(localStorage.getItem('savedIframes')) || [];

                savedIframes.forEach(iframeData => {
                    const iframeWindow = createIframe(
                        iframeData.url,
                        iframeData.title,
                        iframeData.isMinimized,
                        parseInt(iframeData.width),
                        parseInt(iframeData.height),
                        parseInt(iframeData.x),
                        parseInt(iframeData.y)
                    );

                    if (iframeData.isMaximized) {
                        iframeWindow.classList.add('maximized');
                    }

                    if (iframeData.isMinimized) {
                        addToMinimizedWindows(iframeWindow, iframeData.title);
                    }
                });
            }

            function exportConfiguration() {
                const iframes = [];
                document.querySelectorAll('.iframe-window').forEach(window => {
                    const iframe = window.querySelector('iframe');
                    const title = window.querySelector('.window-title span').textContent;

                    iframes.push({
                        url: iframe.src,
                        title: title,
                        isMinimized: window.classList.contains('minimized'),
                        isMaximized: window.classList.contains('maximized'),
                        width: window.style.width,
                        height: window.style.height,
                        x: window.style.left,
                        y: window.style.top
                    });
                });

                const menuItems = [];
                document.querySelectorAll('.menu-item').forEach(item => {
                    menuItems.push({
                        url: item.getAttribute('data-url'),
                        title: item.querySelector('span').textContent
                    });
                });

                const config = {
                    iframes: iframes,
                    menuItems: menuItems,
                    exportDate: new Date().toISOString()
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", "bibliaplay_config.json");
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
            }

            function importConfiguration(config) {
                if (!config.iframes || !config.menuItems) {
                    alert('El archivo de configuración no es válido');
                    return;
                }

                if (!confirm('¿Estás seguro de que quieres importar esta configuración? Se reemplazarán todas las ventanas actuales.')) {
                    return;
                }

                // Limpiar ventanas actuales
                desktop.innerHTML = '';
                minimizedWindows.innerHTML = '';
                iframeCount = 0;
                minimizedWindowsList = [];

                // Cargar elementos del menú
                menuItemsContainer.innerHTML = '';
                config.menuItems.forEach(item => {
                    addMenuItem(item.url, item.title);
                });

                // Cargar iframes
                config.iframes.forEach(iframeData => {
                    const iframeWindow = createIframe(
                        iframeData.url,
                        iframeData.title,
                        iframeData.isMinimized,
                        parseInt(iframeData.width),
                        parseInt(iframeData.height),
                        parseInt(iframeData.x),
                        parseInt(iframeData.y)
                    );

                    if (iframeData.isMaximized) {
                        iframeWindow.classList.add('maximized');
                    }

                    if (iframeData.isMinimized) {
                        addToMinimizedWindows(iframeWindow, iframeData.title);
                    }
                });

                // Guardar la nueva configuración
                saveIframes();
                saveMenuItems();

                alert('Configuración importada correctamente');
            }

            function updateWindowCount() {
                const visibleWindows = document.querySelectorAll('.iframe-window:not(.minimized)').length;
                windowCount.textContent = visibleWindows;
            }
        });

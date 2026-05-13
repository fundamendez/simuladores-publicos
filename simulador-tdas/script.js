let tdaActual = null;
let estadoTDA = [];
let frames = [];
let frameActual = 0;
let timerAuto = null;
let enReproduccion = false;

const velocidadMs = 800;
const contenedorTDA = document.getElementById('tda-container');
const statusMessage = document.getElementById('status-message');
const panelOps = document.getElementById('operations-panel');
const panelPlayback = document.getElementById('playback-controls');
const opsButtons = document.getElementById('ops-buttons');
const inputVal = document.getElementById('tda-value');
const inputPos = document.getElementById('tda-pos');
const groupPos = document.getElementById('group-pos');

/* ====================
   CONFIGURACIÓN DE TDA
   ==================== */
function seleccionarTDA(tipo) {
    cancelarEjecucion();
    tdaActual = tipo;
    estadoTDA = [];
    contenedorTDA.className = `tda-container layout-${tipo}`;
    panelOps.style.display = 'flex';
    groupPos.style.display = (tipo === 'lista') ? 'flex' : 'none';
    let htmlBotones = '';
    htmlBotones += `<button class="btn-accion" onclick="opCrear()">Crear / Vaciar</button>`;
    
    if (tipo === 'lista') {
        htmlBotones += `
            <button class="btn-accion" onclick="prepararOp('insertar')">Insertar</button>
            <button class="btn-alg" onclick="prepararOp('eliminar')">Eliminar (Posición)</button>
            <button class="btn-info" onclick="prepararOp('obtener')">Obtener (Posición)</button>
            <button class="btn-info" onclick="prepararOp('buscar')">Buscar (Valor)</button>
            <button class="btn-info" onclick="opEstatica('largo')">Largo Lista</button>
        `;
    } else if (tipo === 'cola') {
        htmlBotones += `
            <button class="btn-accion" onclick="prepararOp('encolar')">Encolar</button>
            <button class="btn-alg" onclick="prepararOp('desencolar')">Desencolar</button>
            <button class="btn-info" onclick="opEstatica('primero')">Primero</button>
        `;
    } else if (tipo === 'pila') {
        htmlBotones += `
            <button class="btn-accion" onclick="prepararOp('apilar')">Apilar</button>
            <button class="btn-alg" onclick="prepararOp('desapilar')">Desapilar</button>
            <button class="btn-info" onclick="opEstatica('tope')">Tope</button>
        `;
    }
    
    htmlBotones += `
        <button class="btn-info" onclick="opEstatica('esta_vacia')">¿Está Vacía?</button>
        <button class="btn-alg" onclick="opDestruir()">Destruir</button>
    `;
    
    opsButtons.innerHTML = htmlBotones;
    statusMessage.textContent = `TDA ${tipo.toUpperCase()} inicializado.`;
    renderizarNodos(estadoTDA);
}

/* ====================
   OPERACIONES DIRECTAS
   ==================== */
function opCrear() {
    estadoTDA = [];
    statusMessage.textContent = "TDA Creado / Vaciado correctamente.";
    renderizarNodos(estadoTDA);
}

function opDestruir() {
    estadoTDA = [];
    tdaActual = null;
    panelOps.style.display = 'none';
    contenedorTDA.innerHTML = '';
    statusMessage.textContent = "TDA Destruido. Memoria liberada.";
}

function opEstatica(tipo) {
    if (tipo === 'esta_vacia') {
        statusMessage.textContent = estadoTDA.length === 0 ? "True: El TDA está vacío." : "False: El TDA tiene elementos.";
    } else if (tipo === 'largo') {
        statusMessage.textContent = `El largo de la lista es: ${estadoTDA.length}`;
    } else if (tipo === 'primero') {
        if (estadoTDA.length === 0) statusMessage.textContent = "Error: La cola está vacía.";
        else statusMessage.textContent = `El primer elemento es: ${estadoTDA[0]}`;
    } else if (tipo === 'tope') {
        if (estadoTDA.length === 0) statusMessage.textContent = "Error: La pila está vacía.";
        else statusMessage.textContent = `El tope es: ${estadoTDA[estadoTDA.length - 1]}`;
    }
}

/* ===================
   GENERADOR DE FRAMES
   =================== */
function prepararOp(operacion) {
    cancelarEjecucion();
    const val = parseInt(inputVal.value);
    const pos = parseInt(inputPos.value);
    frames = [];
    let tempArr = [...estadoTDA];
    guardarFrame(tempArr, -1, '', `Iniciando operación: ${operacion.toUpperCase()}`);

    try {
        if (operacion === 'apilar') {
            guardarFrame(tempArr, -1, '', `Preparando nodo con valor ${val}`);
            tempArr.push(val);
            guardarFrame(tempArr, tempArr.length - 1, 'highlight', `Nodo apilado en el Tope.`);
        } 
        else if (operacion === 'desapilar') {
            if (tempArr.length === 0) throw "La pila está vacía.";
            guardarFrame(tempArr, tempArr.length - 1, 'removing', `Identificando el Tope para desapilar...`);
            tempArr.pop();
            guardarFrame(tempArr, -1, '', `Tope eliminado. Nueva memoria actualizada.`);
        }
        else if (operacion === 'encolar') {
            guardarFrame(tempArr, -1, '', `Preparando nodo con valor ${val}`);
            tempArr.push(val);
            guardarFrame(tempArr, tempArr.length - 1, 'highlight', `Nodo agregado al final (back) de la Cola.`);
        }
        else if (operacion === 'desencolar') {
            if (tempArr.length === 0) throw "La cola está vacía.";
            guardarFrame(tempArr, 0, 'removing', `Identificando el Frente (front) para desencolar...`);
            tempArr.shift();
            guardarFrame(tempArr, -1, '', `Frente desencolado. Desplazando punteros.`);
        }
        else if (operacion === 'insertar') {
            if (pos < 0 || pos > tempArr.length) throw "Posición inválida.";
            guardarFrame(tempArr, -1, '', `Buscando la posición ${pos}...`);
            tempArr.splice(pos, 0, val);
            guardarFrame(tempArr, pos, 'highlight', `Nodo insertado. Reconfigurando punteros para incluir el valor ${val}.`);
        }
        else if (operacion === 'eliminar') {
            if (pos < 0 || pos >= tempArr.length) throw "Posición inválida.";
            guardarFrame(tempArr, pos, 'removing', `Rompiendo enlaces para aislar el nodo de la posición ${pos}...`);
            tempArr.splice(pos, 1);
            guardarFrame(tempArr, -1, '', `Nodo eliminado. Punteros reconectados exitosamente.`);
        }
        else if (operacion === 'obtener') {
            if (pos < 0 || pos >= tempArr.length) throw "Posición inválida.";
            guardarFrame(tempArr, pos, 'info', `Recorriendo hasta la posición ${pos}...`);
            guardarFrame(tempArr, pos, 'highlight', `El valor en la posición ${pos} es ${tempArr[pos]}.`);
        }
        else if (operacion === 'buscar') {
            let encontrado = false;
            for (let i = 0; i < tempArr.length; i++) {
                guardarFrame(tempArr, i, 'info', `Comparando con índice ${i}...`);
                if (tempArr[i] === val) {
                    guardarFrame(tempArr, i, 'highlight', `¡Encontrado! El valor ${val} está en la posición ${i}.`);
                    encontrado = true;
                    break;
                }
            }
            if (!encontrado) guardarFrame(tempArr, -1, '', `El valor ${val} no existe en la lista.`);
        }
        
    } catch (error) {
        guardarFrame(tempArr, -1, 'removing', `ERROR: ${error}`);
    }

    frameActual = 0;
    panelPlayback.style.display = 'flex';
    renderizarFotograma(frames[frameActual]);
    actualizarBotonesUI();
}

function guardarFrame(arr, targetIndex, statusClass, msj) {
    frames.push({
        array: [...arr],
        target: targetIndex,
        cssClass: statusClass,
        mensaje: msj
    });
}

/* =====================
   MOTOR DE REPRODUCCIÓN
   ===================== */
function renderizarNodos(arr, target = -1, cssClass = '') {
    contenedorTDA.innerHTML = '';
    arr.forEach((valor, index) => {
        const nodo = document.createElement('div');
        nodo.classList.add('tda-node');
        nodo.style.setProperty('--hue', (valor * 37) % 360);
        nodo.textContent = valor;
        let etiqueta = `Idx: ${index}`;
        if (tdaActual === 'pila' && index === arr.length - 1) etiqueta = 'Tope';
        if (tdaActual === 'cola' && index === 0) etiqueta = 'Frente';
        if (tdaActual === 'cola' && index === arr.length - 1) etiqueta = 'Final';
        nodo.setAttribute('data-index', etiqueta);
        if (index === target && cssClass !== '') {
            nodo.classList.add(cssClass);
        }

        contenedorTDA.appendChild(nodo);
        if (tdaActual === 'lista' && index < arr.length - 1) {
            const flecha = document.createElement('div');
            flecha.classList.add('tda-arrow');
            if ((index === target || index + 1 === target) && cssClass === 'removing') {
                flecha.classList.add('arrow-removing');
            }
            
            if ((index === target || index + 1 === target) && cssClass === 'highlight') {
                flecha.classList.add('arrow-highlight');
            }

            contenedorTDA.appendChild(flecha);
        }
    });
}

function renderizarFotograma(frame) {
    statusMessage.textContent = frame.mensaje;
    renderizarNodos(frame.array, frame.target, frame.cssClass);
    if (frameActual === frames.length - 1) {
        estadoTDA = [...frame.array];
    }
}

function actualizarBotonesUI() {
    document.getElementById('btn-prev').disabled = (frameActual === 0);
    document.getElementById('btn-next').disabled = (frameActual >= frames.length - 1);
    
    const btnAuto = document.getElementById('btn-auto');
    if (enReproduccion) {
        btnAuto.innerHTML = "⏸ Pausar";
        btnAuto.classList.add('pausado');
    } else {
        btnAuto.innerHTML = "▶ Auto Ejecutar";
        btnAuto.classList.remove('pausado');
    }
}

function toggleAutoPlay() {
    if (enReproduccion) pausarAutoPlay();
    else iniciarAutoPlay();
}

function iniciarAutoPlay() {
    if (frameActual >= frames.length - 1) return; 
    enReproduccion = true;
    actualizarBotonesUI();
    
    timerAuto = setInterval(() => {
        if (frameActual < frames.length - 1) {
            frameActual++;
            renderizarFotograma(frames[frameActual]);
            actualizarBotonesUI();
        } else {
            pausarAutoPlay();
        }
    }, velocidadMs);
}

function pausarAutoPlay() {
    enReproduccion = false;
    clearInterval(timerAuto);
    actualizarBotonesUI();
}

function cancelarEjecucion() {
    pausarAutoPlay();
    panelPlayback.style.display = 'none';
    frames = [];
    frameActual = 0;
    renderizarNodos(estadoTDA);
}

function pasoSiguiente() {
    pausarAutoPlay();
    if (frameActual < frames.length - 1) {
        frameActual++;
        renderizarFotograma(frames[frameActual]);
        actualizarBotonesUI();
    }
}

function pasoPrevio() {
    pausarAutoPlay();
    if (frameActual > 0) {
        frameActual--;
        renderizarFotograma(frames[frameActual]);
        if (frameActual < frames.length - 1) {
            estadoTDA = [...frames[0].array]; 
        }
        actualizarBotonesUI();
    }
}

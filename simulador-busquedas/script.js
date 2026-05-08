let vectorOriginal = [];
let frames = [];
let frameActual = 0;
let timerAuto = null;
let enReproduccion = false;
let estaOrdenado = false;
const velocidadMs = 800; // Un poco más lento para poder leer los mensajes

const contenedorBarras = document.getElementById('bars-container');
const inputTarget = document.getElementById('search-target');
const panelPlayback = document.getElementById('playback-controls');
const btnBinaria = document.getElementById('btn-binaria');
const statusMessage = document.getElementById('status-message');

/* ====================
   FUNCIONES AUXILIARES Y UI
   ==================== */
function generarVector(size = 15) {
    cancelarEjecucion(); 
    vectorOriginal = [];
    estaOrdenado = false;
    btnBinaria.disabled = true;
    
    for (let i = 0; i < size; i++) {
        vectorOriginal.push(Math.floor(Math.random() * 51));
    }
    
    renderizarFrame({
        array: vectorOriginal,
        comparando: [],
        descartado: [],
        encontrado: -1,
        mensaje: "Vector generado. Listo para buscar."
    });
}

function ordenarVector() {
    if (enReproduccion || frames.length > 0) cancelarEjecucion();
    
    // Ordenamos el array real
    vectorOriginal.sort((a, b) => a - b);
    estaOrdenado = true;
    btnBinaria.disabled = false;
    
    renderizarFrame({
        array: vectorOriginal,
        comparando: [],
        descartado: [],
        encontrado: -1,
        mensaje: "Vector ordenado. ¡Búsqueda Binaria habilitada!"
    });
}

function renderizarFrame(frame) {
    contenedorBarras.innerHTML = '';
    statusMessage.textContent = frame.mensaje;
    
    frame.array.forEach((valor, index) => {
        const barra = document.createElement('div');
        barra.classList.add('bar');
        barra.style.height = `${(valor * 6) + 25}px`; 
        barra.textContent = valor;

        if (index === frame.encontrado) {
            barra.classList.add('encontrado');
        } else if (frame.descartado.includes(index)) {
            barra.classList.add('descartado');
        } else if (frame.comparando.includes(index)) {
            barra.classList.add('comparando');
        }

        contenedorBarras.appendChild(barra);
    });
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

// Inicializamos con 15 elementos
generarVector(15);

/* ====================
   CONTROLES DE REPRODUCCIÓN
   ==================== */
function prepararBusqueda(tipo) {
    cancelarEjecucion();
    let target = parseInt(inputTarget.value);
    if (isNaN(target)) target = 25;

    switch(tipo) {
        case 'lineal': frames = calcularBusquedaLineal([...vectorOriginal], target); break;
        case 'binaria': frames = calcularBusquedaBinaria([...vectorOriginal], target); break;
    }
    
    frameActual = 0;
    panelPlayback.style.display = 'flex';
    renderizarFrame(frames[frameActual]);
    actualizarBotonesUI();
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
            renderizarFrame(frames[frameActual]);
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
    
    if (vectorOriginal.length > 0) {
        renderizarFrame({
            array: vectorOriginal,
            comparando: [],
            descartado: [],
            encontrado: -1,
            mensaje: "Búsqueda cancelada."
        });
    }
}

function pasoSiguiente() {
    pausarAutoPlay();
    if (frameActual < frames.length - 1) {
        frameActual++;
        renderizarFrame(frames[frameActual]);
        actualizarBotonesUI();
    }
}

function pasoPrevio() {
    pausarAutoPlay();
    if (frameActual > 0) {
        frameActual--;
        renderizarFrame(frames[frameActual]);
        actualizarBotonesUI();
    }
}

/* ===================
   MÉTODOS DE BÚSQUEDA
   =================== */
function guardarFrame(fArr, arr, comparando, descartado, encontrado, mensaje) {
    fArr.push({
        array: [...arr],
        comparando: [...comparando],
        descartado: [...descartado],
        encontrado: encontrado,
        mensaje: mensaje
    });
}

/* ======
   LINEAL
   ====== */
function calcularBusquedaLineal(arr, target) {
    let f = [];
    let descartados = [];
    
    guardarFrame(f, arr, [], [], -1, `Iniciando búsqueda lineal del número ${target}...`);

    for (let i = 0; i < arr.length; i++) {
        guardarFrame(f, arr, [i], descartados, -1, `¿El índice ${i} (Valor: ${arr[i]}) es igual a ${target}?`);
        
        if (arr[i] === target) {
            guardarFrame(f, arr, [], descartados, i, `¡Éxito! El número ${target} se encuentra en el índice ${i}.`);
            return f;
        } else {
            descartados.push(i);
            guardarFrame(f, arr, [], descartados, -1, `No. Descartamos el índice ${i} y avanzamos.`);
        }
    }
    guardarFrame(f, arr, [], descartados, -1, `Búsqueda finalizada. El número ${target} no existe en el vector.`);
    return f;
}

/* =======
   BINARIA
   ======= */
function calcularBusquedaBinaria(arr, target) {
    let f = [];
    let L = 0;
    let R = arr.length - 1;
    
    guardarFrame(f, arr, [], [], -1, `Iniciando búsqueda binaria del número ${target}...`);

    while (L <= R) {
        let mid = Math.floor((L + R) / 2);
        
        let descartados = [];
        for(let i = 0; i < arr.length; i++) {
            if(i < L || i > R) descartados.push(i);
        }

        guardarFrame(f, arr, [mid], descartados, -1, `Rango [${L} a ${R}]. Analizando el centro: Índice ${mid} (Valor: ${arr[mid]})`);

        if (arr[mid] === target) {
            guardarFrame(f, arr, [], descartados, mid, `¡Éxito! El número ${target} se encuentra en el índice ${mid}.`);
            return f;
        } else if (arr[mid] < target) {
            guardarFrame(f, arr, [mid], descartados, -1, `${arr[mid]} es menor que ${target}. El objetivo debe estar en la mitad derecha.`);
            L = mid + 1;
        } else {
            guardarFrame(f, arr, [mid], descartados, -1, `${arr[mid]} es mayor que ${target}. El objetivo debe estar en la mitad izquierda.`);
            R = mid - 1;
        }
    }
    
    let todosDescartados = arr.map((_, i) => i);
    guardarFrame(f, arr, [], todosDescartados, -1, `Búsqueda finalizada. El número ${target} no existe en el vector.`);
    return f;
}

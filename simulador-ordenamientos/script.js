let vectorOriginal = [];
let frames = [];
let frameActual = 0;
let timerAuto = null;
let enReproduccion = false;
const velocidadMs = 300;

const contenedorBarras = document.getElementById('bars-container');
const inputPersonalizado = document.getElementById('custom-size');
const panelPlayback = document.getElementById('playback-controls');

/* =========================
   FUNCIONES AUXILIARES Y UI
   ========================= */
function generarVectorPersonalizado() {
    let size = parseInt(inputPersonalizado.value);
    if (isNaN(size)) size = 10;
    if (size < 5) size = 5;
    if (size > 20) size = 20;
    inputPersonalizado.value = size;
    generarVector(size);
}

function generarVector(size = 10) {
    cancelarEjecucion(); 
    vectorOriginal = [];
    
    for (let i = 0; i < size; i++) {
        const valor = Math.floor(Math.random() * 51);
        vectorOriginal.push(valor);
    }
    
    renderizarFrame({
        array: vectorOriginal,
        comparando: [],
        intercambiando: [],
        ordenado: []
    });
}

function renderizarFrame(frame) {
    contenedorBarras.innerHTML = '';
    
    frame.array.forEach((valor, index) => {
        const barra = document.createElement('div');
        barra.classList.add('bar');
        barra.style.height = `${(valor * 6) + 25}px`; 
        barra.textContent = valor;

        if (frame.ordenado.includes(index)) {
            barra.classList.add('ordenado');
        } else if (frame.intercambiando.includes(index)) {
            barra.classList.add('intercambiando');
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

// POR DEFECTO SE INICIA CON VECTOR DE 10 ELEMENTOS.
generarVector(10);

/* =========================
   CONTROLES DE REPRODUCCIÓN
   ========================= */
function prepararAlgoritmo(tipo) {
    cancelarEjecucion();
    
    switch(tipo) {
        case 'burbujeo': frames = calcularBurbujeo([...vectorOriginal]); break;
        case 'seleccion': frames = calcularSeleccion([...vectorOriginal]); break;
        case 'insercion': frames = calcularInsercion([...vectorOriginal]); break;
    }
    
    frameActual = 0;
    panelPlayback.style.display = 'flex';
    renderizarFrame(frames[frameActual]);
    actualizarBotonesUI();
}

function toggleAutoPlay() {
    if (enReproduccion) {
        pausarAutoPlay();
    } else {
        iniciarAutoPlay();
    }
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
            intercambiando: [],
            ordenado: []
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

/* =======================
   MÉTODOS DE ORDENAMIENTO
   ======================= */
function guardarFrame(framesArr, currentArray, comparando = [], intercambiando = [], ordenado = []) {
    framesArr.push({
        array: [...currentArray],
        comparando: [...comparando],
        intercambiando: [...intercambiando],
        ordenado: [...ordenado]
    });
}

/* ========
   BURBUJEO
   ======== */
function calcularBurbujeo(arr) {
    let f = [];
    let n = arr.length;
    let ordenados = [];
    guardarFrame(f, arr, [], [], ordenados);
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            guardarFrame(f, arr, [j, j + 1], [], ordenados);

            if (arr[j] > arr[j + 1]) {
                guardarFrame(f, arr, [], [j, j + 1], ordenados);
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                guardarFrame(f, arr, [], [j, j + 1], ordenados);
            }
        }
        ordenados.push(n - i - 1);
        guardarFrame(f, arr, [], [], ordenados);
    }
    ordenados.push(0);
    guardarFrame(f, arr, [], [], ordenados);
    return f;
}

/* =========
   SELECCIÓN
   ========= */
function calcularSeleccion(arr) {
    let f = [];
    let n = arr.length;
    let ordenados = [];
    guardarFrame(f, arr, [], [], ordenados);
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        guardarFrame(f, arr, [], [minIdx], ordenados);
        for (let j = i + 1; j < n; j++) {
            guardarFrame(f, arr, [j], [minIdx], ordenados);

            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                guardarFrame(f, arr, [], [minIdx], ordenados);
            }
        }

        if (minIdx !== i) {
            guardarFrame(f, arr, [], [i, minIdx], ordenados);
            let temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            guardarFrame(f, arr, [], [i, minIdx], ordenados);
        }
        
        ordenados.push(i);
        guardarFrame(f, arr, [], [], ordenados);
    }
    return f;
}

/* =========
   INSERCIÓN
   ========= */
function calcularInsercion(arr) {
    let f = [];
    let n = arr.length;
    let ordenados = [0];
    guardarFrame(f, arr, [], [], ordenados);
    for (let i = 1; i < n; i++) {
        let j = i;
        guardarFrame(f, arr, [], [j], ordenados);
        while (j > 0) {
            guardarFrame(f, arr, [j - 1, j], [], ordenados);
            if (arr[j - 1] > arr[j]) {
                let temp = arr[j];
                arr[j] = arr[j - 1];
                arr[j - 1] = temp;
                guardarFrame(f, arr, [], [j], ordenados);
            } else {
                // Si el de la izquierda es menor o igual, ya encontramos su lugar definitivo.
                break; 
            }
        }
        
        ordenados.push(i);
        guardarFrame(f, arr, [], [], ordenados);
    }
    return f;
}

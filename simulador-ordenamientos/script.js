let vectorOriginal = [];
let frames = [];
let frameActual = 0;
let timerAuto = null;
let enReproduccion = false;
const velocidadMs = 300;

const contenedorBarras = document.getElementById('bars-container');
const inputPersonalizado = document.getElementById('custom-size');
const panelPlayback = document.getElementById('playback-controls');
const statusMessage = document.getElementById('status-message');

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
        ordenado: [],
        mensaje: "Vector generado. Elige un algoritmo para comenzar."
    });
}

function renderizarFrame(frame) {
    contenedorBarras.innerHTML = '';
    if(statusMessage && frame.mensaje) {
        statusMessage.textContent = frame.mensaje;
    }
    
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
            ordenado: [],
            mensaje: "Ejecución cancelada."
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
function guardarFrame(framesArr, currentArray, comparando = [], intercambiando = [], ordenado = [], msj = "") {
    framesArr.push({
        array: [...currentArray],
        comparando: [...comparando],
        intercambiando: [...intercambiando],
        ordenado: [...ordenado],
        mensaje: msj
    });
}

/* ========
   BURBUJEO
   ======== */
function calcularBurbujeo(arr) {
    let f = [];
    let n = arr.length;
    let ordenados = [];
    guardarFrame(f, arr, [], [], ordenados, "Iniciando ordenamiento por Burbujeo.");
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            guardarFrame(f, arr, [j, j + 1], [], ordenados, `Comparando índices ${j} (${arr[j]}) y ${j+1} (${arr[j+1]}).`);
            if (arr[j] > arr[j + 1]) {
                guardarFrame(f, arr, [], [j, j + 1], ordenados, `${arr[j]} es mayor que ${arr[j+1]}, se preparan para intercambiar.`);
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                guardarFrame(f, arr, [], [j, j + 1], ordenados, `Intercambio completado.`);
            } else {
                guardarFrame(f, arr, [j, j + 1], [], ordenados, `Están en el orden correcto, avanzamos.`);
            }
        }

        ordenados.push(n - i - 1);
        guardarFrame(f, arr, [], [], ordenados, `Fin de pasada. El elemento más grande llegó a su posición final.`);
    }

    ordenados.push(0);
    guardarFrame(f, arr, [], [], ordenados, "¡Vector ordenado completamente!");
    return f;
}

/* =========
   SELECCIÓN
   ========= */
function calcularSeleccion(arr) {
    let f = [];
    let n = arr.length;
    let ordenados = [];
    guardarFrame(f, arr, [], [], ordenados, "Iniciando ordenamiento por Selección.");
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        guardarFrame(f, arr, [], [minIdx], ordenados, `Buscando el mínimo en el resto del arreglo. Asumimos el índice ${i} (Valor: ${arr[i]}).`);
        for (let j = i + 1; j < n; j++) {
            guardarFrame(f, arr, [j], [minIdx], ordenados, `¿Es ${arr[j]} menor que nuestro mínimo actual ${arr[minIdx]}?`);
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                guardarFrame(f, arr, [], [minIdx], ordenados, `¡Sí! Encontramos un nuevo mínimo en el índice ${minIdx} (Valor: ${arr[minIdx]}).`);
            }
        }

        if (minIdx !== i) {
            guardarFrame(f, arr, [], [i, minIdx], ordenados, `Posicionando el menor elemento encontrado (${arr[minIdx]}) al inicio de los desordenados.`);
            let temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
            guardarFrame(f, arr, [], [i, minIdx], ordenados, `Intercambio realizado con éxito.`);
        } else {
            guardarFrame(f, arr, [], [], ordenados, `El elemento ya es el mínimo restante, no hay que moverlo.`);
        }
        
        ordenados.push(i);
        guardarFrame(f, arr, [], [], ordenados, `El índice ${i} queda definitivamente ordenado.`);
    }

    guardarFrame(f, arr, [], [], ordenados, "¡Vector ordenado completamente!");
    return f;
}

/* =========
   INSERCIÓN
   ========= */
function calcularInsercion(arr) {
    let f = [];
    let n = arr.length;
    guardarFrame(f, arr, [], [], [0], "Iniciando ordenamiento por Inserción. Consideramos el primer elemento ordenado por defecto.");
    for (let i = 1; i < n; i++) {
        let j = i;
        const getOrdenados = (posViajero) => {
            let ord = [];
            for(let k = 0; k <= i; k++) {
                if(k !== posViajero) ord.push(k);
            }
            
            return ord;
        };

        guardarFrame(f, arr, [j], [], getOrdenados(j), `Tomamos el elemento en el índice ${j} (Valor: ${arr[j]}) para insertarlo.`);
        while (j > 0) {
            guardarFrame(f, arr, [j - 1, j], [], getOrdenados(j), `Comparamos ${arr[j]} con su vecino de la izquierda ${arr[j-1]}.`);
            if (arr[j - 1] > arr[j]) {
                guardarFrame(f, arr, [], [j - 1, j], getOrdenados(j), `${arr[j-1]} es mayor que ${arr[j]}. Los invertimos para hacerle espacio.`);
                let temp = arr[j];
                arr[j] = arr[j - 1];
                arr[j - 1] = temp;
                j--;
                guardarFrame(f, arr, [j], [], getOrdenados(j), `Desplazamiento completado.`);
            } else {
                guardarFrame(f, arr, [j - 1, j], [], getOrdenados(j), `${arr[j-1]} es menor o igual a ${arr[j]}. Hemos encontrado el lugar para este número.`);
                break; 
            }
        }
        
        let ordenadosFinal = [];
        for(let k = 0; k <= i; k++) ordenadosFinal.push(k);
        guardarFrame(f, arr, [], [], ordenadosFinal, `El elemento se ha integrado a la sublista ordenada correctamente.`);
    }
    
    let todos = [];
    for(let k = 0; k < n; k++) todos.push(k);
    guardarFrame(f, arr, [], [], todos, "¡Vector ordenado completamente!");
    return f;
}

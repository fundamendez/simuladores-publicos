/* =========================
   ESTADO GLOBAL DEL VECTOR
   ========================= */
let MAX = 0;
let vector = [];
let tope = 0;
let vectorCreado = false;
let mostrarBasura = false;

/* =========================
   ESTADO GLOBAL DE PLAYBACK
   ========================= */
let frames = [];
let frameActual = 0;
let timerAuto = null;
let enReproduccion = false;
const velocidadMs = 700;

const statusMsg = document.getElementById("status-message");
const wrapper = document.getElementById("array-wrapper");
const panelPlayback = document.getElementById("playback-controls");

const controlesOperacion = [
    "val-agregar", "btn-agregar",
    "idx-operacion", "val-operacion", "btn-insertar", "btn-elim-ord", "btn-elim-des",
    "val-buscar", "btn-buscar",
    "btn-revelar"
];

/* =========================
   FUNCIONES AUXILIARES Y UI
   ========================= */
function actualizarMensaje(texto, color = "#E91E63") {
    statusMsg.style.color = color;
    statusMsg.innerText = texto;
}

function habilitarControles(habilitar) {
    controlesOperacion.forEach(id => {
        document.getElementById(id).disabled = !habilitar;
    });
}

function generarGarbage() {
    // Simula un valor de "basura" de memoria no inicializada.
    return Math.floor(Math.random() * 1000) - 500;
}

function crearVector() {
    cancelarEjecucion();

    const tamInput = document.getElementById("tam-vector");
    const tam = parseInt(tamInput.value);

    if (isNaN(tam) || tam < 1 || tam > 20) {
        actualizarMensaje("Elegí un tamaño válido entre 1 y 20.", "#E91E63");
        return;
    }

    MAX = tam;
    vector = Array.from({ length: MAX }, () => generarGarbage());
    tope = 0;
    vectorCreado = true;
    mostrarBasura = false;

    document.getElementById("btn-revelar").innerText = "👁 Revelar elementos basura";
    document.getElementById("btn-revelar").classList.remove("activo");

    habilitarControles(true);
    dibujarArray(vector, tope, {});
    actualizarMensaje(`Vector creado con capacidad ${MAX}. Tope actual: 0`, "#5DADE2");
}

function toggleBasura() {
    mostrarBasura = !mostrarBasura;
    const btn = document.getElementById("btn-revelar");
    btn.innerText = mostrarBasura ? "🙈 Ocultar elementos basura" : "👁 Revelar elementos basura";
    btn.classList.toggle("activo", mostrarBasura);
    dibujarArray(vector, tope, {});
}

/* Dibuja el array tal cual está, sin tocar el mensaje de estado. */
function dibujarArray(vec, topeActual, estados = {}) {
    wrapper.innerHTML = "";

    for (let i = 0; i < MAX; i++) {
        const cellContainer = document.createElement("div");
        cellContainer.className = "cell-container";

        const indexLabel = document.createElement("div");
        indexLabel.className = "index";
        indexLabel.innerText = `Idx: ${i}`;

        const cell = document.createElement("div");
        cell.className = "cell";
        cell.id = `cell-${i}`;

        if (i >= topeActual) {
            cell.classList.add("garbage");
            cell.innerText = mostrarBasura ? vec[i] : "?";
        } else {
            cell.innerText = vec[i];
        }

        if (estados[i]) {
            cell.classList.add(estados[i]);
        }

        cellContainer.appendChild(cell);
        cellContainer.appendChild(indexLabel);
        wrapper.appendChild(cellContainer);
    }
}

/* Dibuja un frame completo (array + estados + mensaje). */
function renderizarFrame(frame) {
    dibujarArray(frame.vector, frame.tope, frame.estados);
    actualizarMensaje(frame.mensaje, frame.color);
}

function guardarFrame(framesArr, vec, topeActual, estados = {}, mensaje = "", color = "#F4D03F") {
    framesArr.push({
        vector: [...vec],
        tope: topeActual,
        estados: { ...estados },
        mensaje,
        color
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

function iniciarPlayback(framesGenerados) {
    frames = framesGenerados;
    frameActual = 0;
    panelPlayback.style.display = 'flex';
    renderizarFrame(frames[frameActual]);
    actualizarBotonesUI();
}

/* =========================
   CONTROLES DE REPRODUCCIÓN
   ========================= */
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
    if (vectorCreado) {
        dibujarArray(vector, tope, {});
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

/* =========================
   OPERACIONES DEL VECTOR
   ========================= */
function prepararAgregar() {
    if (!vectorCreado) return;
    cancelarEjecucion();

    if (tope >= MAX) {
        actualizarMensaje("Error: El vector alcanzó su capacidad máxima.", "#E91E63");
        return;
    }
    const val = parseInt(document.getElementById("val-agregar").value);
    if (isNaN(val)) return;

    const f = [];
    guardarFrame(f, vector, tope, {}, `Vamos a agregar el valor ${val} en el índice ${tope} (el tope actual).`);

    vector[tope] = val;
    tope++;
    guardarFrame(f, vector, tope, { [tope - 1]: "found" }, `Valor ${val} agregado. Tope actual: ${tope} | Máximo: ${MAX}`, "#2ecc71");

    iniciarPlayback(f);
}

function prepararInsertar() {
    if (!vectorCreado) return;
    cancelarEjecucion();

    const idx = parseInt(document.getElementById("idx-operacion").value);
    const val = parseInt(document.getElementById("val-operacion").value);

    if (isNaN(idx) || isNaN(val)) return;
    if (idx < 0 || idx > tope) {
        actualizarMensaje("Índice inválido.", "#E91E63");
        return;
    }
    if (tope >= MAX) {
        actualizarMensaje("Error: El vector está lleno.", "#E91E63");
        return;
    }

    const f = [];
    guardarFrame(f, vector, tope, {}, `Vamos a insertar el valor ${val} en el índice ${idx}. Hay que desplazar elementos para hacerle lugar.`);

    for (let i = tope; i > idx; i--) {
        vector[i] = vector[i - 1];
        guardarFrame(f, vector, tope, { [i]: "highlight" }, `Desplazando el valor de la posición ${i - 1} hacia la posición ${i}.`);
    }

    vector[idx] = val;
    tope++;
    guardarFrame(f, vector, tope, { [idx]: "found" }, `Inserción completada. Tope actual: ${tope}`, "#2ecc71");

    iniciarPlayback(f);
}

function prepararEliminarOrdenado() {
    if (!vectorCreado) return;
    cancelarEjecucion();

    const idx = parseInt(document.getElementById("idx-operacion").value);
    if (isNaN(idx) || idx < 0 || idx >= tope) {
        actualizarMensaje("Índice inválido para eliminar.", "#E91E63");
        return;
    }

    const f = [];
    guardarFrame(f, vector, tope, { [idx]: "removing" }, `Vamos a eliminar el valor en el índice ${idx} manteniendo el orden. Hay que desplazar los elementos siguientes.`);

    for (let i = idx; i < tope - 1; i++) {
        vector[i] = vector[i + 1];
        guardarFrame(f, vector, tope, { [i]: "highlight" }, `Moviendo el valor de la posición ${i + 1} hacia la posición ${i}.`);
    }

    tope--;
    guardarFrame(f, vector, tope, {}, `Eliminación completada. Tope actual: ${tope}`, "#2ecc71");

    iniciarPlayback(f);
}

function prepararEliminarDesordenado() {
    if (!vectorCreado) return;
    cancelarEjecucion();

    const idx = parseInt(document.getElementById("idx-operacion").value);
    if (isNaN(idx) || idx < 0 || idx >= tope) {
        actualizarMensaje("Índice inválido para eliminar.", "#E91E63");
        return;
    }

    const f = [];
    guardarFrame(f, vector, tope, { [idx]: "removing" }, `Vamos a eliminar el valor en el índice ${idx} sin mantener el orden.`);
    guardarFrame(f, vector, tope, { [idx]: "removing", [tope - 1]: "highlight" }, `Reemplazamos el índice ${idx} por el último valor válido (índice ${tope - 1}).`);

    vector[idx] = vector[tope - 1];
    tope--;
    guardarFrame(f, vector, tope, { [idx]: "found" }, `Eliminación completada. Tope actual: ${tope}`, "#2ecc71");

    iniciarPlayback(f);
}

function prepararBuscar() {
    if (!vectorCreado) return;
    cancelarEjecucion();

    const val = parseInt(document.getElementById("val-buscar").value);
    if (isNaN(val)) return;

    const f = [];
    guardarFrame(f, vector, tope, {}, `Buscando el valor ${val} linealmente, desde el índice 0.`);

    let encontrado = false;
    for (let i = 0; i < tope && !encontrado; i++) {
        if (vector[i] === val) {
            guardarFrame(f, vector, tope, { [i]: "found" }, `¡Valor ${val} encontrado en el índice ${i}!`, "#2ecc71");
            encontrado = true;
        } else {
            guardarFrame(f, vector, tope, { [i]: "highlight" }, `Comparando con el índice ${i} (valor ${vector[i]}). No coincide, seguimos.`);
        }
    }

    if (!encontrado) {
        guardarFrame(f, vector, tope, {}, `El valor ${val} NO se encuentra en el vector.`, "#E91E63");
    }

    iniciarPlayback(f);
}

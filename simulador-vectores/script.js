const MAX = 10;
let vector = new Array(MAX).fill("?");
let tope = 0;

const statusMsg = document.getElementById("status-message");

function actualizarMensaje(texto, color = "#E91E63") {
    statusMsg.style.color = color;
    statusMsg.innerText = texto;
}

function renderizar() {
    const wrapper = document.getElementById("array-wrapper");
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
        
        if (i >= tope) {
            cell.classList.add("garbage");
            cell.innerText = "?";
        } else {
            cell.innerText = vector[i];
        }

        cellContainer.appendChild(cell);
        cellContainer.appendChild(indexLabel);
        wrapper.appendChild(cellContainer);
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function agregar() {
    if (tope >= MAX) {
        actualizarMensaje("Error: El vector alcanzó su capacidad máxima.");
        return;
    }
    const val = parseInt(document.getElementById("val-agregar").value);
    if (isNaN(val)) return;

    vector[tope] = val;
    tope++;
    renderizar();
    actualizarMensaje(`Valor ${val} agregado. Tope actual: ${tope} | Máximo: 10`, "#5DADE2");
}

async function insertar() {
    const idx = parseInt(document.getElementById("idx-operacion").value);
    const val = parseInt(document.getElementById("val-operacion").value);
    
    if (isNaN(idx) || isNaN(val)) return;
    if (idx < 0 || idx > tope) {
        actualizarMensaje("Índice inválido.", "#E91E63");
        return;
    }
    if (tope >= MAX) {
        actualizarMensaje("Error: El vector está lleno.");
        return;
    }

    actualizarMensaje(`Insertando valor ${val} en índice ${idx}... desplazando elementos.`, "#F4D03F");

    for (let i = tope; i > idx; i--) {
        vector[i] = vector[i - 1];
        renderizar();
        document.getElementById(`cell-${i}`).classList.add("highlight");
        await sleep(500);
    }
    
    vector[idx] = val;
    tope++;
    renderizar();
    actualizarMensaje(`Inserción completada. Tope actual: ${tope}`, "#2ecc71");
}

async function eliminarOrdenado() {
    const idx = parseInt(document.getElementById("idx-operacion").value);
    if (isNaN(idx) || idx < 0 || idx >= tope) {
        actualizarMensaje("Índice inválido para eliminar.");
        return;
    }

    actualizarMensaje(`Eliminación ordenada en índice ${idx}... desplazando elementos.`, "#F4D03F");
    document.getElementById(`cell-${idx}`).classList.add("removing");
    await sleep(400);

    for (let i = idx; i < tope - 1; i++) {
        vector[i] = vector[i + 1];
        renderizar();
        document.getElementById(`cell-${i}`).classList.add("highlight");
        await sleep(500);
    }
    tope--;
    renderizar();
    actualizarMensaje(`Eliminación completada. Tope actual: ${tope}`, "#2ecc71");
}

async function eliminarDesordenado() {
    const idx = parseInt(document.getElementById("idx-operacion").value);
    if (isNaN(idx) || idx < 0 || idx >= tope) {
        actualizarMensaje("Índice inválido para eliminar.");
        return;
    }

    actualizarMensaje(`Eliminación desordenada. Reemplazando índice ${idx} con el último valor válido.`, "#F4D03F");
    document.getElementById(`cell-${idx}`).classList.add("removing");
    await sleep(600);

    vector[idx] = vector[tope - 1];
    tope--;
    renderizar();
    actualizarMensaje(`Eliminación completada. Tope actual: ${tope}`, "#2ecc71");
}

async function buscar() {
    const val = parseInt(document.getElementById("val-buscar").value);
    if (isNaN(val)) return;

    renderizar(); 
    actualizarMensaje(`Buscando valor ${val} linealmente...`, "#F4D03F");

    let encontrado = false;
    let i = 0;
    
    while (i < tope && !encontrado) {
        const cell = document.getElementById(`cell-${i}`);
        cell.classList.add("highlight");
        await sleep(500); 

        if (vector[i] === val) {
            cell.classList.remove("highlight");
            cell.classList.add("found");
            encontrado = true;
            actualizarMensaje(`¡Valor ${val} encontrado en el índice ${i}!`, "#2ecc71");
        } else {
            cell.classList.remove("highlight");
        }
        i++;
    }

    if (!encontrado) {
        actualizarMensaje(`El valor ${val} NO se encuentra en el vector.`, "#E91E63");
    }
}

renderizar();

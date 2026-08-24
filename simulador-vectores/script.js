const MAX = 10;
let vector = new Array(MAX).fill("?");
let tope = 0;

function renderizar() {
    const wrapper = document.getElementById("array-wrapper");
    wrapper.innerHTML = "";
    document.getElementById("tope-val").innerText = tope;

    for (let i = 0; i < MAX; i++) {
        const cellContainer = document.createElement("div");
        cellContainer.className = "cell-container";

        const indexLabel = document.createElement("div");
        indexLabel.className = "index";
        indexLabel.innerText = i;

        const cell = document.createElement("div");
        cell.className = "cell";
        cell.id = `cell-${i}`;
        
        if (i >= tope) {
            cell.classList.add("garbage");
            cell.innerText = "?";
        } else {
            cell.innerText = vector[i];
        }

        cellContainer.appendChild(indexLabel);
        cellContainer.appendChild(cell);
        wrapper.appendChild(cellContainer);
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function agregar() {
    if (tope >= MAX) return alert("Error: El vector alcanzó su capacidad máxima.");
    const val = parseInt(document.getElementById("val-agregar").value);
    if (isNaN(val)) return;

    vector[tope] = val;
    tope++;
    renderizar();
}

async function insertar() {
    const idx = parseInt(document.getElementById("idx-insercion").value);
    const val = parseInt(document.getElementById("val-insercion").value);
    
    if (isNaN(idx) || isNaN(val)) return;
    if (idx < 0 || idx > tope) return alert("Índice inválido.");
    if (tope >= MAX) return alert("Error: El vector está lleno.");
    for (let i = tope; i > idx; i--) {
        vector[i] = vector[i - 1];
        renderizar();
        document.getElementById(`cell-${i}`).classList.add("highlight");
        await sleep(400);
    }
    
    vector[idx] = val;
    tope++;
    renderizar();
}

async function eliminarOrdenado() {
    const idx = parseInt(document.getElementById("idx-eliminar").value);
    if (isNaN(idx) || idx < 0 || idx >= tope) return alert("Índice inválido.");
    for (let i = idx; i < tope - 1; i++) {
        vector[i] = vector[i + 1];
        renderizar();
        document.getElementById(`cell-${i}`).classList.add("highlight");
        await sleep(400);
    }
    tope--;
    renderizar();
}

function eliminarDesordenado() {
    const idx = parseInt(document.getElementById("idx-eliminar").value);
    if (isNaN(idx) || idx < 0 || idx >= tope) return alert("Índice inválido.");
    vector[idx] = vector[tope - 1];
    tope--;
    renderizar();
}

async function buscar() {
    const val = parseInt(document.getElementById("val-buscar").value);
    if (isNaN(val)) return;
    renderizar(); 
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
        } else {
            cell.classList.remove("highlight");
        }
        i++;
    }

    if (!encontrado) {
        setTimeout(() => alert("El valor buscado NO se encuentra en el vector."), 100);
    }
}

renderizar();

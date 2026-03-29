const socket = io();
const canvas = document.getElementById('muralCanvas');
const ctx = canvas.getContext('2d');
const colorBtns = document.querySelectorAll('.color-btn');

const GRID_SIZE = 100;
const CANVAS_SIZE = 500;
const PIXEL_SIZE = CANVAS_SIZE / GRID_SIZE; // Cada "píxel" mide 5x5 px reales

let currentColor = '#000000';
let localGrid = [];

// 1. Manejar la selección de color
colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.getAttribute('data-color');
    });
});

// Función auxiliar para pintar en el canvas
function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

// 2. Pintar al hacer clic
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    
    // Cálculo avanzado para manejar el redimensionamiento de CSS (max-width/max-height)
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Convertir coordenadas del ratón a índices de la matriz (0 a 99)
    const gridX = Math.floor(clickX / PIXEL_SIZE);
    const gridY = Math.floor(clickY / PIXEL_SIZE);

    if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE) {
        // Actualización optimista: lo pintamos localmente al instante para que se sienta rápido
        drawPixel(gridX, gridY, currentColor);
        localGrid[gridX][gridY] = currentColor;

        // Enviar el dato al servidor
        socket.emit('draw', { x: gridX, y: gridY, color: currentColor });
    }
});

// 3. Recibir el estado inicial al conectar
socket.on('init', (gridData) => {
    localGrid = gridData;
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            drawPixel(x, y, localGrid[x][y]);
        }
    }
});

// 4. Recibir actualizaciones de otros jugadores en tiempo real
socket.on('update', (data) => {
    const { x, y, color } = data;
    localGrid[x][y] = color;
    drawPixel(x, y, color);
});
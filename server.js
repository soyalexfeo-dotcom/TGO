const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir la carpeta 'public' al navegador
app.use(express.static('public'));

const GRID_SIZE = 100; // Lienzo de 100x100 píxeles
// Inicializar la matriz con color blanco puro
const grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('#ffffff'));

io.on('connection', (socket) => {
    console.log('Nuevo comandante conectado:', socket.id);
    
    // 1. Al conectar, enviar el estado actual completo del lienzo
    socket.emit('init', grid);

    // 2. Escuchar cuando alguien pinta un píxel
    socket.on('draw', (data) => {
        const { x, y, color } = data;
        
        // Validar que las coordenadas estén dentro del lienzo
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            // Actualizar la matriz en memoria
            grid[x][y] = color;
            
            // Emitir el cambio a TODOS los demás usuarios conectados
            socket.broadcast.emit('update', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Comandante desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`[TGO SYSTEM] Servidor operativo en http://localhost:${PORT}`);
});
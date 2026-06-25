const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {};
let foods = [];
const MAP_SIZE = 100;
const INITIAL_FOOD_COUNT = 200;

// Generate initial food
for (let i = 0; i < INITIAL_FOOD_COUNT; i++) {
    spawnFood();
}

function spawnFood() {
    foods.push({
        id: Math.random().toString(36).substr(2, 9),
        x: (Math.random() - 0.5) * MAP_SIZE,
        z: (Math.random() - 0.5) * MAP_SIZE,
        color: Math.floor(Math.random() * 16777215)
    });
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    players[socket.id] = {
        id: socket.id,
        x: 0,
        z: 0,
        angle: 0,
        score: 0,
        size: 1,
        color: Math.floor(Math.random() * 16777215)
    };

    // Send initial state
    socket.emit('init', { id: socket.id, players, foods });

    socket.on('updateInput', (data) => {
        if (players[socket.id]) {
            players[socket.id].angle = data.angle;
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

// Game Loop (60 ticks per second)
setInterval(() => {
    Object.values(players).forEach(player => {
        const speed = 0.15 / (1 + player.size * 0.1); // Larger = slower
        player.x += Math.cos(player.angle) * speed;
        player.z += Math.sin(player.angle) * speed;

        // Boundary checks
        player.x = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, player.x));
        player.z = Math.max(-MAP_SIZE/2, Math.min(MAP_SIZE/2, player.z));

        // Food collision detection
        foods.forEach((food, index) => {
            const dx = player.x - food.x;
            const dz = player.z - food.z;
            const distance = Math.sqrt(dx*dx + dz*dz);
            if (distance < player.size * 0.6) {
                player.score += 10;
                player.size += 0.05;
                foods.splice(index, 1);
                spawnFood();
                io.emit('foodEaten', { foodId: food.id, playerId: player.id, newSize: player.size });
            }
        });
    });

    io.emit('gameState', { players, foods });
}, 1000 / 60);

server.listen(3000, () => console.log('Server running on port 3000'));

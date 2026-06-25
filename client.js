import * as THREE from 'three';

const socket = io();
let scene, camera, renderer, myId;
const playerMeshes = {};
const foodMeshes = {};

init();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12); // Deep space/neon vibe

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    // Floor Grid
    const grid = new THREE.GridHelper(100, 50, 0x4444ff, 0x222244);
    scene.add(grid);

    window.addEventListener('mousemove', (e) => {
        const angle = Math.atan2(
            e.clientY - window.innerHeight / 2,
            e.clientX - window.innerWidth / 2
        );
        socket.emit('updateInput', { angle });
    });

    animate();
}

socket.on('init', (data) => {
    myId = data.id;
    updateGameState(data);
});

socket.on('gameState', (data) => {
    updateGameState(data);
});

function updateGameState(data) {
    // Update Players
    for (let id in data.players) {
        const p = data.players[id];
        if (!playerMeshes[id]) {
            const geo = new THREE.SphereGeometry(1, 32, 32);
            const mat = new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.3, metalness: 0.8 });
            playerMeshes[id] = new THREE.Mesh(geo, mat);
            scene.add(playerMeshes[id]);
        }
        playerMeshes[id].position.set(p.x, p.size/2, p.z);
        playerMeshes[id].scale.set(p.size, p.size, p.size);
        
        if (id === myId) {
            camera.position.set(p.x, p.size + 15, p.z + 15);
            camera.lookAt(p.x, 0, p.z);
            document.getElementById('score').innerText = p.score;
        }
    }

    // Update Food
    data.foods.forEach(f => {
        if (!foodMeshes[f.id]) {
            const geo = new THREE.OctahedronGeometry(0.3, 0);
            const mat = new THREE.MeshPhongMaterial({ color: f.color, emissive: f.color, emissiveIntensity: 0.5 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(f.x, 0.3, f.z);
            foodMeshes[f.id] = mesh;
            scene.add(mesh);
        }
    });

    // Cleanup disconnected players
    for (let id in playerMeshes) {
        if (!data.players[id]) {
            scene.remove(playerMeshes[id]);
            delete playerMeshes[id];
        }
    }
}

socket.on('foodEaten', (data) => {
    if (foodMeshes[data.foodId]) {
        scene.remove(foodMeshes[data.foodId]);
        delete foodMeshes[data.foodId];
    }
});

function animate() {
    requestAnimationFrame(animate);
    // Add subtle rotation to food
    Object.values(foodMeshes).forEach(m => {
        m.rotation.y += 0.05;
    });
    renderer.render(scene, camera);
}

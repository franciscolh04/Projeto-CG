import * as THREE from 'three';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

var cameras = [], camera, scene, bufferSceneTerrain, bufferTextureTerrain, bufferSceneSky, bufferTextureSky, renderer;
var geometry, mesh;
var skydome, terrain;

// materials
const materials = new Map();
const clock = new THREE.Clock();
var delta;
const keys = {};

let globalLight; // luz direcional global
let moon;        // referência à lua
let lightOn = true;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#262626');
    
    createSkydome(0, -5, 0);
    createTerrain(0, -6.7, 0);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
}

function createTerrainScene() {
    'use strict';
    bufferSceneTerrain = new THREE.Scene();
    bufferSceneTerrain.background = new THREE.Color(0x90EE90); // Light green background
    bufferTextureTerrain = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { 
        wrapT: THREE.RepeatWrapping, 
        wrapS: THREE.RepeatWrapping, 
        minFilter: THREE.LinearFilter, 
        magFilter: THREE.NearestFilter
    });
    
    createFlowers();
    
    renderer.setRenderTarget(bufferTextureTerrain);
    renderer.render(bufferSceneTerrain, cameras[0]);
    renderer.setRenderTarget(null);
    bufferTextureTerrain.texture.repeat.set(3, 3);
    materials.get("terrain").map = bufferTextureTerrain.texture;
    materials.get("terrain").needsUpdate = true;
}

function createSkyScene() {
    'use strict';
    bufferSceneSky = new THREE.Scene();
    bufferTextureSky = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { 
        wrapT: THREE.RepeatWrapping, 
        wrapS: THREE.RepeatWrapping, 
        minFilter: THREE.LinearFilter, 
        magFilter: THREE.NearestFilter
    });
    
    createDegrade();
    createStars();
    
    renderer.setRenderTarget(bufferTextureSky);
    renderer.render(bufferSceneSky, cameras[0]);
    renderer.setRenderTarget(null);
    bufferTextureSky.texture.repeat.set(4, 1);
    materials.get("skydome").map = bufferTextureSky.texture;
    materials.get("skydome").needsUpdate = true;
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    'use strict';
    const positions = [
        [0, 0, -50],  // Orthographic camera for texture generation
        [70, 35, 50]   // Perspective camera for main scene (fixed aerial view)
    ];

    for (let i = 0; i < 2; i++) {
        if (i == 1) {
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        } else {
            camera = new THREE.OrthographicCamera(
                window.innerWidth / -50,
                window.innerWidth / 50,
                window.innerHeight / 50,
                window.innerHeight / -50,
                1,
                1000
            );
        }

        camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
        camera.lookAt(0, 0, 0);
        cameras.push(camera);
    }
    camera = cameras[1];
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMaterials() {
    'use strict';
    // Load heightmap texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load('textures/heightmap1.png');
    
    // Gera texturas procedurais
    const floralTexture = gerarTexturaCampoFloral();
    const skyTexture = gerarTexturaCeuEstrelado();

    materials.set("skydome", new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide, 
        map: skyTexture 
    }));
    materials.set("terrain", new THREE.MeshPhongMaterial({ 
        side: THREE.DoubleSide, 
        bumpMap: texture, 
        bumpScale: 5, 
        displacementMap: texture, 
        displacementScale: 20,
        map: floralTexture
    }));
}

function createFlowers() {
    'use strict';
    const colors = [0xFFFFFF, 0xFFFF00, 0xC8A2C8, 0xADD8E6]; // white, yellow, lilac, light blue
    const flowers = [];
    
    for (let i = 0; i < 500; i++) {
        const flower = new THREE.Object3D();
        const geometry = new THREE.CircleGeometry(0.1, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: colors[Math.floor(Math.random() * colors.length)], 
            side: THREE.DoubleSide 
        });
        const mesh = new THREE.Mesh(geometry, material);
        flower.add(mesh);
        
        // Random position
        flower.position.set(
            Math.random() * window.innerWidth - window.innerWidth/2,
            Math.random() * window.innerHeight - window.innerHeight/2,
            0
        );
        
        bufferSceneTerrain.add(flower);
    }
}

function createStars() {
    'use strict';
    for (let i = 0; i < 1000; i++) {
        const star = new THREE.Object3D();
        const geometry = new THREE.CircleGeometry(0.05, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF, 
            side: THREE.DoubleSide 
        });
        const mesh = new THREE.Mesh(geometry, material);
        star.add(mesh);
        
        // Random position
        star.position.set(
            Math.random() * window.innerWidth - window.innerWidth/2,
            Math.random() * window.innerHeight - window.innerHeight/2,
            0
        );
        
        bufferSceneSky.add(star);
    }
}

function createDegrade() {
    'use strict';
    const degrade = new THREE.Object3D();
    const geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 1, 1);

    // Dark blue to dark purple gradient
    const colors = new Float32Array([
        0.00, 0.05, 0.28,  // top left (dark blue)
        0.00, 0.05, 0.28,  // top right
        0.22, 0.00, 0.28,  // bottom left (dark purple)
        0.22, 0.00, 0.28   // bottom right
    ]);

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    degrade.add(mesh);
    bufferSceneSky.add(degrade);
}

function createSkydome(x, y, z) {
    'use strict';
    skydome = new THREE.Object3D();
    const geometry = new THREE.SphereGeometry(100, 32, 16);
    const mesh = new THREE.Mesh(geometry, materials.get("skydome"));
    mesh.scale.set(1, 1, -1); // Invert the sphere to see inside
    skydome.add(mesh);
    skydome.position.set(x, y, z);
    scene.add(skydome);
}

function createTerrain(x, y, z) {
    'use strict';
    terrain = new THREE.Object3D();
    const geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const mesh = new THREE.Mesh(geometry, materials.get("terrain"));
    terrain.add(mesh);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(x, y, z);
    scene.add(terrain);
}

function createMoon(x, y, z) {
    const geometry = new THREE.SphereGeometry(4, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffcc,
        emissive: 0xffffee,
        emissiveIntensity: 1.2,
        shininess: 100
    });
    const moon = new THREE.Mesh(geometry, material);
    moon.position.set(x, y, z);
    scene.add(moon);
    return moon;
}

/**
 * Creates the main trunk of the cork oak (inclined cylinder)
 */
function addMainTrunk(obj, height, radius, inclination, color) {
    const geometry = new THREE.CylinderGeometry(radius, radius * 1.1, height, 24);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const trunk = new THREE.Mesh(geometry, material);
    trunk.position.y = height / 2;
    trunk.rotation.z = inclination;
    obj.add(trunk);
    return trunk;
}

/**
 * Creates a secondary branch (cylinder inclined in opposite direction)
 */
function addSecondaryBranch(obj, height, radius, inclination, color) {
    const geometry = new THREE.CylinderGeometry(radius * 0.6, radius * 0.7, height, 20);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const branch = new THREE.Mesh(geometry, material);
    branch.position.y = height * 0.7;
    branch.position.x = height * 0.25;
    branch.rotation.z = inclination;
    obj.add(branch);
    return branch;
}

/**
 * Creates the tree canopy (1 to 3 ellipsoids)
 */
function addCanopy(obj, numEllipsoids, size, color) {
    for (let i = 0; i < numEllipsoids; i++) {
        const geometry = new THREE.SphereGeometry(size, 24, 16);
        geometry.scale(1.2 + Math.random()*0.3, 0.7 + Math.random()*0.2, 1.2 + Math.random()*0.3);
        const material = new THREE.MeshPhongMaterial({ color: color });
        const canopy = new THREE.Mesh(geometry, material);
        canopy.position.y = size * (1.2 + i * 0.5);
        canopy.position.x = (i - 1) * size * 0.7 + (Math.random()-0.5)*size*0.2;
        canopy.position.z = (Math.random()-0.5)*size*0.3;
        obj.add(canopy);
    }
}

/**
 * Creates a cork oak tree instance
 */
function createCorkOak(x, z, scale, trunkInclination, branchInclination, numEllipsoids) {
    const tree = new THREE.Object3D();
    
    // Colors
    const trunkColor = 0xcc7722; // orange-brown
    const canopyColor = 0x234d20; // dark green

    // Main trunk (slightly tapered)
    const trunkHeight = 8 * scale;
    const trunkRadius = 0.7 * scale;
    addMainTrunk(tree, trunkHeight, trunkRadius, trunkInclination, trunkColor);

    // Secondary branch (opposite inclination)
    const branchHeight = 4.5 * scale;
    const branchRadius = 0.35 * scale;
    addSecondaryBranch(tree, branchHeight, branchRadius, branchInclination, trunkColor);

    // Canopy (1-3 ellipsoids)
    addCanopy(tree, numEllipsoids, 2.5 * scale, canopyColor);

    // Random orientation and position
    tree.rotation.y = Math.random() * Math.PI * 2;
    tree.position.set(x, 0, z);

    scene.add(tree);
}

/**
 * Scatters multiple cork oaks across the terrain
 */
function scatterCorkOaks(numTrees) {
    for (let i = 0; i < numTrees; i++) {
        const x = (Math.random() - 0.5) * 160;
        const z = (Math.random() - 0.5) * 160;
        const scale = 0.8 + Math.random() * 0.7;
        const trunkInclination = (Math.random() - 0.5) * 0.35; // up to ~20 degrees
        const branchInclination = -trunkInclination + (Math.random()-0.5)*0.15;
        const numEllipsoids = 1 + Math.floor(Math.random() * 3);
        createCorkOak(x, z, scale, trunkInclination, branchInclination, numEllipsoids);
    }
}

////////////
/* UPDATE */
////////////
function update(delta) {
    'use strict';
    // Animation updates can go here
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createCameras();      // 1º - cria cameras
    createMaterials();    // 2º - gera texturas usando cameras[0]
    createScene();        // 3º - cria objetos principais

    moon = createMoon(40, 40, -30); // Posição alta e lateral

    globalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    globalLight.position.set(20, 30, 10); // Ângulo diferente de zero
    globalLight.target.position.set(0, 0, 0);
    scene.add(globalLight);
    scene.add(globalLight.target);

    // Add cork oak trees to the scene
    scatterCorkOaks(12); // Creates 12 trees with random variations

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    delta = clock.getDelta();
    update(delta);
    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
        case 49: // 1 - Campo floral no terreno
            materials.get("terrain").map = gerarTexturaCampoFloral();
            materials.get("terrain").needsUpdate = true;
            break;
        case 50: // 2 - Céu estrelado no skydome
            materials.get("skydome").map = gerarTexturaCeuEstrelado();
            materials.get("skydome").needsUpdate = true;
            break;
        case 68: // D
        case 100: // d
            lightOn = !lightOn;
            if (globalLight) globalLight.visible = lightOn;
            if (moon) {
                moon.material.emissiveIntensity = lightOn ? 1.2 : 0.2;
            }
            break;
    }
}

function gerarTexturaCampoFloral() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b7ff7a'; // VERDE-CLARO VIBRANTE
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const cores = [
        '#ffffff', // branco
        '#ffe066', // amarelo vivo
        '#d1a3ff', // lilás claro
        '#7ed6ff'  // azul-claro vivo
    ];
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 2.2 + 0.7;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = cores[Math.floor(Math.random() * cores.length)];
        ctx.globalAlpha = 0.92 + Math.random() * 0.08;
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
}

function gerarTexturaCeuEstrelado() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    // Degradé linear vertical
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0a40'); // azul-escuro
    grad.addColorStop(1, '#3d0a40'); // violeta-escuro
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Estrelas
    for (let i = 0; i < 800; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
}

// Start the application
init();
animate();
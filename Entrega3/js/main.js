import * as THREE from 'three';
import { createHouse } from './casa.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

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

// Tree parameters
const treeParams = {
    lowTrunkBotR: 0.7,
    lowTrunkTopR: 0.6,
    lowTrunkH: 8,
    uppTrunkBotR: 0.6,
    uppTrunkTopR: 0.5,
    uppTrunkH: 4,
    trunkCrownR: 4,
    lowBranchBotR: 0.4,
    lowBranchTopR: 0.35,
    lowBranchH: 5,
    uppBranchBotR: 0.35,
    uppBranchTopR: 0.3,
    uppBranchH: 3,
    branchCrownR: 3
};

// Tree materials
const treeMaterials = {
    darkorange: new THREE.MeshPhongMaterial({ color: 0xcc7722 }),
    bistre: new THREE.MeshPhongMaterial({ color: 0x3d2b1f }),
    darkgreen: new THREE.MeshPhongMaterial({ color: 0x234d20 })
};

// UFO variables
var ufo, ufoPointLights = [], ufoSpotLight;
var ufoSpeed = 10;
var ufoRotationSpeed = 1;
var pointLightsOn = true;
var spotLightOn = true;

// UFO movement state (booleans for each arrow key)
let ufoMove = {
    left: false,
    right: false,
    up: false,
    down: false
};

// Fixed camera for VR
let fixedCamera, usingFixedCamera = false, previousCamera;

// Adiciona estas variáveis globais no topo do ficheiro:
let isFixedCamera = false;
let prevPosition = null;
let prevTarget = null;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene(){
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#262626');
    
    createSkydome(0, -5, 0);
    createTerrain(0, -6.7, 0);

    // Adiciona a casa ao campo
    const house = createHouse();
    house.scale.set(2, 2, 2); // 2x bigger in all axes
    house.position.set(30, 0, 30);
    scene.add(house);
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

    // Fixed camera for VR
    fixedCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    fixedCamera.position.set(120, 80, 120);
    fixedCamera.lookAt(0, 0, 0);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMaterials() {
    'use strict';
    // Load heightmap texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load('textures/heightmap.png');
    
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

function createCorkTree(x, y, z, s) {
    'use strict';
    const d = treeParams;
    const m = treeMaterials;
    const rAxes = {
        x: new THREE.Vector3(1, 0, 0),
        y: new THREE.Vector3(0, 1, 0),
        z: new THREE.Vector3(0, 0, 1)
    };

    // Trunk 3D (parent: scene; children: lower trunk, upper trunk, trunk crown 3D, branch 3D)
    const trunk3D = new THREE.Object3D();
    trunk3D.position.set(x, y, z);
    scene.add(trunk3D);

    // Lower trunk
    const lowTrunkGeo = new THREE.CylinderGeometry(
        s*d.lowTrunkTopR, 
        s*d.lowTrunkBotR, 
        s*d.lowTrunkH, 
        16
    );
    const lowTrunk = new THREE.Mesh(lowTrunkGeo, m.darkorange);
    lowTrunk.position.y = s*d.lowTrunkH/2;
    trunk3D.add(lowTrunk);

    // Upper trunk
    const uppTrunkGeo = new THREE.CylinderGeometry(
        s*d.uppTrunkTopR, 
        s*d.uppTrunkBotR, 
        s*d.uppTrunkH, 
        12
    );
    const uppTrunk = new THREE.Mesh(uppTrunkGeo, m.bistre);
    uppTrunk.position.y = s*(d.lowTrunkH + d.uppTrunkH/2);
    trunk3D.add(uppTrunk);

    // Trunk Crown 3D (parent: trunk 3D; children: trunk crown)
    const trunkCrown3D = new THREE.Object3D();
    trunkCrown3D.position.set(0, s*(d.lowTrunkH + d.uppTrunkH), 0);
    trunk3D.add(trunkCrown3D);

    // Trunk crown (ellipsoid)
    const trunkCrownGeo = new THREE.SphereGeometry(s*d.trunkCrownR, 16, 16);
    trunkCrownGeo.scale(1, 0.5, 1); // Make it ellipsoid
    const trunkCrown = new THREE.Mesh(trunkCrownGeo, m.darkgreen);
    trunkCrown.position.y = s*d.trunkCrownR/4;
    trunkCrown3D.add(trunkCrown);

    // Branch 3D (parent: trunk 3D, children: lower branch, upper branch, branch crown 3D)
    const branch3D = new THREE.Object3D();
    branch3D.position.set(0, 3*s*d.lowTrunkH/4, 0);
    trunk3D.add(branch3D);

    // Lower branch
    const lowBranchGeo = new THREE.CylinderGeometry(
        s*d.lowBranchTopR, 
        s*d.lowBranchBotR, 
        s*d.lowBranchH, 
        12
    );
    const lowBranch = new THREE.Mesh(lowBranchGeo, m.darkorange);
    lowBranch.position.y = s*d.lowBranchH/2;
    branch3D.add(lowBranch);

    // Upper branch
    const uppBranchGeo = new THREE.CylinderGeometry(
        s*d.uppBranchTopR, 
        s*d.uppBranchBotR, 
        s*d.uppBranchH, 
        8
    );
    const uppBranch = new THREE.Mesh(uppBranchGeo, m.bistre);
    uppBranch.position.y = s*(d.lowBranchH + d.uppBranchH/2);
    branch3D.add(uppBranch);

    // Branch Crown 3D (parent: branch 3D; children: branch crown)
    const branchCrown3D = new THREE.Object3D();
    branchCrown3D.position.set(0, s*(d.lowBranchH + d.uppBranchH), 0);
    branch3D.add(branchCrown3D);

    // Branch crown (ellipsoid)
    const branchCrownGeo = new THREE.SphereGeometry(s*d.branchCrownR, 12, 12);
    branchCrownGeo.scale(1, 0.5, 1); // Make it ellipsoid
    const branchCrown = new THREE.Mesh(branchCrownGeo, m.darkgreen);
    branchCrown.position.y = s*d.branchCrownR/4;
    branchCrown3D.add(branchCrown);

    // Random rotations
    trunk3D.rotateOnWorldAxis(rAxes.y, getRandomAngle(0, 2*Math.PI));
    trunk3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/16, Math.PI/16));
    trunk3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(-Math.PI/8, 0));
    branch3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/8, Math.PI/8));
    branch3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(Math.PI/6, Math.PI/3));
    trunkCrown3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/16, Math.PI/16));
    trunkCrown3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(-Math.PI/16, Math.PI/16));
    branchCrown3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/16, Math.PI/16));
    branchCrown3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(-Math.PI/16, Math.PI/16));

    function getRandomAngle(min, max) {
        return Math.random() * (max - min) + min;
    }
}

function scatterCorkTrees() {
    const terrainMesh = terrain.children[0];

    // Posições escolhidas manualmente (fora do raio da casa e dentro do terreno)
    const positions = [
        [-30, -30],
        [30, -40],
        [-40, 50],
        [50, 60],
        [0, -10],
        [-40, 20]
    ];

    const houseX = 30;
    const houseZ = 30;
    const houseRadius = 18;

    positions.forEach(([x, z]) => {
        // Confirma que está fora do raio da casa (por segurança)
        const dx = x - houseX;
        const dz = z - houseZ;
        if (Math.sqrt(dx * dx + dz * dz) < houseRadius) return;

        // Calcula a altura correta do terreno para cada árvore
        const y = getTerrainHeight(x, z, terrainMesh);
        const scale = 1.2 + Math.random() * 0.5;
        createCorkTree(x, y, z, scale);
    });
}

// Função auxiliar para obter a altura do terreno em (x, z)
function getTerrainHeight(x, z, terrainMesh) {
    const geometry = terrainMesh.geometry;
    const positions = geometry.attributes.position;
    const width = 200;
    const height = 200;
    const segments = 100;

    // Map (x, z) to geometry grid indices
    const gridX = Math.round(((x + width / 2) / width) * segments);
    const gridZ = Math.round(((z + height / 2) / height) * segments);

    const ix = Math.max(0, Math.min(segments, gridX));
    const iz = Math.max(0, Math.min(segments, gridZ));

    const index = iz * (segments + 1) + ix;
    const y = positions.getZ(index); // Use getZ devido à rotação do terreno

    return y + terrainMesh.parent.position.y;
}

// UFO creation
function createUFO(x, y, z) {
    'use strict';
    ufo = new THREE.Object3D();
    ufo.position.set(x, y, z);

    // Main body (flattened sphere)
    const bodyGeometry = new THREE.SphereGeometry(3, 32, 32);
    bodyGeometry.scale(1, 0.3, 1); // Flatten the sphere
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x444444, 
        specular: 0x999999, 
        shininess: 30 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    ufo.add(body);

    // Cockpit (spherical cap)
    const cockpitGeometry = new THREE.SphereGeometry(1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x33aaff, 
        transparent: true, 
        opacity: 0.7,
        specular: 0xffffff,
        shininess: 100
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.y = 0.6;
    ufo.add(cockpit);

    // Bottom lights arrangement
    const bottomGroup = new THREE.Object3D();
    const radius = 2.5;
    const lightCount = 16;

    // Ajuste: eleva o grupo das luzes e cilindro para ficarem ligeiramente sobrepostos com a esfera achatada
    bottomGroup.position.y = 0.15; // valor ajustado para sobreposição suave

    // Small spheres and point lights
    for (let i = 0; i < lightCount; i++) {
        const angle = (i / lightCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Small sphere
        const lightSphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const lightSphereMat = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        const lightSphere = new THREE.Mesh(lightSphereGeo, lightSphereMat);
        lightSphere.position.set(x, -0.6, z); // subiu de -1 para -0.6
        bottomGroup.add(lightSphere);

        // Point light
        const pointLight = new THREE.PointLight(0xffff00, 10, 10);
        pointLight.position.set(x, -1.1, z); // subiu de -1.5 para -1.1
        pointLight.castShadow = true;
        bottomGroup.add(pointLight);
        ufoPointLights.push(pointLight);
    }

    // Central cylinder (agora amarelo para destacar a luz spotlight)
    const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    cylinderGeo.scale(1, 4, 1); // Flatten it
    const cylinderMat = new THREE.MeshPhongMaterial({ 
        color: 0xffff00, // amarelo
        emissive: 0xffff00,
        emissiveIntensity: 0.7
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinder.position.y = -0.8; // subiu de -1.2 para -0.8
    bottomGroup.add(cylinder);

    // Spotlight
    ufoSpotLight = new THREE.SpotLight(0xffffff, 2, 30, Math.PI/4, 0.5);
    ufoSpotLight.position.set(0, -1.1, 0); // subiu de -1.5 para -1.1
    ufoSpotLight.target.position.set(0, -10, 0);
    ufoSpotLight.castShadow = true;
    bottomGroup.add(ufoSpotLight);
    bottomGroup.add(ufoSpotLight.target);

    ufo.add(bottomGroup);
    ufo.scale.set(3, 3, 3); // UFO maior

    // Initialize light states
    ufoPointLights.forEach(light => {
        light.visible = pointLightsOn;
    });
    ufoSpotLight.visible = spotLightOn;

    scene.add(ufo);
}

////////////
/* UPDATE */
////////////
function update(delta) {
    'use strict';
    // Update UFO rotation
    if (ufo) {
        ufo.rotation.y += ufoRotationSpeed * delta;

        // UFO movement using booleans for smooth movement (like trailer in Entrega2)
        const moveSpeed = ufoSpeed * delta;
        if (ufoMove.left) {
            ufo.position.x -= moveSpeed;
        }
        if (ufoMove.right) {
            ufo.position.x += moveSpeed;
        }
        if (ufoMove.up) {
            ufo.position.z -= moveSpeed;
        }
        if (ufoMove.down) {
            ufo.position.z += moveSpeed;
        }

        // Keep UFO within bounds (optional)
        ufo.position.x = Math.max(-80, Math.min(80, ufo.position.x));
        ufo.position.z = Math.max(-80, Math.min(80, ufo.position.z));
    }
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

    // Add cork trees to the scene
    scatterCorkTrees(12); // Creates 12 trees with random variations

    // Create UFO
    createUFO(0, 35, 0);

    // Enable VR
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    if (!renderer.xr.isPresenting) {
        renderer.setAnimationLoop(function () { renderer.render( scene, camera ); }); // Stop VR rendering loop
    }
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
    keys[e.keyCode] = true;

    switch (e.keyCode) {
        case 37: // Left arrow
            ufoMove.left = true;
            break;
        case 39: // Right arrow
            ufoMove.right = true;
            break;
        case 38: // Up arrow
            ufoMove.up = true;
            break;
        case 40: // Down arrow
            ufoMove.down = true;
            break;
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
        case 80: // P
        case 112: // p - Toggle point lights
            pointLightsOn = !pointLightsOn;
            console.log('Toggling point lights:', pointLightsOn);
            ufoPointLights.forEach(light => {
                light.visible = pointLightsOn;
                light.intensity = pointLightsOn ? 10 : 0;
            });
            break;
        case 83: // S
        case 115: // s - Toggle spotlight
            spotLightOn = !spotLightOn;
            console.log('Toggling spotlight:', spotLightOn);
            if (ufoSpotLight) {
                ufoSpotLight.visible = spotLightOn;
                ufoSpotLight.intensity = spotLightOn ? 2 : 0;
            }
            break;
        case 55: // '7'
            if (!isFixedCamera) {
                // Guarda a posição e direção atuais
                prevPosition = camera.position.clone();
                prevTarget = new THREE.Vector3(0, 0, 0); // ou o alvo atual se usares controls
                // Define a vista fixa
                camera.position.set(100, 60, 100);
                camera.lookAt(0, 0, 0);
                camera.updateProjectionMatrix();
                isFixedCamera = true;

                // Torna a frente da cúpula transparente
                const skydomeMat = materials.get("skydome");
                skydomeMat.transparent = true;
                skydomeMat.opacity = 0.3; // ou outro valor mais confortável
                skydomeMat.needsUpdate = true;
            } else {
                // Restaura a posição e direção anteriores
                if (prevPosition) camera.position.copy(prevPosition);
                if (prevTarget) camera.lookAt(prevTarget);
                camera.updateProjectionMatrix();
                isFixedCamera = false;

                // Restaura opacidade da cúpula
                const skydomeMat = materials.get("skydome");
                skydomeMat.opacity = 1.0;
                skydomeMat.transparent = false;
                skydomeMat.needsUpdate = true;
            }
            break;
    }
}

function onKeyUp(e) {
    'use strict';
    keys[e.keyCode] = false;

    switch (e.keyCode) {
        case 37: // Left arrow
            ufoMove.left = false;
            break;
        case 39: // Right arrow
            ufoMove.right = false;
            break;
        case 38: // Up arrow
            ufoMove.up = false;
            break;
        case 40: // Down arrow
            ufoMove.down = false;
            break;
    }
}

function gerarTexturaCampoFloral() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Fundo verde
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Flores aleatórias
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const cores = ["#fff", "#ff0", "#c8a2c8", "#add8e6"];
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 6 + 3, 0, 2 * Math.PI);
        ctx.fillStyle = cores[Math.floor(Math.random() * cores.length)];
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
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
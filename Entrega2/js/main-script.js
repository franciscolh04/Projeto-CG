import * as THREE from "three";
import { L_Ca, H_Ca, W_Ca, L_Olho, H_Olho, W_Olho, R_Ant, H_Ant, L_Tronco, H_Tronco, W_Tronco } from './const.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras = [], camera, scene, renderer;

var object;

var robot, container, head, trunk, feet, leg, lArm, rArm;

let rotateHeadIn = false, rotateHeadOut = false, rotateLegIn = false, rotateLegOut = false,
    rotateFeetIn = false, rotateFeetOut = false, displaceArmsIn = false, displaceArmsOut = false;

const materials = new Map(), clock = new THREE.Clock();
var delta;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    scene = new THREE.Scene();
    //scene.background = new THREE.Color(0xFEF9D9);
    scene.background = new THREE.Color(0xFFFFFF);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCameras() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 10; // dimensão visível da ortogonal

    // Frontal: à frente no Z positivo, olhando para o robot (origem)
    const camFront = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    camFront.position.set(0, 0, 10);
    camFront.lookAt(0, 0, 0);
    cameras.push(camFront);


    // Lateral: na direita (X positivo), olhando para o robot
    const camSide = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    camSide.position.set(10, 0, 0);
    camSide.lookAt(0, 0, 0);
    cameras.push(camSide);

    // Topo: em cima (Y positivo), olhando para baixo
    const camTop = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    camTop.position.set(0, 10, 0);
    camTop.lookAt(0, 0, 0);
    cameras.push(camTop);

    // Perspetiva: em cima e atrás, numa posição que dá boa visão
    const camPersp = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camPersp.position.set(10, 5, 10);
    camPersp.lookAt(0, 0, 0);
    cameras.push(camPersp);

    camera = camPersp;
}

/////////////////////*
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

/////////////////
/* CREATE HEAD */
/////////////////
function createHead() {
    const head = new THREE.Group();

    // Cabeça (cubóide)
    const headGeometry = new THREE.BoxGeometry(1, 1, 1);  // geometria unitária para depois aplicar escala
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);

    // Aplica escala e posição conforme grafo
    headMesh.scale.set(L_Ca, H_Ca, W_Ca);
    headMesh.position.set(0, H_Ca / 2, 0);
    head.add(headMesh);

    // Olho Esquerdo (paralelepípedo)
    const eyeGeometry = new THREE.BoxGeometry(1, 1, 1);  // geometria unitária
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xfaf61b });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.scale.set(L_Olho, H_Olho, W_Olho);
    leftEye.position.set(L_Ca / 4, 2 * H_Ca / 3, (W_Ca + W_Olho) / 2);
    head.add(leftEye);

    // Olho Direito (mesma escala e posição em X invertida)
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.scale.set(L_Olho, H_Olho, W_Olho);
    rightEye.position.set(-L_Ca / 4, 2 * H_Ca / 3, (W_Ca + W_Olho) / 2);
    head.add(rightEye);

    // Antena Esquerda (cone)
    const antennaGeometry = new THREE.ConeGeometry(1, 1, 32);  // geometria unitária
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });

    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    leftAntenna.scale.set(R_Ant, H_Ant, R_Ant);
    leftAntenna.position.set((L_Ca - R_Ant - 0.25) / 2, H_Ca + H_Ant / 2, 0.25 + (-W_Ca + R_Ant) / 2); // mudámos aqui
    head.add(leftAntenna);

    // Antena Direita (posição espelhada em X)
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.scale.set(R_Ant, H_Ant, R_Ant);
    rightAntenna.position.set(-(L_Ca - R_Ant - 0.25) / 2, H_Ca + H_Ant / 2, 0.25 + (-W_Ca + R_Ant) / 2); // mudámos aqui
    head.add(rightAntenna);

    return head;
}

/////////////////
/* CREATE BODY */
/////////////////
function createTrunk() {
    const trunk = new THREE.Group();

    const trunkGeometry = new THREE.BoxGeometry(1, 1, 1); // unidade
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);

    // Aplicar escala e posição
    trunkMesh.scale.set(L_Tronco, H_Tronco, W_Tronco);
    trunkMesh.position.set(0, 0, 0); // para assentar no chão

    trunk.add(trunkMesh);

    return trunk;
}

function addTorso(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(20, 40, 70); // (4, 4, 7)
    var mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x + 10, y, z);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(20, 40, 30); // (4, 4, 7)
    var mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x - 10, y, z);
    obj.add(mesh);
}

function addAbdomen(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(40, 20, 30); // (4, 2, 2)
    var mesh = new THREE.Mesh(geometry, materials.get("abdomen"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWaist(obj, x, y, z) {
    'use strict';

    addWheel(obj, x, y - 7.5, z - 40); // (x, y, z)
    addWheel(obj, x, y - 7.5, z + 40); // (x, y, z)

    geometry = new THREE.BoxGeometry(40, 20, 70); // (4, 2, 7)
    var mesh = new THREE.Mesh(geometry, materials.get("waist"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {}

////////////
/* UPDATE */
////////////
function update() {}

/////////////
/* DISPLAY */
/////////////
function render() {}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    createScene();
    createCameras();

    // Criar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar controlo orbital
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Luz ambiente para ver objetos
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Luz direcional para sombras (opcional)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7.5);
    scene.add(dirLight);

    // Adicionar eixos visíveis
    const axesHelper = new THREE.AxesHelper(5); // tamanho 5 unidades
    scene.add(axesHelper);

    // Robot
    robot = new THREE.Group();

    /*
    head = createHead();
    head.position.set(0, H_Tronco/2 + H_Ca/2, 0);
    robot.add(head);

    scene.add(robot);
    */
    trunk = createTrunk();
    trunk.position.set(0, 0, 0);
    robot.add(trunk);



    window.addEventListener('keydown', onKeyDown);

}


/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    switch (e.key) {
        case '1':
            camera = cameras[0]; // frontal
            break;
        case '2':
            camera = cameras[1]; // lateral
            break;
        case '3':
            camera = cameras[2]; // topo
            break;
        case '4':
            camera = cameras[3]; // perspetiva
            break;
    }
}


///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {}

init();
animate();
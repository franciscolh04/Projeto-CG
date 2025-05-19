import * as THREE from "three";
import { L_Ca, H_Ca, W_Ca, L_Olho, H_Olho, W_Olho, R_Ant, H_Ant, L_Tronco, H_Tronco, W_Tronco, L_Ab, H_Ab, W_Ab, L_Ci, H_Ci, W_Ci, R_Roda, H_Roda, L_Br, H_Br, W_Br, R_Tu, H_Tu, L_An, H_An, W_An, R_Mao, H_Mao, L_Coxa, H_Coxa, W_Coxa, L_Perna, H_Perna, W_Perna, L_Pe, H_Pe, W_Pe } from './const.js';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras = [], camera, scene, renderer;

var object;

var robot, container, head, trunk, abdomen, waist, leftWheel, rightWheel, leftArm, rightArm, leftLeg, rightLeg, feet, leg, lArm, rArm;

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
    leftAntenna.scale.set(R_Ant/2, H_Ant, R_Ant/2);
    leftAntenna.position.set((L_Ca - R_Ant) / 2, H_Ca + H_Ant / 2, (-W_Ca + R_Ant) / 2); // mudámos aqui
    head.add(leftAntenna);

    // Antena Direita (posição espelhada em X)
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.scale.set(R_Ant/2, H_Ant, R_Ant/2);
    rightAntenna.position.set(-(L_Ca - R_Ant) / 2 , H_Ca + H_Ant / 2, (-W_Ca + R_Ant) / 2); // mudámos aqui
    head.add(rightAntenna);

    return head;
}

/////////////////
/* CREATE BODY */
/////////////////
function createTrunk() {
    const trunk = new THREE.Group();

    const trunkGeometry = new THREE.BoxGeometry(1, 1, 1);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const trunkMesh = new THREE.Mesh(trunkGeometry, trunkMaterial);

    // Aplicar escala e posição
    trunkMesh.scale.set(L_Tronco, H_Tronco, W_Tronco);
    trunkMesh.position.set(0, 0, 0); // para assentar no chão

    trunk.add(trunkMesh);

    return trunk;
}

function createAbdomen() {
    const abdomen = new THREE.Group();

    const abdomenGeometry = new THREE.BoxGeometry(L_Ab, H_Ab, W_Ab);
    const abdomenMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const abdomenMesh = new THREE.Mesh(abdomenGeometry, abdomenMaterial);

    abdomenMesh.position.set(0, 0, 0);

    abdomen.add(abdomenMesh);

    return abdomen;
}

function createWaist() {
    const waist = new THREE.Group();

    const waistGeometry = new THREE.BoxGeometry(L_Ci, H_Ci, W_Ci);
    const waistMaterial = new THREE.MeshStandardMaterial({ color: 0xd1d8ea });
    const waistMesh = new THREE.Mesh(waistGeometry, waistMaterial);

    waistMesh.position.set(0, 0, 0);

    waist.add(waistMesh);

    return waist;
}

function createWheel() {
    const wheel = new THREE.Group();

    const wheelGeometry = new THREE.CylinderGeometry(R_Roda/2, R_Roda/2, H_Roda, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);

    wheelMesh.position.set(0, 0, 0);

    wheel.add(wheelMesh);

    return wheel;
}

function createArm(side = "left") {
    const arm = new THREE.Group();

    // Braço (superior)
    const upperArmGeometry = new THREE.BoxGeometry(L_Br, H_Br, W_Br);
    const upperArmMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const upperArmMesh = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
    upperArmMesh.position.set(0, 0, 0); // Origem no topo do braço
    arm.add(upperArmMesh);

    // Antebraço
    const forearmGeometry = new THREE.BoxGeometry(L_An, H_An, W_An);
    const forearmMaterial = new THREE.MeshStandardMaterial({ color: 0x40c3f4 });
    const forearmMesh = new THREE.Mesh(forearmGeometry, forearmMaterial);
    // Posicionar antebraço abaixo do braço
    forearmMesh.position.set(0, (-H_Br - H_An) / 2, 0);
    arm.add(forearmMesh);

    // Mão (cilindro)
    const handGeometry = new THREE.CylinderGeometry(R_Mao, R_Mao, H_Mao, 32);
    const handMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });
    const handMesh = new THREE.Mesh(handGeometry, handMaterial);
    // Rodar para ficar perpendicular ao braço
    handMesh.rotation.x = Math.PI / 2;
    // Posicionar mão abaixo do antebraço
    handMesh.position.set(0,- H_An + (-H_Br - H_Mao) / 2, 0);
    arm.add(handMesh);

    // Tubo de escape (cilindro)
    const exhaustGeometry = new THREE.CylinderGeometry(R_Tu/2, R_Tu/2, H_Tu, 32);
    const exhaustMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const exhaustMesh = new THREE.Mesh(exhaustGeometry, exhaustMaterial);

    // Espelha em X se for o braço direito
    const xSign = (side === "left") ? 1 : -1;
    exhaustMesh.position.set(xSign * (L_Br + R_Tu)/2, (H_Br - H_Tu)/2 + H_Ca, (-W_Br + R_Tu) / 2);

    arm.add(exhaustMesh);

    return arm;
}

function createLeg(side = "left") {
    const leg = new THREE.Group();

    // Sinal para espelhar em X se for a perna direita
    const xSign = (side === "left") ? 1 : -1;

    // Coxa
    const thighGeometry = new THREE.BoxGeometry(L_Coxa, H_Coxa, W_Coxa);
    const thighMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const thighMesh = new THREE.Mesh(thighGeometry, thighMaterial);
    thighMesh.position.set(0, -H_Coxa / 2, 0);
    leg.add(thighMesh);

    // Perna
    const legGeometry = new THREE.BoxGeometry(L_Perna, H_Perna, W_Perna);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x00aaff });
    const legMesh = new THREE.Mesh(legGeometry, legMaterial);
    legMesh.position.set(0, -H_Coxa - H_Perna / 2, 0);
    leg.add(legMesh);

    // Pé
    const footGeometry = new THREE.BoxGeometry(L_Pe, H_Pe, W_Pe);
    const footMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });
    const footMesh = new THREE.Mesh(footGeometry, footMaterial);
    footMesh.position.set(xSign * (-L_Perna + L_Pe)/2, -H_Coxa - H_Perna - H_Pe / 2, (-W_Perna + W_Pe)/2);
    leg.add(footMesh);

    // Roda Traseira 1
    const rearWheel1Geometry = new THREE.CylinderGeometry(R_Roda/2, R_Roda/2, H_Roda, 32);
    const rearWheel1Material = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const rearWheel1Mesh = new THREE.Mesh(rearWheel1Geometry, rearWheel1Material);
    rearWheel1Mesh.rotation.z = Math.PI / 2;
    // Coloca a roda na lateral da coxa
    rearWheel1Mesh.position.set(xSign *(L_Perna + H_Roda)/2,-(H_Coxa + H_Perna/4), W_Perna / 2);
    leg.add(rearWheel1Mesh);

    // Roda Traseira 2
    const rearWheel2Geometry = new THREE.CylinderGeometry(R_Roda/2, R_Roda/2, H_Roda, 32);
    const rearWheel2Material = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const rearWheel2Mesh = new THREE.Mesh(rearWheel2Geometry, rearWheel2Material);
    rearWheel2Mesh.rotation.z = Math.PI / 2;
    // Coloca a roda na lateral da perna (ajuste conforme necessário)
    rearWheel2Mesh.position.set(xSign *(L_Perna + H_Roda)/2,-(H_Coxa + (3 * H_Perna)/4), W_Perna / 2);
    leg.add(rearWheel2Mesh);

    return leg;
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

    
    head = createHead();
    head.position.set(0, H_Tronco/2, 0);
    robot.add(head);
    trunk = createTrunk();
    trunk.position.set(0, 0, 0);
    robot.add(trunk);
    abdomen = createAbdomen();
    abdomen.position.set(0, -(H_Tronco + H_Ab) / 2, 0);
    robot.add(abdomen);
    waist = createWaist();
    waist.position.set(0, -(H_Tronco + H_Ci)/2 - H_Ab, 0);
    robot.add(waist);
    leftWheel = createWheel();
    leftWheel.position.set(L_Ci/2+H_Roda/2,-(H_Tronco+H_Ci + R_Roda)/2 - H_Ab, W_Ci / 2);
    leftWheel.rotation.z = Math.PI / 2;
    robot.add(leftWheel);
    rightWheel = createWheel();
    rightWheel.position.set(-(L_Ci/2+H_Roda/2),-(H_Tronco+H_Ci + R_Roda)/2 - H_Ab, W_Ci / 2);
    rightWheel.rotation.z = Math.PI / 2;
    robot.add(rightWheel);
    leftArm = createArm("left");
    leftArm.position.set((L_Tronco + L_Br)/2, (-H_Tronco + H_Ab)/2, -(W_Tronco + W_Br)/2);
    robot.add(leftArm);
    rightArm = createArm("right");
    rightArm.position.set(-(L_Tronco + L_Br)/2,  (-H_Tronco + H_Ab)/2, -(W_Tronco + W_Br)/2);
    robot.add(rightArm);
    leftLeg = createLeg("left");
    leftLeg.position.set((L_Ci - L_Perna)/2, -(H_Tronco )/2 - H_Ab - H_Ci, (W_Ci - W_Perna)/2);
    robot.add(leftLeg);
    rightLeg = createLeg("right");
    rightLeg.position.set(-(L_Ci - L_Perna)/2,  -(H_Tronco )/2 - H_Ab - H_Ci,(W_Ci - W_Perna)/2);
    robot.add(rightLeg);

    
    
   
    scene.add(robot);

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
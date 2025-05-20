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
const keys = {};

var robot, trailer, head, headPivot, trunk, abdomen, waist, leftWheel, rightWheel, leftArm, rightArm, leftLeg, rightLeg, feet, leg, lArm, rArm;

let theta1 = 0, theta2 = 0, delta1 = 0, theta3 = 0;

let rotateFeetIn = false, rotateFeetOut = false;
let rotateWaistIn = false, rotateWaistOut = false;
let displaceArmsIn = false, displaceArmsOut = false;
let rotateHeadIn = false, rotateHeadOut = false;

const materials = new Map(), clock = new THREE.Clock();
var delta;

var minTrailerAABB, maxTrailerAABB;

const trailerMove = { left: false, right: false, up: false, down: false };
const TRAILER_SPEED = 20; // unidades por segundo (ajusta conforme necessário)

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);

    createRobot(0, 15, 0);
    createTrailer(0, 15, -30); // ou outro valor negativo em Z, ajusta conforme o teu modelo
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
    // Pivot para rotação: origem no ponto de rotação (base/trás da cabeça)
    const headPivot = new THREE.Group();

    // Container da cabeça: origem no canto inferior/traseiro da cabeça
    const headContainer = new THREE.Group();
    headContainer.position.set(0, 0, -W_Ca / 2);

    // Cabeça (cubóide)
    const headGeometry = new THREE.BoxGeometry(1, 1, 1);
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });
    const headMesh = new THREE.Mesh(headGeometry, headMaterial);
    headMesh.scale.set(L_Ca, H_Ca, W_Ca);
    headMesh.position.set(0, H_Ca/2, 0);
    headContainer.add(headMesh);

    // Olho Esquerdo
    const eyeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xfaf61b });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.scale.set(L_Olho, H_Olho, W_Olho);
    leftEye.position.set(L_Ca / 4, 2 * H_Ca / 3, (W_Ca + W_Olho) / 2);
    headContainer.add(leftEye);

    // Olho Direito
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.scale.set(L_Olho, H_Olho, W_Olho);
    rightEye.position.set(-L_Ca / 4, 2 * H_Ca / 3, (W_Ca + W_Olho) / 2);
    headContainer.add(rightEye);

    // Antena Esquerda
    const antennaGeometry = new THREE.ConeGeometry(1, 1, 32);
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });
    const leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    leftAntenna.scale.set(R_Ant/2, H_Ant, R_Ant/2);
    leftAntenna.position.set((L_Ca - R_Ant) / 2, H_Ca + H_Ant / 2, (-W_Ca + R_Ant) / 2);
    headContainer.add(leftAntenna);

    // Antena Direita
    const rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    rightAntenna.scale.set(R_Ant/2, H_Ant, R_Ant/2);
    rightAntenna.position.set(-(L_Ca - R_Ant) / 2, H_Ca + H_Ant / 2, (-W_Ca + R_Ant) / 2);
    headContainer.add(rightAntenna);

    // Junta o container ao pivot
    headPivot.add(headContainer);

    return headPivot;
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

    // PIVOT DO PÉ
    const footPivot = new THREE.Group();

    // O mesh do pé
    const footGeometry = new THREE.BoxGeometry(L_Pe, H_Pe, W_Pe);
    const footMaterial = new THREE.MeshStandardMaterial({ color: 0x3d4ac4 });
    const footMesh = new THREE.Mesh(footGeometry, footMaterial);

    // Desloca o mesh do pé para a frente e para baixo, para que o pivot fique no calcanhar
    footMesh.position.set(0, -H_Pe/2, W_Pe/2);

    footPivot.add(footMesh);

    // Coloca o pivot do pé na base e atrás da perna
    footPivot.position.set(
        xSign * (-L_Perna/2), // linha de trás do pé, alinhada com a perna
        -H_Coxa - H_Perna,    // base da perna
        0
    );

    leg.add(footPivot);

    // Guarda referência ao pivot do pé
    leg.foot = footPivot;

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

function createRobot(x, y, z) {
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
    robot.position.set(x, y, z);
}

function createTrailer(x = 0, y = 0, z = 0) {
    trailer = new THREE.Group();

    // Corpo Principal
    const mainBodyGeometry = new THREE.BoxGeometry(15, 8, 7);
    const mainBodyMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
    const mainBodyMesh = new THREE.Mesh(mainBodyGeometry, mainBodyMaterial);
    mainBodyMesh.position.set(0, 4, 0);
    trailer.add(mainBodyMesh);

    // Peça que liga o trailer ao robot
    const connectorGeometry = new THREE.BoxGeometry(4, 2, 3);
    const connectorMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const connectorMesh = new THREE.Mesh(connectorGeometry, connectorMaterial);
    connectorMesh.position.set(-9.5, 1.5, 0); // in front of main body, near the bottom
    trailer.add(connectorMesh);

    // Rodas
    //Esta função é necessária para criar as rodas do trailer ???
    function addTrailerWheel(parent, x, y, z) {
        const wheelGeometry = new THREE.CylinderGeometry(1.2, 1.2, 2, 24);
        const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const wheelMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheelMesh.rotation.x = Math.PI / 2;
        wheelMesh.position.set(x, y, z);
        parent.add(wheelMesh);
    }

    // Wheels at the four corners (slightly outside the body for realism)
    const wheelY = -1.2; // just below the main body
    const wheelZ = 3.5 ; // outside the body
    addTrailerWheel(trailer,  6, wheelY,  wheelZ); // front right
    addTrailerWheel(trailer, -6, wheelY,  wheelZ); // back right
    addTrailerWheel(trailer,  6, wheelY, -wheelZ); // front left
    addTrailerWheel(trailer, -6, wheelY, -wheelZ); // back left

    scene.add(trailer);
    trailer.position.set(x, y, z);
    trailer.rotation.y = Math.PI / 2; // Alinha o reboque com o camião (eixo Z)
    updateTrailerAABB();
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(delta, pos){
    'use strict';

    updateTrailerAABB(pos.x, pos.y); // check collision with tentativePos values

    var newPos = pos;

    if (maxTruckAABB.x > minTrailerAABB.x && minTruckAABB.x < maxTrailerAABB.x &&
        maxTruckAABB.y > minTrailerAABB.y && minTruckAABB.y < maxTrailerAABB.y &&
        maxTruckAABB.z > minTrailerAABB.z && minTruckAABB.z < maxTrailerAABB.z) 
    {   
        if (!trailer.userData.engaged) { // collision detected and trailer is not engaged -> engage (animation)
            computeDisplacement(delta);
            trailer.userData.engaging = true;
            newPos.x = trailer.position.x;
            newPos.y = trailer.position.z;
        }
    } else {
        trailer.userData.engaged = false;
    }

    return newPos;

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

    if (elapsed < duration) { // animation
        trailer.position.add(displacement);
        elapsed += delta * animationSpeed;
    } else { // end of animation, trailer/robot free to move
        trailer.position.set(-95, 30, 0); // garantee trailer is in the right position
        trailer.userData.engaging = false;
        trailer.userData.engaged = true;
        elapsed = 0;
    }
}

function computeDisplacement(delta) {
    const currentPos = trailer.position.clone();
    const distance = targetPos.clone().sub(currentPos);
    const velocity = distance.clone().divideScalar(duration).multiplyScalar(animationSpeed);
    displacement = velocity.clone().multiplyScalar(delta);
}

////////////
/* UPDATE */
////////////
function update() {
    delta = clock.getDelta();
    const stepRot = Math.PI / 16;
    const stepArm = 0.25;

    // --- Feet rotation (θ1) ---
    if (rotateFeetIn && leftLeg && rightLeg) {
        theta1 = Math.min(theta1 + stepRot, Math.PI / 2);
        if (leftLeg.foot) leftLeg.foot.rotation.x = theta1;
        if (rightLeg.foot) rightLeg.foot.rotation.x = theta1;
        rotateFeetIn = false;
    }
    if (rotateFeetOut && leftLeg && rightLeg) {
        theta1 = Math.max(theta1 - stepRot, 0);
        if (leftLeg.foot) leftLeg.foot.rotation.x = theta1;
        if (rightLeg.foot) rightLeg.foot.rotation.x = theta1;
        rotateFeetOut = false;
    }

    // --- Waist rotation (θ2) ---
    if (rotateWaistIn && leftLeg && rightLeg) {
        theta2 = Math.min(theta2 + stepRot, Math.PI/2);
        leftLeg.rotation.x = theta2;
        rightLeg.rotation.x = theta2;
        rotateWaistIn = false;
    }
    if (rotateWaistOut && leftLeg && rightLeg) {
        theta2 = Math.max(theta2 - stepRot, 0);
        leftLeg.rotation.x = theta2;
        rightLeg.rotation.x = theta2;
        rotateWaistOut = false;
    }

    // --- Arms translation (δ1) ---
    if (displaceArmsIn && leftArm && rightArm) {
        delta1 = Math.min(delta1 + stepArm, 0);
        leftArm.position.x = (L_Tronco + L_Br) / 2 + delta1;
        rightArm.position.x = -(L_Tronco + L_Br) / 2 - delta1;
        displaceArmsIn = false;
    }
    if (displaceArmsOut && leftArm && rightArm) {
        delta1 = Math.max(delta1 - stepArm, -2);
        leftArm.position.x = (L_Tronco + L_Br) / 2 + delta1;
        rightArm.position.x = -(L_Tronco + L_Br) / 2 - delta1;
        displaceArmsOut = false;
    }

    // --- Head rotation (θ3) ---
    if (rotateHeadIn && head) {
        theta3 = Math.max(theta3 - stepRot, -Math.PI);
        head.rotation.x = theta3;
        rotateHeadIn = false;
    }
    if (rotateHeadOut && head) {
        theta3 = Math.min(theta3 + stepRot, 0);
        head.rotation.x = theta3;
        rotateHeadOut = false;
    }

    // --- Trailer movement (setas) ---
    if (trailer) {
        let moveY = 0, moveZ = 0;
        if (trailerMove.left)  moveZ -= 1; // Esquerda = frente (Z-)
        if (trailerMove.right) moveZ += 1; // Direita = trás (Z+)
        if (trailerMove.up)    moveY += 1; // Cima = sobe (Y+)
        if (trailerMove.down)  moveY -= 1; // Baixo = desce (Y-)

        // Normaliza para velocidade constante em diagonal
        if (moveY !== 0 || moveZ !== 0) {
            const len = Math.sqrt(moveY * moveY + moveZ * moveZ);
            moveY /= len;
            moveZ /= len;
            trailer.position.y += moveY * TRAILER_SPEED * delta;
            trailer.position.z += moveZ * TRAILER_SPEED * delta;
        }
    }

}

function updateTrailerAABB(x, z) {
    'use strict';
    
    // 150, 90, 70
    minTrailerAABB = new THREE.Vector3(x - 150 / 2, trailer.position.y - 90 / 2 + 15, z - 70 / 2);
    maxTrailerAABB = new THREE.Vector3(x + 150 / 2, trailer.position.y + 90 / 2 + 15, z + 70 / 2);
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

function setWireframeMode(enabled) {
    scene.traverse(function(obj) {
        if (obj.isMesh && obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => mat.wireframe = enabled);
            } else {
                obj.material.wireframe = enabled;
            }
        }
    });
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    // Criar renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
    createCameras();

    // Agora sim, já podes criar os OrbitControls
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

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
}


/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() { 
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

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
        case 'q':
            rotateFeetIn = true;
            break;
        case 'a':
            rotateFeetOut = true;
            break;
        case 'w':
            rotateWaistIn = true;
            break;
        case 's':
            rotateWaistOut = true;
            break;
        case 'e':
            displaceArmsIn = true;
            break;
        case 'd':
            displaceArmsOut = true;
            break;
        case 'r':
            rotateHeadIn = true;
            break;
        case 'f':
            rotateHeadOut = true;
            break;
        case 'ArrowLeft':
            trailerMove.left = true;
            break;
        case 'ArrowRight':
            camera = cameras[3]; // frontal
            trailerMove.right = true;
            break;
        case 'ArrowUp':
            trailerMove.up = true;
            break;
        case 'ArrowDown':
            trailerMove.down = true;
            break;
        case '7':
            isWireframe = !isWireframe;
            setWireframeMode(isWireframe);
            break;
    }
}


///////////////////////
/* KEY UP CALLBACK */
function onKeyUp(e) {
    switch (e.key) {
        case 'ArrowLeft':
            trailerMove.left = false;
            break;
        case 'ArrowRight':
            trailerMove.right = false;
            break;
        case 'ArrowUp':
            trailerMove.up = false;
            break;
        case 'ArrowDown':
            trailerMove.down = false;
            break;
    }
}

let isWireframe = false;

init();
animate();
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras = [], camera, scene, renderer;

var object;

var robot, container, head, feet, leg, lArm, rArm;

let rotateHeadIn = false, rotateHeadOut = false, rotateLegIn = false, rotateLegOut = false,
    rotateFeetIn = false, rotateFeetOut = false, displaceArmsIn = false, displaceArmsOut = false;

const materials = new Map(), clock = new THREE.Clock();
var delta;

/////////////////////
/* CREATE SCENE(S) */function createCameras() {
    const aspect = window.innerWidth / window.innerHeight;
    const d = 10; // dimensão visível da ortogonal

    // Frontal: atrás no Z negativo, olhando para o robot (origem)
    const camFront = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 0.1, 100);
    camFront.position.set(0, 0, -10);
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
    camPersp.position.set(5, 5, 10);
    camPersp.lookAt(0, 0, 0);
    cameras.push(camPersp);

    camera = camPersp;
}

/////////////////////
function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFEF9D9);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////


/////////////////////*
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

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

    // Exemplo: 
    const geometry = new THREE.BoxGeometry(2, 5, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
    const domino = new THREE.Mesh(geometry, material);
    scene.add(domino);


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
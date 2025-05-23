import * as THREE from "three";
import { createMaterials, materials } from "./materials.js";
import { createScene } from "./scene.js";
import { createCameras, cameras, camera } from "./camera.js";
import { update, handleRotations, updateTruckPosition, updateTrailerAABB, checkTruckMode } from "./update.js";
import { onKeyDown, onKeyUp } from "./input.js";
import {L_Tronco, H_Tronco, W_Tronco, 
    L_Ab, H_Ab, W_Ab,
    L_Ci, H_Ci, W_Ci,
    R_Roda, H_Roda,
    L_Ca, H_Ca, W_Ca,
    L_Olho, H_Olho, W_Olho,
    R_Ant, H_Ant,
    L_Coxa, H_Coxa, W_Coxa,
    L_Perna, H_Perna, W_Perna,
    L_Pe, H_Pe, W_Pe,
    L_An, H_An, W_An,
    L_Br, H_Br, W_Br,
    R_Mao, H_Mao,
    R_Tu, H_Tu,
    L_Trailer,
    H_Trailer,
    H_LowerT,
    W_Trailer, X_In, Y_In, Z_In } from "./const.js";

const keys = {};
let renderer, clock = new THREE.Clock();
const movementVector = new THREE.Vector3(0, 0, 0);

function render() {
    renderer.render(window.scene, window.camera);
}

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock.start();

    createMaterials();
    createScene(X_In, Y_In, Z_In);
    createCameras();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    window.cameras = cameras;
    window.keys = keys;
    window.materials = materials;
    window.trailer = trailer; // and any other globals you use in input.js

    window.rotateHeadIn = false;
    window.rotateHeadOut = false;
    window.rotateLegIn = false;
    window.rotateLegOut = false;
    window.rotateFeetIn = false;
    window.rotateFeetOut = false;
    window.displaceArmsIn = false;
    window.displaceArmsOut = false;

    window.clock = clock;

    window.movementVector = movementVector;
    
    window.minTruckAABB = new THREE.Vector3(X_In -L_Ci/2, Y_In -H_Ci / 2, Z_In - H_Coxa - H_Perna - W_Pe + H_Pe / 2);
    window.maxTruckAABB = new THREE.Vector3(X_In + L_Ci/2, Y_In + H_Ci / 2 + H_Ab + H_Tronco, Z_In + W_Ci / 2);
    window.minTrailerAABB = new THREE.Vector3(X_In - L_Trailer/2, Y_In -H_Trailer/2 - H_LowerT, Z_In -W_Trailer/2);
    window.maxTrailerAABB = new THREE.Vector3(X_In + L_Trailer/2, Y_In + H_Trailer/2 , Z_In + W_Trailer/2);

    window.elapsed = 0;
    window.duration = 5;
    window.animationSpeed = 2;
    window.displacement = new THREE.Vector3(0, 0, 0);
    window.targetPos = new THREE.Vector3(X_In, Y_In, Z_In -W_Ci/2 -W_Br -W_Trailer/2 - W_Olho);
}

function animate() {
    update();
    render();
    requestAnimationFrame(animate);
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        window.camera.aspect = window.innerWidth / window.innerHeight;
        window.camera.updateProjectionMatrix();
    }
}

init();
animate();
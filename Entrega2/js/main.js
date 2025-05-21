import * as THREE from "three";
import { createMaterials, materials } from "./materials.js";
import { createScene } from "./scene.js";
import { createCameras, cameras, camera } from "./camera.js";
import { update, handleRotations, updateTruckPosition, updateTrailerAABB, checkTruckMode } from "./update.js";
import { onKeyDown, onKeyUp } from "./input.js";

const keys = {};
let renderer, clock = new THREE.Clock();
const movementVector = new THREE.Vector2(0, 0);

function render() {
    renderer.render(window.scene, window.camera);
}

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock.start();

    createMaterials();
    createScene();
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

    window.minTruckAABB = new THREE.Vector3(-120 / 2 - 40, 0, -70 / 2);
    window.maxTruckAABB = new THREE.Vector3(120 / 2 - 40, 80, 70 / 2);
    window.minTrailerAABB = new THREE.Vector3(-150 / 2, 0, -70 / 2);
    window.maxTrailerAABB = new THREE.Vector3(150 / 2, 80, 70 / 2);

    window.elapsed = 0;
    window.duration = 5;
    window.animationSpeed = 2;
    window.displacement = new THREE.Vector3(0, 0, 0);
    window.targetPos = new THREE.Vector3(-95, 30, 0);
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
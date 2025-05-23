import * as THREE from "three";
import { createMaterials, materialsMap } from "./materials.js";
import { createScene } from "./scene.js";
import { createCameras, cameraList } from "./camera.js";
import { update } from "./update.js";
import { onKeyDown, onKeyUp } from "./input.js";
import { H_Tronco, H_Ab, L_Ci, H_Ci, W_Ci, W_Olho, H_Coxa, H_Perna, H_Pe, W_Pe, W_Br,
         L_Trailer, H_Trailer, H_LowerT, W_Trailer, X_In, Y_In, Z_In } from "./robotConstants.js";

// Stores the state of pressed keys for movement and actions
const pressedKeys = {};
// Main renderer and clock for animation timing
let renderer, clock = new THREE.Clock();
// Vector for movement direction and magnitude
const movementVector = new THREE.Vector3(0, 0, 0);

/**
 * Renders the current scene from the active camera.
 */
function render() {
    renderer.render(window.scene, window.currentCamera);
}

/**
 * Initializes the renderer, scene, cameras, and event listeners.
 * Also sets up global state variables and bounding boxes.
 */
function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    clock.start();

    // Initialize materials, scene, and cameras
    createMaterials();
    createScene(X_In, Y_In, Z_In);
    createCameras();

    // Register input and resize event listeners
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);

    // Expose important objects and state to the global window for access in other modules
    window.cameraList = cameraList;
    window.pressedKeys = pressedKeys;
    window.materialsMap = materialsMap;
    window.trailer = trailer;

    // Initialize robot transformation flags
    window.headRotationIn = false;
    window.headRotationOut = false;
    window.legRotationIn = false;
    window.legRotationOut = false;
    window.feetRotationIn = false;
    window.feetRotationOut = false;
    window.moveArmsIn = false;
    window.moveArmsOut = false;

    // Expose clock and movement vector globally
    window.clock = clock;
    window.movementVector = movementVector;
    
    // Set up bounding boxes for collision detection
    window.minTruckAABB = new THREE.Vector3(X_In - L_Ci / 2, Y_In - H_Ci / 2, Z_In - H_Coxa - H_Perna - W_Pe + H_Pe / 2);
    window.maxTruckAABB = new THREE.Vector3(X_In + L_Ci / 2, Y_In + H_Ci / 2 + H_Ab + H_Tronco, Z_In + W_Ci / 2);
    window.minTrailerAABB = new THREE.Vector3(X_In - L_Trailer / 2, Y_In - H_Trailer / 2 - H_LowerT, Z_In - W_Trailer / 2);
    window.maxTrailerAABB = new THREE.Vector3(X_In + L_Trailer / 2, Y_In + H_Trailer / 2, Z_In + W_Trailer / 2);

    // Animation and engagement state for trailer
    window.elapsed = 0;
    window.duration = 5;
    window.animationSpeed = 2;
    window.displacement = new THREE.Vector3(0, 0, 0);
    window.targetPos = new THREE.Vector3(X_In, Y_In, Z_In - W_Ci / 2 - W_Br - W_Trailer / 2 - W_Olho);
}

/**
 * Main animation loop: updates state and renders the scene.
 */
function animate() {
    update();
    render();
    requestAnimationFrame(animate);
}

/**
 * Handles window resize events to keep the renderer and camera aspect ratio correct.
 */
function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (window.innerHeight > 0 && window.innerWidth > 0) {
        window.currentCamera.aspect = window.innerWidth / window.innerHeight;
        window.currentCamera.updateProjectionMatrix();
    }
}

// Initialize and start the animation loop
init();
animate();
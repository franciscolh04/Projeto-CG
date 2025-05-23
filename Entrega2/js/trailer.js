import * as THREE from "three";
import { materialsMap } from "./materials.js";
import {
    L_Tronco, H_Tronco, W_Tronco, 
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
    R_Tu, H_Tu, H_Trailer,
    L_Trailer, W_Trailer,
    H_LowerT, L_LowerT, W_LowerT
} from "./robotConstants.js";

/**
 * Adds a wheel to the given object at the specified position.
 * Used for the trailer's wheels.
 * @param {THREE.Object3D} obj - The object to which the wheel will be added.
 * @param {number} x - X position for the wheel.
 * @param {number} y - Y position for the wheel.
 * @param {number} z - Z position for the wheel.
 */
function addWheel(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(7.5, 7.5, 10, 15);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("wheel"));
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Creates the trailer object, including the main body, lower part, and wheels.
 * Adds the trailer to the scene and sets its position.
 * @param {number} x - X position for the trailer.
 * @param {number} y - Y position for the trailer.
 * @param {number} z - Z position for the trailer.
 */
export function createTrailer(x, y, z) {
    // Create a new Object3D to represent the trailer
    window.trailer = new THREE.Object3D();
    // Store engagement state and displacement for animation
    window.trailer.userData = { isEngaging: false, isEngaged: false, displacement: new THREE.Vector3(0, 0, 0) };
    
    // Main trailer body
    let geometry = new THREE.BoxGeometry(L_Trailer, H_Trailer, W_Trailer);
    let mesh = new THREE.Mesh(geometry, materialsMap.get("trailer"));
    mesh.position.set(0, (( H_Ci + H_Trailer)/2), 0);
    window.trailer.add(mesh);

    // Lower trailer part
    geometry = new THREE.BoxGeometry(L_LowerT, H_LowerT, W_LowerT);
    mesh = new THREE.Mesh(geometry, materialsMap.get("trailer"));
    mesh.position.set(0, (H_Ci - H_LowerT)/2, - W_Trailer/4);
    window.trailer.add(mesh);

    // Add four wheels to the trailer
    addWheel(window.trailer, -(L_LowerT + H_Roda) /2 , (H_Ci )/2 - H_LowerT, - W_Trailer/4 + W_LowerT/4);
    addWheel(window.trailer, -(L_LowerT + H_Roda) /2 , (H_Ci )/2 - H_LowerT, - W_Trailer/4 - W_LowerT/4);
    addWheel(window.trailer, (L_LowerT + H_Roda) /2 , (H_Ci)/2 - H_LowerT, - W_Trailer/4 + W_LowerT/4);
    addWheel(window.trailer, (L_LowerT + H_Roda) /2 , (H_Ci)/2 - H_LowerT, - W_Trailer/4 - W_LowerT/4);
    
    // Add the trailer to the scene and set its position
    window.scene.add(window.trailer);
    window.trailer.position.set(x, y, z);
}
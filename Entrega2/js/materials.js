import * as THREE from "three";

// Map to store all materials used for different robot and trailer parts
export const materialsMap = new Map();

/**
 * Initializes and stores all materials needed for the robot and trailer.
 * Each material is associated with a string key for easy retrieval.
 * The 'wireframe' property can be toggled at runtime for all materials.
 */
export function createMaterials() {
    // Head material (blue)
    materialsMap.set("head", new THREE.MeshBasicMaterial({ color: 0x0000cc, wireframe: false }));
    // Eye material (yellow)
    materialsMap.set("eye", new THREE.MeshBasicMaterial({ color: 0xffdb00, wireframe: false }));
    // Antenna material (blue)
    materialsMap.set("antenna", new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false }));
    // Torso material (red)
    materialsMap.set("torso", new THREE.MeshBasicMaterial({ color: 0xe60000, wireframe: false }));
    // Arm material (red)
    materialsMap.set("arm", new THREE.MeshBasicMaterial({ color: 0xe60000, wireframe: false }));
    // Exhaust pipe material (light gray)
    materialsMap.set("pipe", new THREE.MeshBasicMaterial({ color: 0xd5d5d5, wireframe: false }));
    // Abdomen material (gray)
    materialsMap.set("abdomen", new THREE.MeshBasicMaterial({ color: 0xa6a6a6, wireframe: false }));
    // Waist material (light gray)
    materialsMap.set("waist", new THREE.MeshBasicMaterial({ color: 0xc6c6c6, wireframe: false }));
    // Wheel material (black)
    materialsMap.set("wheel", new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
    // Thigh material (light gray)
    materialsMap.set("thigh", new THREE.MeshBasicMaterial({ color: 0xc6c6c6, wireframe: false }));
    // Leg material (dark blue)
    materialsMap.set("leg", new THREE.MeshBasicMaterial({ color: 0x0000a3, wireframe: false }));
    // Foot material (blue)
    materialsMap.set("foot", new THREE.MeshBasicMaterial({ color: 0x0000cc, wireframe: false }));
    // Trailer material (gray)
    materialsMap.set("trailer", new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false }));
}
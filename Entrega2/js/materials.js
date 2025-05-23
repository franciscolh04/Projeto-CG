import * as THREE from "three";

export const materials = new Map();

export function createMaterials() {
    materials.set("trailer", new THREE.MeshBasicMaterial({ color: 0x808080, wireframe: false }));
    materials.set("wheel", new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: false }));
    materials.set("torso", new THREE.MeshBasicMaterial({ color: 0xe60000, wireframe: false }));
    materials.set("abdomen", new THREE.MeshBasicMaterial({ color: 0xa6a6a6, wireframe: false }));
    materials.set("waist", new THREE.MeshBasicMaterial({ color: 0xc6c6c6, wireframe: false }));
    materials.set("arm", new THREE.MeshBasicMaterial({ color: 0xe60000, wireframe: false }));
    materials.set("leg", new THREE.MeshBasicMaterial({ color: 0x0000a3, wireframe: false }));
    materials.set("thigh", new THREE.MeshBasicMaterial({ color: 0xc6c6c6, wireframe: false }));
    materials.set("head", new THREE.MeshBasicMaterial({ color: 0x0000cc, wireframe: false }));
    materials.set("antenna", new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: false }));
    materials.set("eye", new THREE.MeshBasicMaterial({ color: 0xffdb00, wireframe: false }));
    materials.set("foot", new THREE.MeshBasicMaterial({ color: 0x0000cc, wireframe: false }));
    materials.set("pipe", new THREE.MeshBasicMaterial({ color: 0xd5d5d5, wireframe: false }));
}
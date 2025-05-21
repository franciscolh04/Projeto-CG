import * as THREE from "three";
import { materials } from "./materials.js";

function addWheel(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(7.5, 7.5, 10, 15);
    const mesh = new THREE.Mesh(geometry, materials.get("wheel"));
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

export function createTrailer(x, y, z) {
    window.trailer = new THREE.Object3D();
    window.trailer.userData = { engaging: false, engaged: false, displacement: new THREE.Vector3(0, 0, 0) };

    // Main trailer body
    let geometry = new THREE.BoxGeometry(150, 80, 70);
    let mesh = new THREE.Mesh(geometry, materials.get("trailer"));
    mesh.position.set(0, 25, 0);
    window.trailer.add(mesh);

    // Lower trailer part
    geometry = new THREE.BoxGeometry(50, 10, 70);
    mesh = new THREE.Mesh(geometry, materials.get("trailer"));
    mesh.position.set(-40, -20, 0);
    window.trailer.add(mesh);

    // Wheels
    addWheel(window.trailer, -60, -22.5, -40);
    addWheel(window.trailer, -20, -22.5, -40);
    addWheel(window.trailer, -60, -22.5, 40);
    addWheel(window.trailer, -20, -22.5, 40);

    window.scene.add(window.trailer);
    window.trailer.position.set(x, y, z);
}
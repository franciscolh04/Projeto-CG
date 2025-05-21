import * as THREE from "three";
import { materials } from "./materials.js";

// These should be declared in a shared/global scope or passed as parameters if you want to avoid globals
function addEye(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const mesh = new THREE.Mesh(geometry, materials.get("eye"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAntenna(obj, x, y, z) {
    const geometry = new THREE.ConeGeometry(2, 10, 10);
    const mesh = new THREE.Mesh(geometry, materials.get("antenna"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addHead(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(20, 20, 30);
    const mesh = new THREE.Mesh(geometry, materials.get("head"));
    mesh.position.set(0, 20, 0);

    addEye(mesh, 11, 1, 5);
    addEye(mesh, 11, 1, -5);

    addAntenna(mesh, 0, 15, 5);
    addAntenna(mesh, 0, 15, -5);

    mesh.add(window.head);
    window.head.add(mesh);
    obj.add(window.head);
}

function addExhaustPipe(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(1, 1, 40, 15);
    const mesh = new THREE.Mesh(geometry, materials.get("pipe"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addForearm(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(40, 20, 20);
    const mesh = new THREE.Mesh(geometry, materials.get("arm"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addArm(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(20, 40, 20);
    const mesh = new THREE.Mesh(geometry, materials.get("arm"));
    mesh.position.set(0, 0, z);

    addExhaustPipe(mesh, x - 10, y + 15, obj.position.z > 0 ? z + 9 : z - 9);
    addForearm(mesh, x + 10, y - 30, 0);

    mesh.add(obj);
    obj.add(mesh);
    window.robot.add(obj);
}

function addTorso(obj, x, y, z) {
    let geometry = new THREE.BoxGeometry(20, 40, 70);
    let mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x + 10, y, z);
    obj.add(mesh);

    geometry = new THREE.BoxGeometry(20, 40, 30);
    mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x - 10, y, z);
    obj.add(mesh);
}

function addAbdomen(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(40, 20, 30);
    const mesh = new THREE.Mesh(geometry, materials.get("abdomen"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWheel(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(7.5, 7.5, 10, 15);
    const mesh = new THREE.Mesh(geometry, materials.get("wheel"));
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWaist(obj, x, y, z) {
    addWheel(obj, x, y - 7.5, z - 40);
    addWheel(obj, x, y - 7.5, z + 40);

    const geometry = new THREE.BoxGeometry(40, 20, 70);
    const mesh = new THREE.Mesh(geometry, materials.get("waist"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFoot(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(20, 10, 30);
    const mesh = new THREE.Mesh(geometry, materials.get("foot"));
    mesh.position.set(0, -5, z < 0 ? z - 5 : z + 5);
    mesh.add(feet);
    feet.add(mesh);
    leg.add(feet);
}

function addLeg(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(10, 70, 30);
    const mesh = new THREE.Mesh(geometry, materials.get("leg"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addThigh(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(10, 30, 20);
    const mesh = new THREE.Mesh(geometry, materials.get("thigh"));
    mesh.position.set(0, -10, z);

    addLeg(mesh, 0, -50, z < 0 ? -5 : 5);
    addWheel(mesh, 2.5, -55, z < 0 ? -25 : 25);
    addWheel(mesh, 2.5, -75, z < 0 ? -25 : 25);
    addFoot(mesh, 5, -90, z);

    mesh.add(leg);
    leg.add(mesh);
    obj.add(leg);
}

export function createRobot(x, y, z) {
    window.head = new THREE.Object3D();
    window.feet = new THREE.Object3D();
    window.leg = new THREE.Object3D();
    window.lArm = new THREE.Object3D();
    window.rArm = new THREE.Object3D();

    window.robot = new THREE.Object3D();
    window.robot.userData = { truck: false };

    addWaist(window.robot, 0, 0, 0);
    addAbdomen(window.robot, 0, 20, 0);
    addTorso(window.robot, 0, 50, 0);

    head.position.set(10, 60, 0);
    addHead(window.robot, 0, 20, 0);

    lArm.position.set(-10, 50, 45);
    rArm.position.set(-10, 50, -45);
    addArm(lArm, 0, 0, 0);
    addArm(rArm, 0, 0, 0);

    leg.position.set(5, -5, 0);
    feet.position.set(5, -95, 0);

    addThigh(window.robot, 0, 0, 15);
    addThigh(window.robot, 0, 0, -15);

    window.scene.add(window.robot);
    window.robot.position.set(x, y, z);

    // Optionally export head, feet, leg, lArm, rArm if needed elsewhere
}
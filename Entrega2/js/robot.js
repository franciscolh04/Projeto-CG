import * as THREE from "three";
import { materialsMap } from "./materials.js";
import {
    L_Tronco, H_Tronco, W_Tronco, 
    L_Ab, H_Ab, W_Ab,
    L_Ci, H_Ci, W_Ci,
    R_Roda, H_Roda,
    L_Ca, H_Ca, W_Ca,
    L_Olho, H_Olho, W_Olho,
    R_Ant,  H_Ant,
    L_Coxa, H_Coxa, W_Coxa,
    L_Perna, H_Perna, W_Perna,
    L_Pe, H_Pe, W_Pe,
    L_An, H_An, W_An,
    L_Br, H_Br, W_Br,
    R_Mao, H_Mao,
    R_Tu, H_Tu
} from "./robotConstants.js";

/**
 * Adds an eye to the given object at the specified position.
 */
function addEye(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Olho, H_Olho, W_Olho);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("eye"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Adds an antenna to the given object at the specified position.
 */
function addAntenna(obj, x, y, z) {
    const geometry = new THREE.ConeGeometry(R_Ant/2, H_Ant, 50);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("antenna"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Builds the robot's head, including eyes and antennas, and attaches it to the parent object.
 */
function addHead(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Ca, H_Ca, W_Ca);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("head"));
    // Set mesh pivot to back down edge: (-L_Ca/2, -H_Ca/2, -W_Ca/2)
    mesh.position.set(0, H_Ca/2, W_Ca/2);

    // Add eyes and antennas relative to mesh's new local origin
    addEye(mesh, L_Ca /4, 0, W_Ca/2 + W_Olho/2);
    addEye(mesh, -L_Ca /4, 0, W_Ca/2 + W_Olho/2);
    addAntenna(mesh, (H_Ca - R_Ant)/2, H_Ca/2, (-W_Ca + R_Ant)/2 );
    addAntenna(mesh, -(H_Ca - R_Ant)/2, H_Ca/2, (-W_Ca + R_Ant)/2);

    window.head.add(mesh);
    // Position window.head so the head appears in the same place as before
    window.head.position.set(x, y + H_Ci/2 + H_Tronco + H_Ab, z - W_Tronco/2);
    obj.add(window.head);
}

/**
 * Adds an exhaust pipe to the given object at the specified position.
 */
function addExhaustPipe(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(R_Tu/2, R_Tu/2, H_Tu, 30);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("pipe"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Adds a forearm to the given object at the specified position.
 */
function addForearm(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_An, H_An, W_An);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("arm"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Builds an arm, including exhaust pipe and forearm, and attaches it to the parent object.
 */
function addArm(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Br, H_Br, W_Br);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("arm"));
    mesh.position.set(x, y - H_Br/2, z);

    // Add exhaust pipe and forearm to the arm mesh
    addExhaustPipe(mesh, obj.position.x > 0 ? x + (L_Br + R_Tu)/2 : x - (L_Br + R_Tu)/2 ,y + H_Br/2 + H_Ca - H_Tu/2, z - (W_Br - R_Tu)/2);
    addForearm(mesh, x, y - (H_An + H_Br)/2, z + (-W_Br + W_An)/2);

    mesh.add(obj);
    obj.add(mesh);
    window.robot.add(obj);
}

/**
 * Adds the torso to the robot at the specified position.
 */
function addTorso(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Tronco, H_Tronco, W_Tronco);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("torso"));
    mesh.position.set(x, y + (H_Ci + H_Tronco)/2 + H_Ab, z);
    obj.add(mesh);
}

/**
 * Adds the abdomen to the robot at the specified position.
 */
function addAbdomen(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Ab, H_Ab, W_Ab);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("abdomen"));
    mesh.position.set(x, y + (H_Ci + H_Ab)/2, z);
    obj.add(mesh);
}

/**
 * Adds a wheel to the given object at the specified position.
 */
function addWheel(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(R_Roda/2, R_Roda/2, H_Roda, 32);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("wheel"));
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Adds the waist to the robot, including wheels, at the specified position.
 */
function addWaist(obj, x, y, z) {
    addWheel(obj, x + (L_Ci + H_Roda)/2 , y - H_Ci/2 , z + W_Ci/2);
    addWheel(obj, x - (L_Ci + H_Roda)/2 , y - H_Ci/2 , z + W_Ci/2);

    const geometry = new THREE.BoxGeometry(L_Ci, H_Ci, W_Ci);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("waist"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Adds a foot to the given object, with direction (left/right).
 */
function addFoot(obj, x, y, z, dir) {
    const geometry = new THREE.BoxGeometry(L_Pe, H_Pe, W_Pe);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("foot"));
    mesh.position.set(0, y, z + W_Pe/2 + (-W_Perna)/2);
    if (dir) {
        // Right foot
        mesh.add(rightFeet);
        rightFeet.position.set(x - (W_Perna - W_Pe)/2, -(H_Coxa)/2 - H_Perna, 0);
        rightFeet.add(mesh);
        obj.add(rightFeet);
    } else {
        // Left foot
        mesh.add(leftFeet);
        leftFeet.position.set(x + (W_Perna - W_Pe) /2, -(H_Coxa)/2 - H_Perna, 0);
        leftFeet.add(mesh);
        obj.add(leftFeet);
    }
}

/**
 * Adds a leg to the given object at the specified position.
 */
function addLeg(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Perna, H_Perna, W_Perna);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("leg"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

/**
 * Adds a thigh to the given object, including leg, wheels, and foot.
 */
function addThigh(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Coxa, H_Coxa, W_Coxa);
    const mesh = new THREE.Mesh(geometry, materialsMap.get("thigh"));
    mesh.position.set(0, (-H_Coxa - H_Ci)/2, z);

    addLeg(mesh, x, y - (H_Coxa + H_Perna)/2 , z);
    
    // Add wheels to the thigh
    addWheel(mesh, obj.position.x > 0 ? x +(L_Perna + H_Roda)/2 :x -(L_Perna + H_Roda)/2, y- H_Coxa/2 - H_Perna/4, x + W_Perna/2);
    addWheel(mesh, obj.position.x > 0 ? x +(L_Perna + H_Roda)/2 :x -(L_Perna + H_Roda)/2, y- H_Coxa/2 - 3*H_Perna/4, x + W_Perna/2);
    // Add foot (right or left depending on position)
    if(obj.position.x > 0) {
        addFoot(mesh, x, y, z, true);
    } else {
        addFoot(mesh, x, y, z, false);
    }
    mesh.add(obj);
    obj.add(mesh);
    window.robot.add(obj);
}

/**
 * Assembles the robot by creating all parts and positioning them correctly.
 * Adds the robot to the scene at the given coordinates.
 */
export function createRobot(x, y, z) {
    // Create empty Object3Ds for each main robot part
    window.head = new THREE.Object3D();
    window.rightFeet = new THREE.Object3D();
    window.leftFeet = new THREE.Object3D();
    window.leftLeg = new THREE.Object3D();
    window.rightLeg = new THREE.Object3D();
    window.leftArm = new THREE.Object3D();
    window.rightArm = new THREE.Object3D();

    window.robot = new THREE.Object3D();
    window.robot.userData = { truck: false };

    // Add main body parts
    addWaist(window.robot, 0, 0, 0);
    addAbdomen(window.robot, 0, 0, 0);
    addTorso(window.robot, 0, 0, 0);
    addHead(window.robot, 0, 0, 0);

    // Position arms
    leftArm.position.set((L_Tronco + L_Br) /2 , H_Ci/2 + H_Tronco + H_Ab, -(W_Tronco + W_Br)/2);
    rightArm.position.set(-(L_Tronco + L_Br) /2 , H_Ci/2 + H_Tronco + H_Ab, -(W_Tronco + W_Br)/2);

    // Add arms to the robot
    addArm(leftArm, 0, 0, 0);
    addArm(rightArm, 0, 0, 0);

    // Position legs
    leftLeg.position.set((L_Ci - L_Perna)/2, 0, (W_Ci - W_Perna)/2);
    rightLeg.position.set(-(L_Ci - L_Perna)/2,0, (W_Ci - W_Perna)/2);

    // Add thighs (which include legs, wheels, and feet)
    addThigh(leftLeg, 0, 0, 0);
    addThigh(rightLeg, 0, 0, 0);

    // Add the robot to the scene and set its position
    window.scene.add(window.robot);
    window.robot.position.set(x, y, z);

}
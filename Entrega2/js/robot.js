import * as THREE from "three";
import { materials } from "./materials.js";
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
    R_Tu, H_Tu} from "./const.js";

// These should be declared in a shared/global scope or passed as parameters if you want to avoid globals
function addEye(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Olho, H_Olho, W_Olho);
    const mesh = new THREE.Mesh(geometry, materials.get("eye"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addAntenna(obj, x, y, z) {
    const geometry = new THREE.ConeGeometry(R_Ant/2, H_Ant, 50);
    const mesh = new THREE.Mesh(geometry, materials.get("antenna"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addHead(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Ca, H_Ca, W_Ca);
    const mesh = new THREE.Mesh(geometry, materials.get("head"));
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

function addExhaustPipe(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(R_Tu/2, R_Tu/2, H_Tu, 30);
    const mesh = new THREE.Mesh(geometry, materials.get("pipe"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addForearm(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_An, H_An, W_An);
    const mesh = new THREE.Mesh(geometry, materials.get("arm"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addArm(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Br, H_Br, W_Br);
    const mesh = new THREE.Mesh(geometry, materials.get("arm"));
    mesh.position.set(x, y - H_Br/2, z);

    addExhaustPipe(mesh, obj.position.x > 0 ? x + (L_Br + R_Tu)/2 : x - (L_Br + R_Tu)/2 ,y + H_Br/2 + H_Ca - H_Tu/2, z - (W_Br - R_Tu)/2);
    addForearm(mesh, x, y - (H_An + H_Br)/2, z + (-W_Br + W_An)/2);

    mesh.add(obj);
    obj.add(mesh);
    window.robot.add(obj);
}

function addTorso(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Tronco, H_Tronco, W_Tronco);
    const mesh = new THREE.Mesh(geometry, materials.get("torso"));
    mesh.position.set(x, y + (H_Ci + H_Tronco)/2 + H_Ab, z);
    obj.add(mesh);
}

function addAbdomen(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Ab, H_Ab, W_Ab);
    const mesh = new THREE.Mesh(geometry, materials.get("abdomen"));
    mesh.position.set(x, y + (H_Ci + H_Ab)/2, z);
    obj.add(mesh);
}

function addWheel(obj, x, y, z) {
    const geometry = new THREE.CylinderGeometry(R_Roda/2, R_Roda/2, H_Roda, 32);
    const mesh = new THREE.Mesh(geometry, materials.get("wheel"));
    mesh.rotation.z = Math.PI / 2;
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addWaist(obj, x, y, z) {
    addWheel(obj, x + (L_Ci + H_Roda)/2 , y - H_Ci/2 , z + W_Ci/2);
    addWheel(obj, x - (L_Ci + H_Roda)/2 , y - H_Ci/2 , z + W_Ci/2);

    const geometry = new THREE.BoxGeometry(L_Ci, H_Ci, W_Ci);
    const mesh = new THREE.Mesh(geometry, materials.get("waist"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addFoot(obj, x, y, z, dir) {
    const geometry = new THREE.BoxGeometry(L_Pe, H_Pe, W_Pe);
    const mesh = new THREE.Mesh(geometry, materials.get("foot"));
    mesh.position.set(0, y, z + W_Pe/2 + (-W_Perna)/2);
    if (dir) {
        mesh.add(rFeet);
        rFeet.position.set(x - (W_Perna - W_Pe)/2, -(H_Coxa)/2 - H_Perna, 0);
        rFeet.add(mesh);
        obj.add(rFeet);
    } else {
        mesh.add(lFeet);
        lFeet.position.set(x + (W_Perna - W_Pe) /2, -(H_Coxa)/2 - H_Perna, 0);
        lFeet.add(mesh);
        obj.add(lFeet);
    }
}

function addLeg(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Perna, H_Perna, W_Perna);
    const mesh = new THREE.Mesh(geometry, materials.get("leg"));
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function addThigh(obj, x, y, z) {
    const geometry = new THREE.BoxGeometry(L_Coxa, H_Coxa, W_Coxa);
    const mesh = new THREE.Mesh(geometry, materials.get("thigh"));
    mesh.position.set(x, (-H_Coxa - H_Ci)/2, z);

    addLeg(mesh, x, y - (H_Coxa + H_Perna)/2 , z);
    
    addWheel(mesh, obj.position.x > 0 ? x +(L_Perna + H_Roda)/2 :x -(L_Perna + H_Roda)/2, y- H_Coxa/2 - H_Perna/4, x + W_Perna/2);
    addWheel(mesh, obj.position.x > 0 ? x +(L_Perna + H_Roda)/2 :x -(L_Perna + H_Roda)/2, y- H_Coxa/2 - 3*H_Perna/4, x + W_Perna/2);
    if(obj.position.x > 0) {
        addFoot(mesh, x, y, z, true);
    } else {
        addFoot(mesh, x, y, z, false);
    }
    mesh.add(obj);
    obj.add(mesh);
    window.robot.add(obj);

}

export function createRobot(x, y, z) {
    window.head = new THREE.Object3D();
    window.rFeet = new THREE.Object3D();
    window.lFeet = new THREE.Object3D();
    window.lLeg = new THREE.Object3D();
    window.rLeg = new THREE.Object3D();
    window.lArm = new THREE.Object3D();
    window.rArm = new THREE.Object3D();

    window.robot = new THREE.Object3D();
    window.robot.userData = { truck: false };

    addWaist(window.robot, x, y, z);
    addAbdomen(window.robot, x, y, z);
    addTorso(window.robot, x, y, z);
    
    //head.position.set(0, H_Ci/2 + H_Tronco + H_Ab, -W_Ca/2);
    addHead(window.robot, x, y, z);
    
    lArm.position.set((L_Tronco + L_Br) /2 , H_Ci/2 + H_Tronco + H_Ab, -(W_Tronco + W_Br)/2);
    rArm.position.set(-(L_Tronco + L_Br) /2 , H_Ci/2 + H_Tronco + H_Ab, -(W_Tronco + W_Br)/2);

    addArm(lArm, x, y, z);
    addArm(rArm, x, y, z);
    
    lLeg.position.set((L_Ci - L_Perna)/2, 0, (W_Ci - W_Perna)/2);
    rLeg.position.set(-(L_Ci - L_Perna)/2,0, (W_Ci - W_Perna)/2);

    
    
    addThigh(lLeg, x, y, z);
    addThigh(rLeg, x, y, z);
    
    
   
    window.scene.add(window.robot);
    window.robot.position.set(x, y, z);


    // Optionally export head, feet, leg, lArm, rArm if needed elsewhere
}
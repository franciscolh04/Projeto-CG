import * as THREE from "three";
import { checkCollisions, handleCollisions, computeDisplacement } from "./collisions.js";
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
    L_Trailer, W_Trailer, H_Trailer } from "./const.js";

////////////
/* UPDATE */
////////////
export function update(){

    let delta = window.clock.getDelta();
    
    if (!window.trailer.userData.engaging) { // trailer is free to move around
        handleRotations(delta);
        updateMovement();

        var tentativePos = updateTruckPosition(delta);
        var currentPos;
        
        if (robot.userData.truck) { // check collision (truck mode && trailer not engaged)
            currentPos = checkCollisions(delta, tentativePos);
        } else {
            currentPos = tentativePos;
        }
        window.trailer.position.x = currentPos.x;
        window.trailer.position.z = currentPos.y; // CORRIGIDO
        updateTrailerAABB(window.trailer.position.x, window.trailer.position.z);
    } else {
        handleCollisions(delta);
    }
}

export function updateMovement() {
    window.movementVector.set(0, 0, 0);

    if (window.keys['ArrowUp']) {
        window.movementVector.x -= 100;
    }
    if (window.keys['ArrowDown']) {
        window.movementVector.x += 100;
    }
    if (window.keys['ArrowLeft']) {
        window.movementVector.z += 100;
    }
    if (window.keys['ArrowRight']) {
        window.movementVector.z -= 100;
    }
}

export function handleRotations(delta) {
    if (rotateFeetIn) {
        rFeet.rotation.x = THREE.MathUtils.clamp(rFeet.rotation.x + delta * 5, 0, Math.PI/2 );
        lFeet.rotation.x = THREE.MathUtils.clamp(lFeet.rotation.x + delta * 5, 0, Math.PI/2);
    }
    if (rotateFeetOut) {
        rFeet.rotation.x = THREE.MathUtils.clamp(rFeet.rotation.x - delta * 5, 0, Math.PI/2);
        lFeet.rotation.x = THREE.MathUtils.clamp(lFeet.rotation.x - delta * 5, 0, Math.PI/2);
    }
    if (rotateLegIn) {
        rLeg.rotation.x = THREE.MathUtils.clamp(rLeg.rotation.x + delta * 5, 0, Math.PI / 2);
        lLeg.rotation.x = THREE.MathUtils.clamp(lLeg.rotation.x + delta * 5, 0, Math.PI / 2);
    }
    if (rotateLegOut) {
        rLeg.rotation.x = THREE.MathUtils.clamp(rLeg.rotation.x - delta * 5, 0,  Math.PI / 2);
        lLeg.rotation.x = THREE.MathUtils.clamp(lLeg.rotation.x - delta * 5, 0,  Math.PI / 2)
    }
    if (rotateHeadIn) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x - delta * 5, - Math.PI, 0);
    }
    if (rotateHeadOut) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x + delta * 5, - Math.PI, 0);
    }
    if (displaceArmsIn) {
        lArm.position.x = THREE.MathUtils.clamp(lArm.position.x - delta * 50, L_Tronco - L_Ab, lArm.position.x);
        rArm.position.x = THREE.MathUtils.clamp(rArm.position.x + delta * 50, rArm.position.x, -(L_Tronco - L_Ab));
    }
    if (displaceArmsOut) {
        lArm.position.x = THREE.MathUtils.clamp(lArm.position.x + delta * 50, lArm.position.x, L_Ab);
        rArm.position.x = THREE.MathUtils.clamp(rArm.position.x - delta * 50, -L_Ab, rArm.position.x);
    }
    checkTruckMode();
}

export function updateTruckPosition(delta) {

    const tentativeX = window.trailer.position.x + movementVector.x * delta;
    const tentativeZ = window.trailer.position.z + movementVector.z * delta;

    return new THREE.Vector2(tentativeX, tentativeZ);
}

export function checkTruckMode() {

    robot.userData.truck = head.rotation.x == -Math.PI &&
                            lLeg.rotation.x ==  Math.PI / 2 &&
                            rLeg.rotation.x == Math.PI / 2 &&
                            lFeet.rotation.x == Math.PI / 2 &&
                            rFeet.rotation.x == Math.PI / 2 &&
                            rArm.position.x == -(L_Tronco - L_Ab) &&
                            lArm.position.x == L_Tronco - L_Ab
    if (!robot.userData.truck) window.trailer.userData.engaged = false;
}

export function updateTrailerAABB(x, z) {
    window.minTrailerAABB = new THREE.Vector3(
        x - L_Trailer / 2,
        window.trailer.position.y - H_Trailer / 2 + 15,
        z - W_Trailer / 2
    );
    window.maxTrailerAABB = new THREE.Vector3(
        x + L_Trailer / 2,
        window.trailer.position.y + H_Trailer / 2 + 15,
        z + W_Trailer / 2
    );
}

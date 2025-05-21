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
    R_Tu, H_Tu} from "./const.js";

////////////
/* UPDATE */
////////////
export function update(){
    'use strict';

    let delta = window.clock.getDelta();
    
    if (!trailer.userData.engaging) { // trailer is free to move around
        handleRotations(delta);
        updateMovement();

        var tentativePos = updateTruckPosition(delta);
        var currentPos;
        
        if (robot.userData.truck) { // check collision (truck mode && trailer not engaged)
            currentPos = checkCollisions(delta, tentativePos);
        } else {
            currentPos = tentativePos;
        }
        trailer.position.x = currentPos.x;
        trailer.position.z = currentPos.y;
        updateTrailerAABB(trailer.position.x, trailer.position.z);
    } else {
        handleCollisions(delta);
    }

}

export function updateMovement() {
    'use strict';
    window.movementVector.set(0, 0);

    if (window.keys['ArrowUp']) {
        window.movementVector.x -= 100;
    }
    if (window.keys['ArrowDown']) {
        window.movementVector.x += 100;
    }
    if (window.keys['ArrowLeft']) {
        window.movementVector.y += 100;
    }
    if (window.keys['ArrowRight']) {
        window.movementVector.y -= 100;
    }
}

export function handleRotations(delta) {
    'use strict';
    if (rotateFeetIn) {
        rFeet.rotation.x = THREE.MathUtils.clamp(rFeet.rotation.x - delta * 5, 0, Math.PI/2);
        lFeet.rotation.x = THREE.MathUtils.clamp(lFeet.rotation.x - delta * 5, 0, Math.PI/2);
        rotateFeetIn = false;
    }
    if (rotateFeetOut) {
        rFeet.rotation.x = THREE.MathUtils.clamp(rFeet.rotation.x + delta * 5, 0, Math.PI/2 );
        lFeet.rotation.x = THREE.MathUtils.clamp(lFeet.rotation.x + delta * 5, 0, Math.PI/2);
        rotateFeetOut = false;
    }
    if (rotateLegIn) {
        rLeg.rotation.x = THREE.MathUtils.clamp(rLeg.rotation.x + delta * 5, 0, Math.PI / 2);
        lLeg.rotation.x = THREE.MathUtils.clamp(lLeg.rotation.x + delta * 5, 0, Math.PI / 2);
        rotateLegIn = false;
    }
    if (rotateLegOut) {
        rLeg.rotation.x = THREE.MathUtils.clamp(rLeg.rotation.x - delta * 5, 0,  Math.PI / 2);
        lLeg.rotation.x = THREE.MathUtils.clamp(lLeg.rotation.x - delta * 5, 0,  Math.PI / 2)
        rotateLegOut = false;
    }
    if (rotateHeadIn) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x + delta * 5, - Math.PI, 0);
        rotateHeadIn = false;
    }
    if (rotateHeadOut) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x - delta * 5, - Math.PI, 0);
        rotateHeadOut = false;
    }
    if (displaceArmsIn) {
        lArm.position.x = THREE.MathUtils.clamp(lArm.position.x + delta * 50, lArm.position.x, 60);
        rArm.position.x = THREE.MathUtils.clamp(rArm.position.x - delta * 50, -60, rArm.position.x);
        displaceArmsIn = false;
    }
    if (displaceArmsOut) {
        lArm.position.x = THREE.MathUtils.clamp(lArm.position.x - delta * 50, 40, lArm.position.x);
        rArm.position.x = THREE.MathUtils.clamp(rArm.position.x + delta * 50, rArm.position.x, -40);
        displaceArmsOut = false;
    }
    checkTruckMode();
}

export function updateTruckPosition(delta) {
    'use strict';

    const tentativeX = trailer.position.x + movementVector.x * delta;
    const tentativeZ = trailer.position.z + movementVector.y * delta;

    return new THREE.Vector2(tentativeX, tentativeZ);
}

export function checkTruckMode() {
    'use strict';

    robot.userData.truck = head.rotation.z == Math.PI / 2 &&
                            leg.rotation.z ==  - Math.PI / 2 &&
                            feet.rotation.z == - Math.PI / 2 &&
                            lArm.position.z == 25 && rArm.position.z == -25;

    if (!robot.userData.truck) trailer.userData.engaged = false; 
}

export function updateTrailerAABB(x, z) {
    'use strict';
    window.minTrailerAABB = new THREE.Vector3(x - 150 / 2, window.trailer.position.y - 90 / 2 + 15, z - 70 / 2);
    window.maxTrailerAABB = new THREE.Vector3(x + 150 / 2, window.trailer.position.y + 90 / 2 + 15, z + 70 / 2);
}

import * as THREE from "three";
import { checkCollisions, handleCollisions, computeDisplacement } from "./collisions.js";

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
        feet.rotation.z = THREE.MathUtils.clamp(feet.rotation.z + delta * 5, - Math.PI / 2, 0);
        rotateFeetIn = false;
    }
    if (rotateFeetOut) {
        feet.rotation.z = THREE.MathUtils.clamp(feet.rotation.z - delta * 5, - Math.PI / 2, 0);
        rotateFeetOut = false;
    }
    if (rotateLegIn) {
        leg.rotation.z = THREE.MathUtils.clamp(leg.rotation.z + delta * 5, - Math.PI / 2, 0);
        rotateLegIn = false;
    }
    if (rotateLegOut) {
        leg.rotation.z = THREE.MathUtils.clamp(leg.rotation.z - delta * 5, - Math.PI / 2, 0);
        rotateLegOut = false;
    }
    if (rotateHeadIn) {
        head.rotation.z = THREE.MathUtils.clamp(head.rotation.z - delta * 5, 0, Math.PI / 2);
        rotateHeadIn = false;
    }
    if (rotateHeadOut) {
        head.rotation.z = THREE.MathUtils.clamp(head.rotation.z + delta * 5, 0, Math.PI / 2);
        rotateHeadOut = false;
    }
    if (displaceArmsIn) {
        lArm.position.z = THREE.MathUtils.clamp(lArm.position.z + delta * 50, 25, 45);
        rArm.position.z = THREE.MathUtils.clamp(rArm.position.z - delta * 50, -45, -25);
        displaceArmsIn = false;
    }
    if (displaceArmsOut) {
        lArm.position.z = THREE.MathUtils.clamp(lArm.position.z - delta * 50, 25, 45);
        rArm.position.z = THREE.MathUtils.clamp(rArm.position.z + delta * 50, -45, -25);
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

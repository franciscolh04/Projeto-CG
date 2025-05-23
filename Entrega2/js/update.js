import * as THREE from "three";
import { verifyCollisions, processCollisions, calculateDisplacement } from "./collisions.js";
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
    R_Tu, H_Tu,
    L_Trailer, W_Trailer, H_Trailer
} from "./robotConstants.js";

/**
 * Main update function called every animation frame.
 * Handles robot rotations, trailer movement, collision detection, and trailer engagement animation.
 */
export function update() {
    let delta = window.clock.getDelta();

    // If the trailer is not currently engaging, allow movement and rotation
    if (!window.trailer.userData.isEngaging) {
        processRotations(delta);
        updateMovement();

        // Calculate the tentative new position for the trailer
        var tentativePos = calculateTrailerPosition(delta);
        var currentPos;

        // If the robot is in truck mode, check for collision with the trailer
        if (robot.userData.truck) {
            currentPos = verifyCollisions(delta, tentativePos);
        } else {
            currentPos = tentativePos;
        }
        // Update trailer position
        window.trailer.position.x = currentPos.x;
        window.trailer.position.z = currentPos.y; // Note: .y is used as z here due to Vector2
        updateTrailerAABB(window.trailer.position.x, window.trailer.position.z);
    } else {
        // If engaging, animate the trailer engagement
        processCollisions(delta);
    }
}

/**
 * Updates the movement vector based on pressed keys.
 * Arrow keys control the direction and speed of the trailer.
 */
export function updateMovement() {
    window.movementVector.set(0, 0, 0);

    if (window.pressedKeys['ArrowUp']) {
        window.movementVector.x -= 100;
    }
    if (window.pressedKeys['ArrowDown']) {
        window.movementVector.x += 100;
    }
    if (window.pressedKeys['ArrowLeft']) {
        window.movementVector.z += 100;
    }
    if (window.pressedKeys['ArrowRight']) {
        window.movementVector.z -= 100;
    }
}

/**
 * Handles all robot part rotations and arm movements based on input flags.
 * Uses clamping to ensure rotations stay within allowed limits.
 */
export function processRotations(delta) {
    if (feetRotationIn) {
        rightFeet.rotation.x = THREE.MathUtils.clamp(rightFeet.rotation.x + delta * 5, 0, Math.PI/2 );
        leftFeet.rotation.x = THREE.MathUtils.clamp(leftFeet.rotation.x + delta * 5, 0, Math.PI/2);
    }
    if (feetRotationOut) {
        rightFeet.rotation.x = THREE.MathUtils.clamp(rightFeet.rotation.x - delta * 5, 0, Math.PI/2);
        leftFeet.rotation.x = THREE.MathUtils.clamp(leftFeet.rotation.x - delta * 5, 0, Math.PI/2);
    }
    if (legRotationIn) {
        rightLeg.rotation.x = THREE.MathUtils.clamp(rightLeg.rotation.x + delta * 5, 0, Math.PI / 2);
        leftLeg.rotation.x = THREE.MathUtils.clamp(leftLeg.rotation.x + delta * 5, 0, Math.PI / 2);
    }
    if (legRotationOut) {
        rightLeg.rotation.x = THREE.MathUtils.clamp(rightLeg.rotation.x - delta * 5, 0,  Math.PI / 2);
        leftLeg.rotation.x = THREE.MathUtils.clamp(leftLeg.rotation.x - delta * 5, 0,  Math.PI / 2)
    }
    if (headRotationIn) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x - delta * 5, - Math.PI, 0);
    }
    if (headRotationOut) {
        head.rotation.x = THREE.MathUtils.clamp(head.rotation.x + delta * 5, - Math.PI, 0);
    }
    if (moveArmsIn) {
        leftArm.position.x = THREE.MathUtils.clamp(leftArm.position.x - delta * 50, L_Tronco - L_Ab, leftArm.position.x);
        rightArm.position.x = THREE.MathUtils.clamp(rightArm.position.x + delta * 50, rightArm.position.x, -(L_Tronco - L_Ab));
    }
    if (moveArmsOut) {
        leftArm.position.x = THREE.MathUtils.clamp(leftArm.position.x + delta * 50, leftArm.position.x, L_Ab);
        rightArm.position.x = THREE.MathUtils.clamp(rightArm.position.x - delta * 50, -L_Ab, rightArm.position.x);
    }
    // After all rotations, check if the robot is in truck mode
    verifyTruckMode();
}

/**
 * Calculates the tentative new position for the trailer based on the movement vector and delta time.
 * Returns a Vector2 with the new x and z positions.
 */
export function calculateTrailerPosition(delta) {
    const tentativeX = window.trailer.position.x + movementVector.x * delta;
    const tentativeZ = window.trailer.position.z + movementVector.z * delta;
    return new THREE.Vector2(tentativeX, tentativeZ);
}

/**
 * Verifies if the robot is in truck mode by checking the rotations and positions of all relevant parts.
 * If not in truck mode, disengages the trailer.
 */
export function verifyTruckMode() {
    robot.userData.truck = head.rotation.x == -Math.PI &&
                            leftLeg.rotation.x ==  Math.PI / 2 &&
                            rightLeg.rotation.x == Math.PI / 2 &&
                            leftFeet.rotation.x == Math.PI / 2 &&
                            rightFeet.rotation.x == Math.PI / 2 &&
                            rightArm.position.x == -(L_Tronco - L_Ab) &&
                            leftArm.position.x == L_Tronco - L_Ab;
    if (!robot.userData.truck) window.trailer.userData.isEngaged = false;
}

/**
 * Updates the trailer's Axis-Aligned Bounding Box (AABB) for collision detection.
 * The bounding box is recalculated based on the trailer's current position.
 */
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

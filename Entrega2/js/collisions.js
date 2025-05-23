import * as THREE from "three";
import { updateTrailerAABB } from "./update.js";
import { W_Ci, W_Br, W_Trailer, W_Olho, X_In, Y_In, Z_In } from "./robotConstants.js";

/**
 * Checks for collision (overlap) between the truck and the trailer's bounding boxes.
 * If a collision is detected and the trailer is not yet engaged, starts the engagement animation.
 * Returns the new position for the trailer (may be unchanged if no collision).
 */
export function verifyCollisions(delta, pos) {
    // Update the trailer's bounding box with the tentative position
    updateTrailerAABB(pos.x, pos.y);

    let newPos = pos;

    // Check for overlap between truck and trailer AABBs (Axis-Aligned Bounding Boxes)
    if (
        window.maxTruckAABB.x > window.minTrailerAABB.x && window.minTruckAABB.x < window.maxTrailerAABB.x &&
        window.maxTruckAABB.y > window.minTrailerAABB.y && window.minTruckAABB.y < window.maxTrailerAABB.y &&
        window.maxTruckAABB.z > window.minTrailerAABB.z && window.minTruckAABB.z < window.maxTrailerAABB.z
    ) { 
        // If not already engaged, start the engagement animation
        if (!window.trailer.userData.isEngaged) {
            calculateDisplacement(delta);
            window.trailer.userData.isEngaging = true;
            // Lock trailer position to the animated value
            newPos.x = window.trailer.position.x;
            newPos.z = window.trailer.position.z;
        }
    } else {
        // No collision: disengage trailer if it was engaged
        window.trailer.userData.isEngaged = false;
    }

    return newPos;
}

/**
 * Handles the trailer engagement animation, moving the trailer towards the target position.
 * When the animation completes, sets the trailer as engaged and resets animation state.
 */
export function processCollisions(delta) {
    if (window.elapsed < window.duration) {
        // Calculate squared distances for comparison
        var dis = window.trailer.position.clone().sub(window.targetPos).lengthSq();
        var displacement = window.displacement.lengthSq();

        // If the next step would overshoot, snap to the target
        if (displacement > dis) {
            window.displacement = targetPos.clone().sub(window.trailer.position);
        }

        // Move the trailer by the computed displacement
        window.trailer.position.add(window.displacement);
        window.elapsed += delta * window.animationSpeed;
    } else {
        // Animation finished: ensure trailer is exactly at the target position
        window.trailer.position.set(X_In, Y_In, Z_In -W_Ci/2 -W_Br -W_Trailer/2 - W_Olho);
        window.trailer.userData.isEngaging = false;
        window.trailer.userData.isEngaged = true;
        window.elapsed = 0;
    }
}

/**
 * Computes the displacement vector for the trailer engagement animation.
 * This determines how much the trailer should move in this frame.
 */
export function calculateDisplacement(delta) {
    const currentPos = window.trailer.position.clone();
    const distance = window.targetPos.clone().sub(currentPos);
    // Calculate velocity based on total duration and animation speed
    const velocity = distance.clone().divideScalar(window.duration).multiplyScalar(window.animationSpeed);
    // Displacement for this frame
    window.displacement = velocity.clone().multiplyScalar(delta);
}
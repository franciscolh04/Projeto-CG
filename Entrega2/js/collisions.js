import * as THREE from "three";
import { updateTrailerAABB } from "./update.js";

// This function checks for collision between the truck and trailer
export function checkCollisions(delta, pos) {
    // Update the trailer's AABB with the tentative position
    updateTrailerAABB(pos.x, pos.y);

    let newPos = pos;

    // Check for overlap between truck and trailer AABBs
    if (
        window.maxTruckAABB.x > window.minTrailerAABB.x && window.minTruckAABB.x < window.maxTrailerAABB.x &&
        window.maxTruckAABB.y > window.minTrailerAABB.y && window.minTruckAABB.y < window.maxTrailerAABB.y &&
        window.maxTruckAABB.z > window.minTrailerAABB.z && window.minTruckAABB.z < window.maxTrailerAABB.z
    ) {
        if (!window.trailer.userData.engaged) {
            // Collision detected and trailer is not engaged -> engage (animation)
            computeDisplacement(delta);
            window.trailer.userData.engaging = true;
            newPos.x = window.trailer.position.x;
            newPos.y = window.trailer.position.z;
        }
    } else {
        window.trailer.userData.engaged = false;
    }

    return newPos;
}

// This function handles the trailer engagement animation
export function handleCollisions(delta) {
    if (window.elapsed < window.duration) {
        window.trailer.position.add(window.displacement);
        window.elapsed += delta * window.animationSpeed;
    } else {
        window.trailer.position.set(-125, 30, 0); // guarantee trailer is in the right position
        window.trailer.userData.engaging = false;
        window.trailer.userData.engaged = true;
        window.elapsed = 0;
    }
}

// This function computes the displacement vector for the trailer engagement animation
export function computeDisplacement(delta) {
    const currentPos = window.trailer.position.clone();
    const distance = window.targetPos.clone().sub(currentPos);
    const velocity = distance.clone().divideScalar(window.duration).multiplyScalar(window.animationSpeed);
    window.displacement = velocity.clone().multiplyScalar(delta);
}
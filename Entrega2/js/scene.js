import * as THREE from "three";
import { createRobot } from "./robot.js";
import { createTrailer } from "./trailer.js";

/**
 * Creates and initializes the main scene.
 * Sets the background color, adds the robot and the trailer to the scene.
 * The trailer is positioned behind the robot by offsetting the z coordinate.
 *
 * @param {number} x - X position for the robot and trailer.
 * @param {number} y - Y position for the robot and trailer.
 * @param {number} z - Z position for the robot; the trailer is placed at z - 250.
 */
export function createScene(x, y, z) {
    // Create a new Three.js scene and set the background color to white
    window.scene = new THREE.Scene();
    window.scene.background = new THREE.Color('#ffffff');
    // Add the robot at the specified position
    createRobot(x, y, z);
    // Add the trailer behind the robot
    createTrailer(x, y, z - 250);
}
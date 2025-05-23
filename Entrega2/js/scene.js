import * as THREE from "three";
import { createRobot } from "./robot.js";
import { createTrailer } from "./trailer.js";

export function createScene(x, y, z) {
    window.scene = new THREE.Scene();
    window.scene.background = new THREE.Color('#ffffff');
    createRobot(x, y, z);
    createTrailer(x, y, z -250);
}
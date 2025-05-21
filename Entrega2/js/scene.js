import * as THREE from "three";
import { createRobot } from "./robot.js";
import { createTrailer } from "./trailer.js";

export function createScene() {
    window.scene = new THREE.Scene();
    window.scene.background = new THREE.Color('#ffffff');
    createRobot(0, 0, 0);
    createTrailer(0, 0, -250);
}
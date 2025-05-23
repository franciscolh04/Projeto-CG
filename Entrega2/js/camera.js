import * as THREE from "three";

// List to store all created cameras
export let cameraList = [];
// Reference to the currently active camera
export let currentCamera;

/**
 * Creates four cameras (three orthographic and one perspective) and stores them in cameraList.
 * The cameras are positioned according to the viewpointPositions array.
 * The first camera in the list is set as the default active camera (window.currentCamera).
 */
export function createCameras() {
    // Array of positions for each camera: [x, y, z]
    const viewpointPositions = [
        [0, 0, 100],   // Front view
        [100, 0, 0],   // Side view
        [0, 150, 0],   // Top view
        [250, 150, 250] // Perspective view
    ];

    for (let i = 0; i < viewpointPositions.length; i++) {
        // The last camera is a perspective camera, the others are orthographic
        if (i === 3) {
            currentCamera = new THREE.PerspectiveCamera(
                70, 
                window.innerWidth / window.innerHeight, 
                1, 
                1000
            );
        } else {
            currentCamera = new THREE.OrthographicCamera(
                window.innerWidth / -5,
                window.innerWidth / 5,
                window.innerHeight / 5,
                window.innerHeight / -5,
                1,
                1000
            );
        }
        // Set the camera position
        currentCamera.position.set(...viewpointPositions[i]);
        // Make the camera look at the origin (center of the scene)
        currentCamera.lookAt(0, 0, 0);
        // Add the camera to the list
        cameraList.push(currentCamera);
    }
    // Set the first camera as the default active camera
    window.currentCamera = cameraList[0];
}
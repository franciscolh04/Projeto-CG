import * as THREE from "three";

export let cameras = [];
export let camera;

export function createCameras() {
    const positions = [
        [0, 0, 100],
        [100, 0, 0],
        [0, 150, 0],
        [150, 100, 150],
        [500, 500, 500]
    ];

    for (let i = 0; i < 5; i++) {
        if (i == 4) {
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        } else {
            camera = new THREE.OrthographicCamera(
                window.innerWidth / -5,
                window.innerWidth / 5,
                window.innerHeight / 5,
                window.innerHeight / -5,
                1,
                1000
            );
        }
        camera.position.set(...positions[i]);
        camera.lookAt(0, 0, 0);
        cameras.push(camera);
    }
    window.camera = cameras[0];
}
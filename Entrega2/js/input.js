// These should be imported or passed as needed from your main script
// import { materials } from "./materials.js";
// import { trailer, cameras } from "./scene.js";

export function onKeyDown(e) {
    switch (e.keyCode) {
        case 37: // arrow
        case 38: // arrow
        case 39: // arrow
        case 40: // arrow
            if (!window.trailer.userData.engaging) window.keys[e.code] = true;
            break;
        case 49: // 1
            window.camera = window.cameras[0];
            break;
        case 50: // 2
            window.camera = window.cameras[1];
            break;
        case 51: // 3
            window.camera = window.cameras[2];
            break;
        case 52: // 4
            window.camera = window.cameras[3];
            break;
        case 53: // 5
            window.camera = window.cameras[4];
            break;
        case 81: // q
            window.rotateFeetIn = true;
            break;
        case 65: // a
            window.rotateFeetOut = true;
            break;
        case 87: // w
            window.rotateLegIn = true;
            break;
        case 83: // s
            window.rotateLegOut = true;
            break;
        case 69: // e
            window.displaceArmsIn = true;
            break;
        case 68: // d
            window.displaceArmsOut = true;
            break;
        case 82: // r
            window.rotateHeadIn = true;
            break;
        case 70: // f
            window.rotateHeadOut = true;
            break;
        case 54: // 6
            window.materials.forEach(value => { value.wireframe = !value.wireframe; });
            break;
    }
}

export function onKeyUp(e) {
    window.keys[e.code] = false;
}
// These should be imported or passed as needed from your main script
// import { materials } from "./materials.js";
// import { trailer, cameras } from "./scene.js";

export function onKeyDown(e) {
    switch (e.code) {
        case "ArrowLeft":
        case "ArrowUp":
        case "ArrowRight":
        case "ArrowDown":
            if (!window.trailer.userData.engaging) window.keys[e.code] = true;
            break;
        case "Digit1":
            window.camera = window.cameras[0];
            break;
        case "Digit2":
            window.camera = window.cameras[1];
            break;
        case "Digit3":
            window.camera = window.cameras[2];
            break;
        case "Digit4":
            window.camera = window.cameras[3];
            break;
        case "KeyQ":
            window.rotateFeetIn = true;
            break;
        case "KeyA":
            window.rotateFeetOut = true;
            break;
        case "KeyW":
            window.rotateLegIn = true;
            break;
        case "KeyS":
            window.rotateLegOut = true;
            break;
        case "KeyE":
            window.displaceArmsIn = true;
            break;
        case "KeyD":
            window.displaceArmsOut = true;
            break;
        case "KeyR":
            window.rotateHeadIn = true;
            break;
        case "KeyF":
            window.rotateHeadOut = true;
            break;
        case "Digit7":
            window.materials.forEach(value => { value.wireframe = !value.wireframe; });
            break;
    }
}

export function onKeyUp(e) {
    window.keys[e.code] = false;
    switch (e.code) {
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit7":
            // No action needed on key up, but included for completeness
            break;
        case "KeyQ":
            window.rotateFeetIn = false;
            break;
        case "KeyA":
            window.rotateFeetOut = false;
            break;
        case "KeyW":
            window.rotateLegIn = false;
            break;
        case "KeyS":
            window.rotateLegOut = false;
            break;
        case "KeyE":
            window.displaceArmsIn = false;
            break;
        case "KeyD":
            window.displaceArmsOut = false;
            break;
        case "KeyR":
            window.rotateHeadIn = false;
            break;
        case "KeyF":
            window.rotateHeadOut = false;
            break;
    }
}
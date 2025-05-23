/**
 * Handles keydown events for user input.
 * Sets flags or switches cameras/materials depending on the key pressed.
 * Movement keys are only registered if the trailer is not currently engaging.
 */
export function onKeyDown(e) {
    switch (e.code) {
        // Movement keys: only register if trailer is not engaging
        case "ArrowLeft":
        case "ArrowUp":
        case "ArrowRight":
        case "ArrowDown":
            if (!window.trailer.userData.isEngaging) window.pressedKeys[e.code] = true;
            break;
        // Camera selection (keys 1-4)
        case "Digit1":
            window.currentCamera = window.cameraList[0];
            break;
        case "Digit2":
            window.currentCamera = window.cameraList[1];
            break;
        case "Digit3":
            window.currentCamera = window.cameraList[2];
            break;
        case "Digit4":
            window.currentCamera = window.cameraList[3];
            break;
        // Robot transformation controls
        case "KeyQ":
            window.feetRotationIn = true;
            break;
        case "KeyA":
            window.feetRotationOut = true;
            break;
        case "KeyW":
            window.legRotationIn = true;
            break;
        case "KeyS":
            window.legRotationOut = true;
            break;
        case "KeyE":
            window.moveArmsIn = true;
            break;
        case "KeyD":
            window.moveArmsOut = true;
            break;
        case "KeyR":
            window.headRotationIn = true;
            break;
        case "KeyF":
            window.headRotationOut = true;
            break;
        // Toggle wireframe mode for all materials
        case "Digit7":
            window.materialsMap.forEach(value => { value.wireframe = !value.wireframe; });
            break;
    }
}

/**
 * Handles keyup events for user input.
 * Resets flags when the corresponding key is released.
 */
export function onKeyUp(e) {
    window.pressedKeys[e.code] = false;
    switch (e.code) {
        // Camera and wireframe keys do not require action on key up
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit7":
            break;
        // Reset transformation flags
        case "KeyQ":
            window.feetRotationIn = false;
            break;
        case "KeyA":
            window.feetRotationOut = false;
            break;
        case "KeyW":
            window.legRotationIn = false;
            break;
        case "KeyS":
            window.legRotationOut = false;
            break;
        case "KeyE":
            window.moveArmsIn = false;
            break;
        case "KeyD":
            window.moveArmsOut = false;
            break;
        case "KeyR":
            window.headRotationIn = false;
            break;
        case "KeyF":
            window.headRotationOut = false;
            break;
    }
}
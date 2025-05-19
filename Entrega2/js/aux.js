import * as THREE from "three";

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let scene, renderer;
let cameras = [], currentCamera;
let robot, trailer;
let head, feet, leg, lArm, rArm;
let rotateHeadIn = false, rotateHeadOut = false;
let rotateLegIn = false, rotateLegOut = false;
let rotateFeetIn = false, rotateFeetOut = false;
let displaceArmsIn = false, displaceArmsOut = false;
const keys = {};
const movementVector = new THREE.Vector2(0, 0);
const clock = new THREE.Clock();
let delta;
const materials = new Map();

// Collision detection variables
let minTruckAABB, maxTruckAABB, minTrailerAABB, maxTrailerAABB;

// Animation variables
const animationDuration = 2;
let animationElapsed = 0;
let isAnimating = false;
const targetTrailerPosition = new THREE.Vector3(-95, 30, 0);
let animationDisplacement;

/////////////////////
/* INITIALIZATION */
/////////////////////
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create cameras
    createCameras();
    currentCamera = cameras[0];

    // Create materials
    createMaterials();

    // Create objects
    createRobot(0, 15, 0);
    createTrailer(-150, 30, 0);

    // Set up event listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', onResize);

    // Start animation loop
    animate();
}

function createCameras() {
    // Orthographic cameras
    const aspect = window.innerWidth / window.innerHeight;
    const orthoSize = 100;

    // 1. Front view
    const frontCamera = new THREE.OrthographicCamera(
        -orthoSize * aspect, orthoSize * aspect,
        orthoSize, -orthoSize,
        1, 1000
    );
    frontCamera.position.set(100, 0, 0);
    frontCamera.lookAt(0, 0, 0);
    cameras.push(frontCamera);

    // 2. Side view
    const sideCamera = new THREE.OrthographicCamera(
        -orthoSize * aspect, orthoSize * aspect,
        orthoSize, -orthoSize,
        1, 1000
    );
    sideCamera.position.set(0, 0, 100);
    sideCamera.lookAt(0, 0, 0);
    cameras.push(sideCamera);

    // 3. Top view
    const topCamera = new THREE.OrthographicCamera(
        -orthoSize * aspect, orthoSize * aspect,
        orthoSize, -orthoSize,
        1, 1000
    );
    topCamera.position.set(0, 150, 0);
    topCamera.lookAt(0, 0, 0);
    cameras.push(topCamera);

    // 4. Perspective camera
    const perspectiveCamera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    perspectiveCamera.position.set(150, 100, 150);
    perspectiveCamera.lookAt(0, 0, 0);
    cameras.push(perspectiveCamera);
}

function createMaterials() {
    materials.set("trailer", new THREE.MeshBasicMaterial({ color: 0x808080 }));
    materials.set("wheel", new THREE.MeshBasicMaterial({ color: 0x000000 }));
    materials.set("torso", new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    materials.set("abdomen", new THREE.MeshBasicMaterial({ color: 0xa6a6a6 }));
    materials.set("waist", new THREE.MeshBasicMaterial({ color: 0xa6a6a6 }));
    materials.set("arm", new THREE.MeshBasicMaterial({ color: 0xff0000 }));
    materials.set("leg", new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    materials.set("thigh", new THREE.MeshBasicMaterial({ color: 0xa6a6a6 }));
    materials.set("head", new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    materials.set("antenna", new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    materials.set("eye", new THREE.MeshBasicMaterial({ color: 0xa6a6a6 }));
    materials.set("foot", new THREE.MeshBasicMaterial({ color: 0x0000ff }));
    materials.set("pipe", new THREE.MeshBasicMaterial({ color: 0x808080 }));
}

////////////////////////
/* OBJECT CREATION */
////////////////////////

function createRobot(x, y, z) {
    robot = new THREE.Group();
    robot.userData = { isTruck: false };
    robot.position.set(x, y, z);

    // Create parts hierarchy
    createWaist();
    createAbdomen();
    createTorso();
    createHead();
    createArms();
    createLegs();

    scene.add(robot);

    // Set initial AABB for truck mode collision
    minTruckAABB = new THREE.Vector3(-120 / 2 - 40, 0, -70 / 2);
    maxTruckAABB = new THREE.Vector3(120 / 2 - 40, 80, 70 / 2);
}

function createWaist() {
    const waist = new THREE.Group();
    
    // Waist main part
    const waistGeometry = new THREE.BoxGeometry(40, 20, 70);
    const waistMesh = new THREE.Mesh(waistGeometry, materials.get("waist"));
    waist.add(waistMesh);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(7.5, 7.5, 10, 16);
    wheelGeometry.rotateZ(Math.PI / 2);
    
    const wheelPositions = [
        { x: 0, y: -7.5, z: -40 },
        { x: 0, y: -7.5, z: 40 }
    ];
    
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, materials.get("wheel"));
        wheel.position.set(pos.x, pos.y, pos.z);
        waist.add(wheel);
    });
    
    robot.add(waist);
}

function createAbdomen() {
    const abdomenGeometry = new THREE.BoxGeometry(40, 20, 30);
    const abdomenMesh = new THREE.Mesh(abdomenGeometry, materials.get("abdomen"));
    abdomenMesh.position.set(0, 20, 0);
    robot.add(abdomenMesh);
}

function createTorso() {
    const torsoGeometry1 = new THREE.BoxGeometry(20, 40, 70);
    const torsoMesh1 = new THREE.Mesh(torsoGeometry1, materials.get("torso"));
    torsoMesh1.position.set(10, 50, 0);
    robot.add(torsoMesh1);
    
    const torsoGeometry2 = new THREE.BoxGeometry(20, 40, 30);
    const torsoMesh2 = new THREE.Mesh(torsoGeometry2, materials.get("torso"));
    torsoMesh2.position.set(-10, 50, 0);
    robot.add(torsoMesh2);
}

function createHead() {
    head = new THREE.Group();
    head.position.set(10, 60, 0);
    
    // Head main part
    const headGeometry = new THREE.BoxGeometry(20, 20, 30);
    const headMesh = new THREE.Mesh(headGeometry, materials.get("head"));
    headMesh.position.set(0, 20, 0);
    head.add(headMesh);
    
    // Eyes
    const eyeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const leftEye = new THREE.Mesh(eyeGeometry, materials.get("eye"));
    leftEye.position.set(11, 1, 5);
    headMesh.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, materials.get("eye"));
    rightEye.position.set(11, 1, -5);
    headMesh.add(rightEye);
    
    // Antennas
    const antennaGeometry = new THREE.ConeGeometry(2, 10, 8);
    const leftAntenna = new THREE.Mesh(antennaGeometry, materials.get("antenna"));
    leftAntenna.position.set(0, 15, 5);
    headMesh.add(leftAntenna);
    
    const rightAntenna = new THREE.Mesh(antennaGeometry, materials.get("antenna"));
    rightAntenna.position.set(0, 15, -5);
    headMesh.add(rightAntenna);
    
    robot.add(head);
}

function createArms() {
    // Left arm
    lArm = new THREE.Group();
    lArm.position.set(-10, 50, 45);
    
    const armGeometry = new THREE.BoxGeometry(20, 40, 20);
    const armMesh = new THREE.Mesh(armGeometry, materials.get("arm"));
    armMesh.position.set(0, 0, 0);
    lArm.add(armMesh);
    
    // Exhaust pipe
    const pipeGeometry = new THREE.CylinderGeometry(1, 1, 40, 8);
    const pipe = new THREE.Mesh(pipeGeometry, materials.get("pipe"));
    pipe.position.set(-10, 15, 9);
    armMesh.add(pipe);
    
    // Forearm
    const forearmGeometry = new THREE.BoxGeometry(40, 20, 20);
    const forearm = new THREE.Mesh(forearmGeometry, materials.get("arm"));
    forearm.position.set(10, -30, 0);
    armMesh.add(forearm);
    
    robot.add(lArm);
    
    // Right arm (mirror of left arm)
    rArm = new THREE.Group();
    rArm.position.set(-10, 50, -45);
    
    const armMesh2 = new THREE.Mesh(armGeometry, materials.get("arm"));
    armMesh2.position.set(0, 0, 0);
    rArm.add(armMesh2);
    
    const pipe2 = new THREE.Mesh(pipeGeometry, materials.get("pipe"));
    pipe2.position.set(-10, 15, -9);
    armMesh2.add(pipe2);
    
    const forearm2 = new THREE.Mesh(forearmGeometry, materials.get("arm"));
    forearm2.position.set(10, -30, 0);
    armMesh2.add(forearm2);
    
    robot.add(rArm);
}

function createLegs() {
    leg = new THREE.Group();
    leg.position.set(5, -5, 0);
    
    feet = new THREE.Group();
    feet.position.set(5, -95, 0);
    
    // Thigh
    const thighGeometry = new THREE.BoxGeometry(10, 30, 20);
    const thighMesh = new THREE.Mesh(thighGeometry, materials.get("thigh"));
    thighMesh.position.set(0, -10, 0);
    leg.add(thighMesh);
    
    // Leg
    const legGeometry = new THREE.BoxGeometry(10, 70, 30);
    const leftLeg = new THREE.Mesh(legGeometry, materials.get("leg"));
    leftLeg.position.set(0, -50, 15);
    robot.add(leftLeg);
    
    const rightLeg = new THREE.Mesh(legGeometry, materials.get("leg"));
    rightLeg.position.set(0, -50, -15);
    robot.add(rightLeg);
    
    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(7.5, 7.5, 10, 16);
    wheelGeometry.rotateZ(Math.PI / 2);
    
    const leftWheel1 = new THREE.Mesh(wheelGeometry, materials.get("wheel"));
    leftWheel1.position.set(2.5, -55, 25);
    robot.add(leftWheel1);
    
    const leftWheel2 = new THREE.Mesh(wheelGeometry, materials.get("wheel"));
    leftWheel2.position.set(2.5, -75, 25);
    robot.add(leftWheel2);
    
    const rightWheel1 = new THREE.Mesh(wheelGeometry, materials.get("wheel"));
    rightWheel1.position.set(2.5, -55, -25);
    robot.add(rightWheel1);
    
    const rightWheel2 = new THREE.Mesh(wheelGeometry, materials.get("wheel"));
    rightWheel2.position.set(2.5, -75, -25);
    robot.add(rightWheel2);
    
    // Foot
    const footGeometry = new THREE.BoxGeometry(20, 10, 30);
    const leftFoot = new THREE.Mesh(footGeometry, materials.get("foot"));
    leftFoot.position.set(5, -90, 20);
    robot.add(leftFoot);
    
    const rightFoot = new THREE.Mesh(footGeometry, materials.get("foot"));
    rightFoot.position.set(5, -90, -20);
    robot.add(rightFoot);
}

function createTrailer(x, y, z) {
    trailer = new THREE.Group();
    trailer.userData = { isEngaging: false, isEngaged: false };
    trailer.position.set(x, y, z);
    
    // Main container
    const containerGeometry = new THREE.BoxGeometry(150, 80, 70);
    const container = new THREE.Mesh(containerGeometry, materials.get("trailer"));
    container.position.set(0, 25, 0);
    trailer.add(container);
    
    // Connection part
    const connectorGeometry = new THREE.BoxGeometry(50, 10, 70);
    const connector = new THREE.Mesh(connectorGeometry, materials.get("trailer"));
    connector.position.set(-100, -25, 0);
    trailer.add(connector);

    // Wheels (3 per side)
    const wheelGeometry = new THREE.CylinderGeometry(12, 12, 15, 16);
    wheelGeometry.rotateZ(Math.PI / 2);

    const wheelPositions = [
        { x: 50, y: -25, z: 35 },
        { x: 0,  y: -25, z: 35 },
        { x: -50, y: -25, z: 35 },
        { x: 50, y: -25, z: -35 },
        { x: 0,  y: -25, z: -35 },
        { x: -50, y: -25, z: -35 }
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, materials.get("wheel"));
        wheel.position.set(pos.x, pos.y, pos.z);
        trailer.add(wheel);
    });

    scene.add(trailer);

    // Set initial AABB for trailer collision
    minTrailerAABB = new THREE.Vector3(-150 / 2, 0, -70 / 2);
    maxTrailerAABB = new THREE.Vector3(150 / 2, 80, 70 / 2);
}

// --- Add these stubs at the end of your file ---

function onKeyDown(event) {
    // Example: switch cameras with 1-4
    switch (event.key) {
        case "1":
        case "2":
        case "3":
        case "4":
            currentCamera = cameras[parseInt(event.key) - 1];
            break;
        // Add your transformation controls here
    }
}

function onKeyUp(event) {
    // Handle key up events if needed
}

function onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    renderer.setSize(window.innerWidth, window.innerHeight);
    cameras.forEach(cam => {
        if (cam.isPerspectiveCamera) {
            cam.aspect = aspect;
            cam.updateProjectionMatrix();
        } else if (cam.isOrthographicCamera) {
            const orthoSize = 100;
            cam.left = -orthoSize * aspect;
            cam.right = orthoSize * aspect;
            cam.top = orthoSize;
            cam.bottom = -orthoSize;
            cam.updateProjectionMatrix();
        }
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, currentCamera);
}

// Initialize everything
init();
import * as THREE from 'three';
import { createHouse } from './casa.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// Cameras and scene
var cameras = [], camera, scene, bufferSceneTerrain, bufferTextureTerrain, bufferSceneSky, bufferTextureSky, renderer;
let isFixedCamera = false;
let prevPosition = null;
let prevTarget = null;
var skydome, terrain;

// Fixed camera for VR
let fixedCamera;

// Materials
const materials = new Map();
let currentMaterialType = 'phong';

// Animation
const clock = new THREE.Clock();
var delta;
const keys = {};

// Lights
let globalLight;
let ambientLight;
let moon;
let lightOn = true;
let lightingEnabled = true;

// Tree parameters and materials
const treeParams = {
    lowTrunkBotR: 0.7,
    lowTrunkTopR: 0.6,
    lowTrunkH: 8,
    uppTrunkBotR: 0.6,
    uppTrunkTopR: 0.5,
    uppTrunkH: 4,
    trunkCrownR: 4,
    lowBranchBotR: 0.4,
    lowBranchTopR: 0.35,
    lowBranchH: 5,
    uppBranchBotR: 0.35,
    uppBranchTopR: 0.3,
    uppBranchH: 3,
    branchCrownR: 3
};
const treeMaterials = {
    darkorange: new THREE.MeshPhongMaterial({ color: 0xcc7722 }),
    bistre: new THREE.MeshPhongMaterial({ color: 0x3d2b1f }),
    darkgreen: new THREE.MeshPhongMaterial({ color: 0x234d20 })
};

// UFO variables
var ufo, ufoPointLights = [], ufoSpotLight;
var ufoSpeed = 10;
var ufoRotationSpeed = 1;
var pointLightsOn = false;
var spotLightOn = false;

// UFO movement state (booleans for each arrow key)
let ufoMove = {
    left: false,
    right: false,
    up: false,
    down: false
};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

/**
 * Creates the main scene, background, skydome, terrain, house, and adds them to the scene.
 */
function createScene(){
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#262626');
    
    createSkydome(0, -5, 0);
    createTerrain(0, -6.7, 0);

    // Add house to the field
    const house = createHouse();
    house.scale.set(2, 2, 2); // 2x bigger in all axes
    house.position.set(30, 0, 30);
    scene.add(house);
}

/**
 * Creates the skydome (inverted sphere) and adds it to the scene.
 */
function createSkydome(x, y, z) {
    'use strict';
    skydome = new THREE.Object3D();
    const geometry = new THREE.SphereGeometry(100, 32, 16);
    const mesh = new THREE.Mesh(geometry, materials.get("skydome"));
    mesh.scale.set(1, 1, -1); // Invert the sphere to see inside
    skydome.add(mesh);
    skydome.position.set(x, y, z);
    scene.add(skydome);
}

/**
 * Creates the terrain (plane) and adds it to the scene.
 */
function createTerrain(x, y, z) {
    'use strict';
    terrain = new THREE.Object3D();
    const geometry = new THREE.PlaneGeometry(200, 200, 100, 100);
    const mesh = new THREE.Mesh(geometry, materials.get("terrain"));
    terrain.add(mesh);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(x, y, z);
    scene.add(terrain);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

/**
 * Creates two cameras: one orthographic for texture generation, one perspective for the main scene.
 * Also creates a fixed camera for VR mode.
 */
function createCameras() {
    'use strict';
    const positions = [
        [0, 0, -50],  // Orthographic camera for texture generation
        [70, 35, 50]   // Perspective camera for main scene (fixed aerial view)
    ];

    for (let i = 0; i < 2; i++) {
        if (i == 1) {
            camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
        } else {
            camera = new THREE.OrthographicCamera(
                window.innerWidth / -50,
                window.innerWidth / 50,
                window.innerHeight / 50,
                window.innerHeight / -50,
                1,
                1000
            );
        }

        camera.position.set(positions[i][0], positions[i][1], positions[i][2]);
        camera.lookAt(0, 0, 0);
        cameras.push(camera);
    }
    camera = cameras[1];

    // Fixed camera for perspective view
    fixedCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    fixedCamera.position.set(120, 80, 120);
    fixedCamera.lookAt(0, 0, 0);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

/**
 * Initializes and stores all materials needed for the scene.
 * Loads textures and generates procedural textures for terrain and skydome.
 */
function createMaterials() {
    'use strict';
    // Load heightmap texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load('textures/heightmap.png');
    
    // Generate procedural textures
    const floralTexture = createFlowerTexture();
    const skyTexture = createStarsTexture();

    materials.set("skydome", new THREE.MeshBasicMaterial({ 
        side: THREE.DoubleSide, 
        map: skyTexture 
    }));
    materials.set("terrain", new THREE.MeshPhongMaterial({ 
        side: THREE.DoubleSide, 
        bumpMap: texture, 
        bumpScale: 5, 
        displacementMap: texture, 
        displacementScale: 20,
        map: floralTexture
    }));
}

/**
 * Generates a procedural flower texture for the terrain.
 */
function createFlowerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Green background
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random flowers
    for (let i = 0; i < 400; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const cores = ["#fff", "#ff0", "#c8a2c8", "#add8e6"];
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 6 + 3, 0, 2 * Math.PI);
        ctx.fillStyle = cores[Math.floor(Math.random() * cores.length)];
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
}

/**
 * Generates a procedural star texture for the skydome.
 */
function createStarsTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    // Linear gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#0a0a40'); // dark-blue
    grad.addColorStop(1, '#3d0a40'); // dark-purple
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Stars
    for (let i = 0; i < 800; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const r = Math.random() * 1.5 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    return texture;
}

/**
 * Creates the moon as a bright emissive sphere and adds it to the scene.
 */
function createMoon(x, y, z) {
    const geometry = new THREE.SphereGeometry(4, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffcc,
        emissive: 0xffffee,
        emissiveIntensity: 1.2,
        shininess: 100
    });
    const moon = new THREE.Mesh(geometry, material);
    moon.position.set(x, y, z);
    scene.add(moon);
    return moon;
}

/**
 * Creates a cork tree at the given position and scale, with trunk, branches, and foliage.
 */
function createCorkTree(x, y, z, s) {
    'use strict';
    const d = treeParams;
    const m = treeMaterials;
    const rAxes = {
        x: new THREE.Vector3(1, 0, 0),
        y: new THREE.Vector3(0, 1, 0),
        z: new THREE.Vector3(0, 0, 1)
    };

    // Define three types of materials for each part
    const matDarkorange = {
        lambert: new THREE.MeshLambertMaterial({ color: 0xcc7722 }),
        phong:   new THREE.MeshPhongMaterial({ color: 0xcc7722, specular: 0x999999, shininess: 30 }),
        toon:    new THREE.MeshToonMaterial({ color: 0xcc7722 })
    };
    const matBistre = {
        lambert: new THREE.MeshLambertMaterial({ color: 0x3d2b1f }),
        phong:   new THREE.MeshPhongMaterial({ color: 0x3d2b1f, specular: 0x999999, shininess: 30 }),
        toon:    new THREE.MeshToonMaterial({ color: 0x3d2b1f })
    };
    const matDarkgreen = {
        lambert: new THREE.MeshLambertMaterial({ color: 0x234d20 }),
        phong:   new THREE.MeshPhongMaterial({ color: 0x234d20, specular: 0x999999, shininess: 30 }),
        toon:    new THREE.MeshToonMaterial({ color: 0x234d20 })
    };

    // Trunk 3D (parent: scene; children: lower trunk, upper trunk, trunk crown 3D, branch 3D)
    const trunk3D = new THREE.Object3D();
    trunk3D.position.set(x, y, z);
    scene.add(trunk3D);

    // Lower trunk
    const lowTrunkGeo = new THREE.CylinderGeometry(
        s*d.lowTrunkTopR, 
        s*d.lowTrunkBotR, 
        s*d.lowTrunkH, 
        16
    );
    const lowTrunk = new THREE.Mesh(lowTrunkGeo, matDarkorange.lambert);
    lowTrunk.userData.materials = matDarkorange;
    lowTrunk.position.y = s*d.lowTrunkH/2;
    trunk3D.add(lowTrunk);

    // Upper trunk
    const uppTrunkGeo = new THREE.CylinderGeometry(
        s*d.uppTrunkTopR, 
        s*d.uppTrunkBotR, 
        s*d.uppTrunkH, 
        12
    );
    const uppTrunk = new THREE.Mesh(uppTrunkGeo, matBistre.lambert);
    uppTrunk.userData.materials = matBistre;
    uppTrunk.position.y = s*(d.lowTrunkH + d.uppTrunkH/2);
    trunk3D.add(uppTrunk);

    // Trunk Crown 3D (parent: trunk 3D; children: trunk crown)
    const trunkCrown3D = new THREE.Object3D();
    trunkCrown3D.position.set(0, s*(d.lowTrunkH + d.uppTrunkH), 0);
    trunk3D.add(trunkCrown3D);

    // Trunk crown (ellipsoid)
    const trunkCrownGeo = new THREE.SphereGeometry(s*d.trunkCrownR, 16, 16);
    trunkCrownGeo.scale(1, 0.5, 1); // Make it ellipsoid
    const trunkCrown = new THREE.Mesh(trunkCrownGeo, matDarkgreen.lambert);
    trunkCrown.userData.materials = matDarkgreen;
    trunkCrown.position.y = s*d.trunkCrownR/4;
    trunkCrown3D.add(trunkCrown);

    // Branch 3D (parent: trunk 3D, children: lower branch, upper branch, branch crown 3D)
    const branch3D = new THREE.Object3D();
    branch3D.position.set(0, 3*s*d.lowTrunkH/4, 0);
    trunk3D.add(branch3D);

    // Lower branch
    const lowBranchGeo = new THREE.CylinderGeometry(
        s*d.lowBranchTopR, 
        s*d.lowBranchBotR, 
        s*d.lowBranchH, 
        12
    );
    const lowBranch = new THREE.Mesh(lowBranchGeo, matDarkorange.lambert);
    lowBranch.userData.materials = matDarkorange;
    lowBranch.position.y = s*d.lowBranchH/2;
    branch3D.add(lowBranch);

    // Upper branch
    const uppBranchGeo = new THREE.CylinderGeometry(
        s*d.uppBranchTopR, 
        s*d.uppBranchBotR, 
        s*d.uppBranchH, 
        8
    );
    const uppBranch = new THREE.Mesh(uppBranchGeo, matBistre.lambert);
    uppBranch.userData.materials = matBistre;
    uppBranch.position.y = s*(d.lowBranchH + d.uppBranchH/2);
    branch3D.add(uppBranch);

    // Branch Crown 3D (parent: branch 3D; children: branch crown)
    const branchCrown3D = new THREE.Object3D();
    branchCrown3D.position.set(0, s*(d.lowBranchH + d.uppBranchH), 0);
    branch3D.add(branchCrown3D);

    // Branch crown (ellipsoid)
    const branchCrownGeo = new THREE.SphereGeometry(s*d.branchCrownR, 12, 12);
    branchCrownGeo.scale(1, 0.5, 1); // Make it ellipsoid
    const branchCrown = new THREE.Mesh(branchCrownGeo, matDarkgreen.lambert);
    branchCrown.userData.materials = matDarkgreen;
    branchCrown.position.y = s*d.branchCrownR/4;
    branchCrown3D.add(branchCrown);

    // Random rotations for natural look
    trunk3D.rotateOnWorldAxis(rAxes.y, getRandomAngle(0, 2*Math.PI));
    trunk3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/16, Math.PI/16));
    trunk3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(-Math.PI/8, 0));
    branch3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/8, Math.PI/8));
    branch3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(Math.PI/6, Math.PI/3));
    trunkCrown3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/16, Math.PI/16));
    trunkCrown3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(-Math.PI/16, Math.PI/16));
    branchCrown3D.rotateOnWorldAxis(rAxes.x, getRandomAngle(-Math.PI/16, Math.PI/16));
    branchCrown3D.rotateOnWorldAxis(rAxes.z, getRandomAngle(-Math.PI/16, Math.PI/16));

    function getRandomAngle(min, max) {
        return Math.random() * (max - min) + min;
    }
}

/**
 * Scatters cork trees at predefined positions, avoiding the house area.
 * Computes terrain height for each tree.
 */
function scatterCorkTrees() {
    const terrainMesh = terrain.children[0];

    // Manually chosen positions (outside the house radius and within the terrain)
    const positions = [
        [-30, -30],
        [30, -40],
        [-40, 50],
        [50, 60],
        [0, -10],
        [-40, 20]
    ];

    const houseX = 30;
    const houseZ = 30;
    const houseRadius = 18;

    positions.forEach(([x, z]) => {
        // Assures the tree is outside the house radius
        const dx = x - houseX;
        const dz = z - houseZ;
        if (Math.sqrt(dx * dx + dz * dz) < houseRadius) return;

        // Computes the correct terrain height for each tree
        const y = getTerrainHeight(x, z, terrainMesh);
        const scale = 1.2 + Math.random() * 0.5;
        createCorkTree(x, y, z, scale);
    });
}

/**
 * Gets the terrain height at a specific (x, z) position by sampling the geometry.
 */
function getTerrainHeight(x, z, terrainMesh) {
    const geometry = terrainMesh.geometry;
    const positions = geometry.attributes.position;
    const width = 200;
    const height = 200;
    const segments = 100;

    // Map (x, z) to geometry grid indices
    const gridX = Math.round(((x + width / 2) / width) * segments);
    const gridZ = Math.round(((z + height / 2) / height) * segments);

    const ix = Math.max(0, Math.min(segments, gridX));
    const iz = Math.max(0, Math.min(segments, gridZ));

    const index = iz * (segments + 1) + ix;
    const y = positions.getZ(index);

    return y + terrainMesh.parent.position.y;
}

/**
 * Creates the UFO object, with body, cockpit, lights, and spotlight.
 * Adds it to the scene and sets up all materials for shading switching.
 */
function createUFO(x, y, z) {
    'use strict';
    ufo = new THREE.Object3D();
    ufo.position.set(x, y, z);

    // Main body (flattened sphere)
    const bodyGeometry = new THREE.SphereGeometry(3, 32, 32);
    bodyGeometry.scale(1, 0.3, 1); // Flatten the sphere
    const lambert = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const phong = new THREE.MeshPhongMaterial({ color: 0x444444, specular: 0x999999, shininess: 30 });
    const toon = new THREE.MeshToonMaterial({ color: 0x444444 });

    const body = new THREE.Mesh(bodyGeometry, lambert);
    body.userData.materials = { lambert, phong, toon };
    ufo.add(body);

    // Cockpit (spherical cap)
    const cockpitGeometry = new THREE.SphereGeometry(1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x33aaff, 
        transparent: true, 
        opacity: 0.7,
        specular: 0xffffff,
        shininess: 100
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.y = 0.6;
    ufo.add(cockpit);

    // Bottom lights arrangement
    const bottomGroup = new THREE.Object3D();
    const radius = 2.5;
    const lightCount = 16;

    // Slightly above the bottom of the UFO
    bottomGroup.position.y = 0.15;

    // Small spheres and point lights
    for (let i = 0; i < lightCount; i++) {
        const angle = (i / lightCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        // Small sphere
        const lightSphereGeo = new THREE.SphereGeometry(0.3, 16, 16);
        const lightSphereMat = new THREE.MeshPhongMaterial({ 
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        const lightSphere = new THREE.Mesh(lightSphereGeo, lightSphereMat);
        lightSphere.position.set(x, -0.6, z);
        bottomGroup.add(lightSphere);

        // Point light
        const pointLight = new THREE.PointLight(0xffff00, 1.5, 500);
        pointLight.position.set(x, -1.1, z);
        pointLight.castShadow = true;
        bottomGroup.add(pointLight);
        ufoPointLights.push(pointLight);
    }

    // Central cylinder
    const cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
    cylinderGeo.scale(1, 4, 1); // Flatten it
    const cylinderMat = new THREE.MeshPhongMaterial({ 
        color: 0xffff00,
        emissive: 0xffff00,
        emissiveIntensity: 0.7
    });
    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);
    cylinder.position.y = -0.8;
    bottomGroup.add(cylinder);

    // Spotlight
    ufoSpotLight = new THREE.SpotLight(0xffffff, 2, 30, Math.PI/4, 0.5);
    ufoSpotLight.position.set(0, -1.1, 0);
    ufoSpotLight.target.position.set(0, -10, 0);
    ufoSpotLight.castShadow = true;
    bottomGroup.add(ufoSpotLight);
    bottomGroup.add(ufoSpotLight.target);

    ufo.add(bottomGroup);
    ufo.scale.set(3, 3, 3); // UFO 3x bigger in all axes

    // Initialize light states
    ufoPointLights.forEach(light => {
        light.visible = pointLightsOn;
    });
    ufoSpotLight.visible = spotLightOn;

    scene.add(ufo);
}

////////////
/* UPDATE */
////////////

/**
 * Updates the UFO's rotation and position based on movement flags.
 * Keeps the UFO within scene bounds.
 */
function update(delta) {
    'use strict';
    // Update UFO rotation
    if (ufo) {
        ufo.rotation.y += ufoRotationSpeed * delta;

        // UFO movement using booleans for smooth movement
        const moveSpeed = ufoSpeed * delta;
        if (ufoMove.left) {
            ufo.position.x -= moveSpeed;
        }
        if (ufoMove.right) {
            ufo.position.x += moveSpeed;
        }
        if (ufoMove.up) {
            ufo.position.z -= moveSpeed;
        }
        if (ufoMove.down) {
            ufo.position.z += moveSpeed;
        }

        // Keep UFO within bounds
        ufo.position.x = Math.max(-80, Math.min(80, ufo.position.x));
        ufo.position.z = Math.max(-80, Math.min(80, ufo.position.z));
    }
}

/////////////
/* DISPLAY */
/////////////

/**
 * Renders the current scene from the active camera.
 */
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////

/**
 * Initializes the renderer, cameras, materials, scene, moon, lights, trees, UFO, and event listeners.
 * Also enables VR mode.
 */
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createCameras();      // 1º - create cameras
    createMaterials();    // 2º - create textures and materials
    createScene();        // 3º - create the scene

    moon = createMoon(40, 40, -30); // Higher position for better visibility

    // Directional light
    globalLight = new THREE.DirectionalLight(0xffffff, 1.1);
    globalLight.position.set(40, 40, -30);
    globalLight.target.position.set(0, 0, 0);
    scene.add(globalLight);
    scene.add(globalLight.target);
    
    // Ambient light
    ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    // Add cork trees to the scene
    scatterCorkTrees();

    // Create UFO
    createUFO(0, 35, 0);

    // Enable VR
    renderer.xr.enabled = true;
    document.body.appendChild(VRButton.createButton(renderer));

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

/**
 * Main animation loop: updates state and renders the scene.
 */
function animate() {
    'use strict';
    if (!renderer.xr.isPresenting) {
        renderer.setAnimationLoop(function () { renderer.render( scene, camera ); }); // Stop VR rendering loop
    }
    delta = clock.getDelta();
    update(delta);
    render();
    requestAnimationFrame(animate);
}

/**
 * Switches the material type (lambert, phong, toon) for all objects with userData.materials.
 */
function setMaterialType(type) {
    scene.traverse(obj => {
        if (obj.isMesh && obj.userData.materials) {
            obj.material = obj.userData.materials[type];
        }
    });
}

/**
 * Enables or disables lighting calculation by switching to MeshBasicMaterial or restoring the selected material.
 */
function dsetLightingEnabled(enabled) {
    scene.traverse(obj => {
        if (obj.isMesh && obj.userData.materials) {
            if (enabled) {
                obj.material = obj.userData.materials[currentMaterialType];
            } else {
                obj.material = new THREE.MeshBasicMaterial({ color: obj.material.color });
            }
        }
    });
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////

/**
 * Handles window resize events to keep the renderer and camera aspect ratio correct.
 */
function onResize() { 
    'use strict';
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////

/**
 * Handles all keyboard input for movement, material switching, light toggling, and camera switching.
 */
function onKeyDown(e) {
    'use strict';
    keys[e.keyCode] = true;

    switch (e.keyCode) {
        case 37: // Left arrow
            ufoMove.left = true;
            break;
        case 39: // Right arrow
            ufoMove.right = true;
            break;
        case 38: // Up arrow
            ufoMove.up = true;
            break;
        case 40: // Down arrow
            ufoMove.down = true;
            break;
        case 49: // 1 - Floral texture on terrain
            materials.get("terrain").map = createFlowerTexture();
            materials.get("terrain").needsUpdate = true;
            break;
        case 50: // 2 - Stars texture on skydome
            materials.get("skydome").map = createStarsTexture();
            materials.get("skydome").needsUpdate = true;
            break;
        case 68: // D
        case 100: // d
            lightOn = !lightOn;
            if (globalLight) globalLight.visible = lightOn;
            if (moon) {
                moon.material.emissiveIntensity = lightOn ? 1.2 : 0.2;
            }
            break;
        case 80: // P
        case 112: // p - Toggle point lights
            pointLightsOn = !pointLightsOn;
            ufoPointLights.forEach(light => {
                light.visible = pointLightsOn;
                light.intensity = pointLightsOn ? 10 : 0;
            });
            break;
        case 83: // S
        case 115: // s - Toggle spotlight
            spotLightOn = !spotLightOn;
            if (ufoSpotLight) {
                ufoSpotLight.visible = spotLightOn;
                ufoSpotLight.intensity = spotLightOn ? 10000 : 0;
                ufoSpotLight.distance = 40;
            }
            break;
        case 81: // Q/q - Gouraud (Lambert)
        case 113:
            currentMaterialType = 'lambert';
            if (lightingEnabled) setMaterialType('lambert');
            break;
        case 87: // W/w - Phong
        case 119:
            currentMaterialType = 'phong';
            if (lightingEnabled) setMaterialType('phong');
            break;
        case 69: // E/e - Toon
        case 101:
            currentMaterialType = 'toon';
            if (lightingEnabled) setMaterialType('toon');
            break;
        case 82: // R/r - Toggle lighting
        case 114:
            lightingEnabled = !lightingEnabled;
            dsetLightingEnabled(lightingEnabled);
            break;
        case 55: // '7'
            // Switch to fixed camera and adjust transparency of skydome and UFO cockpit
            if (!isFixedCamera) {
                prevPosition = camera.position.clone();
                prevTarget = new THREE.Vector3(0, 0, 0);
                camera.position.set(100, 60, 100);
                camera.lookAt(0, 0, 0);
                camera.updateProjectionMatrix();
                isFixedCamera = true;

                // Skydome transparente
                const skydomeMat = materials.get("skydome");
                skydomeMat.transparent = true;
                skydomeMat.opacity = 0.3;
                skydomeMat.needsUpdate = true;

                // Torna a cúpula do OVNI opaca
                if (ufo && ufo.children[1] && ufo.children[1].material) {
                    ufo.children[1].material.opacity = 1.0;
                    ufo.children[1].material.transparent = false;
                    ufo.children[1].material.needsUpdate = true;
                }
            } else {
                if (prevPosition) camera.position.copy(prevPosition);
                if (prevTarget) camera.lookAt(prevTarget);
                camera.updateProjectionMatrix();
                isFixedCamera = false;

                // Skydome opaco
                const skydomeMat = materials.get("skydome");
                skydomeMat.opacity = 1.0;
                skydomeMat.transparent = false;
                skydomeMat.needsUpdate = true;

                // Repõe a opacidade original da cúpula do OVNI
                if (ufo && ufo.children[1] && ufo.children[1].material) {
                    ufo.children[1].material.opacity = 0.7;
                    ufo.children[1].material.transparent = true;
                    ufo.children[1].material.needsUpdate = true;
                }
            }
            break;
    }
}

/**
 * Handles key up events for movement.
 */
function onKeyUp(e) {
    'use strict';
    keys[e.keyCode] = false;

    switch (e.keyCode) {
        case 37: // Left arrow
            ufoMove.left = false;
            break;
        case 39: // Right arrow
            ufoMove.right = false;
            break;
        case 38: // Up arrow
            ufoMove.up = false;
            break;
        case 40: // Down arrow
            ufoMove.down = false;
            break;
    }
}

// Start the application
init();
animate();
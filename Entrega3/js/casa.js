import * as THREE from 'three';
import { L_Base, H_Base, W_Base, H_Top, W_Porch, H_Roof, R_Porch_Column, W_Window, W_Window_Frame, H_Floor, W_Chimney, L_Chimney, H_Chimney, H_TopChimney } from './const.js';

// Materials definitions
const baseMaterials = {
    lambert: new THREE.MeshLambertMaterial({ color: 0xe0dacd, side: THREE.FrontSide }),
    phong:   new THREE.MeshPhongMaterial({ color: 0xe0dacd, side: THREE.FrontSide, specular: 0x999999, shininess: 30 }),
    toon:    new THREE.MeshToonMaterial({ color: 0xe0dacd, side: THREE.FrontSide })
};
const roofMaterials = {
    lambert: new THREE.MeshLambertMaterial({ color: 0xE25822, side: THREE.FrontSide }),
    phong:   new THREE.MeshPhongMaterial({ color: 0xE25822, side: THREE.FrontSide, specular: 0x999999, shininess: 30 }),
    toon:    new THREE.MeshToonMaterial({ color: 0xE25822, side: THREE.FrontSide })
};
const porchMaterials = {
    lambert: new THREE.MeshLambertMaterial({ color: 0x8b4513, side: THREE.FrontSide }),
    phong:   new THREE.MeshPhongMaterial({ color: 0x8b4513, side: THREE.FrontSide, specular: 0x999999, shininess: 30 }),
    toon:    new THREE.MeshToonMaterial({ color: 0x8b4513, side: THREE.FrontSide })
};
const windowframeMaterials = {
    lambert: new THREE.MeshLambertMaterial({ color: 0x4682B4, side: THREE.FrontSide }),
    phong:   new THREE.MeshPhongMaterial({ color: 0x4682B4, side: THREE.FrontSide, specular: 0x999999, shininess: 30 }),
    toon:    new THREE.MeshToonMaterial({ color: 0x4682B4, side: THREE.FrontSide })
};

export function createHouse() {
    const group = new THREE.Group();

    const geom1 = new THREE.BufferGeometry().setFromPoints(listaV);
    geom1.setIndex([
    //Front of the house
    2, 6, 7, 
    2, 7, 8, 
    2, 8, 4, 
    8, 9, 4, 
    9, 5, 4,
    10, 5, 9,
    6, 22, 5,
    // Side of the house
    4, 5, 36,
    36, 5, 35,
    35, 5, 38, 
    38, 5, 43,
    43, 5, 46,
    46, 5, 51,
    51, 5, 34,
    34, 62, 54,
    34, 59, 54,
    34, 54, 51,
    4, 36, 37,
    4, 37, 44,
    4, 44, 45,
    4, 45, 52,
    4, 52, 33,
    33, 52, 53,
    33, 53, 60,
    33, 60, 61,
    33, 61, 34,
    34, 61, 62,
    37, 38, 43,
    44, 37, 43,
    45, 46, 51,
    52, 45, 51,
    53, 54, 59,
    60, 53, 59
    ]);
    geom1.computeVertexNormals();
    // Paredes/base
    const meshBase = new THREE.Mesh(geom1, baseMaterials.lambert);
    meshBase.userData.materials = baseMaterials;
    group.add(meshBase);


    const geom2 = new THREE.BufferGeometry().setFromPoints(listaV);
    geom2.setIndex([
    //front window
    8, 7, 11,
    11, 13, 8,
    9, 8, 13,
    13, 14, 9,
    10, 9, 14,
    14, 12, 10,
    12, 11, 7,
    7, 10, 12,
    //side window 1
    36, 35, 39,
    36, 39, 40,
    39, 35, 38,
    39, 38, 42,
    42, 38, 37,
    37, 41, 42,
    36, 40, 41,
    37, 36, 41,
    //side window 2
    44, 43, 47,
    44, 47, 48,
    47, 43, 46,
    47, 46, 50,
    50, 46, 45,
    45, 49, 50,
    44, 48, 49,
    45, 44, 49,
    //side window 3
    52, 51, 55,
    52, 55, 56,
    55, 51, 54,
    55, 54, 58,
    58, 54, 53,
    53, 57, 58,
    52, 56, 57,
    53, 52, 57,
    //side window 4
    60, 59, 63,
    60, 63, 64,
    63, 59, 62,
    63, 62, 66,
    66, 62, 61,
    61, 65, 66,
    60, 64, 65,
    61, 60, 65


    ]);
    geom2.computeVertexNormals();
    // Caixilhos das janelas
    const meshWindowFrame = new THREE.Mesh(geom2, windowframeMaterials.lambert);
    meshWindowFrame.userData.materials = windowframeMaterials;
    group.add(meshWindowFrame);

    const geom3 = new THREE.BufferGeometry().setFromPoints(listaV);
    geom3.setIndex([
    // Roof front of the house
    6, 24, 23,
    6, 23, 22,
    22, 23, 5,
    23, 21, 5,
    // Roof top
    24, 25, 26,
    23, 24, 26,
    21, 23, 26,
    21, 26, 27,
    24, 18, 25,
    18, 28, 25,
    // Roof side of the house
    5, 21, 34,
    21, 27, 34,
    18, 24, 6,
    17, 18, 6,
    ]);
    geom3.computeVertexNormals();
    // Telhado
    const meshRoof = new THREE.Mesh(geom3, roofMaterials.lambert);
    meshRoof.userData.materials = roofMaterials;
    group.add(meshRoof);


    const geom4 = new THREE.BufferGeometry().setFromPoints(listaV);
    geom4.setIndex([19, 17, 20,
    19, 16, 17,
    20, 68, 69,
    69, 19, 20
    
    ]);
    geom4.computeVertexNormals();
    // Varanda (geom4, geom5, geom6)
    const meshPorch1 = new THREE.Mesh(geom4, porchMaterials.lambert);
    meshPorch1.userData.materials = porchMaterials;
    group.add(meshPorch1);

    const geom5 = new THREE.BufferGeometry().setFromPoints(listaV);
    geom5.setIndex([1, 2, 4,
    4, 3, 1,
    2, 1, 16,
    15, 16, 1,
    3, 4, 33,
    3, 33, 67
    ]);
    geom5.computeVertexNormals();
    const meshPorch2 = new THREE.Mesh(geom5, porchMaterials.lambert);
    meshPorch2.userData.materials = porchMaterials;
    group.add(meshPorch2);

    const geom6 = new THREE.BufferGeometry().setFromPoints(listaV);
    geom6.setIndex([11, 12, 14,
    14, 13, 11
    ]);
    geom6.computeVertexNormals();
    const meshPorch3 = new THREE.Mesh(geom6, porchMaterials.lambert);
    meshPorch3.userData.materials = porchMaterials;
    group.add(meshPorch3);


    return group;
}

//Front of the house
const v0 = new THREE.Vector3(0, 0, 0); // This is a placeholder, you can remove it later
const v1 = new THREE.Vector3(0, 0, 0);   
const v2 = new THREE.Vector3(0, H_Floor, 0);
const v3 = new THREE.Vector3(0, 0, W_Base);
const v4 = new THREE.Vector3(0, H_Floor, W_Base);
const v5 = new THREE.Vector3(0, H_Base, W_Base);
const v6 = new THREE.Vector3(0, H_Base, 0);

// Front window
const v7 = new THREE.Vector3(0, H_Base, (W_Base * 3)/4);
const v8 = new THREE.Vector3(0, H_Base - W_Window_Frame * 2 - W_Window, (W_Base * 3)/4);
const v9 = new THREE.Vector3(0, H_Base - W_Window_Frame * 2 - W_Window, (W_Base * 3)/4 + W_Window_Frame* 2 + W_Window);
const v10 = new THREE.Vector3(0, H_Base, (W_Base * 3)/4 + W_Window_Frame* 2 + W_Window);
const v11 = new THREE.Vector3(0, H_Base - W_Window_Frame, (W_Base * 3)/4 + W_Window_Frame);
const v12 = new THREE.Vector3(0, H_Base - W_Window_Frame, (W_Base * 3)/4 + W_Window_Frame + W_Window);
const v13 = new THREE.Vector3(0, H_Base - W_Window_Frame - W_Window, (W_Base * 3)/4 + W_Window_Frame);
const v14 = new THREE.Vector3(0, H_Base - W_Window_Frame - W_Window, (W_Base * 3)/4 + W_Window_Frame + W_Window);

// Roof
const v15 = new THREE.Vector3(0, 0,- W_Porch);
const v16 = new THREE.Vector3(0, H_Floor, - W_Porch);
const v17 = new THREE.Vector3(0, H_Base, - W_Porch);
const v18 = new THREE.Vector3(0, H_Base + H_Roof, - W_Porch);
const v19 = new THREE.Vector3(0, H_Floor,  - W_Porch + R_Porch_Column);
const v20 = new THREE.Vector3(0, H_Base,  - W_Porch + R_Porch_Column);
const v21 = new THREE.Vector3(0, H_Base + H_Roof, W_Base);
const v22 = new THREE.Vector3(0, H_Base + H_Top, W_Base/2);
const v23 = new THREE.Vector3(0, H_Base + H_Top + H_Roof, W_Base/2);
const v24 = new THREE.Vector3(0, H_Base + H_Roof, 0);
const v25 = new THREE.Vector3(- L_Base, H_Base + H_Roof, 0);
const v26 = new THREE.Vector3(- L_Base, H_Base + H_Top + H_Roof, W_Base/2);
const v27 = new THREE.Vector3(-L_Base, H_Base + H_Roof, W_Base);
const v28 = new THREE.Vector3(-L_Base, H_Base + H_Roof, - W_Porch);

// Chimney
const v29 = new THREE.Vector3(-(L_Base * 2)/ 3, H_Base + (H_Top * 2) / ((W_Base* W_Base)/4));
const v30 = new THREE.Vector3(-(L_Base * 2)/ 3 + L_Chimney, H_Base + (H_Top * 2) / ((W_Base* W_Base)/4), W_Base/4);
const v31 = new THREE.Vector3(-(L_Base * 2)/ 3, H_Base + (H_Top * ((W_Base/4) + W_Chimney))/ (W_Base)/2, W_Base/4);
const v32 = new THREE.Vector3(-(L_Base * 2)/ 3 + L_Chimney, H_Base + (H_Top * ((W_Base/4) + W_Chimney))/ (W_Base)/2, W_Base/4);


//Side of the house
const v33 = new THREE.Vector3(- L_Base, H_Floor, W_Base);
const v34 = new THREE.Vector3(- L_Base, H_Base, W_Base);
const v67 = new THREE.Vector3(- L_Base, 0, W_Base);

//Side windows
const v35 = new THREE.Vector3(- L_Base/ 7, H_Base - W_Window_Frame, W_Base);
const v36 = new THREE.Vector3(- L_Base/ 7, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v37 = new THREE.Vector3(- L_Base/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v38 = new THREE.Vector3(- L_Base/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame, W_Base);
const v39 = new THREE.Vector3(- L_Base/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2, W_Base);
const v40 = new THREE.Vector3(- L_Base/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2 - W_Window, W_Base);
const v41 = new THREE.Vector3(- L_Base/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame *2 - W_Window, W_Base);
const v42 = new THREE.Vector3(- L_Base/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame * 2 , W_Base);

const v43 = new THREE.Vector3(- (L_Base * 2)/ 7, H_Base - W_Window_Frame, W_Base);
const v44 = new THREE.Vector3(- (L_Base * 2)/ 7, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v45 = new THREE.Vector3(- (L_Base * 2)/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v46 = new THREE.Vector3(- (L_Base * 2)/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame, W_Base);
const v47 = new THREE.Vector3(- (L_Base * 2)/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2, W_Base);
const v48 = new THREE.Vector3(- (L_Base * 2)/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2 - W_Window, W_Base);
const v49 = new THREE.Vector3(- (L_Base * 2)/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame *2 - W_Window, W_Base);
const v50 = new THREE.Vector3(- (L_Base * 2)/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame * 2 , W_Base);

const v51 = new THREE.Vector3(- (L_Base * 4)/ 7, H_Base - W_Window_Frame, W_Base);
const v52 = new THREE.Vector3(- (L_Base * 4)/ 7, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v53 = new THREE.Vector3(- (L_Base * 4)/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v54 = new THREE.Vector3(- (L_Base * 4)/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame, W_Base);
const v55 = new THREE.Vector3(- (L_Base * 4)/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2, W_Base);
const v56 = new THREE.Vector3(- (L_Base * 4)/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2 - W_Window, W_Base);
const v57 = new THREE.Vector3(- (L_Base * 4)/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame *2 - W_Window, W_Base);
const v58 = new THREE.Vector3(- (L_Base * 4)/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame * 2 , W_Base);

const v59 = new THREE.Vector3(- (L_Base * 5)/ 7, H_Base - W_Window_Frame, W_Base);
const v60 = new THREE.Vector3(- (L_Base * 5)/ 7, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v61 = new THREE.Vector3(- (L_Base * 5)/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame * 3 - W_Window, W_Base);
const v62 = new THREE.Vector3(- (L_Base * 5)/ 7 - W_Window_Frame*2 - W_Window, H_Base - W_Window_Frame, W_Base);
const v63 = new THREE.Vector3(- (L_Base * 5)/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2, W_Base);
const v64 = new THREE.Vector3(- (L_Base * 5)/ 7 - W_Window_Frame, H_Base - W_Window_Frame * 2 - W_Window, W_Base);
const v65 = new THREE.Vector3(- (L_Base * 5)/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame *2 - W_Window, W_Base);
const v66 = new THREE.Vector3(- (L_Base * 5)/ 7 - W_Window_Frame - W_Window, H_Base - W_Window_Frame * 2 , W_Base);

const v68 = new THREE.Vector3(- R_Porch_Column , H_Base,  - W_Porch + R_Porch_Column);
const v69 = new THREE.Vector3(- R_Porch_Column, H_Floor,  - W_Porch + R_Porch_Column);





const listaV = [v0, v1, v2, v3, v4, v5, v6, v7, v8, v9, v10,
v11, v12, v13, v14, v15, v16, v17, v18, v19, v20,
v21, v22, v23, v24, v25, v26, v27, v28, v29, v30,
v31, v32, v33, v34, v35, v36, v37, v38, v39, v40,
v41, v42, v43, v44, v45, v46, v47, v48, v49, v50,
v51, v52, v53, v54, v55, v56, v57, v58, v59, v60,
v61, v62, v63, v64, v65, v66, v67, v68, v69];

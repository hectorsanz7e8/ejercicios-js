import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===============================
// A. ESCENA
// ===============================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFF5F22);

// ===============================
// B. CÁMARA
// ===============================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 3, 6);

// ===============================
// C. RENDER
// ===============================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===============================
// POPUP HTML
// ===============================
const popup = document.createElement('div');
popup.innerText = 'hola';

popup.style.position = 'absolute';
popup.style.top = '20px';
popup.style.left = '50%';
popup.style.transform = 'translateX(-50%)';
popup.style.padding = '12px 20px';
popup.style.background = 'rgba(0,0,0,0.8)';
popup.style.color = 'white';
popup.style.fontSize = '20px';
popup.style.borderRadius = '8px';
popup.style.display = 'none';
popup.style.zIndex = '10';

document.body.appendChild(popup);

// ===============================
// D. LUCES
// ===============================
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// ===============================
// E. PERSONAJE
// ===============================

// Medidas
const bodyHeight = 2;
const bodyRadius = 0.5;
const headRadius = 0.4;
const limbRadius = 0.15;
const limbHeight = 1.5;
const handRadius = 0.18;

// Materiales
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffddaa });
const armMaterial  = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const legMaterial  = new THREE.MeshStandardMaterial({ color: 0x4444ff });
const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffccaa });

// Grupo del personaje
const character = new THREE.Group();

// ----- CUERPO -----
const body = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 32),
    bodyMaterial
);
character.add(body);

// ----- SOMBRERO -----
const clickableObjects = [];

const hatBrim = new THREE.Mesh(
    new THREE.CylinderGeometry(headRadius + 0.1, headRadius + 0.1, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
);
hatBrim.position.y = bodyHeight / 2 + headRadius + 0.25;
character.add(hatBrim);
clickableObjects.push(hatBrim);

const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(headRadius - 0.1, headRadius - 0.1, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
);
hatTop.position.y = bodyHeight / 2 + headRadius + 0.5;
character.add(hatTop);
clickableObjects.push(hatTop);

// ----- CABEZA -----
const head = new THREE.Mesh(
    new THREE.SphereGeometry(headRadius, 32, 32),
    headMaterial
);
head.position.y = bodyHeight / 2 + headRadius;
character.add(head);

// ===============================
// BRAZOS + MANOS (PIVOTE EN HOMBROS)
// ===============================
const armGeometry = new THREE.CylinderGeometry(
    limbRadius,
    limbRadius,
    limbHeight,
    16
);

// Brazo izquierdo
const leftArmPivot = new THREE.Group();
leftArmPivot.position.set(
    -(bodyRadius + limbRadius),
    bodyHeight / 2,
    0
);

const leftArm = new THREE.Mesh(armGeometry, armMaterial);
leftArm.position.y = -limbHeight / 2;

const leftHand = new THREE.Mesh(
    new THREE.SphereGeometry(handRadius, 16, 16),
    handMaterial
);
leftHand.position.y = -limbHeight / 2 - handRadius;

leftArm.add(leftHand);
leftArmPivot.add(leftArm);
character.add(leftArmPivot);

// Brazo derecho
const rightArmPivot = new THREE.Group();
rightArmPivot.position.set(
    bodyRadius + limbRadius,
    bodyHeight / 2,
    0
);

const rightArm = new THREE.Mesh(armGeometry, armMaterial);
rightArm.position.y = -limbHeight / 2;

const rightHand = new THREE.Mesh(
    new THREE.SphereGeometry(handRadius, 16, 16),
    handMaterial
);
rightHand.position.y = -limbHeight / 2 - handRadius;

rightArm.add(rightHand);
rightArmPivot.add(rightArm);
character.add(rightArmPivot);

// ===============================
// PIERNAS (PIVOTE EN CADERAS)
// ===============================
const legGeometry = new THREE.CylinderGeometry(
    limbRadius,
    limbRadius,
    limbHeight,
    16
);

// Pierna izquierda
const leftLegPivot = new THREE.Group();
leftLegPivot.position.set(
    -bodyRadius / 2,
    -bodyHeight / 2,
    0
);

const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
leftLeg.position.y = -limbHeight / 2;
leftLegPivot.add(leftLeg);
character.add(leftLegPivot);

// Pierna derecha
const rightLegPivot = new THREE.Group();
rightLegPivot.position.set(
    bodyRadius / 2,
    -bodyHeight / 2,
    0
);

const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
rightLeg.position.y = -limbHeight / 2;
rightLegPivot.add(rightLeg);
character.add(rightLegPivot);

// Añadir personaje a la escena
scene.add(character);

// ===============================
// F. CONTROLES
// ===============================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ===============================
// G. RAYCASTER CLICK
// ===============================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        popup.style.display = 'block';
    }
});

// ===============================
// H. ANIMACIÓN (CAMINAR)
// ===============================
function animate() {
    requestAnimationFrame(animate);

    const t = Date.now() * 0.002;

    leftArmPivot.rotation.x  =  Math.sin(t) * 0.6;
    rightArmPivot.rotation.x = -Math.sin(t) * 0.6;

    leftLegPivot.rotation.x  = -Math.sin(t) * 0.6;
    rightLegPivot.rotation.x =  Math.sin(t) * 0.6;

    controls.update();
    renderer.render(scene, camera);
}

animate();

// ===============================
// I. RESIZE
// ===============================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

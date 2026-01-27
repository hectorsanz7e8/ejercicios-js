import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ===============================
// ESCENA
// ===============================
const scene = new THREE.Scene();

// 🌈 Cielo animado
let skyHue = 0;
const skyColor = new THREE.Color();
scene.background = new THREE.Color(0xFF5F22);

// ===============================
// CÁMARA
// ===============================
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 10, 6);

const DEFAULT_FOV = 75;
const ZOOM_FOV = 35;

// Centro del mundo
const WORLD_CENTER = new THREE.Vector3(0, 0, 0);

// ===============================
// RENDER
// ===============================
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ===============================
// LUCES
// ===============================
const toggleLight = new THREE.PointLight(0xffffff, 40, 70);
toggleLight.position.set(0, 5, 0);
toggleLight.visible = true;
scene.add(toggleLight);

// ===============================
// CONTROLES
// ===============================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 2;
controls.maxDistance = 8;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 2;

// ===============================
// VARIABLES
// ===============================
let ring;
let selectedObject = null;
const randomRotationSpeed = 0.01;

// Zoom FOV
let targetFov = DEFAULT_FOV;
const zoomSpeed = 0.08;

// Bloqueo de cámara
let focusMode = false;

// ===============================
// RAYCASTER
// ===============================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// ===============================
// ANIMACIÓN
// ===============================
function animate() {
    requestAnimationFrame(animate);

    // Cielo animado
    skyHue += 0.0005;
    if (skyHue > 1) skyHue = 0;
    skyColor.setHSL(skyHue, 0.6, 0.5);
    scene.background = skyColor;

    // Ring animación
    if (ring) {
        ring.rotation.x += 0.5 * randomRotationSpeed;
        ring.rotation.z += 0.7 * randomRotationSpeed;
    }

    // Zoom suave FOV
    camera.fov += (targetFov - camera.fov) * zoomSpeed;
    camera.updateProjectionMatrix();

    controls.update();
    renderer.render(scene, camera);
}

// ===============================
// CARGA DE MODELOS
// ===============================
const loader = new GLTFLoader();

loader.load('main.glb', (gltf) => {
    gltf.scene.userData.selectable = false;
    scene.add(gltf.scene);
});

loader.load('ring.glb', (gltf) => {
    ring = gltf.scene;
    ring.name = 'ring';
    ring.userData.selectable = true;
    scene.add(ring);
});

loader.load('esfera.glb', (gltf) => {
    gltf.scene.userData.selectable = true;
    scene.add(gltf.scene);
});

loader.load('floor.glb', (gltf) => {
    gltf.scene.userData.selectable = false;
    gltf.scene.position.set(0, -0.1, 0);
    scene.add(gltf.scene);
});

// OBJETO 1
loader.load('1.glb', (gltf) => {
    gltf.scene.name = '1';
    gltf.scene.userData.selectable = true;
    scene.add(gltf.scene);
});

// OBJETOS 2–20
for (let i = 2; i <= 20; i++) {
    loader.load(`${i}.glb`, (gltf) => {
        gltf.scene.userData.selectable = true;
        scene.add(gltf.scene);
    });
}

// ===============================
// RESALTADO
// ===============================
function highlightObject(object) {
    object.traverse((child) => {
        if (child.isMesh) {
            child.userData.originalMaterial = child.material;
            child.material = child.material.clone();
            child.material.emissive = new THREE.Color(0xffff00);
            child.material.emissiveIntensity = 0.6;
        }
    });
}

function resetHighlight(object) {
    object.traverse((child) => {
        if (child.isMesh && child.userData.originalMaterial) {
            child.material = child.userData.originalMaterial;
            delete child.userData.originalMaterial;
        }
    });
}

// ===============================
// SELECCIONABLE
// ===============================
function isSelectable(object) {
    let current = object;
    while (current) {
        if (current.userData.selectable === false) return false;
        current = current.parent;
    }
    return true;
}

// ===============================
// CLICK
// ===============================
window.addEventListener('click', (event) => {
    if (focusMode) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (!intersects.length) return;

    const mesh = intersects[0].object;
    if (!isSelectable(mesh)) return;

    let obj = mesh;
    while (obj.parent && obj.parent !== scene) obj = obj.parent;

    // Reset highlight anterior
    if (selectedObject) resetHighlight(selectedObject);

    // Si es el anillo → toggle luz
    if (obj.name === 'ring') {
        toggleLight.visible = !toggleLight.visible;
        console.log('Luz toggled:', toggleLight.visible);
        selectedObject = null;
        return;
    }

    // Si es el objeto 1 → mostrar overlay HTML + zoom
    if (obj.name === '1') {
        highlightObject(obj);
        selectedObject = obj;

        const box = new THREE.Box3().setFromObject(obj);
        const center = new THREE.Vector3();
        box.getCenter(center);
        controls.target.copy(center);

        targetFov = ZOOM_FOV;
        focusMode = true;
        controls.enableRotate = false;
        controls.enablePan = false;

        // Mostrar HTML overlay
        const infoBox = document.getElementById('infoBox');
        infoBox.style.display = 'block';
        document.getElementById('closeInfo').onclick = () => {
            infoBox.style.display = 'none';

            // Al cerrar el HTML, desbloquear cámara y reset
            targetFov = DEFAULT_FOV;
            controls.target.copy(WORLD_CENTER);
            focusMode = false;
            controls.enableRotate = true;
            controls.enablePan = true;
            if (selectedObject) {
                resetHighlight(selectedObject);
                selectedObject = null;
            }
        };
        return;
    }

    // Otros objetos → zoom y bloqueo cámara
    highlightObject(obj);
    selectedObject = obj;

    const box = new THREE.Box3().setFromObject(obj);
    const center = new THREE.Vector3();
    box.getCenter(center);
    controls.target.copy(center);

    targetFov = ZOOM_FOV;
    focusMode = true;
    controls.enableRotate = false;
    controls.enablePan = false;
});

// ===============================
// RUEDA → RECUPERAR FOV, DESBLOQUEAR Y CERRAR HTML
// ===============================
window.addEventListener('wheel', () => {
    targetFov = DEFAULT_FOV;
    controls.target.copy(WORLD_CENTER);

    focusMode = false;
    controls.enableRotate = true;
    controls.enablePan = true;

    if (selectedObject) {
        resetHighlight(selectedObject);
        selectedObject = null;
    }

    // Cerrar overlay si estaba abierto
    const infoBox = document.getElementById('infoBox');
    if (infoBox) infoBox.style.display = 'none';
});

// ===============================
// RESIZE
// ===============================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===============================
animate();

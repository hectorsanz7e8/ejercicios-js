import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
// D. LUCES
// ===============================
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

// ===============================
// F. CONTROLES
// ===============================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// ===============================
// H. ANIMACIÓN
// ===============================
function animate() {
    requestAnimationFrame(animate);

    const t = Date.now() * 0.002;

    controls.update();
    renderer.render(scene, camera);
}
//Crear el loader
const loader = new GLTFLoader();

//Cargar el modelo
loader.load(
    'florero.glb', 
    function (gltf) {
        scene.add(gltf.scene);
    }, 
    undefined, 
    function (error) {
        console.error("Error al cargar el modelo: ", error);
    }
);

animate();

// ===============================
// I. RESIZE
// ===============================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
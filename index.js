import * as THREE from "three";
import getLayer from "./libs/getLayer.js";
import { OBJLoader } from "jsm/loaders/OBJLoader.js";
import getStarfield from "./libs/getStarfield.js";
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const canvas = document.getElementById('three-canvas');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(w, h);

let scrollPosY = 0;
function initScene({ geo }) {
  const geometry = geo;
  geometry.center();
  const texLoader = new THREE.TextureLoader();
  const material = new THREE.MeshMatcapMaterial({
    matcap: texLoader.load('./assets/blue.jpg'),
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(1.5, -0.5, 0);
  scene.add(mesh);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(hemiLight);

  const gradientBackground = getLayer({
    hue: 0.6,
    numSprites: 8,
    opacity: 0.2,
    radius: 10,
    size: 24,
    z: -10.5,
  });
  scene.add(gradientBackground);

  const stars = getStarfield({ numStars: 4500 });
  scene.add(stars);

  let goalPos = 0;
  const rate = 0.1;
  function animate() {
    requestAnimationFrame(animate);
    goalPos = Math.PI * scrollPosY;;
    mesh.rotation.y -= (mesh.rotation.y - (goalPos * 1.0)) * rate;
    stars.position.z -= (stars.position.z - goalPos * 8) * rate;
    renderer.render(scene, camera);
  }
  animate();
}
const manager = new THREE.LoadingManager();
const loader = new OBJLoader(manager);
let sceneData = {};
manager.onLoad = () => initScene(sceneData);
loader.load("./assets/astronaut.obj", (obj) => {
  let geometry;
  obj.traverse((child) => {
    if (child.type === "Mesh") {
      geometry = child.geometry;
    }
  });
  sceneData.geo = geometry;
});

window.addEventListener("scroll", () => {
  scrollPosY = (window.scrollY / document.body.clientHeight);
});

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
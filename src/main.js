export default {
  root: "src", // Tell Vite to look inside src/
};

import "./style.css";

import * as THREE from "three";
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { log } from "three/src/nodes/TSL.js";
import { gain } from "three/tsl";

// Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
});

// Renderer settings
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Load HDR texture for background and environment
const loader = new RGBELoader();
loader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/solitude_night_1k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);
const textureLoader = new THREE.TextureLoader();
const starGeometry = new THREE.SphereGeometry(50, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
  map: textureLoader.load("./stars.jpg"),
  side: THREE.BackSide,
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);
// Create spheres
const radius = 1.3;
const segment = 64;
const textures = [
  "/csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];
const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00"];
const sphereGroup = new THREE.Group();

for (let i = 0; i < textures.length; i++) {
  const geometry = new THREE.SphereGeometry(radius, segment, segment);
  const material = new THREE.MeshStandardMaterial({
    map: textureLoader.load(textures[i]),
    colors,
  });

  const angle = (i / textures.length) * (Math.PI * 2);

  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.x = 8 * Math.cos(angle);
  sphere.position.z = 8 * Math.sin(angle);
  sphereGroup.position.y = -2;

  // Add rotation animation
  gsap.to(sphere.rotation, {
    y: "+=6.28",
    duration: 4,
    repeat: -1,
    ease: "none",
  });

  sphereGroup.add(sphere);
}
scene.add(sphereGroup);

// Camera position
camera.position.z = 10;
camera.lookAt(sphereGroup.position);

// Smooth scroll control
let lastWheelTime = 0;
const throttleDelay = 2000;
let scrollCount = 0;

function throttledWheelHandler(event) {
  const currentTime = Date.now();

  if (currentTime - lastWheelTime >= throttleDelay) {
    lastWheelTime = currentTime;

    const direction = event.deltaY > 0 ? "down" : "up";
    const headings = document.querySelectorAll(".heading");

    if (direction === "down") {
      scrollCount = (scrollCount + 1) % headings.length;
    } else {
      scrollCount = (scrollCount - 1 + headings.length) % headings.length;
    }

    gsap.to(headings, {
      duration: 1,
      y: `-${scrollCount * 100}%`,
      ease: "power2.inOut",
    });
    gsap.to(sphereGroup.rotation, {
      duration: 1,
      y: `-=${Math.PI / 2}%`,
      ease: "power2.inOut",
    });
    if (scrollCount === 0) {
      gsap.to(headings, {
        duration: 1,
        y: `0`,
        ease: "power2.inOut",
      });
    }

    console.log(`Scroll count: ${scrollCount}`);
  }
}

window.addEventListener("wheel", throttledWheelHandler);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 🎯 Smooth, perfect, and looped scrolling is ready! Let me know if you want adjustments! 🚀

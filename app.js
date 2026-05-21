import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  px: Math.min(window.devicePixelRatio || 1, 1.65),
  targetScroll: 0,
  currentScroll: 0,
  previousScroll: 0,
  scrollVelocity: 0,
  maxScroll: 0,
  mouse: new THREE.Vector2(0, 0),
  mouseTarget: new THREE.Vector2(0, 0),
  cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  cursorTrail: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
  world: 0,
  isMobile: window.matchMedia("(max-width: 980px)").matches,
  reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
};

const smooth = document.querySelector("#smooth");
const preloader = document.querySelector(".preloader");
const loadCount = document.querySelector("#load-count");
const cursor = document.querySelector(".cursor");
const cursorTrail = document.querySelector(".cursor-trail");
const revealEls = [...document.querySelectorAll(".reveal")];
const chapters = [...document.querySelectorAll(".chapter")];
const magneticEls = [...document.querySelectorAll(".magnetic")];
const projectButtons = [...document.querySelectorAll(".project")];
const timelineDots = [...document.querySelectorAll(".case-timeline span")];
const caseCode = document.querySelector("#case-code");
const previewType = document.querySelector("#preview-type");
const previewScore = document.querySelector("#preview-score");
const previewCore = document.querySelector(".preview-core");
const previewOrbit = document.querySelector(".preview-orbit");
const chapterReadout = document.querySelector("#chapter-readout");
const scrollProgress = document.querySelector("#scroll-progress");
const velocityReadout = document.querySelector("#velocity-readout");

const projectCases = [
  {
    code: "CASE 001",
    type: "Predictive Commerce",
    score: "98.7",
    glow: "rgba(69, 170, 255, 0.92)",
  },
  {
    code: "CASE 002",
    type: "Spatial Creative Studio",
    score: "99.1",
    glow: "rgba(155, 233, 255, 0.92)",
  },
  {
    code: "CASE 003",
    type: "Executive Signal System",
    score: "97.9",
    glow: "rgba(199, 209, 220, 0.92)",
  },
];

if (state.reduceMotion) document.body.classList.add("reduce-motion");

const canvas = document.querySelector("#universe");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(state.px);
renderer.setSize(state.width, state.height);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020409, 0.035);

const camera = new THREE.PerspectiveCamera(45, state.width / state.height, 0.1, 120);
camera.position.set(0, 0.3, 13);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(state.width, state.height),
  state.isMobile ? 0.55 : 0.82,
  0.7,
  0.12,
);
composer.addPass(bloom);

const root = new THREE.Group();
const coreGroup = new THREE.Group();
const ringGroup = new THREE.Group();
const gridGroup = new THREE.Group();
const signalCraft = new THREE.Group();
const signalTrail = new THREE.Group();
scene.add(root, gridGroup);
root.add(coreGroup, ringGroup);
scene.add(signalCraft, signalTrail);

const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2() },
  uScroll: { value: 0 },
  uWorld: { value: 0 },
};

const coreMaterial = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec3 p = position;
      float wave = sin((p.y * 5.0) + uTime * 1.45) * 0.08;
      float pulse = sin(uTime * 2.0 + length(p) * 4.5) * 0.045;
      p += normal * (wave + pulse + uMouse.x * 0.04);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uScroll;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.6);
      float scan = sin((vPosition.y * 18.0) + uTime * 3.2 + uScroll * 0.012) * 0.5 + 0.5;
      vec3 blue = vec3(0.12, 0.56, 1.0);
      vec3 cyan = vec3(0.58, 0.93, 1.0);
      vec3 color = mix(blue, cyan, fresnel + scan * 0.18);
      float alpha = 0.18 + fresnel * 0.72 + scan * 0.08;
      gl_FragColor = vec4(color, alpha);
    }
  `,
});

const coreShell = new THREE.Mesh(new THREE.IcosahedronGeometry(2.12, 18), coreMaterial);
const innerCore = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.25, 8),
  new THREE.MeshBasicMaterial({
    color: 0x9be9ff,
    transparent: true,
    opacity: 0.11,
    wireframe: true,
    blending: THREE.AdditiveBlending,
  }),
);
coreGroup.add(coreShell, innerCore);

const ringMaterials = [
  new THREE.MeshBasicMaterial({
    color: 0x45aaff,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
  }),
  new THREE.MeshBasicMaterial({
    color: 0xc7d1dc,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
  }),
  new THREE.MeshBasicMaterial({
    color: 0x9be9ff,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
  }),
];

for (let i = 0; i < 7; i += 1) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.7 + i * 0.34, 0.006 + i * 0.0015, 10, 240),
    ringMaterials[i % ringMaterials.length],
  );
  ring.rotation.set(
    Math.PI * 0.5 + i * 0.17,
    i * 0.35,
    i * 0.24,
  );
  ring.userData.speed = 0.1 + i * 0.025;
  ringGroup.add(ring);
}

const craftMaterial = new THREE.MeshBasicMaterial({
  color: 0x9be9ff,
  transparent: true,
  opacity: 0.72,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
});

const craftEdgeMaterial = new THREE.LineBasicMaterial({
  color: 0xf6fbff,
  transparent: true,
  opacity: 0.58,
  blending: THREE.AdditiveBlending,
});

const wingGeometry = new THREE.BufferGeometry();
wingGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute([
    0, 0, 0,
    -1.9, -0.18, -0.72,
    -0.35, 0.12, 1.2,
    0, 0, 0,
    1.9, -0.18, -0.72,
    0.35, 0.12, 1.2,
  ], 3),
);
wingGeometry.computeVertexNormals();

const wingMesh = new THREE.Mesh(wingGeometry, craftMaterial);
signalCraft.add(wingMesh);

const bodyGeometry = new THREE.ConeGeometry(0.22, 1.55, 5, 1, true);
const bodyMesh = new THREE.Mesh(bodyGeometry, craftMaterial.clone());
bodyMesh.rotation.x = Math.PI * 0.5;
bodyMesh.position.z = 0.22;
bodyMesh.material.opacity = 0.5;
signalCraft.add(bodyMesh);

const craftEdges = new THREE.LineSegments(new THREE.EdgesGeometry(wingGeometry), craftEdgeMaterial);
signalCraft.add(craftEdges);

const noseLight = new THREE.Mesh(
  new THREE.SphereGeometry(0.08, 16, 16),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
  }),
);
noseLight.position.z = 1.16;
signalCraft.add(noseLight);

const trailMaterial = new THREE.MeshBasicMaterial({
  color: 0x45aaff,
  transparent: true,
  opacity: 0.18,
  blending: THREE.AdditiveBlending,
});

for (let i = 0; i < 14; i += 1) {
  const trailDot = new THREE.Mesh(new THREE.SphereGeometry(0.045 + i * 0.006, 10, 10), trailMaterial.clone());
  trailDot.material.opacity = Math.max(0.025, 0.28 - i * 0.017);
  trailDot.userData.followOffset = i + 1;
  signalTrail.add(trailDot);
}

const particleCount = state.isMobile ? 1500 : 3600;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSeeds = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i += 1) {
  const radius = 4 + Math.random() * 24;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
  const i3 = i * 3;
  particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
  particlePositions[i3 + 2] = radius * Math.cos(phi);
  particleSeeds[i] = Math.random();
}

particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
particleGeometry.setAttribute("aSeed", new THREE.BufferAttribute(particleSeeds, 1));

const particleMaterial = new THREE.ShaderMaterial({
  uniforms,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uScroll;
    attribute float aSeed;
    varying float vSeed;

    void main() {
      vSeed = aSeed;
      vec3 p = position;
      float orbit = uTime * (0.02 + aSeed * 0.06) + uScroll * 0.00022;
      float c = cos(orbit);
      float s = sin(orbit);
      p.xz = mat2(c, -s, s, c) * p.xz;
      p.y += sin(uTime * 0.45 + aSeed * 18.0 + p.x * 0.06) * 0.22;
      p.x += uMouse.x * (0.15 + aSeed * 0.3);
      p.y += uMouse.y * (0.1 + aSeed * 0.2);
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = (1.8 + aSeed * 2.6) * (8.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    varying float vSeed;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float alpha = smoothstep(0.5, 0.0, d);
      vec3 color = mix(vec3(0.25, 0.64, 1.0), vec3(0.78, 0.94, 1.0), vSeed);
      gl_FragColor = vec4(color, alpha * 0.62);
    }
  `,
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

const starGeometry = new THREE.BufferGeometry();
const starCount = state.isMobile ? 240 : 520;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i += 1) {
  const i3 = i * 3;
  starPositions[i3] = THREE.MathUtils.randFloatSpread(80);
  starPositions[i3 + 1] = THREE.MathUtils.randFloatSpread(34);
  starPositions[i3 + 2] = THREE.MathUtils.randFloat(-60, -8);
}
starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
const stars = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({
    color: 0xc7d1dc,
    size: 0.035,
    transparent: true,
    opacity: 0.36,
    blending: THREE.AdditiveBlending,
  }),
);
scene.add(stars);

for (let y = -7; y <= 7; y += 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(-26, y * 1.2, -18),
    new THREE.Vector3(26, y * 1.2, -18),
  ]);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0x45aaff,
      transparent: true,
      opacity: 0.045,
      blending: THREE.AdditiveBlending,
    }),
  );
  gridGroup.add(line);
}

for (let x = -14; x <= 14; x += 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(x * 1.8, -9, -18),
    new THREE.Vector3(x * 1.8, 9, -18),
  ]);
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0x9be9ff,
      transparent: true,
      opacity: 0.035,
      blending: THREE.AdditiveBlending,
    }),
  );
  gridGroup.add(line);
}

const ambient = new THREE.AmbientLight(0x9be9ff, 0.6);
const keyLight = new THREE.PointLight(0x45aaff, 38, 26);
keyLight.position.set(4, 6, 6);
const rimLight = new THREE.PointLight(0xc7d1dc, 22, 24);
rimLight.position.set(-6, -4, 8);
scene.add(ambient, keyLight, rimLight);

function setDocumentHeight() {
  state.isMobile = window.matchMedia("(max-width: 980px)").matches;
  state.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (state.isMobile || state.reduceMotion) {
    document.body.style.height = "";
    smooth.style.transform = "";
    state.maxScroll = Math.max(0, document.documentElement.scrollHeight - state.height);
    return;
  }

  const height = smooth.scrollHeight;
  document.body.style.height = `${height}px`;
  state.maxScroll = Math.max(0, height - state.height);
}

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.px = Math.min(window.devicePixelRatio || 1, 1.65);
  camera.aspect = state.width / state.height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(state.px);
  renderer.setSize(state.width, state.height);
  composer.setSize(state.width, state.height);
  bloom.strength = state.isMobile ? 0.52 : 0.82;
  setDocumentHeight();
}

function updateScroll() {
  state.targetScroll = window.scrollY || window.pageYOffset;
  if (state.isMobile || state.reduceMotion) {
    state.scrollVelocity += (Math.abs(state.targetScroll - state.previousScroll) - state.scrollVelocity) * 0.1;
    state.previousScroll = state.targetScroll;
    state.currentScroll = state.targetScroll;
    return;
  }
  state.scrollVelocity += (Math.abs(state.targetScroll - state.currentScroll) - state.scrollVelocity) * 0.08;
  state.currentScroll += (state.targetScroll - state.currentScroll) * 0.095;
  state.previousScroll = state.currentScroll;
  smooth.style.transform = `translate3d(0, ${-state.currentScroll}px, 0)`;
}

function updateReveals() {
  for (const el of revealEls) {
    const rect = el.getBoundingClientRect();
    if (rect.top < state.height * 0.86 && rect.bottom > 0) {
      el.classList.add("is-visible");
    }
  }
}

function updateWorld() {
  let active = 0;
  let activeLabel = "00 / AI Core Hero Experience";
  for (const chapter of chapters) {
    const rect = chapter.getBoundingClientRect();
    if (rect.top < state.height * 0.58 && rect.bottom > state.height * 0.25) {
      active = Number(chapter.dataset.world || 0);
      activeLabel = chapter.querySelector(".chapter__index")?.textContent.trim() || activeLabel;
      break;
    }
  }
  state.world += (active - state.world) * 0.04;
  uniforms.uWorld.value = state.world;
  if (chapterReadout) chapterReadout.textContent = activeLabel;
  if (scrollProgress) {
    const progress = state.maxScroll ? THREE.MathUtils.clamp(state.currentScroll / state.maxScroll, 0, 1) : 0;
    scrollProgress.style.transform = `scaleX(${progress})`;
  }
  if (velocityReadout) {
    velocityReadout.textContent = THREE.MathUtils.clamp(state.scrollVelocity / 100, 0, 9.99).toFixed(2);
  }
}

function updateCursor() {
  state.cursor.x += (state.mouseTarget.x - state.cursor.x) * 0.55;
  state.cursor.y += (state.mouseTarget.y - state.cursor.y) * 0.55;
  state.cursorTrail.x += (state.mouseTarget.x - state.cursorTrail.x) * 0.16;
  state.cursorTrail.y += (state.mouseTarget.y - state.cursorTrail.y) * 0.16;

  cursor.style.transform = `translate3d(${state.cursor.x}px, ${state.cursor.y}px, 0)`;
  cursorTrail.style.transform = `translate3d(${state.cursorTrail.x}px, ${state.cursorTrail.y}px, 0)`;
}

function setActiveCase(index) {
  const nextCase = projectCases[index];
  if (!nextCase) return;

  projectButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
  });
  timelineDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });

  if (caseCode) caseCode.textContent = nextCase.code;
  if (previewType) previewType.textContent = nextCase.type;
  if (previewScore) previewScore.textContent = nextCase.score;
  if (previewCore) previewCore.style.setProperty("--case-glow", nextCase.glow);
  if (previewOrbit) previewOrbit.style.filter = `hue-rotate(${index * 18}deg)`;

  state.world += (index + 1) * 0.12;
  bloom.strength = Math.min(1.05, bloom.strength + 0.08);
}

function getSignalFlightPoint(progress) {
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  const x = THREE.MathUtils.lerp(-13.5, 13.5, p);
  const y = Math.sin(p * Math.PI * 2.1) * 2.2 + Math.cos(p * Math.PI * 0.9) * 0.7;
  const z = -2.2 - Math.sin(p * Math.PI) * 6.8;
  return new THREE.Vector3(x, y, z);
}

function animate(time = 0) {
  const t = time * 0.001;
  uniforms.uTime.value = t;
  updateScroll();
  updateWorld();
  updateReveals();

  state.mouse.lerp(state.mouseTarget.clone().set(
    (state.mouseTarget.x / state.width) * 2 - 1,
    -(state.mouseTarget.y / state.height) * 2 + 1,
  ), 0.06);
  uniforms.uMouse.value.copy(state.mouse);
  uniforms.uScroll.value = state.currentScroll;

  const scrollNorm = state.maxScroll ? state.currentScroll / state.maxScroll : 0;
  const worldShift = state.world * 0.18;
  const velocityBoost = THREE.MathUtils.clamp(state.scrollVelocity / 900, 0, 0.65);
  const flightProgress = THREE.MathUtils.clamp((scrollNorm - 0.015) * 1.08, 0, 1);

  root.rotation.y = t * (0.08 + velocityBoost * 0.04) + state.mouse.x * 0.28 + worldShift;
  root.rotation.x = Math.sin(t * 0.22) * 0.08 + state.mouse.y * 0.18;
  const heroOffset = state.world < 0.7 && !state.isMobile ? 1.55 : 0;
  root.position.x = heroOffset + Math.sin(state.world * 0.7) * 0.8;
  root.position.y = Math.cos(state.world * 0.4) * 0.22;
  root.scale.setScalar((state.world < 0.7 ? 0.9 : 1) + Math.sin(t * 1.2) * 0.018 + scrollNorm * 0.22);

  coreShell.rotation.y -= 0.003;
  coreShell.rotation.z += 0.0017;
  innerCore.rotation.y += 0.006;
  innerCore.rotation.x -= 0.003;

  ringGroup.children.forEach((ring, index) => {
    ring.rotation.z += ring.userData.speed * 0.01;
    ring.rotation.x += Math.sin(t * 0.2 + index) * 0.0009;
    ring.scale.setScalar(1 + Math.sin(t * 0.8 + index) * 0.018);
  });

  particles.rotation.y = -t * 0.018 + scrollNorm * 0.75;
  particles.rotation.x = state.mouse.y * 0.08;
  stars.rotation.y = t * 0.004;
  gridGroup.position.y = -state.currentScroll * 0.0014;
  gridGroup.rotation.z = Math.sin(t * 0.13) * 0.025;

  const craftPoint = getSignalFlightPoint(flightProgress);
  signalCraft.position.copy(craftPoint);
  signalCraft.position.x += state.mouse.x * 0.35;
  signalCraft.position.y += state.mouse.y * 0.22;
  signalCraft.rotation.x = Math.sin(t * 0.9 + flightProgress * 8) * 0.18 + state.mouse.y * 0.12;
  signalCraft.rotation.y = Math.PI * 0.5 + Math.sin(flightProgress * Math.PI * 2) * 0.5;
  signalCraft.rotation.z = -0.62 + Math.sin(flightProgress * Math.PI * 3) * 0.72 - velocityBoost * 0.85;
  signalCraft.scale.setScalar(0.55 + Math.sin(flightProgress * Math.PI) * 0.55 + velocityBoost * 0.18);
  signalCraft.traverse((part) => {
    if (part.material) {
      part.material.opacity = Math.min(part.material.opacity || 0.4, 0.95);
    }
  });

  signalTrail.children.forEach((dot, index) => {
    const delayedProgress = THREE.MathUtils.clamp(flightProgress - (index + 1) * 0.012, 0, 1);
    const dotPoint = getSignalFlightPoint(delayedProgress);
    dot.position.copy(dotPoint);
    dot.position.x += Math.sin(t * 2.1 + index) * 0.08;
    dot.position.y += Math.cos(t * 1.8 + index) * 0.06;
    dot.scale.setScalar(1 + velocityBoost * 3 + index * 0.03);
  });

  camera.position.x += (state.mouse.x * 1.1 - camera.position.x) * 0.025;
  camera.position.y += (0.3 + state.mouse.y * 0.65 - camera.position.y) * 0.025;
  camera.position.z += (13 - scrollNorm * 2.2 - camera.position.z) * 0.018;
  camera.lookAt(0, 0, 0);

  keyLight.position.x = 4 + state.mouse.x * 3;
  keyLight.position.y = 6 + state.mouse.y * 2;
  bloom.strength = (state.isMobile ? 0.52 : 0.78) + Math.sin(t * 0.7) * 0.05 + velocityBoost * 0.14;

  if (!state.isMobile) updateCursor();
  composer.render();
  requestAnimationFrame(animate);
}

function bootPreloader() {
  let count = 0;
  const timer = window.setInterval(() => {
    count += Math.max(1, Math.round((100 - count) * 0.13));
    loadCount.textContent = String(Math.min(count, 99)).padStart(2, "0");
    if (count >= 99) {
      window.clearInterval(timer);
    }
  }, 55);

  window.setTimeout(() => {
    loadCount.textContent = "100";
    document.body.classList.add("is-loaded");
    updateReveals();
    window.setTimeout(() => preloader.remove(), 1300);
  }, 1650);
}

window.addEventListener("resize", resize, { passive: true });
window.addEventListener(
  "mousemove",
  (event) => {
    state.mouseTarget.x = event.clientX;
    state.mouseTarget.y = event.clientY;
  },
  { passive: true },
);

window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    state.mouseTarget.x = touch.clientX;
    state.mouseTarget.y = touch.clientY;
  },
  { passive: true },
);

magneticEls.forEach((el) => {
  el.addEventListener("mouseenter", () => cursorTrail.classList.add("is-active"));
  el.addEventListener("mouseleave", () => {
    cursorTrail.classList.remove("is-active");
    el.style.transform = "";
  });
  el.addEventListener("mousemove", (event) => {
    const rect = el.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18}px, 0)`;
  });
});

projectButtons.forEach((button) => {
  const index = Number(button.dataset.case || 0);
  button.addEventListener("mouseenter", () => setActiveCase(index));
  button.addEventListener("focus", () => setActiveCase(index));
  button.addEventListener("click", () => setActiveCase(index));
});

document.querySelector(".sound")?.addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("is-muted");
  bloom.strength = event.currentTarget.classList.contains("is-muted") ? 0.28 : 0.82;
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const id = anchor.getAttribute("href");
    const target = id ? document.querySelector(id) : null;
    if (!target) return;
    event.preventDefault();
    const top = state.isMobile || state.reduceMotion
      ? target.getBoundingClientRect().top + window.scrollY
      : target.offsetTop;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

setDocumentHeight();
resize();
setActiveCase(0);
bootPreloader();
requestAnimationFrame(animate);

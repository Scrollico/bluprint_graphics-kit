<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

  export let height: number = 520;
  export let width: number = 720; // original size
  // Scroll-driven progress 0..1 to interpolate between two key states
  export const progress: number = 0;
  // Rotation angle in degrees
  export let rotation: number = 0;
  // Camera position parameters for smooth transitions
  export let cameraX: number = 3;
  export let cameraY: number = 2;
  export let cameraZ: number = 3;
  // Camera lookAt parameters
  export let lookAtX: number = 0;
  export let lookAtY: number = 0.5;
  export let lookAtZ: number = 0;
  // Opacity for fading effects
  export let opacity: number = 1;

  let container: HTMLDivElement;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let model: THREE.Group;
  let animationId: number;
  let isLoading = true;
  let maxDimForCamera = 6; // updated after model load

  onMount(() => {
    initThreeJS();
    loadModel();
    animate();
    // no user interaction; purely scroll-driven
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (renderer) {
      renderer.dispose();
    }
  });

  function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    // Removed background color as requested

    // Camera
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    // Renderer with transparent background
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    // more realistic falloff
    // @ts-ignore - property exists in Three
    renderer.physicallyCorrectLights = true;

    if (container) {
      container.appendChild(renderer.domElement);
    }

    // Lighting
    addLighting();
  }

  function addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    scene.add(directionalLight);

    // Point light for extra illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Hemisphere light for natural lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b4513, 0.4);
    scene.add(hemisphereLight);

    // Ground to receive shadows (subtle)
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.ShadowMaterial({ opacity: 0.15 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);
  }

  function loadModel() {
    const loader = new GLTFLoader();

    loader.load(
      '/3d/uploads_files_3685451_railroad.glb',
      (gltf) => {
        model = gltf.scene;

        // Scale and position the model (increased size)
        model.scale.setScalar(1.25);
        model.position.set(0, 0, 0);

        // Enable shadows
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);

        // Center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);

        // Adjust camera position based on model size (closer view)
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        maxDimForCamera = maxDim;
        camera.position.set(
          cameraX || maxDim * 1.0,
          cameraY || maxDim * 0.8,
          cameraZ || maxDim * 1.0
        );
        camera.lookAt(lookAtX || 0, lookAtY || 0.5, lookAtZ || 0);
        isLoading = false;
      },
      (progress) => {
        console.log(
          'Loading progress:',
          (progress.loaded / progress.total) * 100 + '%'
        );
      },
      (error) => {
        console.error('Error loading model:', error);

        // Fallback: Create a simple railroad-like geometry
        createFallbackRailroad();
      }
    );
  }

  function createFallbackRailroad() {
    const group = new THREE.Group();

    // Rails
    const railGeometry = new THREE.BoxGeometry(0.1, 0.1, 10);
    const railMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });

    const rail1 = new THREE.Mesh(railGeometry, railMaterial);
    rail1.position.set(-0.7, 0, 0);
    rail1.castShadow = true;
    rail1.receiveShadow = true;
    group.add(rail1);

    const rail2 = new THREE.Mesh(railGeometry, railMaterial);
    rail2.position.set(0.7, 0, 0);
    rail2.castShadow = true;
    rail2.receiveShadow = true;
    group.add(rail2);

    // Ties (railroad sleepers)
    const tieGeometry = new THREE.BoxGeometry(2, 0.2, 0.3);
    const tieMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });

    for (let i = -4; i <= 4; i++) {
      const tie = new THREE.Mesh(tieGeometry, tieMaterial);
      tie.position.set(0, -0.1, i * 1.2);
      tie.castShadow = true;
      tie.receiveShadow = true;
      group.add(tie);
    }

    // Simple train car
    const trainGeometry = new THREE.BoxGeometry(1.5, 1, 3);
    const trainMaterial = new THREE.MeshLambertMaterial({ color: 0x2563eb });
    const train = new THREE.Mesh(trainGeometry, trainMaterial);
    train.position.set(0, 0.5, 0);
    train.castShadow = true;
    train.receiveShadow = true;
    group.add(train);

    model = group;
    scene.add(model);
    isLoading = false;
  }

  // No user interaction handlers; scroll-only

  function animate() {
    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  // Handle resize
  $: if (renderer && camera) {
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  // Handle rotation, camera updates, and opacity
  $: if (model) {
    model.rotation.y = (rotation * Math.PI) / 180;
  }

  $: if (camera) {
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(lookAtX, lookAtY, lookAtZ);
  }

  $: if (renderer) {
    container.style.opacity = opacity.toString();
  }
</script>

{#if isLoading}
  <div class="loading-overlay">
    <div class="loading-spinner"></div>
    <p>Yükleniyor…</p>
  </div>
{/if}
<div
  bind:this={container}
  style="width: 100%; height: 100%; min-width: {width}px; min-height: {height}px;"
></div>

<style>
  .loading-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #64748b;
    font-size: 14px;
    z-index: 10;
    pointer-events: none;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #2563eb;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 10px;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* removed controls hint per requirement */
</style>

import * as THREE from "three";

export interface ChocoSceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

export function initScene(canvas: HTMLCanvasElement): ChocoSceneObjects {
  const width = canvas.offsetWidth;
  const height = canvas.offsetHeight;
  const dpr = Math.min(window.devicePixelRatio, 2);

  const scene = new THREE.Scene();
  // No scene background — canvas is transparent, HTML CSS handles it

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(dpr);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  return { scene, camera, renderer };
}

export function resizeScene(
  objects: ChocoSceneObjects,
  width: number,
  height: number
) {
  objects.camera.aspect = width / height;
  objects.camera.updateProjectionMatrix();
  objects.renderer.setSize(width, height);
}

export function disposeScene(objects: ChocoSceneObjects) {
  objects.renderer.dispose();
  objects.scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}

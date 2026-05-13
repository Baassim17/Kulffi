"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { getFlavorModelPath } from "@/lib/choco/modelCache";
import { initScene, resizeScene, disposeScene } from "@/lib/choco/scene";
import { createParticles, updateParticles, disposeParticles } from "@/lib/choco/particles";
import { computePhases, lerp, easeOutCubic } from "@/lib/choco/animations";

const Y_OFFSET = -1.6;

function setupModel(model: THREE.Group, isMobile: boolean) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  model.position.set(-center.x, -center.y + Y_OFFSET, -center.z);
  const normalizeScale = 3 / Math.max(maxDim, 0.001);
  const targetScale = normalizeScale * (isMobile ? 0.7 : 1);

  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return targetScale;
}

export interface UseChocoSceneReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isLoading: boolean;
  loadFlavor: (index: number) => void;
  activeFlavorIndex: number;
  scrollRef: React.MutableRefObject<number>;
}

export function useChocoScene(): UseChocoSceneReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFlavorIndex, setActiveFlavorIndex] = useState(0);

  const rafRef = useRef<number>(0);
  const scrollRef = useRef(0);
  const lastScrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetMouseRef = useRef({ x: 0, y: 0 });

  const currentModelRef = useRef<THREE.Group | null>(null);
  const currentTargetScaleRef = useRef(1);
  const nextModelRef = useRef<THREE.Group | null>(null);
  const nextTargetScaleRef = useRef(1);
  const transitionStateRef = useRef<"idle" | "out" | "loading" | "in">("idle");
  const transitionProgressRef = useRef(0);
  const targetFlavorIndexRef = useRef(0);
  const isInitializedRef = useRef(false);
  const isRunningRef = useRef(false);

  const parsedCacheRef = useRef<Map<string, { group: THREE.Group; targetScale: number }>>(new Map());

  const loadFlavor = useCallback((index: number) => {
    if (index === targetFlavorIndexRef.current) return;
    setActiveFlavorIndex(index);
    targetFlavorIndexRef.current = index;

    const state = transitionStateRef.current;
    if (state === "idle" || state === "in") {
      transitionStateRef.current = "out";
      transitionProgressRef.current = 0;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;

    // Lazy-init: wait for section to be near viewport (2x vh) before starting Three.js
    const section = canvas.closest("section");
    if (!section) return;

    let isActive = true;
    let scene: ReturnType<typeof initScene>["scene"];
    let camera: ReturnType<typeof initScene>["camera"];
    let renderer: ReturnType<typeof initScene>["renderer"];
    let loader: GLTFLoader;
    let dracoLoader: DRACOLoader;
    let particles: ReturnType<typeof createParticles>;
    let startTime = 0;

    const OUT_FRAMES = 24;
    const IN_FRAMES = 36;

    function initThree() {
      if (isInitializedRef.current || !isActive) return;
      isInitializedRef.current = true;

      const isMobile = window.innerWidth < 768;
      const sc = initScene(canvas!);
      scene = sc.scene;
      camera = sc.camera;
      renderer = sc.renderer;

      loader = new GLTFLoader();
      dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("/draco/");
      loader.setDRACOLoader(dracoLoader);

      const ambient = new THREE.AmbientLight(0xfff5e6, 0.7);
      scene.add(ambient);

      const hemi = new THREE.HemisphereLight(0xffffff, 0xe8d5c0, 0.6);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xfff8f0, 0.8);
      keyLight.position.set(4, 6, 4);
      keyLight.castShadow = true;
      const shadowSize = isMobile ? 512 : 1024;
      keyLight.shadow.mapSize.width = shadowSize;
      keyLight.shadow.mapSize.height = shadowSize;
      keyLight.shadow.radius = 12;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      scene.add(keyLight);

      const fillLight = new THREE.PointLight(0xffddaa, 0.35);
      fillLight.position.set(-3, 1, 3);
      scene.add(fillLight);

      const rimLight = new THREE.PointLight(0xffcc99, 0.25);
      rimLight.position.set(-2, 3, -4);
      scene.add(rimLight);

      particles = createParticles(scene, isMobile);
      startTime = performance.now();

      // Start render loop
      isRunningRef.current = true;
      requestAnimationFrame(loop);

      // Load first model
      activateModel(0);
    }

    function activateModel(index: number) {
      if (!isActive) return;
      const path = getFlavorModelPath(index);
      if (!path) return;

      const cached = parsedCacheRef.current.get(path);
      if (cached) {
        nextModelRef.current = cached.group;
        nextTargetScaleRef.current = cached.targetScale;
        cached.group.scale.setScalar(0);
        cached.group.rotation.set(0, 0, 0);
        scene.add(cached.group);
        transitionStateRef.current = "in";
        transitionProgressRef.current = 1;
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      loader.load(
        path,
        (gltf) => {
          if (!isActive) return;
          const model = gltf.scene;
          const targetScale = setupModel(model, window.innerWidth < 768);
          parsedCacheRef.current.set(path, { group: model, targetScale });

          nextModelRef.current = model;
          nextTargetScaleRef.current = targetScale;
          model.scale.setScalar(0);
          model.rotation.set(0, 0, 0);
          scene.add(model);
          transitionStateRef.current = "in";
          transitionProgressRef.current = 1;
          setIsLoading(false);
        },
        undefined,
        (error) => {
          console.error("[ChocoScene] Load error:", path, error);
          if (isActive) setIsLoading(false);
        }
      );
    }

    const onMouseMove = (e: MouseEvent) => {
      targetMouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onResize = () => {
      if (renderer && camera && canvas) {
        resizeScene({ scene, camera, renderer }, canvas.offsetWidth, canvas.offsetHeight);
      }
    };

    const loop = () => {
      if (!isRunningRef.current) return;
      rafRef.current = requestAnimationFrame(loop);
      const time = (performance.now() - startTime) / 1000;

      const sp = scrollRef.current;
      const isScrolling = Math.abs(sp - lastScrollRef.current) > 0.0002;
      lastScrollRef.current = sp;

      const state = transitionStateRef.current;

      if (state === "out") {
        transitionProgressRef.current += 1 / OUT_FRAMES;
        if (transitionProgressRef.current >= 1) {
          transitionProgressRef.current = 1;
          if (currentModelRef.current) {
            scene.remove(currentModelRef.current);
            currentModelRef.current = null;
          }
          transitionStateRef.current = "loading";
          activateModel(targetFlavorIndexRef.current);
        }
        if (currentModelRef.current) {
          const t = easeOutCubic(transitionProgressRef.current);
          currentModelRef.current.scale.setScalar(currentTargetScaleRef.current * (1 - t));
        }
      }

      if (state === "in") {
        transitionProgressRef.current -= 1 / IN_FRAMES;
        if (transitionProgressRef.current <= 0) {
          transitionProgressRef.current = 0;
          transitionStateRef.current = "idle";
          currentModelRef.current = nextModelRef.current;
          currentTargetScaleRef.current = nextTargetScaleRef.current;
          nextModelRef.current = null;
        }
        if (nextModelRef.current) {
          const t = easeOutCubic(1 - transitionProgressRef.current);
          nextModelRef.current.scale.setScalar(nextTargetScaleRef.current * t);
        }
      }

      const phases = computePhases(sp, time);

      const activeModel = state === "in" ? nextModelRef.current : currentModelRef.current;
      if (activeModel) {
        const baseY = phases.barY;
        activeModel.position.y = lerp(activeModel.position.y, baseY + Y_OFFSET, 0.1);
        activeModel.rotation.x = lerp(activeModel.rotation.x, phases.barRotX, 0.1);
        activeModel.rotation.y = lerp(activeModel.rotation.y, phases.barRotY, 0.1);

        if (state === "idle" && !isScrolling) {
          mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.06;
          mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.06;
          activeModel.rotation.x += mouseRef.current.y * 0.05;
          activeModel.rotation.y += mouseRef.current.x * 0.05;
        }
      }

      camera.position.z = lerp(camera.position.z, phases.camZ, 0.08);
      camera.position.x = lerp(camera.position.x, phases.camX, 0.08);
      camera.position.y = lerp(camera.position.y, phases.camY, 0.08);
      camera.lookAt(0, 0, 0);

      particles.sparklesActive = false;
      updateParticles(particles, time, activeModel?.position ?? new THREE.Vector3());

      renderer.render(scene, camera);
    };

    // IntersectionObserver: init Three.js only when section is within 2 viewport heights
    const initObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInitializedRef.current) {
          initThree();
          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("resize", onResize);
        }
      },
      { rootMargin: "200% 0px 200% 0px" }
    );
    initObserver.observe(section);

    // VisibilityObserver: pause/resume rAF loop when section enters/leaves viewport
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        if (!isInitializedRef.current) return;
        if (entry.isIntersecting) {
          if (!isRunningRef.current) {
            isRunningRef.current = true;
            rafRef.current = requestAnimationFrame(loop);
          }
        } else {
          isRunningRef.current = false;
          cancelAnimationFrame(rafRef.current);
        }
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(section);

    return () => {
      isActive = false;
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      initObserver.disconnect();
      visibilityObserver.disconnect();
      if (dracoLoader) dracoLoader.dispose();
      if (currentModelRef.current && scene) scene.remove(currentModelRef.current);
      if (nextModelRef.current && scene) scene.remove(nextModelRef.current);
      const parsedCache = parsedCacheRef.current;
      parsedCache.forEach(({ group }) => {
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material?.dispose();
            }
          }
        });
      });
      parsedCache.clear();
      if (particles) disposeParticles(particles);
      if (scene && camera && renderer) disposeScene({ scene, camera, renderer });
    };
  }, []);

  return { canvasRef, isLoading, loadFlavor, activeFlavorIndex, scrollRef };
}

import * as THREE from "three";

export interface ParticleSystems {
  goldDust: THREE.Points;
  sparkles: THREE.Points;
  sparklesActive: boolean;
}

export function createParticles(scene: THREE.Scene, isMobile: boolean): ParticleSystems {
  const sparkleCount = isMobile ? 20 : 60;
  const dustCount = 30;

  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 12;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
  }
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xffd700, size: 0.04, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const goldDust = new THREE.Points(dustGeo, dustMat);
  scene.add(goldDust);

  const sparkGeo = new THREE.BufferGeometry();
  const sparkPos = new Float32Array(sparkleCount * 3);
  for (let i = 0; i < sparkleCount; i++) {
    sparkPos[i * 3] = (Math.random() - 0.5) * 3;
    sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 2;
    sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 3;
  }
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));

  const vertLines = [
    "attribute float size;",
    "varying float vAlpha;",
    "uniform float uTime;",
    "void main() {",
    "  vec3 pos = position;",
    "  pos.y += sin(uTime * 1.5 + position.x * 3.0) * 0.08;",
    "  pos.x += cos(uTime * 1.2 + position.z * 2.0) * 0.05;",
    "  vec4 mv = modelViewMatrix * vec4(pos, 1.0);",
    "  gl_PointSize = (4.0 + sin(uTime + position.y * 5.0) * 2.0) * (10.0 / -mv.z);",
    "  vAlpha = 0.6 + 0.4 * sin(uTime * 3.0 + position.x * 10.0);",
    "  gl_Position = projectionMatrix * mv;",
    "}",
  ];

  const fragLines = [
    "uniform vec3 uColor;",
    "varying float vAlpha;",
    "void main() {",
    "  float d = length(gl_PointCoord - vec2(0.5));",
    "  if (d > 0.5) discard;",
    "  float glow = 1.0 - smoothstep(0.0, 0.5, d);",
    "  gl_FragColor = vec4(uColor, vAlpha * glow);",
    "}",
  ];

  const sparkMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0xd4a017) },
    },
    vertexShader: vertLines.join("\n"),
    fragmentShader: fragLines.join("\n"),
  });
  const sparkles = new THREE.Points(sparkGeo, sparkMat);
  sparkles.visible = false;
  scene.add(sparkles);

  return { goldDust, sparkles, sparklesActive: false };
}

export function updateParticles(
  particles: ParticleSystems,
  time: number,
  barPosition: THREE.Vector3
): void {
  const dustPos = particles.goldDust.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < dustPos.length / 3; i++) {
    dustPos[i * 3 + 1] += 0.002;
    if (dustPos[i * 3 + 1] > 6) dustPos[i * 3 + 1] = -6;
  }
  particles.goldDust.geometry.attributes.position.needsUpdate = true;

  if (particles.sparklesActive) {
    particles.sparkles.visible = true;
    (particles.sparkles.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
    particles.sparkles.position.copy(barPosition);
  } else {
    particles.sparkles.visible = false;
  }
}

export function disposeParticles(particles: ParticleSystems) {
  particles.goldDust.geometry.dispose();
  (particles.goldDust.material as THREE.Material).dispose();
  particles.sparkles.geometry.dispose();
  (particles.sparkles.material as THREE.Material).dispose();
}

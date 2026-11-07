"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { LUMEN_PALETTE } from "@/lib/lumen-visuals";
import type { LumenExpression, LumenMood, LumenReaction } from "@/lib/types";

export type LumenGaze = MutableRefObject<{ x: number; y: number }>;
const INK = "#302640";
const FACE: Record<LumenExpression, { open: number; smile: number; round: number; tilt: number; brow: number }> = {
  calm: { open: 1, smile: 0.045, round: 0, tilt: 0, brow: 0 },
  warm: { open: 0.9, smile: 0.09, round: 0, tilt: -0.07, brow: 0.12 },
  tender: { open: 0.64, smile: -0.025, round: 0, tilt: 0.1, brow: -0.32 },
  curious: { open: 1.18, smile: 0.02, round: 0.045, tilt: -0.13, brow: 0.28 },
  content: { open: 0.7, smile: 0.11, round: 0, tilt: 0.04, brow: 0.05 },
  radiant: { open: 0.12, smile: 0.14, round: 0.065, tilt: -0.045, brow: 0.1 },
};

// Shared displacement for the physical surface and the face anchors. Normals
// are reconstructed on the GPU so reflections follow the sculpted silhouette.
const sculptGLSL = /* glsl */ `
  uniform float uLumenTime;
  uniform float uLumenEnergy;
  varying vec3 vLumenPosition;
  vec3 sculptLumen(vec3 p) {
    float swell = 0.10 * sin(p.y * 2.5 + p.x * 1.6 + uLumenTime * 0.48) * sin(p.z * 2.0 + 1.2);
    float ripple = 0.035 * sin(p.x * 4.5 - p.y * 2.0 + uLumenTime * 0.7) * sin(p.z * 3.0 + uLumenTime * 0.35);
    p *= 1.0 + (swell + ripple) * uLumenEnergy;
    p.x *= 1.08;
    p.y *= 1.04;
    p.x += 0.045 * (p.y * p.y - 0.4);
    return p;
  }
`;

function surfacePoint(x: number, y: number, time: number, energy: number, target: THREE.Vector3) {
  const z = Math.sqrt(Math.max(0.01, 1 - x * x - y * y));
  const swell = 0.1 * Math.sin(y * 2.5 + x * 1.6 + time * 0.48) * Math.sin(z * 2 + 1.2);
  const ripple = 0.035 * Math.sin(x * 4.5 - y * 2 + time * 0.7) * Math.sin(z * 3 + time * 0.35);
  const radius = 1 + (swell + ripple) * energy;
  const sy = y * radius * 1.04;
  return target.set(x * radius * 1.08 + 0.045 * (sy * sy - 0.4), sy, z * radius + 0.032);
}

function createPearlMaterial() {
  const uniforms = {
    uLumenTime: { value: 0 }, uLumenEnergy: { value: 1 },
    uLumenShadow: { value: new THREE.Color(LUMEN_PALETTE.calm.shadow) },
    uLumenGlow: { value: new THREE.Color(LUMEN_PALETTE.calm.glow) },
  };
  const material = new THREE.MeshPhysicalMaterial({
    color: LUMEN_PALETTE.calm.body, roughness: 0.27, metalness: 0.06,
    emissive: LUMEN_PALETTE.calm.body, emissiveIntensity: 0.16,
    clearcoat: 1, clearcoatRoughness: 0.2, iridescence: 0.4, iridescenceIOR: 1.34,
    iridescenceThicknessRange: [160, 420], sheen: 0.45,
    sheenColor: new THREE.Color("#e1d3ff"), sheenRoughness: 0.5, envMapIntensity: 1.15,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${sculptGLSL}`)
      .replace("#include <beginnormal_vertex>", /* glsl */ `
        vec3 n = normalize(position);
        vec3 tangent = normalize(cross(n, abs(n.y) > 0.99 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
        vec3 bitangent = normalize(cross(n, tangent));
        vec3 sculpted = sculptLumen(position);
        vec3 objectNormal = normalize(cross(
          sculptLumen(normalize(position + tangent * 0.002)) - sculpted,
          sculptLumen(normalize(position + bitangent * 0.002)) - sculpted
        ));
      `)
      .replace("#include <begin_vertex>", "vec3 transformed = sculpted; vLumenPosition = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", /* glsl */ `
        #include <common>
        uniform vec3 uLumenShadow;
        uniform vec3 uLumenGlow;
        varying vec3 vLumenPosition;
      `)
      .replace("#include <color_fragment>", /* glsl */ `
        #include <color_fragment>
        float pearl = smoothstep(-0.65, 0.95, vLumenPosition.y + vLumenPosition.x * 0.35);
        diffuseColor.rgb = mix(uLumenShadow, diffuseColor.rgb, 0.42 + pearl * 0.58);
        float opal = pow(max(0., sin(vLumenPosition.x * 2.8 + vLumenPosition.y * 2.)), 3.);
        diffuseColor.rgb = mix(diffuseColor.rgb, uLumenGlow, opal * 0.28);
      `);
  };
  material.customProgramCacheKey = () => "lumen-pearl-v1";
  return { material, uniforms };
}

function makeArc(points: THREE.Vector3[], radius = 0.014) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 32, radius, 8, false);
}

export function LumenScene({ mood, expression, reaction, reactKey, pulse, gaze, reduced, active }: {
  mood: LumenMood; expression: LumenExpression; reaction: LumenReaction;
  reactKey: number; pulse: number; gaze: LumenGaze; reduced: boolean; active: boolean;
}) {
  const root = useRef<THREE.Group>(null);
  const faceRoot = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.Group>(null);
  const rightEye = useRef<THREE.Group>(null);
  const leftBrow = useRef<THREE.Mesh>(null);
  const rightBrow = useRef<THREE.Mesh>(null);
  const leftCheek = useRef<THREE.Mesh>(null);
  const rightCheek = useRef<THREE.Mesh>(null);
  const satellites = useRef<THREE.Group>(null);
  const rippleRing = useRef<THREE.Mesh>(null);
  const { material, uniforms } = useMemo(createPearlMaterial, []);
  const targetColors = useMemo(() => ({
    body: new THREE.Color(LUMEN_PALETTE[mood].body),
    shadow: new THREE.Color(LUMEN_PALETTE[mood].shadow),
    glow: new THREE.Color(LUMEN_PALETTE[mood].glow),
  }), [mood]);
  const mouth = useMemo(() => makeArc(Array.from({ length: 33 }, (_, i) =>
    new THREE.Vector3((i / 32 - 0.5) * 0.28, -0.18 - Math.sin(i / 32 * Math.PI) * 0.05, 1)), 0.016), []);
  const brow = useMemo(() => makeArc([
    new THREE.Vector3(-0.085, 0, 0), new THREE.Vector3(0, 0.023, 0), new THREE.Vector3(0.085, 0, 0),
  ], 0.012), []);
  const happyEye = useMemo(() => makeArc([
    new THREE.Vector3(-0.073, -0.014, 0.015), new THREE.Vector3(0, 0.035, 0.022), new THREE.Vector3(0.073, -0.014, 0.015),
  ], 0.023), []);
  const animation = useRef({
    time: 0, reactionAge: 10, lastReact: reactKey, lastPulse: pulse,
    open: 0.7, smile: 0.1, round: 0, tilt: 0, brow: 0, energy: 1,
    gazeX: 0, gazeY: 0, nextBlink: 3.2, blinkAge: 1,
  });
  const point = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => {
    material.dispose(); mouth.dispose(); brow.dispose(); happyEye.dispose();
  }, [material, mouth, brow, happyEye]);

  useFrame((_, rawDelta) => {
    if (!active) return;
    const delta = Math.min(rawDelta, 0.05);
    const a = animation.current;
    if (!reduced) a.time += delta;
    const t = a.time;
    const ease = reduced ? 1 : 1 - Math.exp(-delta * 5);
    const face = FACE[expression];
    a.open = THREE.MathUtils.lerp(a.open, face.open, ease);
    a.smile = THREE.MathUtils.lerp(a.smile, face.smile, ease);
    a.round = THREE.MathUtils.lerp(a.round, face.round, ease);
    a.tilt = THREE.MathUtils.lerp(a.tilt, face.tilt, ease);
    a.brow = THREE.MathUtils.lerp(a.brow, face.brow, ease);
    a.energy = THREE.MathUtils.lerp(a.energy, expression === "tender" ? 0.55 : expression === "radiant" ? 1.2 : 1, ease);
    a.gazeX = THREE.MathUtils.lerp(a.gazeX, reduced ? 0 : gaze.current.x, ease);
    a.gazeY = THREE.MathUtils.lerp(a.gazeY, reduced ? 0 : gaze.current.y, ease);
    const colorEase = reduced ? 1 : ease * 0.5;
    material.color.lerp(targetColors.body, colorEase);
    material.emissive.copy(material.color);
    uniforms.uLumenShadow.value.lerp(targetColors.shadow, colorEase);
    uniforms.uLumenGlow.value.lerp(targetColors.glow, colorEase);
    uniforms.uLumenTime.value = t;
    uniforms.uLumenEnergy.value = a.energy;
    if (a.lastReact !== reactKey || a.lastPulse !== pulse) {
      a.lastReact = reactKey; a.lastPulse = pulse; a.reactionAge = 0;
    }
    a.reactionAge += delta;
    const age = a.reactionAge;
    const spring = reduced ? 0 : Math.sin(age * 12) * Math.exp(-age * 4);
    const bloom = reduced ? 0 : Math.sin(Math.min(1, age / 1.4) * Math.PI);
    const squeeze = reaction === "squeeze" ? spring * 0.2 : reaction === "soften" ? bloom * 0.065 : 0;
    if (root.current) {
      const breath = reduced ? 1 : 1 + Math.sin(t * 1.25) * 0.018;
      const expand = reaction === "bloom" ? bloom * 0.07 : 0;
      root.current.scale.set(breath * (1 + squeeze + expand), breath * (1 - squeeze + expand), breath);
      root.current.position.y = reduced ? 0 : Math.sin(t * 0.8) * 0.055 + (reaction === "bloom" ? bloom * 0.12 : 0);
      root.current.rotation.set(a.gazeY * 0.07 + (reaction === "nod" ? spring * 0.18 : 0), a.gazeX * 0.12, a.tilt + (reduced ? 0 : Math.sin(t * 0.6) * 0.025));
    }
    a.nextBlink -= delta; a.blinkAge += delta;
    if (a.nextBlink < 0 && !reduced) { a.blinkAge = 0; a.nextBlink = 3.1 + Math.sin(t * 1.7) * 1.2; }
    const blink = reduced || a.blinkAge > 0.2 ? 1 : 1 - Math.sin(a.blinkAge / 0.2 * Math.PI) * 0.96;
    if (faceRoot.current) faceRoot.current.position.set(a.gazeX * 0.045, -a.gazeY * 0.035, 0);
    [leftEye.current, rightEye.current].forEach((eye, index) => {
      if (!eye) return;
      const side = index === 0 ? -1 : 1;
      surfacePoint(side * 0.285, 0.075, t, a.energy, eye.position);
      eye.children[0].visible = expression !== "radiant";
      eye.children[1].visible = expression === "radiant";
      eye.children[0].scale.y = Math.max(0.045, a.open * blink * (expression === "curious" && side === 1 ? 0.84 : 1));
      eye.rotation.z = expression === "tender" ? side * -0.13 : 0;
    });
    [leftBrow.current, rightBrow.current].forEach((mesh, index) => {
      if (!mesh) return;
      const side = index === 0 ? -1 : 1;
      surfacePoint(side * 0.285, 0.32 + (expression === "curious" && side === -1 ? 0.06 : 0), t, a.energy, mesh.position);
      mesh.rotation.z = side * a.brow;
    });
    [leftCheek.current, rightCheek.current].forEach((mesh, index) => {
      if (mesh) surfacePoint(index === 0 ? -0.49 : 0.49, -0.115, t, a.energy, mesh.position);
    });
    // Morph a single preallocated lip mesh; it stays anchored to the skin.
    const vertices = mouth.attributes.position as THREE.BufferAttribute;
    const width = expression === "radiant" ? 0.19 : 0.135;
    for (let segment = 0; segment <= 32; segment++) {
      const u = segment / 32;
      surfacePoint((u - 0.5) * width * 2, -0.18 - Math.sin(u * Math.PI) * a.smile, t, a.energy, point);
      for (let radial = 0; radial <= 8; radial++) {
        const angle = radial / 8 * Math.PI * 2;
        vertices.setXYZ(segment * 9 + radial, point.x, point.y + Math.cos(angle) * (0.016 + a.round * Math.sin(u * Math.PI)), point.z + 0.012 + Math.sin(angle) * 0.016);
      }
    }
    vertices.needsUpdate = true;
    if (satellites.current && !reduced) satellites.current.children.forEach((satellite, i) => {
      satellite.position.y = Math.sin(t * 0.65 + i * 2) * 0.07;
      satellite.rotation.y += delta * 0.14;
    });
    if (rippleRing.current) {
      rippleRing.current.visible = !reduced && age < 1.4 && reaction !== "none";
      if (rippleRing.current.visible) {
        rippleRing.current.scale.setScalar(1 + age * 0.7);
        (rippleRing.current.material as THREE.MeshBasicMaterial).opacity = (1 - age / 1.4) * 0.22;
      }
    }
  });

  return <>
    <ambientLight intensity={0.55} />
    <directionalLight position={[-3, 5, 4]} intensity={2.3} color="#fff4e9" />
    <pointLight position={[3, -1, 2]} intensity={4} color="#c4b9ff" />
    {/* Local studio lighting: no HDR download or third-party asset dependency. */}
    <Environment resolution={128} frames={1}>
      <Lightformer position={[-3, 3, 4]} scale={[3, 5, 1]} intensity={3.5} color="#fff9f4" target={[0, 0, 0]} />
      <Lightformer position={[4, 1, 2]} scale={[1, 4, 1]} intensity={2} color="#dacbff" target={[0, 0, 0]} />
      <Lightformer position={[0, -3, 1]} scale={[4, 1, 1]} intensity={1.2} color="#bdf4e0" target={[0, 0, 0]} />
    </Environment>
    <group ref={root}>
      <mesh material={material}><sphereGeometry args={[1, 96, 64]} /></mesh>
      <group ref={faceRoot}>
        <Eye eyeRef={leftEye} happyGeometry={happyEye} />
        <Eye eyeRef={rightEye} happyGeometry={happyEye} />
        <mesh ref={leftBrow} geometry={brow}><meshBasicMaterial color={INK} transparent opacity={0.65} /></mesh>
        <mesh ref={rightBrow} geometry={brow}><meshBasicMaterial color={INK} transparent opacity={0.65} /></mesh>
        <mesh geometry={mouth}><meshBasicMaterial color={INK} /></mesh>
        <mesh ref={leftCheek} scale={[0.12, 0.055, 0.015]}>
          <sphereGeometry args={[1, 24, 16]} /><meshBasicMaterial color={LUMEN_PALETTE[mood].blush} transparent opacity={0.6} depthWrite={false} />
        </mesh>
        <mesh ref={rightCheek} scale={[0.12, 0.055, 0.015]}>
          <sphereGeometry args={[1, 24, 16]} /><meshBasicMaterial color={LUMEN_PALETTE[mood].blush} transparent opacity={0.6} depthWrite={false} />
        </mesh>
      </group>
    </group>
    <group ref={satellites}>
      <group><Pearl position={[-1.43, 0.65, -0.3]} scale={0.12} color={LUMEN_PALETTE[mood].body} /></group>
      <group><Pearl position={[1.38, -0.38, 0.15]} scale={0.075} color={LUMEN_PALETTE[mood].glow} /></group>
      <group><Pearl position={[0.94, 1.18, -0.45]} scale={0.045} color={LUMEN_PALETTE[mood].body} /></group>
    </group>
    <mesh ref={rippleRing} position={[0, 0, -0.5]} visible={false}>
      <ringGeometry args={[1.25, 1.258, 100]} />
      <meshBasicMaterial color={LUMEN_PALETTE[mood].shadow} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  </>;
}

function Pearl({ position, scale, color }: { position: [number, number, number]; scale: number; color: string }) {
  return <mesh position={position} scale={scale}>
    <sphereGeometry args={[1, 24, 24]} />
    <meshPhysicalMaterial color={color} metalness={0.2} roughness={0.15} clearcoat={1} iridescence={0.8} />
  </mesh>;
}

function Eye({ eyeRef, happyGeometry }: { eyeRef: React.RefObject<THREE.Group>; happyGeometry: THREE.TubeGeometry }) {
  return <group ref={eyeRef}>
    <group>
      <mesh scale={[0.085, 0.125, 0.048]}>
        <sphereGeometry args={[1, 32, 24]} /><meshPhysicalMaterial color={INK} roughness={0.18} clearcoat={1} envMapIntensity={0.7} />
      </mesh>
      <mesh position={[-0.026, 0.047, 0.042]} scale={[0.022, 0.03, 0.01]}>
        <sphereGeometry args={[1, 16, 12]} /><meshBasicMaterial color="#fff9fc" />
      </mesh>
      <mesh position={[0.025, -0.037, 0.044]} scale={0.01}>
        <sphereGeometry args={[1, 12, 12]} /><meshBasicMaterial color="#c5b4ed" />
      </mesh>
    </group>
    <mesh geometry={happyGeometry} visible={false}><meshBasicMaterial color={INK} /></mesh>
  </group>;
}

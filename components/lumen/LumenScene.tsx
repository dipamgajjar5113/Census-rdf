"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { damp, dampC } from "maath/easing";
import {
  useEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react";
import * as THREE from "three";
import { LUMEN_PALETTE } from "@/lib/lumen-visuals";
import { blinkOpenness, LUMEN_POSES, reactionPose } from "@/lib/lumen-motion";
import type { LumenExpression, LumenMood, LumenReaction } from "@/lib/types";
import { createSeedMaterial, seedSurface } from "./lumen-material";
import {
  createLeafResources,
  disposeLeaves,
  type LeafResources,
} from "./lumen-botany";

export type LumenGaze = MutableRefObject<{ x: number; y: number }>;
export type LumenQuality = "low" | "balanced" | "high";
const INK = "#30392a";

function arc(points: THREE.Vector3[], radius = 0.012) {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    32,
    radius,
    8,
    false,
  );
}

export function LumenScene({
  mood,
  expression,
  reaction,
  reactKey,
  pulse,
  gaze,
  reduced,
  active,
  hero,
  quality,
}: {
  mood: LumenMood;
  expression: LumenExpression;
  reaction: LumenReaction;
  reactKey: number;
  pulse: number;
  gaze: LumenGaze;
  reduced: boolean;
  active: boolean;
  hero: boolean;
  quality: LumenQuality;
}) {
  const root = useRef<THREE.Group>(null);
  const crown = useRef<THREE.Group>(null);
  const leftLeaf = useRef<THREE.Group>(null);
  const rightLeaf = useRef<THREE.Group>(null);
  const leftEye = useRef<THREE.Group>(null);
  const rightEye = useRef<THREE.Group>(null);
  const leftBrow = useRef<THREE.Mesh>(null);
  const rightBrow = useRef<THREE.Mesh>(null);
  const leftCheek = useRef<THREE.Mesh>(null);
  const rightCheek = useRef<THREE.Mesh>(null);
  const { material, depthMaterial, uniforms } = useMemo(createSeedMaterial, []);
  const cotyledons = useMemo(() => createLeafResources(false), []);
  const colors = useMemo(
    () => ({
      body: new THREE.Color(LUMEN_PALETTE[mood].body),
      shadow: new THREE.Color(LUMEN_PALETTE[mood].shadow),
      glow: new THREE.Color(LUMEN_PALETTE[mood].glow),
    }),
    [mood],
  );
  const point = useMemo(() => new THREE.Vector3(), []);
  const mouth = useMemo(
    () =>
      arc(
        Array.from(
          { length: 33 },
          (_, i) =>
            new THREE.Vector3(
              (i / 32 - 0.5) * 0.28,
              -0.18 - Math.sin((i / 32) * Math.PI) * 0.05,
              0.9,
            ),
        ),
        0.014,
      ),
    [],
  );
  const brow = useMemo(
    () =>
      arc(
        [
          new THREE.Vector3(-0.08, 0, 0),
          new THREE.Vector3(0, 0.018, 0),
          new THREE.Vector3(0.08, 0, 0),
        ],
        0.009,
      ),
    [],
  );
  const happyEye = useMemo(
    () =>
      arc(
        [
          new THREE.Vector3(-0.07, -0.01, 0.025),
          new THREE.Vector3(0, 0.035, 0.025),
          new THREE.Vector3(0.07, -0.01, 0.025),
        ],
        0.02,
      ),
    [],
  );
  const stalk = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-0.035, 0.18, 0),
          new THREE.Vector3(0.035, 0.32, -0.025),
        ]),
        18,
        0.018,
        7,
      ),
    [],
  );
  const kinetics = useRef({
    ...LUMEN_POSES.content,
    time: 0,
    gazeX: 0,
    gazeY: 0,
    wave: 0,
    glow: 0,
    leafLag: 0.2,
    reactionAge: 5,
    lastReact: reactKey,
    lastPulse: pulse,
    nextBlink: 2.8,
    blinkAge: 1,
  });

  useEffect(
    () => () => {
      material.dispose();
      depthMaterial.dispose();
      mouth.dispose();
      brow.dispose();
      happyEye.dispose();
      stalk.dispose();
      disposeLeaves(cotyledons);
    },
    [material, depthMaterial, mouth, brow, happyEye, stalk, cotyledons],
  );

  useFrame((_, rawDelta) => {
    if (!active) return;
    const delta = Math.min(rawDelta, 0.05);
    const a = kinetics.current;
    if (!reduced) a.time += delta;
    const pose = LUMEN_POSES[expression];
    const keys = [
      "open",
      "smile",
      "round",
      "tilt",
      "brow",
      "happy",
      "energy",
      "lean",
      "leafOpen",
    ] as const;
    for (const key of keys) {
      if (reduced) a[key] = pose[key];
      else damp(a, key, pose[key], key === "leafOpen" ? 0.5 : 0.3, delta);
    }
    if (reduced) {
      a.gazeX = 0;
      a.gazeY = 0;
      a.leafLag = a.leafOpen;
    } else {
      // The eyes lead; the crown follows more slowly, like a real soft stem.
      damp(a, "gazeX", gaze.current.x, 0.23, delta);
      damp(a, "gazeY", gaze.current.y, 0.26, delta);
      damp(a, "leafLag", a.leafOpen, 0.45, delta);
    }
    for (const [uniform, color] of [
      [uniforms.uBody, colors.body],
      [uniforms.uShadow, colors.shadow],
      [uniforms.uGlow, colors.glow],
    ] as const) {
      if (reduced) uniform.value.copy(color);
      else dampC(uniform.value, color, 0.6, delta);
    }
    if (a.lastReact !== reactKey || a.lastPulse !== pulse) {
      a.lastReact = reactKey;
      a.lastPulse = pulse;
      a.reactionAge = 0;
      if (!reduced) {
        a.blinkAge = 0;
        a.nextBlink = 3.1;
      }
    }
    a.reactionAge += delta;
    const action = reactionPose(reaction, a.reactionAge);
    a.wave = reduced ? 0 : action.wave;
    a.glow = reduced ? 0 : action.glow;
    uniforms.uTime.value = a.time;
    uniforms.uEnergy.value = a.energy;
    uniforms.uLight.value = a.glow;

    const breath = reduced ? 0 : Math.sin(a.time * 0.78) * 0.018;
    const squash = reduced ? 0 : action.squash;
    if (root.current) {
      // Preserve apparent volume when the seed squishes.
      const vertical = 1 + breath - squash;
      const horizontal = 1 / Math.sqrt(Math.max(0.7, vertical));
      root.current.scale.set(horizontal, vertical, horizontal);
      root.current.position.set(
        a.gazeX * 0.018,
        -0.11 + (reduced ? 0 : Math.sin(a.time * 0.68) * 0.025 + action.rise),
        0.13 + a.lean,
      );
      root.current.rotation.set(
        a.gazeY * 0.055 + (reduced ? 0 : action.nod),
        a.gazeX * 0.12,
        a.tilt + (reduced ? 0 : Math.sin(a.time * 0.45) * 0.012),
      );
    }
    if (crown.current) {
      seedSurface(0, 0.96, a.time, a.energy, crown.current.position);
      crown.current.position.z -= 0.15;
      crown.current.rotation.set(
        0.04 + a.gazeY * 0.06,
        -0.08,
        -a.tilt * 0.5 +
          (reduced
            ? 0
            : Math.sin(a.time * 0.8 - 0.55) * 0.045 + action.squash * -0.7),
      );
    }
    if (leftLeaf.current)
      leftLeaf.current.rotation.set(
        0.18 +
          a.leafLag * 0.18 +
          (reduced ? 0 : Math.sin(a.time * 4) * a.wave * 0.06),
        -0.25,
        0.95 + a.leafLag * 0.2,
      );
    if (rightLeaf.current)
      rightLeaf.current.rotation.set(
        -0.12 -
          a.leafLag * 0.2 +
          (reduced ? 0 : Math.sin(a.time * 4 - 0.6) * a.wave * 0.06),
        0.34,
        -0.65 - a.leafLag * 0.24,
      );

    if (!reduced) {
      a.nextBlink -= delta;
      a.blinkAge += delta;
    }
    if (!reduced && a.nextBlink <= 0) {
      a.blinkAge = 0;
      a.nextBlink = 3.4 + Math.sin(a.time * 1.3) * 1.05;
    }
    const blink = reduced ? 1 : blinkOpenness(a.blinkAge);
    const gx = a.gazeX * 0.04;
    const gy = -a.gazeY * 0.028;
    [leftEye.current, rightEye.current].forEach((eye, index) => {
      if (!eye) return;
      const side = index ? 1 : -1;
      seedSurface(
        side * 0.275 + gx,
        0.045 + gy,
        a.time,
        a.energy,
        eye.position,
      );
      eye.rotation.y = side * 0.12;
      eye.rotation.z = expression === "tender" ? side * -0.1 : 0;
      eye.children[0].scale.y = Math.max(
        0.015,
        a.open *
          blink *
          (1 - a.happy) *
          (expression === "curious" && side === 1 ? 0.84 : 1),
      );
      eye.children[0].visible = a.happy < 0.985;
      eye.children[1].visible = a.happy > 0.02;
      eye.children[1].scale.y = Math.max(0.01, a.happy);
    });
    [leftBrow.current, rightBrow.current].forEach((mesh, index) => {
      if (!mesh) return;
      const side = index ? 1 : -1;
      seedSurface(
        side * 0.275 + gx,
        0.27 + gy + (expression === "curious" && side === -1 ? 0.045 : 0),
        a.time,
        a.energy,
        mesh.position,
      );
      mesh.rotation.z = side * a.brow;
    });
    [leftCheek.current, rightCheek.current].forEach((mesh, index) => {
      if (!mesh) return;
      const side = index ? 1 : -1;
      seedSurface(
        side * 0.46 + gx,
        -0.14 + gy,
        a.time,
        a.energy,
        mesh.position,
      );
      mesh.rotation.y = side * 0.32;
    });
    const positions = mouth.attributes.position as THREE.BufferAttribute;
    const width = 0.135 + a.happy * 0.03;
    for (let segment = 0; segment <= 32; segment++) {
      const u = segment / 32;
      seedSurface(
        (u - 0.5) * width * 2 + gx,
        -0.19 - Math.sin(u * Math.PI) * a.smile + gy,
        a.time,
        a.energy,
        point,
      );
      for (let radial = 0; radial <= 8; radial++) {
        const angle = (radial / 8) * Math.PI * 2;
        positions.setXYZ(
          segment * 9 + radial,
          point.x,
          point.y + Math.cos(angle) * (0.014 + a.round * Math.sin(u * Math.PI)),
          point.z + 0.009 + Math.sin(angle) * 0.014,
        );
      }
    }
    positions.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight
        position={[-3.5, 5, 5]}
        intensity={2.4}
        color="#fff3df"
        castShadow={quality !== "low"}
        shadow-mapSize={[
          quality === "high" ? 1024 : 512,
          quality === "high" ? 1024 : 512,
        ]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-bias={-0.0005}
        shadow-normalBias={0.025}
        shadow-radius={3}
      />
      <directionalLight position={[3, 1, -3]} intensity={1.6} color="#dceab5" />
      <Environment resolution={128} frames={1}>
        <Lightformer
          position={[-3, 3, 4]}
          scale={[3, 5, 1]}
          intensity={3}
          color="#fff8eb"
          target={[0, 0, 0]}
        />
        <Lightformer
          position={[4, 1, 2]}
          scale={[0.8, 4, 1]}
          intensity={2.2}
          color="#dfebc8"
          target={[0, 0, 0]}
        />
        <Lightformer
          position={[0, -3, 1]}
          scale={[4, 1, 1]}
          intensity={0.9}
          color="#dae5bc"
          target={[0, 0, 0]}
        />
      </Environment>
      <group ref={root} position={[0, -0.11, 0.13]}>
        <mesh
          material={material}
          customDepthMaterial={depthMaterial}
          castShadow
          receiveShadow
        >
          <sphereGeometry
            args={[1, quality === "low" ? 48 : 80, quality === "low" ? 32 : 56]}
          />
        </mesh>
        <group ref={crown} position={[0, 1, 0]}>
          <mesh geometry={stalk} castShadow>
            <meshStandardMaterial color="#74865c" roughness={0.48} />
          </mesh>
          <group
            ref={leftLeaf}
            position={[0.005, 0.23, -0.015]}
            scale={[0.44, 0.5, 0.5]}
            rotation={[0.18, -0.25, 1]}
          >
            <CrownLeaf resources={cotyledons} />
          </group>
          <group
            ref={rightLeaf}
            position={[0.025, 0.29, -0.025]}
            scale={[0.43, 0.56, 0.5]}
            rotation={[-0.12, 0.34, -0.7]}
          >
            <CrownLeaf resources={cotyledons} />
          </group>
          <mesh position={[-0.29, 0.46, 0.09]} scale={0.025}>
            <sphereGeometry args={[1, 16, 12]} />
            <meshPhysicalMaterial
              color="#eff1d2"
              clearcoat={1}
              roughness={0.08}
            />
          </mesh>
        </group>
        <Eye eyeRef={leftEye} happyGeometry={happyEye} />
        <Eye eyeRef={rightEye} happyGeometry={happyEye} />
        <mesh ref={leftBrow} geometry={brow}>
          <meshBasicMaterial color={INK} transparent opacity={0.7} />
        </mesh>
        <mesh ref={rightBrow} geometry={brow}>
          <meshBasicMaterial color={INK} transparent opacity={0.7} />
        </mesh>
        <mesh geometry={mouth}>
          <meshBasicMaterial color={INK} />
        </mesh>
        <Cheek cheekRef={leftCheek} color={LUMEN_PALETTE[mood].blush} />
        <Cheek cheekRef={rightCheek} color={LUMEN_PALETTE[mood].blush} />
      </group>
      {hero && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -1.86, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}
    </>
  );
}

function CrownLeaf({ resources }: { resources: LeafResources }) {
  return (
    <group dispose={null}>
      <mesh
        geometry={resources.geometry}
        material={resources.material}
        castShadow
        receiveShadow
      />
      <mesh geometry={resources.veins} material={resources.veinMaterial} />
    </group>
  );
}

function Cheek({
  cheekRef,
  color,
}: {
  cheekRef: RefObject<THREE.Mesh>;
  color: string;
}) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color(color) } }),
    [color],
  );
  return (
    <mesh ref={cheekRef} scale={[0.15, 0.075, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader="varying vec2 vUV; void main() { vUV=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }"
        fragmentShader={
          /* glsl */ `
        varying vec2 vUV;
        uniform vec3 uColor;
        void main() {
          float a = 1. - smoothstep(.12,.5,length(vUV-.5));
          gl_FragColor = vec4(uColor,a*.34);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `
        }
      />
    </mesh>
  );
}

function Eye({
  eyeRef,
  happyGeometry,
}: {
  eyeRef: RefObject<THREE.Group>;
  happyGeometry: THREE.TubeGeometry;
}) {
  return (
    <group ref={eyeRef}>
      <group>
        <mesh scale={[0.079, 0.111, 0.043]}>
          <sphereGeometry args={[1, 24, 20]} />
          <meshPhysicalMaterial
            color={INK}
            roughness={0.16}
            clearcoat={1}
            envMapIntensity={0.6}
          />
        </mesh>
        <mesh position={[-0.024, 0.039, 0.037]} scale={[0.018, 0.023, 0.009]}>
          <sphereGeometry args={[1, 12, 10]} />
          <meshBasicMaterial color="#fffbed" />
        </mesh>
        <mesh position={[0.022, -0.032, 0.041]} scale={0.008}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#c8d7b5" />
        </mesh>
      </group>
      <mesh geometry={happyGeometry} visible={false}>
        <meshBasicMaterial color={INK} />
      </mesh>
    </group>
  );
}

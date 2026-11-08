"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import { LumenScene, type LumenGaze, type LumenQuality } from "./LumenScene";
import type { LumenExpression, LumenMood, LumenReaction } from "@/lib/types";

export function LumenCanvas({
  onReady,
  onLost,
  active,
  reduced,
  hero,
  ...scene
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
  onReady: () => void;
  onLost: () => void;
}) {
  const [quality, setQuality] = useState<LumenQuality>(() => {
    const device =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & {
            deviceMemory?: number;
            connection?: { saveData?: boolean };
          })
        : null;
    return device &&
      (device.connection?.saveData ||
        device.hardwareConcurrency <= 4 ||
        (device.deviceMemory && device.deviceMemory <= 4))
      ? "low"
      : "balanced";
  });
  const failed = useRef(false);
  const allowUpgrade = useRef(true);
  const dpr: number | [number, number] =
    quality === "low" ? 1 : quality === "high" ? [1, 1.75] : [1, 1.5];

  return (
    <Canvas
      dpr={dpr}
      shadows={quality !== "low" ? "soft" : false}
      frameloop={active ? (reduced ? "demand" : "always") : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "default" }}
      camera={{
        position: hero ? [0, 0.14, 5.65] : [0, 0.2, 4.9],
        fov: 40,
        near: 0.1,
        far: 24,
      }}
      onCreated={({ gl, camera }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        camera.lookAt(0, 0.08, 0);
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            failed.current = true;
            onLost();
          },
          { once: true },
        );
        gl.debug.onShaderError = (context, program, vertex, fragment) => {
          failed.current = true;
          console.error(
            "Lumen shader could not compile.",
            context.getProgramInfoLog(program),
            context.getShaderInfoLog(vertex),
            context.getShaderInfoLog(fragment),
          );
          onLost();
        };
      }}
    >
      {active && !reduced && (
        <PerformanceMonitor
          ms={350}
          iterations={6}
          bounds={() => [42, 58]}
          onIncline={() => {
            if (!allowUpgrade.current) return;
            allowUpgrade.current = false;
            setQuality((current) => (current === "low" ? "balanced" : "high"));
          }}
          onDecline={() => {
            allowUpgrade.current = false;
            setQuality((current) => (current === "high" ? "balanced" : "low"));
          }}
        />
      )}
      <Suspense fallback={null}>
        <LumenScene
          {...scene}
          hero={hero}
          quality={quality}
          reduced={reduced}
          active={active}
        />
        <SceneReady
          onReady={() => {
            if (!failed.current) onReady();
          }}
        />
      </Suspense>
    </Canvas>
  );
}

/** Keep the composed portrait visible until WebGL has actually rendered. */
function SceneReady({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  useFrame(({ invalidate }) => {
    if (frames.current >= 2) return;
    frames.current++;
    if (frames.current === 2) onReady();
    else invalidate();
  });
  return null;
}

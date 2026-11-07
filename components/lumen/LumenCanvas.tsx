"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useCallback } from "react";
import * as THREE from "three";
import { LumenScene, type LumenGaze } from "./LumenScene";
import type { LumenExpression, LumenMood, LumenReaction } from "@/lib/types";

export function LumenCanvas({ onReady, onLost, active, reduced, ...scene }: {
  mood: LumenMood; expression: LumenExpression; reaction: LumenReaction;
  reactKey: number; pulse: number; gaze: LumenGaze; reduced: boolean; active: boolean;
  onReady: () => void; onLost: () => void;
}) {
  const handleLost = useCallback((event: Event) => { event.preventDefault(); onLost(); }, [onLost]);
  // React owns the canvas node, so its context-loss listener is collected on unmount.
  return <Canvas
    dpr={[1, 1.75]}
    frameloop={active ? reduced ? "demand" : "always" : "never"}
    gl={{ antialias: true, alpha: true, powerPreference: "default" }}
    camera={{ position: [0, 0, 5.1], fov: 38 }}
    onCreated={({ gl }) => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.1;
      gl.domElement.addEventListener("webglcontextlost", handleLost, { once: true });
    }}
  >
    <Suspense fallback={null}>
      <LumenScene {...scene} reduced={reduced} active={active} />
      <SceneReady onReady={onReady} />
    </Suspense>
  </Canvas>;
}

function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => { onReady(); }, [onReady]);
  return null;
}

import assert from "node:assert/strict";
import test from "node:test";
import { Vector3 } from "three";
import { damp } from "maath/easing";
import { blinkOpenness, LUMEN_POSES, reactionPose } from "../lib/lumen-motion";
import { seedSurface } from "../components/lumen/lumen-material";
import {
  createLeafResources,
  disposeLeaves,
} from "../components/lumen/lumen-botany";
import type { LumenReaction } from "../lib/types";

test("reactions recover completely and cannot leave the character distorted", () => {
  for (const reaction of [
    "none",
    "squeeze",
    "nod",
    "soften",
    "bloom",
  ] as LumenReaction[]) {
    for (let frame = 0; frame < 400; frame++) {
      for (const value of Object.values(reactionPose(reaction, frame / 120))) {
        assert.ok(Number.isFinite(value));
        assert.ok(Math.abs(value) <= 1.01);
      }
    }
    assert.deepEqual(reactionPose(reaction, 4), {
      squash: 0,
      rise: 0,
      nod: 0,
      glow: 0,
      wave: 0,
    });
  }
  assert.ok(
    reactionPose("squeeze", 0.08).squash > 0,
    "a touch has anticipation before recovery",
  );
  assert.ok(reactionPose("bloom", 0.7).rise > 0, "a bloom lifts the character");
});

test("blinks close quickly, reopen, and stay within a valid eyelid range", () => {
  assert.equal(blinkOpenness(-1), 1);
  assert.ok(blinkOpenness(0.075) < 0.04);
  assert.equal(blinkOpenness(1), 1);
  for (let frame = 0; frame < 100; frame++) {
    const open = blinkOpenness(frame / 120);
    assert.ok(open >= 0.029 && open <= 1);
  }
});

test("empathy has lower energy than rest and keeps a gentle forward lean", () => {
  assert.ok(LUMEN_POSES.tender.energy < LUMEN_POSES.calm.energy);
  assert.ok(LUMEN_POSES.tender.lean > 0);
  assert.ok(LUMEN_POSES.tender.leafOpen < LUMEN_POSES.calm.leafOpen);
});

test("the motion smoother behaves consistently at 30, 60, and 120 Hz", () => {
  const endpoints = [30, 60, 120].map((fps) => {
    const state = { value: 0 };
    for (let frame = 0; frame < fps; frame++) {
      damp(state, "value", 1, 0.3, 1 / fps);
      assert.ok(state.value >= 0 && state.value <= 1);
    }
    return state.value;
  });
  assert.ok(Math.max(...endpoints) - Math.min(...endpoints) < 0.004);
  assert.ok(Math.min(...endpoints) > 0.98);
});

test("facial landmarks remain finite and on the visible side of the moving seed", () => {
  const point = new Vector3();
  const landmarks = [
    [0, 0],
    [0.275, 0.045],
    [-0.275, 0.045],
    [0.46, -0.14],
    [-0.46, -0.14],
    [0, -0.3],
    [0, 0.96],
  ];
  for (const energy of [0.32, 0.65, 0.95])
    for (let time = 0; time <= 12; time += 0.25) {
      for (const [x, y] of landmarks) {
        seedSurface(x, y, time, energy, point);
        assert.ok(point.toArray().every(Number.isFinite));
        assert.ok(point.z > 0.13);
        assert.ok(point.length() < 1.2);
      }
    }
});

test("crown geometry and normals are finite and remain within the small-mesh budget", () => {
  const leaf = createLeafResources(false);
  try {
    for (const geometry of [leaf.geometry, leaf.veins]) {
      const positions = geometry.attributes.position;
      assert.ok(positions.count <= 500);
      assert.ok(Array.from(positions.array).every(Number.isFinite));
      assert.ok(
        Array.from(geometry.attributes.normal.array).every(Number.isFinite),
      );
      assert.ok(geometry.index);
      assert.ok(Math.max(...geometry.index.array) < positions.count);
    }
  } finally {
    disposeLeaves(leaf);
  }
});

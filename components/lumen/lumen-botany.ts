import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";

function leafPoint(u: number, v: number, round: boolean) {
  const width =
    Math.pow(Math.max(0, Math.sin(u * Math.PI)), round ? 0.55 : 0.85) *
    (round ? 0.49 : 0.35);
  return new THREE.Vector3(
    v * width,
    u,
    0.085 * (1 - v * v) * Math.sin(u * Math.PI) + 0.18 * u * u,
  );
}

/** Cupped crown leaves with actual midrib and vein geometry. */
export function createLeafResources(round = true) {
  const geometry = new THREE.PlaneGeometry(1, 1, 8, 22);
  const positions = geometry.attributes.position as THREE.BufferAttribute;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < positions.count; i++) {
    const point = leafPoint(uv.getY(i), uv.getX(i) * 2 - 1, round);
    positions.setXYZ(i, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  const veinParts: THREE.BufferGeometry[] = [];
  const rib = Array.from({ length: 16 }, (_, i) =>
    leafPoint(i / 15, 0, round).add(new THREE.Vector3(0, 0, 0.005)),
  );
  veinParts.push(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rib), 15, 0.0035, 3),
  );
  for (let i = 1; i <= 5; i++)
    for (const side of [-1, 1]) {
      const start = i / 7;
      const points = Array.from({ length: 6 }, (_, j) =>
        leafPoint(start + (j / 5) * 0.17, (j / 5) * side * 0.88, round).add(
          new THREE.Vector3(0, 0, 0.005),
        ),
      );
      veinParts.push(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          5,
          0.0017,
          3,
        ),
      );
    }
  const veins = mergeGeometries(veinParts, false)!;
  veinParts.forEach((part) => part.dispose());
  const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: "varying vec2 vLeafUV; void main() { vLeafUV = uv; }",
    fragmentShader: /* glsl */ `
      varying vec2 vLeafUV;
      uniform vec3 uLeafBase;
      uniform vec3 uLeafTip;
      void main() {
        float rim = smoothstep(.3,.5,abs(vLeafUV.x-.5));
        vec3 wax = mix(uLeafBase,uLeafTip,vLeafUV.y);
        wax += rim * .025;
        #ifdef USE_COLOR
          wax *= vColor;
        #endif
        csm_DiffuseColor = vec4(wax,1.);
      }
    `,
    uniforms: {
      uLeafBase: { value: new THREE.Color("#bdcda9") },
      uLeafTip: { value: new THREE.Color("#869f75") },
    },
    color: "#c6d1af",
    roughness: 0.64,
    metalness: 0,
    side: THREE.DoubleSide,
    cacheKey: () => "lumen-botanical-leaf-2",
  });
  const veinMaterial = new THREE.MeshBasicMaterial({
    color: "#e0dfb6",
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  return { geometry, veins, material, veinMaterial };
}

export type LeafResources = ReturnType<typeof createLeafResources>;

export function disposeLeaves(resources: LeafResources) {
  resources.geometry.dispose();
  resources.veins.dispose();
  resources.material.dispose();
  resources.veinMaterial.dispose();
}

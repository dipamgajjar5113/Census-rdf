import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { LUMEN_PALETTE } from "@/lib/lumen-visuals";

export const seedSculptGLSL = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  vec3 seedSculpt(vec3 p) {
    float breath = .025 * sin(p.y * 2.8 + p.x * 1.3 + uTime * .68)
      * sin(p.z * 2.2 + 1.1) * uEnergy;
    float waist = 1.0 - .16 * max(0.0, p.y);
    p *= 1.0 + breath;
    p.x *= 1.06 * waist;
    p.z *= .91 * waist;
    p.y *= 1.045;
    p.x += .065 * pow(p.y + .28, 2.0) - .025;
    return p;
  }
`;

const seedVertex = /* glsl */ `
  ${seedSculptGLSL}
  varying vec3 vSeed;
  varying vec3 vSeedWorld;
  varying vec3 vSeedNormal;
  void main() {
    vec3 n = normalize(position);
    vec3 tangent = normalize(cross(n, abs(n.y) > .99 ? vec3(1.,0.,0.) : vec3(0.,1.,0.)));
    vec3 bitangent = normalize(cross(n, tangent));
    vec3 sculpted = seedSculpt(position);
    csm_Position = sculpted;
    csm_Normal = normalize(cross(
      seedSculpt(normalize(position + tangent * .002)) - sculpted,
      seedSculpt(normalize(position + bitangent * .002)) - sculpted
    ));
    vSeed = position;
    vSeedWorld = (modelMatrix * vec4(sculpted, 1.)).xyz;
    vSeedNormal = normalize(mat3(modelMatrix) * csm_Normal);
  }
`;

const seedFragment = /* glsl */ `
  uniform vec3 uBody;
  uniform vec3 uShadow;
  uniform vec3 uGlow;
  uniform float uLight;
  varying vec3 vSeed;
  varying vec3 vSeedWorld;
  varying vec3 vSeedNormal;
  void main() {
    vec3 p = vSeed;
    float lightSide = smoothstep(-.8, 1., p.y + p.x * .25);
    vec3 jade = mix(uShadow, uBody, .52 + lightSide * .48);
    float milk = pow(max(0., dot(normalize(p), normalize(vec3(-.5,.8,.7)))), 3.);
    jade = mix(jade, uGlow, milk * .38);
    // A fine seed seam and growth grain are part of the glaze, not an overlay.
    float seam = 1. - smoothstep(.006, .018, abs(p.x - (.72 + .09 * sin(p.y * 3.5))));
    seam *= smoothstep(.3,.75,p.z) * (1. - smoothstep(.86,.98,abs(p.y)));
    float growth = sin((p.y + .035 * sin(p.x * 5.) + .018 * sin(p.z * 7.)) * 75.);
    jade += growth * .003;
    jade = mix(jade, vec3(.73,.57,.29), seam * .48);
    float rim = pow(1. - max(0., dot(normalize(vSeedNormal), normalize(cameraPosition - vSeedWorld))), 3.);
    csm_DiffuseColor = vec4(jade, 1.);
    csm_Roughness = .25 + growth * .012;
    csm_Emissive = uGlow * (rim * .1 + uLight * .055 + seam * .025);
  }
`;

export function createSeedMaterial() {
  const palette = LUMEN_PALETTE.calm;
  const uniforms = {
    uTime: { value: 0 },
    uEnergy: { value: 0.6 },
    uLight: { value: 0 },
    uBody: { value: new THREE.Color(palette.body) },
    uShadow: { value: new THREE.Color(palette.shadow) },
    uGlow: { value: new THREE.Color(palette.glow) },
  };
  const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshPhysicalMaterial,
    vertexShader: seedVertex,
    fragmentShader: seedFragment,
    uniforms,
    color: "white",
    roughness: 0.25,
    metalness: 0,
    clearcoat: 0.75,
    clearcoatRoughness: 0.19,
    ior: 1.38,
    iridescence: 0.18,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [160, 310],
    envMapIntensity: 0.95,
    emissive: "#ffffff",
    emissiveIntensity: 1,
    cacheKey: () => "lumen-living-seed-2",
  });
  const depthMaterial = new CustomShaderMaterial({
    baseMaterial: THREE.MeshDepthMaterial,
    vertexShader: `${seedSculptGLSL}\nvoid main() { csm_Position = seedSculpt(position); }`,
    uniforms,
    depthPacking: THREE.RGBADepthPacking,
    cacheKey: () => "lumen-living-seed-depth-2",
  });
  return { material, depthMaterial, uniforms };
}

/** Mirrors the vertex displacement so every facial feature stays on the skin. */
export function seedSurface(
  x: number,
  y: number,
  time: number,
  energy: number,
  result: THREE.Vector3,
) {
  const z = Math.sqrt(Math.max(0.005, 1 - x * x - y * y));
  const breath =
    0.025 *
    Math.sin(y * 2.8 + x * 1.3 + time * 0.68) *
    Math.sin(z * 2.2 + 1.1) *
    energy;
  const waist = 1 - 0.16 * Math.max(0, y);
  const sy = y * (1 + breath) * 1.045;
  return result.set(
    x * (1 + breath) * 1.06 * waist + 0.065 * (sy + 0.28) ** 2 - 0.025,
    sy,
    z * (1 + breath) * 0.91 * waist + 0.025,
  );
}

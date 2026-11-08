# Lumen — character and rendering research

## Direction: a little living seed

Lumen has a botanical identity: a slightly asymmetric, milky jade seed with a fine
warm seam, a flexible two-leaf crown, soft eyes, and a small expressive mouth.
The photographic eucalyptus wreath remains the backdrop. Its real leaf texture
contrasts with the sculpted character and connects the digital check-in to the
project's physical health-fair sign.

The aim is a recognizable character and a considered performance. There is no
objective test for “best in the world”; the practical criteria here are a clear
silhouette, distinctive material, readable emotion, immediate response, visual
depth, and reliable performance on a range of devices.

## What the research supports

**Performance gives the object personality.** Disney describes timing, staging,
anticipation, squash and stretch, follow-through, and secondary action as central
to believable character animation. Applied here: a touch begins with a brief
compression, then recovers; the eyes lead attention, the body follows, and the
leaf crown settles last. Empathy has a lower-energy pose than rest, instead of
becoming more frantic. This is our application of those principles, not a claim
that a film animation rig has been reproduced. [Disney Animation](https://www.disneyanimation.com/process/animation/)

**Eyes should behave as a coordinated system.** Disney's eye-motion work treats
blinking and the surrounding tissue as related to gaze. Lumen uses asymmetric
curiosity, faster closure than reopening, and face anchors that follow the
deforming surface. Brows, mouth, posture, and crown opening change together.
[Realistic Eye Motion](https://media.disneyanimation.com/uploads/production/publication_asset/66/asset/realisticEyeMotion.pdf)

**A small set of controllable material responses is useful.** Disney's BRDF work
emphasizes practical artistic control with consistent lighting responses. The
selected look uses a dielectric jade base, restrained clearcoat, broad studio
highlights, subtle iridescence, and fine growth grain. This is an art-directed
real-time material, rather than a collection of unrelated shiny layers.
[Physically-Based Shading at Disney](https://disneyanimation.com/publications/physically-based-shading-at-disney/)

**Translucent appearance needs softness as well as gloss.** Pixar's subsurface
research discusses materials including plants, jade, and wax. That supports the
choice of a soft jade palette and warm edge light. The implementation uses a
light-wrap/emission approximation; it does not implement the paper's BSSRDF or
claim physically accurate subsurface transport.
[Approximate Reflectance Profiles for Efficient Subsurface Scattering](https://graphics.pixar.com/library/ApproxBSSRDF/paper.pdf)

**Mixed media can form a coherent scene.** Lusion describes blending original 3D
assets and hand-drawn imagery in _My Little Storybook_. Our inference is that a
coherent material language matters more than making every layer three-dimensional.
Here, the photographic wreath remains a separate rear layer, while the character
gets real geometry, lighting, shadow support, and a flexible crown.
[My Little Storybook](https://lusion.co/projects/my_little_story_book/)

**A physical project can guide the digital experience.** Lusion's _Of The Oak_
extends a botanical installation into a web companion, and describes using an
efficient custom geometry pipeline. For this project the comparable design
principle is preserving the health-fair sign's eucalyptus, timber, and warmth.
We do not reuse that project's assets, code, or visual composition.
[Of The Oak](https://lusion.co/projects/of_the_oak/)

## Library decisions

Versions below are the installed and verified versions, not an assertion that
each is the newest available major release.

| Library                       | Decision and purpose                                                                                                                                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Three.js 0.169.0              | Keep the app's renderer. Physical materials, custom depth material, shadow maps, reusable leaf geometry, and linear color management.                                                                                                                          |
| React Three Fiber 8.17.10     | Keep the React 18-compatible renderer. Animate objects and uniforms through frame callbacks rather than React state every frame.                                                                                                                               |
| Drei 9.114.3                  | Use local `Environment`/`Lightformer` lighting and `PerformanceMonitor` to adapt resolution and shadow quality.                                                                                                                                                |
| Custom Shader Material 6.4.0  | Add for explicit surface displacement, reconstructed normals, jade color, grain, and embedded seed seam while retaining Three's physical shading. Registry peers support the existing React/Fiber/Three versions.                                              |
| maath 0.10.8                  | Declare the already-installed package directly and use its damping entry point for smooth pose, color, gaze, and crown transitions with frame delta. The upstream repository now redirects to `pmndrs/math`; this implementation uses the verified 0.10.8 API. |
| Framer Motion 11.11.1         | Keep for interface transitions and the separate foreground/background motion values.                                                                                                                                                                           |
| Drei MeshTransmissionMaterial | Evaluated. It adds another scene pass, and the photographic backdrop lives in the DOM rather than in its refraction buffer. A controlled opaque jade treatment fits this composition better.                                                                   |
| React Postprocessing / Bloom  | Evaluated. Not required for this material direction. Clearcoat highlights and a restrained shader edge light supply the intended glow without a full-screen effect pipeline.                                                                                   |

Primary technical references:

- [Three.js physical material documentation](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) — physical layers, environment lighting, transmission, and per-pixel cost. Newer APIs in the current documentation are not assumed to exist in r169; installed source/types were checked.
- [Custom Shader Material](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial) — `csm_Position`, `csm_Normal`, `csm_DiffuseColor`, roughness, and emissive outputs.
- [R3F scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) — resource reuse, on-demand rendering, and adaptive resolution.
- [Drei PerformanceMonitor](https://drei.docs.pmnd.rs/performances/performance-monitor) — frame-rate sampling with upper/lower bounds and a fallback.
- [Drei MeshTransmissionMaterial](https://drei.docs.pmnd.rs/shaders/mesh-transmission-material) — refraction capabilities and the additional render-pass tradeoff.
- [React Postprocessing](https://react-postprocessing.docs.pmnd.rs/effect-composer) — effect-pass management and multisampling.
- [maath package metadata](https://www.npmjs.com/package/maath/v/0.10.8) and its installed type declarations — the exact damping API used here.

## The implemented emotional language

| State   | Performance                                                             |
| ------- | ----------------------------------------------------------------------- |
| At ease | Small breathing cycle, half-soft eyes, open crown, unhurried attention. |
| Warm    | Slight forward lean, wider smile, a small caring tilt.                  |
| Tender  | Lower movement energy, inner brows lifted, crown gently folded inward.  |
| Curious | Asymmetric eyes and brow, a listening tilt, a more open crown.          |
| Content | Settled body, soft smile, relaxed crown.                                |
| Radiant | Curved eyes, broader smile, lifted posture, unfurled crown.             |

There are distinct one-shot responses for touch, acknowledgment, softening, and
blooming. The character returns to its resting pose after each response. Squash
and stretch preserve apparent volume. Face anchors use the same displacement
equation as the material, so features stay attached to the moving seed.

## Device and motion behavior

The renderer starts conservatively, samples frame rate, and adjusts DPR and
shadow quality within a bounded range. The low profile uses DPR 1 and omits
shadow-map rendering. An initial promotion is allowed when measurements support
it; a downgrade prevents later re-promotion within the mounted scene, avoiding
repeated resolution changes. Hidden scenes stop rendering. Reduced motion uses a static
frame, and the pause control disables idle movement and parallax.

These choices follow the performance guidance above and W3C's guidance for
disabling non-essential interaction-triggered movement.
[WCAG 2.2: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Verification

- TypeScript checks and production build.
- Browser observation of the new shader/geometry during development. Final
  browser control was stopped with Escape; this is not a completed mobile or
  cross-browser visual certification.
- `npx --yes tsx@4.19.2 --test tests/lumen.test.ts` checks reaction recovery,
  blink bounds, gentle empathy, 30/60/120 Hz damping, facial-anchor bounds, and
  crown geometry/normal validity.
- Shader errors and WebGL context loss return to the composed CSS portrait and
  photographic wreath rather than leaving a blank interaction.

The photographed background is an intentional part of the final composition.
Further visual refinement should be judged in the app at phone, tablet, and
desktop sizes with all four preview emotions, alongside the actual survey flow.

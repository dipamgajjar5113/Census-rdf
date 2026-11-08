# Stress Management — botanical retreat

The project's physical eucalyptus-and-timber sign is the visual reference. The
app uses warm parchment, deep olive ink, sage surfaces, subtle grain, natural
leaf shadows, Lora's gentle italic forms, and readable DM Sans interface text.
Dark mode is a forest-green palette with the same hierarchy.

The survey uses normal document scrolling, native keyboard-operable radio
controls, clearly described selection limits, visible focus, optional questions,
and layouts for narrow phones, landscape phones, tablets, and larger screens.
Lumen stays mounted between survey views. On phones the welcome introduction,
companion, and start action form one vertical composition; during questions the
companion becomes a compact row rather than covering the form.

The wreath is a separate, slightly tilted rear plane with soft leaf shadows.
The character sits in front with silhouette-based cast shadows, a diffuse
contact shadow, and gentle counter-parallax. Pointer movement updates motion
values, without re-rendering React every frame. Reduced motion and pause remove
the parallax as well as the character's idle animation.

## Artwork

- Production: `public/images/eucalyptus-wreath.webp` (410,376 bytes, alpha retained).
- Generated source: `design/source-assets/eucalyptus-wreath.png`.
- Method: built-in image generation tool; the source was encoded as WebP for delivery.
- The reference photograph is not redistributed as a site asset.

## Final generation prompt

Use case: photorealistic-natural. Asset type: decorative transparent eucalyptus
wreath for a refined stress management health-fair website. Primary request: a
single beautiful, airy, asymmetrical wreath made of real round silver-dollar
eucalyptus leaves, very fine olive stems, a few small fresh sage leaves.
Composition: square 1024px composition, wreath slightly oval upright, open center
occupying at least 65% width and height so an interactive 3D character can sit
inside; heavier leaves on the lower-left and upper-right, plenty of open
breathing room, all leaves inside the image with generous transparent outer
margins. Lighting: soft warm late-afternoon sunlight from upper left, tactile
realistic matte leaf texture and delicate veins, subtly translucent backlit
edges, quiet botanical editorial photography. Palette: muted sage, eucalyptus,
dusty olive, warm pale green, natural off-white highlights. Background: truly
transparent alpha everywhere except the leaves and stems, including the entire
large open center. Constraints: isolated botanical cutout only, no pot, no
surface, no board, no writing, no text, no ribbons, no flowers, no drop shadow
baked into the background, no watermark. It must feel naturally handmade and
sophisticated, graceful rather than dense or symmetrical.

## Verification build

Set `NEXT_BUILD_DIR=.next-verify` when running `npm run build` alongside the dev
server to avoid replacing its `.next` cache. The verification directory is ignored.

## Legacy service worker

There is no active service-worker registration in this app. `public/sw.js` serves
a retirement worker for older registrations at the same origin: it activates,
unregisters itself, and never intercepts fetches or stores responses. Its response
uses `Cache-Control: no-store, max-age=0`. The existing localStorage check-in queue
is unaffected.

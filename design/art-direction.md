# Stress Management — botanical retreat

The project's physical eucalyptus-and-timber sign is the visual reference. The
app uses warm parchment (`#F3F2EB`), deep forest ink, sage surfaces, subtle grain,
natural leaf shadows, Lora's gentle italic forms, and readable DM Sans interface text.
Dark mode is a forest-green palette with the same hierarchy.

## Surface and layout system

The parchment ground, opaque ivory cards, and inset sage controls form three
distinct surface levels. Shared shadow tokens combine a narrow contact shadow,
a soft cast shadow, and an inner highlight; dark mode uses its own shadow values.
Borders remain visible around forms and controls in both themes. Primary actions
have consistent heights, inset highlights, and clear pressed and disabled states.

The welcome view pairs editorial copy and an immediately available start action
with Lumen's framed botanical portrait. Above 680px the application fits the
viewport using `app/viewport.css`. Secondary journey cards are omitted throughout;
desktop also omits repeated reassurance and duplicate question labels to preserve generous type
and spacing. The progress rail and question navigation keep stable bounds across
all six questions. Answer explanations have a reserved column; the completion
screen places the affirmation and intention side by side. The privacy disclosure
opens above its trigger without changing the page height.

Lumen stays mounted between survey views. It has its own paper surface on wide
screens and shares the progress row on narrower tablets. Short desktop windows
omit the secondary companion panel to give the form its full width.

## Mobile composition

`app/mobile.css` owns phone layouts, replacing the old small-screen overrides.
Phones use normal document scrolling, an immediately available welcome action,
and a full botanical portrait. Feeling choices become readable full-width stones;
stress sources use generous tiles, with a single-column list on narrow phones.
Selection labels stay at 14–15px and interactive targets are at least 44px.

During the survey, Lumen becomes a light inline companion. A sticky progress strip
and navigation keep context and actions reachable on long questions. Question
and census-tab changes are immediate on mobile. Question changes scroll to the progress strip rather than
animating through a temporarily empty page. Focused goal entry releases sticky
controls so a soft keyboard can use the available space; inputs keep a 16px font.
Completion, organizer access, metrics, charts, and data tools share the same
reading and touch sizes. Page edges and bottom controls account for safe areas.

`lib/mobile-layout.ts` matches both narrow screens and coarse-pointer phones
rotated into landscape. This query must stay aligned with `app/mobile.css`.
Reduced-motion preferences apply through the shared MotionConfig as well as
Lumen's scene controls. Native radio navigation, focus outlines, optional answers,
and selection limits remain available in every layout.

The organizer login uses a two-column introduction and form. The desktop census
keeps its header, metrics, and tabs in the viewport; long data collections scroll
inside their panel. Chart labels sit above their tracks so long labels fit narrow
screens. Exceptionally short windows (540px or less in height) retain an overflow
fallback so zoom and unusual window sizes cannot make controls unreachable.

The wreath is a separate, slightly tilted rear plane with soft leaf shadows.
The character sits in front with silhouette-based cast shadows, a diffuse
contact shadow, and gentle counter-parallax. Pointer movement updates motion
values, without re-rendering React every frame. Reduced motion and pause remove
the parallax as well as the character's idle animation.

The final character is a living jade seed with a warm seam, subtle growth grain,
and a flexible two-leaf crown. Its photographic eucalyptus backdrop is retained.
The material and pose rig use Custom Shader Material and maath; the research,
library comparisons, and verification approach are in `design/lumen-research.md`.

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

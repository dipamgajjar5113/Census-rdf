# Community Census

A world-class, **anonymous stress check-in** for a Community Health Nursing health
fair. Six questions, ~2 minutes, fully private — part reflection, part mini-lesson.
Behind a password-protected dashboard, organizers see the aggregate census.

Inspired by the project's eucalyptus-and-timber health-fair sign: warm parchment,
sage greens, natural botanical artwork, and a persistent 3D companion — **Lumen**.
One question at a time, with native keyboard controls, a stable desktop frame,
and natural scrolling on phones.

## The experience

- **Welcome → 6 questions (one at a time) → thank-you**, with directional
  desktop transitions, immediate mobile question changes, and a segmented progress rail.
- **Lumen**, a sculpted jade seed with a flexible leaf crown, a photographic
  eucalyptus wreath, custom surface shading, and local studio lighting,
  pointer-following eyes, blinking, expressive brows, and a morphing smile.
  Explore four emotions on the welcome screen; during the survey it settles
  into a smaller companion and responds with distinct nods, softening, blooms,
  and touch-triggered squishes. The WebGL scene loads separately, pauses when
  hidden, and uses a static frame for reduced motion or the pause control.
  An expressive CSS portrait covers loading, unavailable WebGL, and context loss.
  See `design/lumen-research.md` for the source research and library decisions.
- **Dashboard** (`/dashboard`): password-gated census with headline insights,
  per-question breakdowns, anonymous coping goals, and CSV export. Small samples
  (< 5) are suppressed to protect anonymity.

## Tech

Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion · React Three Fiber
(three.js) · Supabase (optional) · iron-session.

## Design system

See `design/art-direction.md` and the shared, viewport, and mobile styles in `app/`.
Tokens: parchment ground `#F3F2EB`, deep forest ink, sage surfaces, and warm timber accents. Lora (serif,
questions) + DM Sans (UI), with forest-green dark mode. The optimized botanical
asset is local and keeps its transparency. Layouts adapt to portrait and landscape
phones, tablets, and desktop screens. Larger screens keep a stable viewport;
phones use readable answer cards, sticky progress and navigation, and document scrolling.

## Running locally

```bash
npm install
cp .env.example .env.local   # optional: add Supabase + change secrets
npm run dev                  # http://localhost:3000
```

Supabase is **optional**. Without it, the survey runs fully offline (answers are
queued in `localStorage`) and the dashboard shows an empty, configured-off state.

### With Supabase

1. Create a project, run `supabase/schema.sql` in the SQL editor.
2. Set in `.env.local`:
   ```
   SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ADMIN_PASSWORD=Community          # dashboard password
   SESSION_PASSWORD=<32+ char secret>
   ```

## Anonymity guarantees

No names, emails, student numbers, or times are ever collected — only a random
per-visit id and a date. Free-text goals are filtered for anything
identity-looking and dropped if matched. The public summary is counts-only; raw
rows are reachable only through an authenticated admin session.

## Architecture

```
app/            routes + API (checkins, summary, auth, admin)
components/
  survey/       Welcome / Question / Thanks + typed inputs + progress rail
  lumen/        Lumen companion (R3F orb + CSS fallback), shared state, breathing
  dashboard/    login gate, census/details/goals, stat cards, bar charts
  ui/           Button, loading/error/empty states
lib/            questions, types, summarize, queue (offline-first), supabase, labels
supabase/       schema.sql
```

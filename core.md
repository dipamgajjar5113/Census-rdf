# Community-Census — Core Logic

A plain-language description of **what this app is, what it collects, how data moves, and how it is stored and shown.** No UI, no components, no styling — only the core mechanics.

---

## 1. What this app is

Community-Census is an **anonymous stress check-in survey** built for a Community Health Nursing health fair. It serves two distinct purposes:

- **For a participant:** answer a short, 6-question stress check-in. Part survey (how are you doing), part mini-lesson (two quiz-style questions that teach a concept).
- **For the organizer:** see the **aggregate census** — group totals across everyone who answered — behind a password-protected dashboard.

Key principle: **it is anonymous by design.** No names, student numbers, emails, or timestamps are collected. Every submission is a random id plus a date only. There is active filtering to strip anything that looks identifying.

---

## 2. What it asks (the input)

The survey is a fixed list of **6 questions**, defined in one place (`lib/questions.ts`). Each has an `id`, a `type`, and a set of options. Participants may **skip any question**.

| # | id | type | What it asks | Notes |
|---|-----|------|--------------|-------|
| 1 | `stress` | scale | How stressed over the past 7 days | 5-point scale (not at all → extremely) + "prefer not to answer" |
| 2 | `sources` | multi | Main sources of stress | Pick **up to 3**. "None" and "Prefer not" are **exclusive** (selecting one clears the rest) |
| 3 | `stressor` | single (quiz) | "Which is the stressor?" from a scenario | Has a **correct answer** (`deadlines`); teaches stressor vs. stress response |
| 4 | `signs` | single (quiz) | Do warning signs alone prove a disorder? | Correct answer is `no`; teaches that signs ≠ diagnosis |
| 5 | `coping` | single | Which coping strategy would you try? | Each option has a "how to" tip |
| 6 | `goal` | text | One small coping goal to try | Optional free text, capped at 140 chars, identity-filtered |

**Data shape per answer** (`Answer` in `lib/types.ts`): `stress` (string), `sources` (string array), `stressor` / `signs` / `coping` (string), `goal` (string). Any field may be `null` = skipped.

Supporting content also lives in `lib/questions.ts`:
- `CONSENT` — the voluntary-participation notice.
- `EXPLAIN` — the teaching explanation shown after each quiz question.
- `HOWTO` — a practical tip per coping strategy.
- `STRESS_MOOD` — maps each stress level to a response.

---

## 3. How many screens (the flow)

Three logical views (`SurveyView` = `"welcome" | "question" | "thanks"`), driven by state in `components/SurveyApp.tsx`:

```
welcome  →  question (×6, one at a time)  →  thanks
```

- **welcome** → start.
- **question** → steps through the 6 questions. Navigation: back / next / skip. Skipping sets that answer to `null`. Reaching the end of question 6 triggers submit.
- **thanks** → shown after submit; also where the submission is pushed to the server.

The organizer dashboard (`/dashboard`) is a **separate area**, not part of the participant flow.

---

## 4. How data flows

### A. During the survey (in memory)
All answers are held in a single React state object (`answers`). Each visit gets one **random, anonymous id** (`visitId`, generated via `crypto.randomUUID`) that lives only for that session. Nothing is sent to the server while answering.

### B. On submit
When question 6 is completed, `doSubmit()` builds the record:

```
{ id: visitId, v: 2, day: <local date, en-CA = YYYY-MM-DD>,
  stress, sources, stressor, signs, coping, goal }
```

- Unanswered fields become `null`.
- `goal` is trimmed, capped at 140 chars, and **dropped if it looks identifying** (emails, phone numbers, long digit runs, "my name is…", "@handle" are rejected by `looksIdentifying`).
- Only a **date** is stored — never a time.

### C. Offline-first queue
The record is first written to a **local queue** in `localStorage` under key `smhf-queue-v3`, then a flush to the server is attempted. This means:

- The survey works with **no network** — answers are saved locally and marked pending.
- `flushQueue()` POSTs each queued item to `/api/checkins`; successfully-sent items are removed from the queue.
- Browser `online` / `offline` events trigger re-sync automatically. A sync status (`ok | pending | offline | busy | error`) reflects the queue state.
- De-duplication is by `id` (same visit id is never queued twice; the server upserts on `id`).

### D. Server ingest — `POST /api/checkins`
1. Validates there is an `id`.
2. **Upserts** the row into the `checkins` table (conflict on `id`), so re-sending the same visit is idempotent.
3. Recomputes the aggregate **summary** over all rows and writes it to `config` under key `"summary"` (with an `updatedAt` timestamp). The public summary is therefore kept fresh on every submission.

---

## 5. How it is saved (storage)

Backend is **Supabase (Postgres)**, accessed server-side with the service-role key (`lib/supabase-server.ts`). Supabase is **optional** — if not configured, the survey still runs fully offline via the localStorage queue.

Two tables:

- **`checkins`** — one row per visit: `id`, `v` (schema version = 2), `day`, and the six answer fields. `created_at` is used only for ordering raw records in the admin view.
- **`config`** — a key/value store:
  - `summary` → the precomputed public aggregate.
  - `lock` → an optional admin password hash (`{ salt, hash }`, SHA-256 of `salt + password`).

Storage layers in summary:
1. **In-memory** React state while answering.
2. **localStorage** queue (`smhf-queue-v3`) for durability/offline.
3. **Supabase `checkins`** rows as the source of truth.
4. **Supabase `config.summary`** as the cached aggregate for fast public reads.

---

## 6. How it is aggregated (`summarize`)

The same `summarize()` logic runs server-side (in `/api/checkins` and `/api/admin/checkins`). For each non-text question it produces a `QuestionSummary`:

- `counts` — how many times each option was chosen (multi-select counts each selected value).
- `skipped` — how many had no valid answer.
- `answered` — total minus skipped.

Plus `total` (number of check-ins) and `goals` (how many non-empty goals). **Only group totals exist** — individual answers are never part of the summary.

---

## 7. How it is displayed / represented

### Public summary — `GET /api/summary`
Returns only the cached `config.summary` aggregate (never raw rows). Cached at the edge (`s-maxage=30`). If missing, returns an empty summary. This is safe to expose because it is counts-only.

### Admin dashboard — `/dashboard`
Gated by a shared password.

- **Auth** (`/api/auth`): a single fixed password (`"Community"`). On success an **iron-session** cookie (`smhf-session`, httpOnly, 8-hour expiry) marks `isAdmin`. `DELETE` logs out.
- **`GET /api/admin/checkins`** (session required): returns `isAdmin`, the **raw records** (ordered newest-first), and a freshly computed summary.
- **`DELETE /api/admin/checkins`** (session required): wipes all rows and resets the summary — the "clear census" action.

The dashboard represents data three ways:
1. **Census** — headline group totals and plain-English takeaways (e.g. share who identified the stressor correctly; high/moderate/low stress split). **Suppressed until at least `MIN_CENSUS = 5`** check-ins exist, to avoid showing numbers for tiny samples.
2. **Details** — per-question breakdowns.
3. **Goals** — the free-text coping goals.

**Export:** raw records can be exported as CSV (option labels resolved, quiz questions marked correct/incorrect, skipped fields shown as `skipped`), copied to clipboard or downloaded.

---

## 8. Anonymity & safety guarantees (the core promise)

- No name, email, student number, or time is ever collected — only a random id and a date.
- Free-text goals are filtered for anything identity-looking and dropped if matched.
- Participation is voluntary; every question is skippable.
- The public endpoint exposes **only aggregate counts**, never individual rows.
- Raw rows are reachable **only** through an authenticated admin session.
- Small-sample results are hidden below 5 check-ins.

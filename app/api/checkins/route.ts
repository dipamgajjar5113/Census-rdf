import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";
import { summarize } from "@/lib/summarize";
import { cleanGoal } from "@/lib/identity-filter";
import type { CheckinRecord } from "@/lib/types";

export const runtime = "nodejs";

/**
 * POST /api/checkins — upsert a single anonymous check-in, then recompute
 * and cache the aggregate summary. Idempotent on `id`.
 */
export async function POST(req: Request) {
  let body: Partial<CheckinRecord>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const record: CheckinRecord = {
    id: String(body.id),
    v: 2,
    day: body.day || new Date().toLocaleDateString("en-CA"),
    stress: body.stress ?? null,
    sources: Array.isArray(body.sources) ? body.sources : null,
    stressor: body.stressor ?? null,
    signs: body.signs ?? null,
    coping: body.coping ?? null,
    goal: cleanGoal(body.goal ?? null),
  };

  const supabase = getSupabase();
  // No backend configured: accept silently so the offline queue clears.
  if (!supabase) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const { error: upsertError } = await supabase
    .from("checkins")
    .upsert(record, { onConflict: "id" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Recompute summary over all rows and cache it.
  const { data: rows, error: readError } = await supabase
    .from("checkins")
    .select("*");

  if (!readError && rows) {
    const summary = summarize(rows as CheckinRecord[]);
    await supabase
      .from("config")
      .upsert({ key: "summary", value: summary }, { onConflict: "key" });
  }

  return NextResponse.json({ ok: true, stored: true });
}

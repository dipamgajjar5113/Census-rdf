import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type AdminSession } from "@/lib/session";
import { getSupabase } from "@/lib/supabase-server";
import { summarize } from "@/lib/summarize";
import type { CheckinRecord } from "@/lib/types";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getIronSession<AdminSession>(cookies(), sessionOptions);
  return Boolean(session.isAdmin);
}

/** GET — session-gated: raw records (newest first) + fresh summary. */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({
      isAdmin: true,
      records: [],
      summary: summarize([]),
      configured: false,
    });
  }

  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ isAdmin: true, error: error.message }, { status: 500 });
  }

  const records = (data ?? []) as CheckinRecord[];
  return NextResponse.json({
    isAdmin: true,
    records,
    summary: summarize(records),
    configured: true,
  });
}

/** DELETE — session-gated: wipe all rows + reset summary. */
export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) return NextResponse.json({ ok: true, configured: false });

  const { error } = await supabase.from("checkins").delete().neq("id", "");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase
    .from("config")
    .upsert({ key: "summary", value: summarize([]) }, { onConflict: "key" });

  return NextResponse.json({ ok: true });
}

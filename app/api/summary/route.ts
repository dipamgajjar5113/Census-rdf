import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase-server";
import type { Summary } from "@/lib/types";

export const runtime = "nodejs";

const EMPTY: Summary = { total: 0, goals: 0, questions: {} };

/**
 * GET /api/summary — public, counts-only aggregate. Edge-cacheable.
 */
export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(EMPTY, {
      headers: { "Cache-Control": "public, s-maxage=30" },
    });
  }

  const { data, error } = await supabase
    .from("config")
    .select("value")
    .eq("key", "summary")
    .maybeSingle();

  const summary = !error && data?.value ? (data.value as Summary) : EMPTY;

  return NextResponse.json(summary, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

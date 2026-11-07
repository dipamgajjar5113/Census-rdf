import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, ADMIN_PASSWORD, type AdminSession } from "@/lib/session";

export const runtime = "nodejs";

/** POST /api/auth — log in with the shared password. */
export async function POST(req: Request) {
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const session = await getIronSession<AdminSession>(cookies(), sessionOptions);
  session.isAdmin = true;
  await session.save();
  return NextResponse.json({ ok: true });
}

/** DELETE /api/auth — log out. */
export async function DELETE() {
  const session = await getIronSession<AdminSession>(cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ ok: true });
}

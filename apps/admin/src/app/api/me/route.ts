import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { ownProfile } from "@/lib/members-auth.server";

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await verifySession(token);
  if (!s) return NextResponse.json({ ok: false }, { status: 401 });
  const profile = ownProfile(s.key);
  if (!profile) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true, profile, role: s.role });
}

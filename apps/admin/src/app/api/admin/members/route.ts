import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { fullMembers } from "@/lib/members-auth.server";

/** Admin-only: ham TC + telefon içeren tam üye listesi. Oturum + rol kontrolü. */
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await verifySession(token);
  if (!s) return NextResponse.json({ ok: false }, { status: 401 });
  if (s.role !== "admin") return NextResponse.json({ ok: false, message: "Yetkisiz." }, { status: 403 });
  return NextResponse.json({ ok: true, members: fullMembers() });
}

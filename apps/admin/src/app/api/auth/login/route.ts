import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/members-auth.server";
import { signSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { bdayKey } from "@/lib/no17-bday";

export async function POST(req: Request) {
  let body: { tc?: string; day?: number | string; month?: number | string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Geçersiz istek." }, { status: 400 });
  }
  const day = Number(body.day);
  const month = Number(body.month);
  if (!Number.isInteger(day) || day < 1 || day > 31 || !Number.isInteger(month) || month < 0 || month > 11) {
    return NextResponse.json({ ok: false, message: "Gün ve ay seç." }, { status: 400 });
  }
  const res = verifyLogin(String(body.tc ?? ""), bdayKey(day, month));
  if (!res) {
    return NextResponse.json({ ok: false, message: "TC veya doğum günü eşleşmedi." }, { status: 401 });
  }
  const token = await signSession({ key: res.key, name: res.name, role: res.role });
  const r = NextResponse.json({ ok: true, role: res.role });
  r.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return r;
}

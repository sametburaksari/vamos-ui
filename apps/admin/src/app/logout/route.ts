import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/** Menüdeki "Çıkış" buraya gelir: oturum çerezini sil, /giris'e yönlendir. */
export async function GET(req: NextRequest) {
  const r = NextResponse.redirect(new URL("/giris", req.url));
  r.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return r;
}

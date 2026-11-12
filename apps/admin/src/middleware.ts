import { NextResponse, type NextRequest } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/session";

/**
 * Giriş kapısı:
 *  - Oturum yoksa → /giris
 *  - Üye (admin değil) admin alanına girerse → /ben
 * Admin alanı: /, /no17/*, /site/*, /api/admin/*
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API'ler kendi oturum/rol kontrolünü yapar (JSON 401/403) — HTML'e yönlendirme.
  if (pathname.startsWith("/api")) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const s = await verifySession(token);

  if (!s) {
    const url = new URL("/giris", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const adminArea =
    pathname === "/" ||
    pathname.startsWith("/no17") ||
    pathname.startsWith("/site") ||
    pathname.startsWith("/ayarlar") ||
    pathname.startsWith("/api/admin");

  if (adminArea && s.role !== "admin") {
    return NextResponse.redirect(new URL("/ben", req.url));
  }

  return NextResponse.next();
}

// /giris, auth API'leri, statik varlıklar hariç her şeyi koru.
export const config = {
  matcher: ["/((?!giris|api/auth|_next/static|_next/image|favicon.ico|logos).*)"],
};

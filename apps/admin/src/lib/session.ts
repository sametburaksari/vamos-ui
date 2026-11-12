// Edge-uyumlu oturum imzalama (Web Crypto HMAC-SHA256).
// Hem middleware (edge) hem route handler (node) kullanır. Node/Buffer API'si YOK.

export type Session = { key: string; name: string; role: "admin" | "member"; exp: number };

export const SESSION_COOKIE = "no17_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 gün

function secret(): string {
  const s = process.env.PANEL_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("PANEL_SESSION_SECRET eksik/kısa");
  return s;
}

const enc = new TextEncoder();

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64urlFromStr(s: string): string {
  return b64urlFromBytes(enc.encode(s));
}
function strFromB64url(s: string): string {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return b64urlFromBytes(new Uint8Array(sig));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function signSession(input: Omit<Session, "exp"> & { exp?: number }): Promise<string> {
  const payload: Session = { ...input, exp: input.exp ?? Math.floor(Date.now() / 1000) + MAX_AGE };
  const data = b64urlFromStr(JSON.stringify(payload));
  const sig = await hmac(data);
  return `${data}.${sig}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  try {
    const expected = await hmac(data);
    if (!timingSafeEqual(sig, expected)) return null;
    const payload = JSON.parse(strFromB64url(data)) as Session;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

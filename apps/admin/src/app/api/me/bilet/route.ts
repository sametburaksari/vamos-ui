import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { verifySession, SESSION_COOKIE } from "@/lib/session";
import { MEMBER_FULL_BY_KEY } from "@/lib/no17-data.server";
import { TICKET_BY_DIGEST, TICKET_EVENT } from "@/lib/tickets.server";

export const runtime = "nodejs";

/**
 * Bilet-indir ucu (eski no17-kombine projesi; PDF'ler orada) — aynı secret, aynı imza.
 * no17-fener.vercel.app panele taşınınca da no17-kombine.vercel.app'ten servis edilir.
 * Panele porter'lanınca `TICKET_DOWNLOAD_BASE` env'iyle değiştirilebilir.
 */
const DOWNLOAD_BASE = process.env.TICKET_DOWNLOAD_BASE || "https://no17-kombine.vercel.app/api/bilet-indir";

const hmac = (value: string, secret: string) => createHmac("sha256", secret).update(value, "utf8").digest("hex");

export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = await verifySession(token);
  if (!s) return NextResponse.json({ ok: false }, { status: 401 });

  const secret = process.env.TICKET_LOOKUP_SECRET;
  if (!secret || secret.length < 32) {
    // Secret yoksa bileti gösteremeyiz; akışı bozmadan "bilet yok" döndürme yerine net hata.
    return NextResponse.json({ ok: true, hasTicket: false, configured: false });
  }

  const tc = MEMBER_FULL_BY_KEY[s.key]?.tc ?? "";
  if (tc.length !== 11) {
    return NextResponse.json({ ok: true, hasTicket: false, event: TICKET_EVENT });
  }

  // no17-fener ile birebir aynı digest + token (createToken mantığı korunur).
  const d = hmac(`ticket:${tc}`, secret);
  const ticket = TICKET_BY_DIGEST[d];
  if (!ticket) {
    return NextResponse.json({ ok: true, hasTicket: false, event: TICKET_EVENT });
  }

  const expires = Date.now() + 30 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ d, expires })).toString("base64url");
  const ticketToken = `${payload}.${hmac(payload, secret)}`;
  const downloadUrl = `${DOWNLOAD_BASE}?token=${encodeURIComponent(ticketToken)}`;

  return NextResponse.json({
    ok: true,
    hasTicket: true,
    event: TICKET_EVENT,
    seats: ticket.seats,
    count: ticket.seats.length,
    downloadUrl,
  });
}

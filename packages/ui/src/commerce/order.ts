/**
 * The order between "Pay" and the payment provider's callback, without a database: the server
 * signs a snapshot (HMAC-SHA256 with ORDER_SECRET) and keeps it in an HttpOnly cookie on the
 * buyer's browser. The callback accepts it only when the signature matches, it has not expired and
 * the provider's verified result names the same order and amount.
 */
import { hmacSha256, safeEqual, toHex } from "../payments/crypto";
import type { Quote } from "./pricing";

export interface OrderBuyer {
  name: string;
  surname: string;
  email: string;
  /** E.164 ("+905321234567") or national digits. */
  phone: string;
  address: string;
  city: string;
  /** İlçe / district. */
  district?: string;
  zipCode?: string;
  /** ISO country name or code. Default "Turkey". */
  country?: string;
  /** TCKN, when the business collects it (invoices over the e-Arşiv limit). */
  identityNumber?: string;
  /** Invoice to a company. */
  company?: { name: string; taxOffice?: string; taxNumber?: string };
}

export interface OrderSnapshot {
  v: 1;
  /** Order number, also the provider's basket / conversation id. */
  id: string;
  /** ISO time the order was created. */
  createdAt: string;
  locale: "tr" | "en";
  quote: Quote;
  buyer: OrderBuyer;
  note?: string;
}

export interface PaidOrder extends OrderSnapshot {
  paidAt: string;
  provider: "iyzico";
  paymentId?: string;
  /** Amount charged, decimal string as the provider returned it. */
  paidPrice?: string;
  installment?: number;
}

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** A readable, unguessable order number: "VB-251118-7K3Q9X". */
export function createOrderId(prefix = "VB", now = new Date()): string {
  const date = now.toISOString().slice(2, 10).replace(/-/g, "");
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const tail = [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
  return `${prefix.replace(/[^A-Za-z0-9]/g, "").slice(0, 6) || "VB"}-${date}-${tail}`;
}

/** Signs a snapshot: `<base64url JSON>.<hex HMAC>`. */
export async function signOrder(order: OrderSnapshot, secret: string): Promise<string> {
  if (!secret || secret.length < 32) throw new TypeError("commerce: ORDER_SECRET must be at least 32 characters");
  const body = b64url(enc.encode(JSON.stringify(order)));
  return `${body}.${toHex(await hmacSha256(secret, body))}`;
}

/** The snapshot when the signature matches and it is younger than `maxAgeSeconds`; otherwise null. */
export async function verifyOrder(token: string | null | undefined, secret: string, opts: { maxAgeSeconds?: number; now?: Date } = {}): Promise<OrderSnapshot | null> {
  if (!token || typeof token !== "string" || !secret) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, toHex(await hmacSha256(secret, body)))) return null;
  let order: OrderSnapshot;
  try {
    order = JSON.parse(dec.decode(fromB64url(body))) as OrderSnapshot;
  } catch {
    return null;
  }
  if (order?.v !== 1 || typeof order.id !== "string") return null;
  const age = ((opts.now ?? new Date()).getTime() - Date.parse(order.createdAt)) / 1000;
  if (!(age >= -60 && age <= (opts.maxAgeSeconds ?? 3600))) return null;
  return order;
}

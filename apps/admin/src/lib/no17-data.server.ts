import "server-only";
import { MEMBERS, type Member } from "./no17-data";

/**
 * Ham TC + telefon REPODA DEĞİL — Vercel ortam değişkeninden (MEMBER_PII_B64, base64 JSON)
 * gelir. Public MEMBERS (key/ad/kan/doğum günü/bayraklar) üstüne tc/telefon bindirilir.
 * SADECE sunucu (route handler / server component); client'a ASLA import edilmez.
 * KVKK/gizlilik sınırı burada: repoda hiçbir ham kimlik numarası tutulmaz.
 */
function loadPII(): Record<string, { tc?: string; phone?: string }> {
  const b64 = process.env.MEMBER_PII_B64;
  if (!b64) return {};
  try {
    return JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  } catch {
    return {};
  }
}

const PII = loadPII();

export const MEMBERS_FULL: Member[] = MEMBERS.map((m) => ({
  ...m,
  tc: PII[m.key]?.tc ?? "",
  phone: PII[m.key]?.phone ?? "",
}));

export const MEMBER_FULL_BY_KEY: Record<string, Member> =
  Object.fromEntries(MEMBERS_FULL.map((m) => [m.key, m]));

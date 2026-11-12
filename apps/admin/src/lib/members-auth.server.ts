import "server-only";
import { MEMBERS_FULL, MEMBER_FULL_BY_KEY } from "./no17-data.server";
import { normalizeBday } from "./no17-bday";
import { titlecase, maskTc } from "./no17-helpers";

/**
 * Admin anahtarları — yalnızca PANEL_ADMIN_KEYS env'inden (virgülle ayrılmış üye
 * anahtarları). Env yoksa kimse admin değildir (fail-closed); repoda isim tutulmaz.
 */
function adminKeys(): Set<string> {
  const raw = process.env.PANEL_ADMIN_KEYS;
  const list = raw ? raw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  return new Set(list);
}

export function roleFor(key: string): "admin" | "member" {
  return adminKeys().has(key) ? "admin" : "member";
}

/** TC + doğum günü (gün/ay) doğrula → oturum için {key,name,role} ya da null. */
export function verifyLogin(tcRaw: string, bdayKeyInput: string): { key: string; name: string; role: "admin" | "member" } | null {
  const tc = (tcRaw || "").replace(/\D/g, "");
  if (tc.length !== 11) return null;
  const member = MEMBERS_FULL.find((m) => m.tc === tc);
  if (!member) return null;
  const stored = normalizeBday(member.bday);
  if (!stored || stored !== bdayKeyInput) return null; // doğum günü eşleşmiyor ya da kayıtlı değil
  return { key: member.key, name: titlecase(member.name), role: roleFor(member.key) };
}

/** Üyenin KENDİ profili — TC maskeli, kendi telefonu açık. */
export function ownProfile(key: string) {
  const m = MEMBER_FULL_BY_KEY[key];
  if (!m) return null;
  return {
    key: m.key,
    name: titlecase(m.name),
    tcMasked: maskTc(m.tc),
    hasTc: !!m.tc,
    phone: m.phone || "",
    blood: m.blood || "",
    bday: m.bday || "",
    kombine: m.kombine,
    uye: m.uye,
    role: roleFor(m.key),
  };
}

/** Admin için tam liste (ham TC + telefon). Yalnızca admin route'undan çağrılır. */
export function fullMembers() {
  return MEMBERS_FULL.map((m) => ({
    key: m.key,
    name: m.name,
    tc: m.tc,
    phone: m.phone,
    blood: m.blood,
    bday: m.bday,
    kombine: m.kombine,
    uye: m.uye,
  }));
}

// Security & sessions data. Sessions, sign-in history, the allow list, backup codes and the TOTP
// URI come from the shared account fixtures; passkeys and the 2FA method state are local to this screen.
import { backupCodes, ipAllowList, sessions, signInHistory, totpUri, type SessionDevice } from "../../_shared/account";
import type { L } from "../../_shared/l10n";
import { me } from "../../_shared/people";
import { day } from "../../_shared/time";

export { backupCodes, sessions, signInHistory, totpUri, me, type SessionDevice };
export type SignIn = (typeof signInHistory)[number];

/** The address this browser signs in from (matches the current session). */
export const currentIp = sessions.find((s) => s.current)!.ip;

export interface Passkey {
  id: string;
  name: string;
  /** Where the key lives. */
  authenticator: L;
  added: string;
  lastUsed?: string;
}

export const passkeys: Passkey[] = [
  { id: "pk-1", name: "Work laptop", authenticator: { en: "Built-in fingerprint reader", tr: "Dahili parmak izi okuyucu" }, added: day(-212), lastUsed: day(0) },
  { id: "pk-2", name: "Hardware key", authenticator: { en: "USB security key", tr: "USB güvenlik anahtarı" }, added: day(-401), lastUsed: day(-38) },
];

export const usedBackupCodes = [backupCodes[0]!, backupCodes[3]!];

export interface AllowEntry {
  id: string;
  cidr: string;
  label: string;
  addedBy: string;
}

export const allowList: AllowEntry[] = [
  { id: "ip-1", cidr: ipAllowList[0]!, label: "Kadıköy office", addedBy: "p-defne" },
  { id: "ip-2", cidr: ipAllowList[1]!, label: "Ankara warehouse", addedBy: "p-viktor" },
];

export const methodLabels: Record<SignIn["method"], L> = {
  password: { en: "Password", tr: "Parola" },
  passkey: { en: "Passkey", tr: "Geçiş anahtarı" },
  sso: { en: "Single sign-on", tr: "Tek oturum açma" },
  "magic-link": { en: "Email link", tr: "E-posta bağlantısı" },
};

export const resultLabels: Record<SignIn["result"], L> = {
  success: { en: "Signed in", tr: "Giriş yapıldı" },
  failed: { en: "Wrong password", tr: "Hatalı parola" },
  blocked: { en: "Blocked", tr: "Engellendi" },
};

/* IPv4 helpers for the allow list ------------------------------------------------ */

const ipv4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

/** `203.0.113.0/24` or a single `198.51.100.8`. Returns an error message key or null. */
export function checkCidr(value: string): "format" | "prefix" | null {
  const [ip, prefix, ...rest] = value.trim().split("/");
  if (rest.length || !ip || !ipv4.test(ip)) return "format";
  if (prefix !== undefined && (!/^\d{1,2}$/.test(prefix) || Number(prefix) < 8 || Number(prefix) > 32)) return "prefix";
  return null;
}

const toInt = (ip: string) => ip.split(".").reduce((n, o) => n * 256 + Number(o), 0);

/** Does `ip` fall inside `cidr`? */
export function inCidr(ip: string, cidr: string): boolean {
  const [base, bits = "32"] = cidr.split("/");
  const size = 2 ** (32 - Number(bits));
  const start = Math.floor(toInt(base!) / size) * size;
  const n = toInt(ip);
  return n >= start && n < start + size;
}

/** Number of addresses a range covers, for the "256 addresses" hint. */
export const cidrSize = (cidr: string) => 2 ** (32 - Number(cidr.split("/")[1] ?? 32));

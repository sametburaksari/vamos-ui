import { MEMBERS, FIXTURE, type Member, type Fixture } from "./no17-data";

export type Tone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export const MEMBER_BY_KEY: Record<string, Member> = Object.fromEntries(MEMBERS.map((m) => [m.key, m]));
export const MATCH_BY_ID: Record<string, Fixture> = Object.fromEntries(FIXTURE.map((f) => [f.id, f]));

const trUpper = (s: string) => s.replace(/i/g, "İ").toLocaleUpperCase("tr");
const trLower = (s: string) => s.replace(/I/g, "ı").replace(/İ/g, "i").toLocaleLowerCase("tr");

/** Türkçe-uyumlu başlık biçimi: "AHMET YILMAZ" → "Ahmet Yılmaz". */
export const titlecase = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => (w ? trUpper(w[0]!) + trLower(w.slice(1)) : w))
    .join(" ");

/** KVKK: TC'nin ortası maskeli ("163 •••• 96"). */
export const maskTc = (tc: string) => (tc ? `${tc.slice(0, 3)} •••• ${tc.slice(-2)}` : "—");

export const fmtPhone = (p: string) =>
  p && p.length === 11 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7, 9)} ${p.slice(9)}` : p || "—";

export const bloodTone = (b: string): Tone => (!b || b === "Bilinmiyor" ? "neutral" : b.includes("-") ? "warning" : "info");

export const hasBlood = (b: string) => !!b && b !== "Bilinmiyor";

export const bloodOptions = ["0 Rh+", "0 Rh-", "A Rh+", "A Rh-", "B Rh+", "B Rh-", "AB Rh+", "AB Rh-"].map((v) => ({
  value: v,
  label: v,
  tone: (v.includes("-") ? "warning" : "info") as Tone,
}));

export const uyeOptions = [
  { value: "uye", label: "Üye", tone: "success" as Tone },
  { value: "form", label: "Form kaydı", tone: "neutral" as Tone },
];

export const matchSubtitle = (f: Fixture) => `${f.date} · ${f.comp} · ${f.ha === "İç" ? "İç saha" : "Deplasman"}`;

/** Türk Lirası biçimi — kuruşsuz ("₺1.250"). */
export const fmtTL = (n: number) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(n || 0);

/** Kampanya türüne göre rozet tonu. */
export const campaignTone = (t: string): Tone =>
  t === "okul" ? "info" : t === "pankart" ? "accent" : t === "cenaze" ? "warning" : "neutral";

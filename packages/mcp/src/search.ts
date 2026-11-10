import type { RegistryIndexItem, RegistryItem } from "./types.js";

/**
 * Folds case and diacritics, Turkish-aware: "Giriş", "GİRİŞ", "giris" all become "giris";
 * "ı/I" → "i", "ş" → "s", "ğ" → "g", "ü" → "u", "ö" → "o", "ç" → "c".
 */
export function fold(text: string): string {
  return text
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Turkish (folded) UI words → English registry vocabulary. */
const SYNONYMS: Record<string, string[]> = {
  giris: ["login", "sign in"],
  oturum: ["login", "session"],
  kayit: ["signup", "register"],
  uye: ["signup", "user"],
  sifre: ["password"],
  parola: ["password"],
  dogrulama: ["otp", "verification"],
  kod: ["otp", "code"],
  tablo: ["table", "data table"],
  liste: ["list"],
  grafik: ["chart"],
  cizelge: ["chart"],
  takvim: ["calendar"],
  tarih: ["date", "date picker"],
  saat: ["time"],
  ayarlar: ["settings"],
  ayar: ["settings"],
  profil: ["profile", "settings"],
  kullanici: ["user", "users"],
  kullanicilar: ["users"],
  rol: ["roles"],
  yetki: ["roles", "permissions"],
  pencere: ["dialog", "modal"],
  acilir: ["dropdown", "popover"],
  menu: ["menu", "dropdown"],
  bildirim: ["toast", "notification"],
  uyari: ["alert"],
  buton: ["button"],
  dugme: ["button"],
  secim: ["select"],
  secici: ["picker", "select"],
  arama: ["search", "command"],
  yukle: ["upload", "file"],
  dosya: ["file", "upload"],
  resim: ["image", "media"],
  gorsel: ["image", "media"],
  fatura: ["invoice", "billing"],
  odeme: ["payment", "billing", "checkout"],
  fiyat: ["pricing", "price"],
  fiyatlandirma: ["pricing"],
  iletisim: ["contact"],
  panel: ["dashboard", "admin"],
  ozet: ["dashboard", "overview"],
  rapor: ["report", "dashboard", "chart"],
  musteri: ["customer", "crm"],
  siparis: ["order", "orders"],
  urun: ["product", "products"],
  stok: ["inventory"],
  kanban: ["board", "kanban"],
  pano: ["board", "dashboard"],
  gorev: ["task", "tasks", "board"],
  sekme: ["tabs"],
  sayfalama: ["pagination"],
  gezinme: ["navigation", "sidebar"],
  yan: ["sidebar"],
  bos: ["empty"],
  hata: ["error"],
  bakim: ["maintenance"],
  karsilama: ["onboarding"],
  baslangic: ["onboarding"],
  form: ["form"],
  editor: ["editor"],
  metin: ["text", "editor"],
  yorum: ["comments"],
  randevu: ["calendar", "scheduler", "booking"],
  rezervasyon: ["booking", "calendar"],
  restoran: ["restaurant"],
  site: ["site", "website"],
  ajans: ["agency"],
  detay: ["detail"],
  calisma: ["workspace"],
};

const STOP = new Set([
  "a", "an", "the", "and", "or", "for", "with", "of", "to", "in", "on", "my", "page", "screen", "ui",
  "bir", "ve", "ile", "icin", "sayfa", "sayfasi", "ekran", "ekrani", "olan", "gibi",
]);

export function tokenize(query: string): string[] {
  return fold(query)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP.has(token));
}

/** Query terms plus their English expansions; each group is "one concept". */
export function expand(query: string): string[][] {
  return tokenize(query).map((token) => {
    const extra = SYNONYMS[token] ?? (token.length > 4 ? SYNONYMS[token.replace(/(lar|ler|leri|lari|si|su|i|u)$/, "")] : undefined);
    return [token, ...(extra ?? []).map(fold)];
  });
}

export interface SearchHit {
  item: RegistryIndexItem;
  score: number;
  /** Fields that matched, for "why" output. */
  matched: string[];
}

interface Field {
  name: string;
  text: string;
  weight: number;
}

function fieldsOf(item: RegistryIndexItem, full?: RegistryItem): Field[] {
  const fields: Field[] = [
    { name: "name", text: fold(item.name.replace(/-/g, " ")), weight: 10 },
    { name: "title", text: fold(item.title ?? ""), weight: 8 },
    { name: "tags", text: fold((item.tags ?? []).join(" ")), weight: 6 },
    { name: "group", text: fold(`${item.group ?? ""} ${item.category ?? ""}`), weight: 4 },
    { name: "description", text: fold(item.description ?? ""), weight: 3 },
  ];
  const g = full?.guidance;
  if (g) {
    fields.push({ name: "guidance", text: fold([...g.whenToUse, ...g.related].join(" ")), weight: 2 });
  }
  return fields;
}

function wordMatch(text: string, term: string): number {
  if (!text || !term) return 0;
  if (text === term) return 3;
  const re = new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (re.test(text)) return 2; // word-start match ("dial" → "dialog")
  if (term.length >= 4 && text.includes(term)) return 1;
  return 0;
}

/**
 * Ranks items for a free-text query. Every concept (query word or its synonyms) must match
 * somewhere; if that yields nothing the ranking falls back to "any concept matches".
 */
export function rankItems(
  query: string,
  items: RegistryIndexItem[],
  details: Map<string, RegistryItem> | RegistryItem[] = [],
  /** "strict": every concept must match (falls back to "any" when nothing does). "any": rank partial matches too. */
  mode: "strict" | "any" = "strict",
): SearchHit[] {
  const groups = expand(query);
  if (!groups.length) return [];
  const byName = details instanceof Map ? details : new Map(details.map((item) => [item.name, item]));
  const exact = fold(query.trim()).replace(/\s+/g, "-");

  const score = (requireAll: boolean): SearchHit[] => {
    const hits: SearchHit[] = [];
    for (const item of items) {
      const fields = fieldsOf(item, byName.get(item.name));
      let total = 0;
      let concepts = 0;
      const matched = new Set<string>();
      for (const group of groups) {
        let best = 0;
        for (const term of group) {
          for (const field of fields) {
            const m = wordMatch(field.text, term);
            if (m) {
              const value = m * field.weight * (term === group[0] ? 1 : 0.8);
              if (value > best) best = value;
              matched.add(field.name);
            }
          }
        }
        if (best > 0) {
          concepts++;
          total += best;
        }
      }
      if (!concepts || (requireAll && concepts < groups.length)) continue;
      if (item.name === exact) total += 100;
      total *= concepts / groups.length;
      // Components and blocks are what agents ask for; lib/style items are plumbing.
      if (item.type === "lib" || item.type === "style") total *= 0.5;
      hits.push({ item, score: Math.round(total * 10) / 10, matched: [...matched] });
    }
    return hits.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name));
  };

  if (mode === "any") return score(false);
  const strict = score(true);
  return strict.length ? strict : score(false);
}

/** Simple edit distance for "did you mean". */
export function closestNames(name: string, items: RegistryIndexItem[], limit = 3): string[] {
  const target = fold(name);
  const dist = (a: string, b: string) => {
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let prev = row[0]!;
      row[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = row[j]!;
        row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return row[b.length]!;
  };
  const fuzzy = items
    .map((item) => ({ name: item.name, d: item.name.includes(target) || target.includes(item.name) ? 0.5 : dist(target, item.name) }))
    .filter((x) => x.d <= Math.max(2, Math.floor(target.length / 3)))
    .sort((a, b) => a.d - b.d)
    .map((x) => x.name);
  const ranked = rankItems(name, items).map((hit) => hit.item.name);
  return [...new Set([...fuzzy, ...ranked])].slice(0, limit);
}

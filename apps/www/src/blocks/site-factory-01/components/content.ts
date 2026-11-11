// Sample content for "Ostrand Components", a fictional precision-machining plant in Gebze OSB,
// Kocaeli. Every human-readable field is `{ en, tr }`. Specs are representative, not for design use.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Branch, type Localized, type OpeningHours } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

export const PHONE = "+902160000000";
export const EMAIL = "rfq@ostrand.example.com";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-GB");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return { t, intl: intlOf(locale), labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined };
}

export const num = (value: number, locale: SiteLocale, digits = 0) => new Intl.NumberFormat(intlOf(locale), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

const unsplash = (id: string, w: number, h: number) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=72&auto=format&fit=crop`, width: w, height: h });

export const photos = {
  line: { ...unsplash("1581091226825-a6a2a5aee158", 1600, 1100), alt: { en: "An engineer at a laptop beside an automated machining line", tr: "Otomatik talaşlı imalat hattının yanında dizüstü bilgisayarla çalışan bir mühendis" } },
  sparks: { ...unsplash("1504917595217-d4dc5ebe6122", 1600, 1100), alt: { en: "Sparks flying from a grinder held against a steel part", tr: "Çelik parçaya tutulan taşlama makinesinden sıçrayan kıvılcımlar" } },
  drawing: { ...unsplash("1581092160562-40aa08e78837", 1600, 1100), alt: { en: "A technical drawing on a bench, an engineer marking it up beside a toolbox", tr: "Tezgâhta teknik resim; alet çantasının yanında üzerinde not alan bir mühendis" } },
  plant: { ...unsplash("1513828583688-c52646db42da", 1600, 1100), alt: { en: "Stainless pipework and a blower in a clean production hall", tr: "Temiz bir üretim holünde paslanmaz boru hattı ve fan" } },
};

// ---------------------------------------------------------------- catalogue

export type FamilyId = "flanges" | "housings" | "fittings" | "shafts";
export const families: { id: FamilyId; name: L; blurb: L }[] = [
  { id: "flanges", name: { en: "Flanges", tr: "Flanşlar" }, blurb: { en: "EN 1092-1 weld-neck and slip-on, PN10–PN40, DN15–DN300", tr: "EN 1092-1 kaynak boyunlu ve geçme, PN10–PN40, DN15–DN300" } },
  { id: "housings", name: { en: "Bearing housings", tr: "Rulman yatakları" }, blurb: { en: "Split plummer blocks and flanged units in GJL-250 and GJS-400", tr: "GJL-250 ve GJS-400 ayrık yataklar ve flanşlı üniteler" } },
  { id: "fittings", name: { en: "Hydraulic fittings", tr: "Hidrolik bağlantılar" }, blurb: { en: "24° cone fittings to ISO 8434-1, zinc-nickel plated, up to 630 bar", tr: "ISO 8434-1 24° konik rakorlar, çinko-nikel kaplı, 630 bara kadar" } },
  { id: "shafts", name: { en: "Shafts", tr: "Miller" }, blurb: { en: "Induction-hardened, ground to h6, cut and machined to drawing", tr: "İndüksiyonla sertleştirilmiş, h6 taşlanmış, resme göre kesilip işlenmiş" } },
];

export type Unit = "mm" | "kg" | "bar" | "text" | "count";
export interface SpecColumn {
  key: string;
  label: L;
  unit: Unit;
}
export type SpecRow = Record<string, string | number>;

export interface Product {
  id: string;
  code: string;
  family: FamilyId;
  name: L;
  summary: L;
  facts: { label: L; value: L }[];
  columns: SpecColumn[];
  rows: SpecRow[];
  /** Which drawing to show. */
  drawing: "flange" | "housing" | "fitting" | "shaft";
}

const common = {
  material: { en: "Material", tr: "Malzeme" },
  standard: { en: "Standard", tr: "Standart" },
  tolerance: { en: "General tolerance", tr: "Genel tolerans" },
  finish: { en: "Finish", tr: "Yüzey" },
  lead: { en: "Lead time", tr: "Termin" },
  moq: { en: "Minimum order", tr: "Asgari sipariş" },
};

export const products: Product[] = [
  {
    id: "wn16",
    code: "OC-WN16",
    family: "flanges",
    drawing: "flange",
    name: { en: "Weld-neck flange PN16", tr: "Kaynak boyunlu flanş PN16" },
    summary: { en: "Forged P250GH, machined in one set-up. Raised face Type B1, Ra 3.2–12.5 µm.", tr: "Dövme P250GH, tek bağlamada işlenir. B1 tipi yüksek yüz, Ra 3,2–12,5 µm." },
    facts: [
      { label: common.material, value: { en: "P250GH forged, 3.1 certificate", tr: "P250GH dövme, 3.1 sertifikalı" } },
      { label: common.standard, value: { en: "EN 1092-1 Type 11", tr: "EN 1092-1 Tip 11" } },
      { label: common.finish, value: { en: "Black oxide or zinc-nickel", tr: "Siyah oksit veya çinko-nikel" } },
      { label: common.lead, value: { en: "3 weeks · stock DN50–DN150", tr: "3 hafta · DN50–DN150 stokta" } },
      { label: common.moq, value: { en: "20 pieces", tr: "20 adet" } },
    ],
    columns: [
      { key: "size", label: { en: "Size", tr: "Ölçü" }, unit: "text" },
      { key: "D", label: { en: "Outside Ø D", tr: "Dış Ø D" }, unit: "mm" },
      { key: "K", label: { en: "Bolt circle K", tr: "Cıvata dairesi K" }, unit: "mm" },
      { key: "b", label: { en: "Thickness b", tr: "Kalınlık b" }, unit: "mm" },
      { key: "bolts", label: { en: "Bolts", tr: "Cıvata" }, unit: "text" },
      { key: "mass", label: { en: "Mass", tr: "Kütle" }, unit: "kg" },
    ],
    rows: [
      { size: "DN50", D: 165, K: 125, b: 18, bolts: "4 × M16", mass: 2.6 },
      { size: "DN80", D: 200, K: 160, b: 20, bolts: "8 × M16", mass: 3.9 },
      { size: "DN100", D: 220, K: 180, b: 20, bolts: "8 × M16", mass: 4.6 },
      { size: "DN150", D: 285, K: 240, b: 22, bolts: "8 × M20", mass: 8.3 },
      { size: "DN200", D: 340, K: 295, b: 24, bolts: "12 × M20", mass: 11.6 },
    ],
  },
  {
    id: "so10",
    code: "OC-SO10",
    family: "flanges",
    drawing: "flange",
    name: { en: "Slip-on flange PN10", tr: "Geçme flanş PN10" },
    summary: { en: "Cut from S235JR plate, faced and drilled. For low-pressure water and air lines.", tr: "S235JR levhadan kesilir, alnı işlenir ve delinir. Düşük basınçlı su ve hava hatları için." },
    facts: [
      { label: common.material, value: { en: "S235JR plate, 2.2 certificate", tr: "S235JR levha, 2.2 sertifikalı" } },
      { label: common.standard, value: { en: "EN 1092-1 Type 01", tr: "EN 1092-1 Tip 01" } },
      { label: common.finish, value: { en: "Oiled, or hot-dip galvanised", tr: "Yağlı veya sıcak daldırma galvaniz" } },
      { label: common.lead, value: { en: "2 weeks", tr: "2 hafta" } },
      { label: common.moq, value: { en: "50 pieces", tr: "50 adet" } },
    ],
    columns: [
      { key: "size", label: { en: "Size", tr: "Ölçü" }, unit: "text" },
      { key: "D", label: { en: "Outside Ø D", tr: "Dış Ø D" }, unit: "mm" },
      { key: "K", label: { en: "Bolt circle K", tr: "Cıvata dairesi K" }, unit: "mm" },
      { key: "b", label: { en: "Thickness b", tr: "Kalınlık b" }, unit: "mm" },
      { key: "bolts", label: { en: "Bolts", tr: "Cıvata" }, unit: "text" },
      { key: "mass", label: { en: "Mass", tr: "Kütle" }, unit: "kg" },
    ],
    rows: [
      { size: "DN65", D: 185, K: 145, b: 16, bolts: "8 × M16", mass: 2.4 },
      { size: "DN100", D: 220, K: 180, b: 18, bolts: "8 × M16", mass: 3.3 },
      { size: "DN150", D: 285, K: 240, b: 20, bolts: "8 × M20", mass: 6.0 },
      { size: "DN250", D: 395, K: 350, b: 22, bolts: "12 × M20", mass: 11.9 },
    ],
  },
  {
    id: "pb5",
    code: "OC-PB5",
    family: "housings",
    drawing: "housing",
    name: { en: "Split plummer block, 5-series", tr: "Ayrık yatak gövdesi, 5 serisi" },
    summary: { en: "Grey cast iron, cap and base machined as a pair. Takes self-aligning ball or spherical roller bearings on adapter sleeves.", tr: "Gri dökme demir; kapak ve gövde çift olarak işlenir. Adaptör burçlu oynak bilyalı veya oynak makaralı rulman alır." },
    facts: [
      { label: common.material, value: { en: "EN-GJL-250, painted RAL 7035", tr: "EN-GJL-250, RAL 7035 boyalı" } },
      { label: common.standard, value: { en: "Interchangeable with ISO 113 dimensions", tr: "ISO 113 ölçüleriyle değiştirilebilir" } },
      { label: common.tolerance, value: { en: "Bore H7, base flat to 0.05 mm", tr: "Delik H7, taban düzlemselliği 0,05 mm" } },
      { label: common.lead, value: { en: "4 weeks", tr: "4 hafta" } },
      { label: common.moq, value: { en: "10 pieces", tr: "10 adet" } },
    ],
    columns: [
      { key: "size", label: { en: "Type", tr: "Tip" }, unit: "text" },
      { key: "d", label: { en: "Shaft Ø d", tr: "Mil Ø d" }, unit: "mm" },
      { key: "D", label: { en: "Bearing seat Ø D", tr: "Rulman yuvası Ø D" }, unit: "mm" },
      { key: "H", label: { en: "Centre height H", tr: "Eksen yüksekliği H" }, unit: "mm" },
      { key: "J", label: { en: "Bolt spacing J", tr: "Cıvata aralığı J" }, unit: "mm" },
      { key: "mass", label: { en: "Mass", tr: "Kütle" }, unit: "kg" },
    ],
    rows: [
      { size: "PB506", d: 25, D: 62, H: 50, J: 150, mass: 1.7 },
      { size: "PB508", d: 35, D: 80, H: 60, J: 170, mass: 2.6 },
      { size: "PB510", d: 45, D: 90, H: 60, J: 170, mass: 3.0 },
      { size: "PB512", d: 55, D: 110, H: 70, J: 210, mass: 4.6 },
      { size: "PB516", d: 70, D: 140, H: 95, J: 250, mass: 8.4 },
    ],
  },
  {
    id: "ff4",
    code: "OC-FF4",
    family: "housings",
    drawing: "housing",
    name: { en: "Four-bolt flanged unit", tr: "Dört cıvatalı flanşlı ünite" },
    summary: { en: "Ductile iron square flange with a grease nipple, for conveyors and agricultural drives.", tr: "Gres nipelli küresel grafitli dökme demir kare flanş; konveyör ve tarım makinesi tahrikleri için." },
    facts: [
      { label: common.material, value: { en: "EN-GJS-400-15", tr: "EN-GJS-400-15" } },
      { label: common.standard, value: { en: "Works with 2xx insert bearings", tr: "2xx serisi rulmanlarla uyumlu" } },
      { label: common.finish, value: { en: "Black dip paint", tr: "Siyah daldırma boya" } },
      { label: common.lead, value: { en: "3 weeks", tr: "3 hafta" } },
      { label: common.moq, value: { en: "25 pieces", tr: "25 adet" } },
    ],
    columns: [
      { key: "size", label: { en: "Type", tr: "Tip" }, unit: "text" },
      { key: "d", label: { en: "Shaft Ø d", tr: "Mil Ø d" }, unit: "mm" },
      { key: "A", label: { en: "Flange A", tr: "Flanş A" }, unit: "mm" },
      { key: "J", label: { en: "Bolt square J", tr: "Cıvata karesi J" }, unit: "mm" },
      { key: "bolts", label: { en: "Bolts", tr: "Cıvata" }, unit: "text" },
      { key: "mass", label: { en: "Mass", tr: "Kütle" }, unit: "kg" },
    ],
    rows: [
      { size: "FF205", d: 25, A: 86, J: 64, bolts: "4 × M10", mass: 0.8 },
      { size: "FF207", d: 35, A: 117, J: 92, bolts: "4 × M12", mass: 1.5 },
      { size: "FF210", d: 50, A: 143, J: 111, bolts: "4 × M14", mass: 2.4 },
    ],
  },
  {
    id: "gs24",
    code: "OC-GS24",
    family: "fittings",
    drawing: "fitting",
    name: { en: "Straight male stud, 24° cone", tr: "Düz erkek rakor, 24° konik" },
    summary: { en: "Free-cutting steel, metric thread with ED seal. Shipped with nut and cutting ring.", tr: "Otomat çeliği, ED contalı metrik diş. Somun ve kesici halkayla gönderilir." },
    facts: [
      { label: common.material, value: { en: "11SMnPb30 + Zn-Ni 8 µm, 720 h salt spray", tr: "11SMnPb30 + Zn-Ni 8 µm, 720 sa tuz testi" } },
      { label: common.standard, value: { en: "ISO 8434-1, L series", tr: "ISO 8434-1, L serisi" } },
      { label: common.tolerance, value: { en: "Thread 6g, cone checked by gauge", tr: "Diş 6g, koni mastarla kontrol" } },
      { label: common.lead, value: { en: "Stock · 48 h dispatch", tr: "Stok · 48 sa sevkiyat" } },
      { label: common.moq, value: { en: "100 pieces", tr: "100 adet" } },
    ],
    columns: [
      { key: "size", label: { en: "Tube OD", tr: "Boru dış çapı" }, unit: "text" },
      { key: "thread", label: { en: "Thread", tr: "Diş" }, unit: "text" },
      { key: "L", label: { en: "Length L", tr: "Boy L" }, unit: "mm" },
      { key: "S", label: { en: "Across flats S", tr: "Anahtar ağzı S" }, unit: "mm" },
      { key: "pn", label: { en: "Max. pressure", tr: "Azami basınç" }, unit: "bar" },
    ],
    rows: [
      { size: "6 L", thread: "M12 × 1.5", L: 29, S: 14, pn: 500 },
      { size: "10 L", thread: "M16 × 1.5", L: 31, S: 19, pn: 500 },
      { size: "12 L", thread: "M18 × 1.5", L: 33, S: 22, pn: 400 },
      { size: "15 L", thread: "M22 × 1.5", L: 36, S: 27, pn: 400 },
      { size: "18 L", thread: "M26 × 1.5", L: 39, S: 32, pn: 400 },
      { size: "22 L", thread: "M27 × 2", L: 42, S: 36, pn: 250 },
    ],
  },
  {
    id: "gt24",
    code: "OC-GT24",
    family: "fittings",
    drawing: "fitting",
    name: { en: "Equal tee, 24° cone", tr: "Eşit tee, 24° konik" },
    summary: { en: "Forged body, three cutting-ring ends. For manifolds on mobile hydraulics.", tr: "Dövme gövde, üç kesici halka ucu. Mobil hidrolik manifoldları için." },
    facts: [
      { label: common.material, value: { en: "C45 forged + Zn-Ni", tr: "C45 dövme + Zn-Ni" } },
      { label: common.standard, value: { en: "ISO 8434-1, S series", tr: "ISO 8434-1, S serisi" } },
      { label: common.finish, value: { en: "Zinc-nickel, transparent passivation", tr: "Çinko-nikel, şeffaf pasivasyon" } },
      { label: common.lead, value: { en: "Stock · 48 h dispatch", tr: "Stok · 48 sa sevkiyat" } },
      { label: common.moq, value: { en: "50 pieces", tr: "50 adet" } },
    ],
    columns: [
      { key: "size", label: { en: "Tube OD", tr: "Boru dış çapı" }, unit: "text" },
      { key: "L", label: { en: "Centre to end L", tr: "Merkez–uç L" }, unit: "mm" },
      { key: "S", label: { en: "Across flats S", tr: "Anahtar ağzı S" }, unit: "mm" },
      { key: "pn", label: { en: "Max. pressure", tr: "Azami basınç" }, unit: "bar" },
      { key: "mass", label: { en: "Mass", tr: "Kütle" }, unit: "kg" },
    ],
    rows: [
      { size: "8 S", L: 25, S: 17, pn: 630, mass: 0.09 },
      { size: "12 S", L: 30, S: 22, pn: 630, mass: 0.17 },
      { size: "16 S", L: 35, S: 27, pn: 400, mass: 0.29 },
      { size: "20 S", L: 40, S: 32, pn: 400, mass: 0.44 },
    ],
  },
  {
    id: "hs6",
    code: "OC-HS6",
    family: "shafts",
    drawing: "shaft",
    name: { en: "Induction-hardened shaft h6", tr: "İndüksiyonla sertleştirilmiş mil h6" },
    summary: { en: "Cf53, hardened and ground, hard-chrome optional. Cut to length and machined to your drawing.", tr: "Cf53, sertleştirilmiş ve taşlanmış, isteğe bağlı sert krom. Boyuna kesilip resminize göre işlenir." },
    facts: [
      { label: common.material, value: { en: "Cf53 (1.1213)", tr: "Cf53 (1.1213)" } },
      { label: common.tolerance, value: { en: "Ø h6 · straightness 0.05 mm/m · Ra 0.3 µm", tr: "Ø h6 · doğrusallık 0,05 mm/m · Ra 0,3 µm" } },
      { label: common.finish, value: { en: "Ground, or 20 µm hard chrome", tr: "Taşlanmış veya 20 µm sert krom" } },
      { label: common.lead, value: { en: "Bar stock · machined parts 3 weeks", tr: "Çubuk stok · işlenmiş parça 3 hafta" } },
      { label: common.moq, value: { en: "1 bar (6 m) or 10 parts", tr: "1 çubuk (6 m) veya 10 parça" } },
    ],
    columns: [
      { key: "size", label: { en: "Ø", tr: "Ø" }, unit: "text" },
      { key: "case", label: { en: "Case depth", tr: "Sertlik derinliği" }, unit: "mm" },
      { key: "hrc", label: { en: "Hardness HRC", tr: "Sertlik HRC" }, unit: "count" },
      { key: "max", label: { en: "Max. length", tr: "Azami boy" }, unit: "mm" },
      { key: "mass", label: { en: "Mass per metre", tr: "Metre ağırlığı" }, unit: "kg" },
    ],
    rows: [
      { size: "12 h6", case: 1.2, hrc: 60, max: 4000, mass: 0.89 },
      { size: "20 h6", case: 1.5, hrc: 60, max: 6000, mass: 2.47 },
      { size: "30 h6", case: 2.0, hrc: 60, max: 6000, mass: 5.55 },
      { size: "40 h6", case: 2.2, hrc: 60, max: 6000, mass: 9.86 },
      { size: "50 h6", case: 2.5, hrc: 60, max: 6000, mass: 15.4 },
    ],
  },
];

export const unitLabel = (u: Unit, system: "metric" | "imperial") => (u === "mm" ? (system === "metric" ? "mm" : "in") : u === "kg" ? (system === "metric" ? "kg" : "lb") : u === "bar" ? (system === "metric" ? "bar" : "psi") : "");

/** A spec value in the chosen system, as a display string. */
export function specValue(value: string | number, unit: Unit, system: "metric" | "imperial", locale: SiteLocale): string {
  if (typeof value === "string") return value;
  if (system === "imperial") {
    if (unit === "mm") return num(value / 25.4, locale, 2);
    if (unit === "kg") return num(value * 2.20462, locale, 2);
    if (unit === "bar") return num(Math.round(value * 14.5038), locale);
  }
  const digits = unit === "kg" && value < 1 ? 2 : Number.isInteger(value) ? 0 : 1;
  return num(value, locale, digits);
}

/** The datasheet as CSV (semicolon-separated so Excel in TR and EU locales opens it in columns). */
export function datasheetCsv(p: Product, system: "metric" | "imperial", locale: SiteLocale, t: (v: L) => string): string {
  const esc = (s: string) => (/[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const lines: string[] = [];
  lines.push(`Ostrand Components;${p.code};${esc(t(p.name))}`);
  lines.push(esc(t(p.summary)));
  for (const f of p.facts) lines.push(`${esc(t(f.label))};${esc(t(f.value))}`);
  lines.push("");
  lines.push(p.columns.map((c) => esc(`${t(c.label)}${unitLabel(c.unit, system) ? ` (${unitLabel(c.unit, system)})` : ""}`)).join(";"));
  for (const r of p.rows) lines.push(p.columns.map((c) => esc(specValue(r[c.key] ?? "", c.unit, system, locale))).join(";"));
  lines.push("");
  lines.push(t({ en: "Representative values. The drawing on the order confirmation governs.", tr: "Temsili değerlerdir. Sipariş onayındaki resim esastır." }));
  lines.push(`Rev. C · 2026-11-02 · ostrand.example.com`);
  return lines.join("\r\n");
}

// ---------------------------------------------------------------- plant, quality

const shift = { open: "07:30", close: "17:30" };
export const hours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: { mon: [shift], tue: [shift], wed: [shift], thu: [shift], fri: [shift], sat: [{ open: "08:00", close: "13:00" }], sun: [] },
};

const siteSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='#f2f3f4'/>" +
  "<g fill='#e1e4e8'><rect x='60' y='80' width='420' height='260'/><rect x='560' y='80' width='300' height='260'/><rect x='940' y='80' width='220' height='520'/><rect x='60' y='420' width='800' height='180'/><rect x='60' y='680' width='520' height='170'/><rect x='660' y='680' width='500' height='170'/></g>" +
  "<g fill='none' stroke='#ffffff'><path d='M-20 380 H1220' stroke-width='34'/><path d='M900 -20 V920' stroke-width='26'/><path d='M-20 640 H1220' stroke-width='22'/></g>" +
  "<rect x='560' y='80' width='300' height='260' fill='#c7ccd3'/></svg>";
export const siteMap = { src: `data:image/svg+xml,${encodeURIComponent(siteSvg)}`, width: 1200, height: 900, alt: "" };

export const address = { line: "4. Cadde No: 12", district: "Gebze OSB", city: "Gebze", region: "Kocaeli", postalCode: "41400", country: "TR", geo: { lat: 40.8471, lng: 29.4381 } };

export function branches(t: (v: Localized<string>) => string): Branch[] {
  return [
    {
      name: t({ en: "Plant & offices", tr: "Fabrika ve ofisler" }),
      address,
      phone: PHONE,
      email: EMAIL,
      hours,
      mapImage: siteMap,
      notes: t({ en: "Visitors sign in at gate 2 with photo ID. Safety shoes are provided for the shop-floor tour.", tr: "Ziyaretçiler 2 numaralı kapıda kimlikle giriş yapar. Atölye turu için iş ayakkabısı verilir." }),
    },
  ];
}

/** Bore Ø52 H7 on housing PB510, mean of 5 parts per subgroup, last 24 subgroups (week 44, 2026). */
export const spc = [
  52.0148, 52.0152, 52.0141, 52.0156, 52.0149, 52.0151, 52.0158, 52.0146, 52.0153, 52.0150, 52.0144, 52.0155, 52.0162, 52.0154, 52.0149, 52.0147, 52.0151, 52.0157, 52.0152, 52.0145, 52.0150, 52.0153, 52.0148, 52.0151,
].map((v, i) => ({ sub: i + 1, mean: v }));
export const SPC = { target: 52.015, ucl: 52.0172, lcl: 52.0128, cpk: 1.67 };

export const certificates: { name: string; scope: L; until: string; body: L }[] = [
  { name: "ISO 9001:2015", scope: { en: "Design and machining of metal components", tr: "Metal parçaların tasarımı ve talaşlı imalatı" }, until: "2028-03-14", body: { en: "Accredited certification body, cert. no. Q-000000", tr: "Akredite belgelendirme kuruluşu, belge no. Q-000000" } },
  { name: "IATF 16949:2016", scope: { en: "Hydraulic fittings and housings for vehicle OEMs", tr: "Araç üreticileri için hidrolik bağlantılar ve yataklar" }, until: "2027-09-30", body: { en: "Accredited certification body, cert. no. A-000000", tr: "Akredite belgelendirme kuruluşu, belge no. A-000000" } },
  { name: "ISO 14001:2015", scope: { en: "Environmental management, Gebze plant", tr: "Çevre yönetimi, Gebze fabrikası" }, until: "2028-03-14", body: { en: "Accredited certification body, cert. no. E-000000", tr: "Akredite belgelendirme kuruluşu, belge no. E-000000" } },
  { name: "PED 2014/68/EU · AD 2000-W0", scope: { en: "Material manufacturer approval for pressure flanges", tr: "Basınçlı flanşlar için malzeme üreticisi onayı" }, until: "2027-06-01", body: { en: "Notified body, cert. no. P-000000", tr: "Onaylanmış kuruluş, belge no. P-000000" } },
];

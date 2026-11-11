// Sample content for "Plumbline", a fictional BI product: connect a database, define metrics
// once, get charts, alerts and weekly digests. The live demo in the hero queries a fictional
// workspace ("Tepe Outdoor", an outdoor-gear shop) — every number is generated, seeded and stable.
// Human-readable fields are `{ en, tr }` and resolved with `pickLocale`.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized, type LogoItem } from "@vamos-ui/react/blocks";

export type SiteLocale = "en" | "tr";
export type L = { en: string; tr: string };

/** Fictional contact details only. */
export const PHONE = "+902160000000";
export const EMAIL = "hello@plumbline.example.com";
export const ADDRESS = "Büyükdere Cad. 000, Kat 0, 34394 Şişli / İstanbul";

export const intlOf = (locale: SiteLocale) => (locale === "tr" ? "tr-TR" : "en-US");

export function copyFor(locale: SiteLocale) {
  const t = (value: Localized<string>) => pickLocale(value, locale) ?? "";
  return {
    t,
    intl: intlOf(locale),
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}

export const USD = (amount: string) => ({ amount, currency: "USD" });

/* ------------------------------------------------------------------ */
/* Demo workspace: weekly series, seeded                              */
/* ------------------------------------------------------------------ */

export type MetricId = "revenue" | "orders" | "aov" | "refunds" | "repeat";
export type SegmentId = "all" | "web" | "marketplace" | "wholesale";
export type RangeId = "12" | "26" | "52";

export interface MetricDef {
  id: MetricId;
  label: L;
  /** How the value is written (chart + stat). */
  format: "currency" | "integer" | "percent";
  intent: "higher-is-better" | "lower-is-better";
  /** The SQL select expression, as the metric layer defines it. */
  expr: string;
  /** Owner shown in the definition card. */
  owner: string;
  description: L;
}

export const metrics: MetricDef[] = [
  {
    id: "revenue",
    label: { en: "Net revenue", tr: "Net ciro" },
    format: "currency",
    intent: "higher-is-better",
    expr: "sum(o.net_total) - coalesce(sum(r.amount), 0)",
    owner: "finance",
    description: { en: "Paid orders minus refunds, VAT excluded.", tr: "Ödenmiş siparişler eksi iadeler, KDV hariç." },
  },
  {
    id: "orders",
    label: { en: "Orders", tr: "Sipariş" },
    format: "integer",
    intent: "higher-is-better",
    expr: "count(distinct o.id)",
    owner: "ops",
    description: { en: "Paid orders, test orders excluded.", tr: "Ödenmiş siparişler, test siparişleri hariç." },
  },
  {
    id: "aov",
    label: { en: "Avg. order value", tr: "Ort. sepet" },
    format: "currency",
    intent: "higher-is-better",
    expr: "sum(o.net_total) / nullif(count(distinct o.id), 0)",
    owner: "finance",
    description: { en: "Net revenue divided by paid orders.", tr: "Net ciro bölü ödenmiş sipariş." },
  },
  {
    id: "refunds",
    label: { en: "Refund rate", tr: "İade oranı" },
    format: "percent",
    intent: "lower-is-better",
    expr: "count(distinct r.order_id)::numeric / nullif(count(distinct o.id), 0)",
    owner: "support",
    description: { en: "Share of paid orders with at least one refund.", tr: "En az bir iadesi olan ödenmiş siparişlerin payı." },
  },
  {
    id: "repeat",
    label: { en: "Repeat customers", tr: "Tekrar eden müşteri" },
    format: "percent",
    intent: "higher-is-better",
    expr: "avg((c.orders_before > 0)::int)",
    owner: "growth",
    description: { en: "Share of orders from customers who ordered before.", tr: "Daha önce sipariş vermiş müşterilerden gelen siparişlerin payı." },
  },
];

export const segments: { id: SegmentId; label: L; share: number }[] = [
  { id: "all", label: { en: "All channels", tr: "Tüm kanallar" }, share: 1 },
  { id: "web", label: { en: "Web store", tr: "Web mağaza" }, share: 0.52 },
  { id: "marketplace", label: { en: "Marketplaces", tr: "Pazaryerleri" }, share: 0.33 },
  { id: "wholesale", label: { en: "Wholesale", tr: "Toptan" }, share: 0.15 },
];

export const ranges: { id: RangeId; label: L }[] = [
  { id: "12", label: { en: "12 wk", tr: "12 hf" } },
  { id: "26", label: { en: "26 wk", tr: "26 hf" } },
  { id: "52", label: { en: "52 wk", tr: "52 hf" } },
];

/** Monday of the last complete week in the demo. */
export const LAST_WEEK = "2026-11-02";

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (n: number) => String(n).padStart(2, "0");
/** YYYY-MM-DD, `weeksBack` Mondays before LAST_WEEK (UTC maths, no time zone drift). */
function weekStart(weeksBack: number) {
  const d = new Date(Date.UTC(2026, 10, 2) - weeksBack * 7 * 86400000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export interface WeekRow {
  week: string;
  value: number;
  lastYear: number;
}

const SEGMENT_SEED: Record<SegmentId, number> = { all: 11, web: 23, marketplace: 37, wholesale: 41 };
const METRIC_SEED: Record<MetricId, number> = { revenue: 3, orders: 5, aov: 7, refunds: 13, repeat: 17 };

/** One metric × segment, 52 weeks, oldest first. Same input → same numbers on server and client. */
function series(metric: MetricId, segment: SegmentId): WeekRow[] {
  const rand = mulberry32(SEGMENT_SEED[segment] * 101 + METRIC_SEED[metric]);
  const share = segments.find((s) => s.id === segment)!.share;
  const rows: WeekRow[] = [];
  for (let i = 51; i >= 0; i--) {
    const week = weekStart(i);
    const pos = 51 - i; // 0 … 51
    const month = Number(week.slice(5, 7));
    // Outdoor gear: spring hiking peak (Apr–May), a summer plateau, a pre-winter push in Oct–Nov.
    const season = 1 + 0.18 * Math.sin(((month - 2) / 12) * Math.PI * 2) + (month >= 10 ? 0.12 : 0);
    const trend = 1 + pos * 0.006;
    const noise = 0.92 + rand() * 0.16;
    const lyNoise = 0.92 + rand() * 0.16;
    let value: number;
    let lastYear: number;
    switch (metric) {
      case "orders": {
        const base = 1480 * share * (segment === "wholesale" ? 0.25 : 1);
        value = Math.round(base * season * trend * noise);
        lastYear = Math.round(base * season * 0.84 * lyNoise);
        break;
      }
      case "revenue": {
        const base = 1480 * share * 64 * (segment === "wholesale" ? 1.4 : 1);
        value = Math.round(base * season * trend * noise);
        lastYear = Math.round(base * season * 0.8 * lyNoise);
        break;
      }
      case "aov": {
        const base = segment === "wholesale" ? 356 : segment === "marketplace" ? 52 : 68;
        value = Math.round(base * (0.96 + pos * 0.0016) * (0.97 + rand() * 0.06) * 100) / 100;
        lastYear = Math.round(base * 0.93 * (0.97 + rand() * 0.06) * 100) / 100;
        break;
      }
      case "refunds": {
        const base = segment === "marketplace" ? 0.071 : segment === "wholesale" ? 0.018 : 0.046;
        // A spike three weeks ago (a bad batch of tent poles) — the alert feed points at it.
        const spike = pos === 49 ? 1.55 : pos === 50 ? 1.2 : 1;
        value = Math.round(base * (1.08 - pos * 0.0028) * spike * (0.94 + rand() * 0.12) * 10000) / 10000;
        lastYear = Math.round(base * 1.14 * (0.94 + rand() * 0.12) * 10000) / 10000;
        break;
      }
      case "repeat": {
        const base = segment === "wholesale" ? 0.71 : segment === "marketplace" ? 0.19 : 0.34;
        value = Math.round(Math.min(0.95, base * (0.92 + pos * 0.0032) * (0.97 + rand() * 0.06)) * 10000) / 10000;
        lastYear = Math.round(base * 0.88 * (0.97 + rand() * 0.06) * 10000) / 10000;
        break;
      }
    }
    rows.push({ week, value, lastYear });
  }
  return rows;
}

const cache = new Map<string, WeekRow[]>();
export function demoSeries(metric: MetricId, segment: SegmentId, range: RangeId): WeekRow[] {
  const key = `${metric}:${segment}`;
  let all = cache.get(key);
  if (!all) {
    all = series(metric, segment);
    cache.set(key, all);
  }
  return all.slice(-Number(range));
}

/** The SQL the metric layer compiles for a selection (shown in the console's SQL tab). */
export function demoSql(metric: MetricDef, segment: SegmentId, range: RangeId): string {
  const joins = [
    "from   orders o",
    metric.id === "revenue" || metric.id === "refunds" ? "left   join refunds r on r.order_id = o.id" : null,
    metric.id === "repeat" ? "join   customer_history c on c.order_id = o.id" : null,
  ].filter(Boolean);
  return [
    `-- ${metric.id} · owner: ${metric.owner} · compiled by Plumbline`,
    "select date_trunc('week', o.paid_at) as week,",
    `       ${metric.expr} as ${metric.id}`,
    ...joins,
    "where  o.status = 'paid'",
    "  and  o.is_test = false",
    segment === "all" ? null : `  and  o.channel = '${segment}'`,
    `  and  o.paid_at >= date '${LAST_WEEK}' - interval '${Number(range) - 1} weeks'`,
    "group  by 1",
    "order  by 1;",
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}

/** A believable run time / scan size per selection (stable). */
export function demoRunStats(metric: MetricId, segment: SegmentId, range: RangeId) {
  const rand = mulberry32(SEGMENT_SEED[segment] * 7 + METRIC_SEED[metric] * 3 + Number(range));
  const rows = Math.round((segment === "all" ? 1_840_000 : 610_000) * (Number(range) / 52) * (0.9 + rand() * 0.2));
  const ms = Math.round(90 + rows / 9000 + rand() * 40);
  return { rows, ms };
}

/* ------------------------------------------------------------------ */
/* Customers (fictional wordmarks)                                    */
/* ------------------------------------------------------------------ */

function wordmark(name: string, font: string, fill: string) {
  const width = Math.round(name.length * 13 + 16);
  const esc = name.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='40' viewBox='0 0 ${width} 40'><text x='8' y='27' fill='${fill}' ${font}>${esc}</text></svg>`;
  return { src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`, width, height: 40 };
}

const FONTS = {
  mono: "font-family='Menlo, monospace' font-size='17' font-weight='600' letter-spacing='1'",
  condensed: "font-family='Arial Narrow, Arial, sans-serif' font-size='21' font-weight='700' letter-spacing='2'",
  serif: "font-family='Georgia, serif' font-size='23' letter-spacing='-0.5'",
  sans: "font-family='Helvetica, Arial, sans-serif' font-size='21' font-weight='700' letter-spacing='-0.8'",
};

const BRANDS: [string, keyof typeof FONTS][] = [
  ["TEPE OUTDOOR", "condensed"],
  ["kervan/supply", "mono"],
  ["Atlas Freight", "sans"],
  ["Moda Seramik", "serif"],
  ["NORDVIK TOOLS", "condensed"],
  ["pilot.bikes", "mono"],
  ["Sarnıç Water", "serif"],
  ["Lumen Pharmacy", "sans"],
];

/** Shown on the dark site in both themes' variants (light ink for light mode just in case). */
export const customerLogos: LogoItem[] = BRANDS.map(([name, font]) => ({
  name: name.replace(/[/.]/g, " ").replace(/\s+/g, " ").trim(),
  image: wordmark(name, FONTS[font], "#1a1d1f"),
  imageDark: wordmark(name, FONTS[font], "#dfe5e6"),
}));

/* ------------------------------------------------------------------ */
/* Alerts, connectors, pricing                                       */
/* ------------------------------------------------------------------ */

export interface AlertItem {
  at: string;
  tone: "danger" | "warning" | "success" | "info";
  metric: L;
  text: L;
  channel: L;
}

export const alerts: AlertItem[] = [
  {
    at: "2026-11-10T02:14:00+03:00",
    tone: "danger",
    metric: { en: "Refund rate · Marketplaces", tr: "İade oranı · Pazaryerleri" },
    text: { en: "11.2% vs 7.1% expected (+3.1σ). 64% of refunds mention “pole” — SKU TNT-2P-ALU.", tr: "Beklenen %7,1’e karşı %11,2 (+3,1σ). İadelerin %64’ünde “direk” geçiyor — SKU TNT-2P-ALU." },
    channel: { en: "Sent to #ops-alerts and Selin K.", tr: "#ops-alerts kanalına ve Selin K.’ya gitti" },
  },
  {
    at: "2026-11-09T09:00:00+03:00",
    tone: "info",
    metric: { en: "Weekly digest", tr: "Haftalık özet" },
    text: { en: "Net revenue $118,420 (+9.4% w/w). Best day: Saturday. Wholesale carried 31% of the growth.", tr: "Net ciro 118.420 $ (haftalık +%9,4). En iyi gün: cumartesi. Büyümenin %31’i toptandan." },
    channel: { en: "E-mailed to 14 people", tr: "14 kişiye e-postayla gitti" },
  },
  {
    at: "2026-11-07T16:42:00+03:00",
    tone: "warning",
    metric: { en: "Orders · Web store", tr: "Sipariş · Web mağaza" },
    text: { en: "No orders for 38 minutes between 15:58 and 16:36 — checkout 502s in the web logs.", tr: "15:58–16:36 arası 38 dakika sipariş yok — web kayıtlarında ödeme sayfası 502 hataları." },
    channel: { en: "Paged the on-call developer", tr: "Nöbetçi geliştiriciye çağrı gitti" },
  },
  {
    at: "2026-11-05T11:20:00+03:00",
    tone: "success",
    metric: { en: "Repeat customers · Web store", tr: "Tekrar eden müşteri · Web mağaza" },
    text: { en: "Crossed the 40% goal for the first time (40.6%), two weeks after the loyalty e-mail.", tr: "Sadakat e-postasından iki hafta sonra ilk kez %40 hedefini geçti (%40,6)." },
    channel: { en: "Posted to #growth", tr: "#growth kanalına gönderildi" },
  },
];

export type ConnectorKind = "database" | "files" | "apps" | "outputs";
export type ConnectorStatus = "ga" | "beta" | "planned";

export interface Connector {
  name: string;
  kind: ConnectorKind;
  status: ConnectorStatus;
  sync: L;
  note: L;
}

export const connectorKinds: { id: ConnectorKind | "all"; label: L }[] = [
  { id: "all", label: { en: "All", tr: "Tümü" } },
  { id: "database", label: { en: "Databases", tr: "Veritabanları" } },
  { id: "files", label: { en: "Files & lakes", tr: "Dosya ve göller" } },
  { id: "apps", label: { en: "Apps & APIs", tr: "Uygulama ve API" } },
  { id: "outputs", label: { en: "Outputs", tr: "Çıktılar" } },
];

export const connectors: Connector[] = [
  { name: "PostgreSQL", kind: "database", status: "ga", sync: { en: "Live query", tr: "Canlı sorgu" }, note: { en: "Versions 12–17, read replica recommended, SSL required.", tr: "Sürüm 12–17, okuma kopyası önerilir, SSL zorunlu." } },
  { name: "MySQL / MariaDB", kind: "database", status: "ga", sync: { en: "Live query", tr: "Canlı sorgu" }, note: { en: "MySQL 8+, MariaDB 10.6+. Time zones read from the session.", tr: "MySQL 8+, MariaDB 10.6+. Saat dilimi oturumdan okunur." } },
  { name: "DuckDB", kind: "database", status: "ga", sync: { en: "Live query", tr: "Canlı sorgu" }, note: { en: "Attach a .duckdb file or a read-only share URL.", tr: "Bir .duckdb dosyası ya da salt okunur paylaşım adresi ekleyin." } },
  { name: "SQLite", kind: "database", status: "ga", sync: { en: "Upload", tr: "Yükleme" }, note: { en: "Up to 2 GB per file; re-upload replaces the snapshot.", tr: "Dosya başına 2 GB’a kadar; yeniden yükleme anlık görüntüyü değiştirir." } },
  { name: "Trino", kind: "database", status: "beta", sync: { en: "Live query", tr: "Canlı sorgu" }, note: { en: "Catalog-aware autocomplete; cost-based limits per query.", tr: "Katalog farkında otomatik tamamlama; sorgu başına maliyet sınırı." } },
  { name: "Parquet", kind: "files", status: "ga", sync: { en: "Hourly", tr: "Saatlik" }, note: { en: "Read straight from a bucket with partition pruning.", tr: "Bölüm budamayla doğrudan kovadan okunur." } },
  { name: "Apache Iceberg", kind: "files", status: "beta", sync: { en: "Hourly", tr: "Saatlik" }, note: { en: "Snapshots and time travel; REST catalogs only for now.", tr: "Anlık görüntü ve zamanda yolculuk; şimdilik yalnızca REST katalogları." } },
  { name: "S3-compatible storage", kind: "files", status: "ga", sync: { en: "Hourly", tr: "Saatlik" }, note: { en: "CSV, JSON lines and Parquet with one access key.", tr: "Tek erişim anahtarıyla CSV, JSON satırları ve Parquet." } },
  { name: "CSV & XLSX upload", kind: "files", status: "ga", sync: { en: "Upload", tr: "Yükleme" }, note: { en: "Column types guessed, then yours to correct before saving.", tr: "Sütun türleri tahmin edilir, kaydetmeden önce düzeltebilirsiniz." } },
  { name: "SFTP drop folder", kind: "files", status: "ga", sync: { en: "On arrival", tr: "Geldiğinde" }, note: { en: "For the ERP that only exports nightly files.", tr: "Yalnızca gece dosya veren ERP’ler için." } },
  { name: "REST / JSON API", kind: "apps", status: "ga", sync: { en: "Every 15 min", tr: "15 dakikada bir" }, note: { en: "Pagination, OAuth 2 and rate limits configured in a form.", tr: "Sayfalama, OAuth 2 ve hız sınırları bir formla ayarlanır." } },
  { name: "Incoming webhooks", kind: "apps", status: "ga", sync: { en: "Real time", tr: "Gerçek zamanlı" }, note: { en: "Signed payloads land in a table you can query in seconds.", tr: "İmzalı yükler saniyeler içinde sorgulanabilen bir tabloya düşer." } },
  { name: "e-Invoice XML (UBL-TR)", kind: "apps", status: "beta", sync: { en: "Daily", tr: "Günlük" }, note: { en: "Parses UBL-TR e-invoices and e-archive files into line items.", tr: "UBL-TR e-fatura ve e-arşiv dosyalarını kalemlere ayırır." } },
  { name: "IMAP inbox", kind: "apps", status: "planned", sync: { en: "Every 15 min", tr: "15 dakikada bir" }, note: { en: "Attachments from a shared mailbox, deduplicated by hash.", tr: "Ortak posta kutusundan ekler, özetle tekilleştirilir." } },
  { name: "E-mail digests", kind: "outputs", status: "ga", sync: { en: "Scheduled", tr: "Zamanlanmış" }, note: { en: "Charts as images with the numbers in the text for screen readers.", tr: "Grafikler görsel olarak, sayılar ekran okuyucular için metinde." } },
  { name: "Outgoing webhooks", kind: "outputs", status: "ga", sync: { en: "On alert", tr: "Uyarıda" }, note: { en: "Post alerts to any chat tool or pager with a signed body.", tr: "Uyarıları imzalı gövdeyle herhangi bir sohbet aracına ya da çağrı sistemine gönderin." } },
  { name: "Embeds", kind: "outputs", status: "ga", sync: { en: "Live", tr: "Canlı" }, note: { en: "Signed iframes with row-level filters per viewer.", tr: "İzleyici başına satır filtreli imzalı iframe’ler." } },
  { name: "Scheduled PDF", kind: "outputs", status: "planned", sync: { en: "Scheduled", tr: "Zamanlanmış" }, note: { en: "Board packs on the first Monday of the month.", tr: "Her ayın ilk pazartesi yönetim kurulu dosyası." } },
];

/** Usage-based part of pricing: query compute above the plan's allowance. */
export const PRICING = {
  team: { seat: 24, includedGb: 500 },
  business: { seat: 49, includedGb: 2000 },
  /** USD per extra GB scanned. */
  overagePerGb: 0.04,
} as const;

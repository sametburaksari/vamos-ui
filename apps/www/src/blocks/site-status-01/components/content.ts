// Status page of "Relay", the fictional webhooks API of site-devtool-01. Every human-readable
// field is `Localized` ({ en, tr }). Days are `YYYY-MM-DD`, instants ISO in UTC, and every time
// on the page is shown in UTC, 24-hour, in both languages. "Today" is fixed to 2026-11-11.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const PHONE = "+902160000000";
export const EMAIL = "status@relay.example.com";
export const TODAY = "2026-11-11";
export const CHECKED_AT = "2026-11-11T09:41:12Z";
export const DAYS = 90;

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-US";
  const f = createFormatter(intl, { currency: "USD", timeZone: "UTC" });
  /** "08:12" — always 24-hour UTC, whatever the language. */
  const time = (iso: string) => f.date(iso, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "UTC" });
  const day = (iso: string) => f.date(iso, { day: "numeric", month: "short", year: "numeric" });
  const minutes = (m: number) => (m >= 60 ? t({ en: `${Math.floor(m / 60)} h ${m % 60} min`, tr: `${Math.floor(m / 60)} sa ${m % 60} dk` }) : t({ en: `${m} min`, tr: `${m} dk` }));
  return {
    locale,
    t,
    f,
    intl,
    time,
    day,
    minutes,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

/* ------------------------------------------------------------------ */
/* Status vocabulary — colours come from the status tokens only         */
/* ------------------------------------------------------------------ */

export type Health = "operational" | "degraded" | "partial" | "major" | "maintenance";
export const healthLabel: Record<Health, L> = {
  operational: { en: "Operational", tr: "Çalışıyor" },
  degraded: { en: "Degraded performance", tr: "Düşük performans" },
  partial: { en: "Partial outage", tr: "Kısmi kesinti" },
  major: { en: "Major outage", tr: "Büyük kesinti" },
  maintenance: { en: "Maintenance", tr: "Bakım" },
};
/** Tailwind token classes per health (text + fill). */
export const healthTone: Record<Health, { text: string; fill: string; badge: "success" | "warning" | "danger" | "info" }> = {
  operational: { text: "text-success", fill: "bg-success", badge: "success" },
  degraded: { text: "text-warning", fill: "bg-warning", badge: "warning" },
  partial: { text: "text-warning", fill: "bg-warning", badge: "warning" },
  major: { text: "text-danger", fill: "bg-danger", badge: "danger" },
  maintenance: { text: "text-info", fill: "bg-info", badge: "info" },
};

/* ------------------------------------------------------------------ */
/* Components                                                           */
/* ------------------------------------------------------------------ */

export type GroupId = "api" | "delivery" | "apps";
export const groups: { id: GroupId; name: L }[] = [
  { id: "api", name: { en: "API", tr: "API" } },
  { id: "delivery", name: { en: "Webhook delivery", tr: "Webhook teslimi" } },
  { id: "apps", name: { en: "Dashboard and portal", tr: "Panel ve portal" } },
];

export interface StatusComponent {
  id: string;
  group: GroupId;
  name: L;
  note?: L;
  now: Health;
  /** First day with data (newer components show grey before it). */
  since?: string;
}

export const components: StatusComponent[] = [
  { id: "rest", group: "api", name: { en: "REST API", tr: "REST API" }, now: "operational" },
  { id: "ingest", group: "api", name: { en: "Event ingestion", tr: "Olay alımı" }, note: { en: "POST /v4/events", tr: "POST /v4/events" }, now: "operational" },
  { id: "us", group: "delivery", name: { en: "Delivery — US", tr: "Teslim — ABD" }, note: { en: "us-east-1, Virginia", tr: "us-east-1, Virginia" }, now: "operational" },
  { id: "eu", group: "delivery", name: { en: "Delivery — EU", tr: "Teslim — AB" }, note: { en: "eu-central-1, Frankfurt", tr: "eu-central-1, Frankfurt" }, now: "degraded" },
  { id: "apac", group: "delivery", name: { en: "Delivery — APAC", tr: "Teslim — APAC" }, note: { en: "ap-southeast-1, Singapore", tr: "ap-southeast-1, Singapur" }, now: "operational" },
  { id: "dashboard", group: "apps", name: { en: "Dashboard", tr: "Panel" }, now: "operational" },
  { id: "portal", group: "apps", name: { en: "Customer portal", tr: "Müşteri portalı" }, now: "operational", since: "2026-09-02" },
  { id: "docs", group: "apps", name: { en: "Docs", tr: "Belgeler" }, now: "operational" },
];

/* ------------------------------------------------------------------ */
/* Incidents                                                            */
/* ------------------------------------------------------------------ */

export type Phase = "investigating" | "identified" | "monitoring" | "resolved" | "scheduled" | "completed";
export const phaseLabel: Record<Phase, L> = {
  investigating: { en: "Investigating", tr: "İnceleniyor" },
  identified: { en: "Identified", tr: "Tespit edildi" },
  monitoring: { en: "Monitoring", tr: "İzleniyor" },
  resolved: { en: "Resolved", tr: "Çözüldü" },
  scheduled: { en: "Scheduled", tr: "Planlandı" },
  completed: { en: "Completed", tr: "Tamamlandı" },
};

export interface Incident {
  id: string;
  title: L;
  impact: Exclude<Health, "operational">;
  components: string[];
  start: string;
  /** Missing while ongoing. */
  end?: string;
  updates: { at: string; phase: Phase; text: L }[];
  postmortem?: { summary: L; cause: L; actions: L[] };
}

export const incidents: Incident[] = [
  {
    id: "inc-1111",
    title: { en: "Delayed deliveries to EU endpoints", tr: "AB uç noktalarına gecikmeli teslim" },
    impact: "degraded",
    components: ["eu"],
    start: "2026-11-11T08:12:00Z",
    updates: [
      { at: "2026-11-11T09:05:00Z", phase: "monitoring", text: { en: "The backlog is draining. Median delay is back under 40 seconds (from 4 minutes at the peak). No events were lost; every delayed event is being delivered in order.", tr: "Birikim eriyor. Ortanca gecikme yeniden 40 saniyenin altında (zirvede 4 dakikaydı). Hiçbir olay kaybolmadı; geciken her olay sırasıyla teslim ediliyor." } },
      { at: "2026-11-11T08:31:00Z", phase: "identified", text: { en: "A queue node in eu-central-1 was replaced and its partitions rebalanced slowly. We have moved them by hand and added capacity.", tr: "eu-central-1’de bir kuyruk düğümü değiştirildi ve bölümleri yavaş dengelendi. Bölümleri elle taşıdık ve kapasite ekledik." } },
      { at: "2026-11-11T08:12:00Z", phase: "investigating", text: { en: "We’re seeing first-attempt delays of up to 4 minutes for endpoints served from Frankfurt. Other regions are not affected.", tr: "Frankfurt’tan hizmet alan uç noktalarda ilk denemede 4 dakikaya varan gecikmeler görüyoruz. Diğer bölgeler etkilenmedi." } },
    ],
  },
  {
    id: "inc-1029",
    title: { en: "Dashboard log search unavailable", tr: "Panelde kayıt araması kullanılamıyor" },
    impact: "partial",
    components: ["dashboard"],
    start: "2026-10-29T13:40:00Z",
    end: "2026-10-29T14:27:00Z",
    updates: [
      { at: "2026-10-29T14:27:00Z", phase: "resolved", text: { en: "Search is back for all projects. Deliveries were never affected.", tr: "Arama tüm projelerde geri geldi. Teslimler hiç etkilenmedi." } },
      { at: "2026-10-29T13:58:00Z", phase: "identified", text: { en: "A search index migration ran out of disk. We are restoring the previous index.", tr: "Bir arama dizini taşıması diski doldurdu. Önceki dizini geri yüklüyoruz." } },
      { at: "2026-10-29T13:40:00Z", phase: "investigating", text: { en: "Searching delivery logs in the dashboard returns an error. Viewing logs without search still works.", tr: "Panelde teslim kayıtlarında arama hata veriyor. Arama olmadan kayıtları görüntülemek çalışıyor." } },
    ],
  },
  {
    id: "inc-1014",
    title: { en: "Elevated API error rates", tr: "API hata oranlarında artış" },
    impact: "major",
    components: ["rest", "ingest"],
    start: "2026-10-14T16:02:00Z",
    end: "2026-10-14T16:24:00Z",
    updates: [
      { at: "2026-10-14T16:24:00Z", phase: "resolved", text: { en: "Error rates are back to normal. Requests that got a 503 can be retried safely with the same Idempotency-Key.", tr: "Hata oranları normale döndü. 503 alan istekler aynı Idempotency-Key ile güvenle yeniden denenebilir." } },
      { at: "2026-10-14T16:11:00Z", phase: "identified", text: { en: "A configuration change to our load balancers dropped 3.1% of requests. It has been rolled back.", tr: "Yük dengeleyicilerimizdeki bir yapılandırma değişikliği isteklerin %3,1’ini düşürdü. Geri alındı." } },
      { at: "2026-10-14T16:02:00Z", phase: "investigating", text: { en: "Some API requests return 503. We’re investigating.", tr: "Bazı API istekleri 503 döndürüyor. İnceliyoruz." } },
    ],
    postmortem: {
      summary: { en: "For 22 minutes, 3.1% of API requests in all regions returned 503. 41,280 send calls failed; 99.6% of them were retried by our SDKs and succeeded. Deliveries already queued were not affected.", tr: "22 dakika boyunca tüm bölgelerde API isteklerinin %3,1’i 503 döndürdü. 41.280 gönderim çağrısı başarısız oldu; bunların %99,6’sı SDK’larımızca yeniden denendi ve başarılı oldu. Kuyruktaki teslimler etkilenmedi." },
      cause: { en: "A connection-draining timeout was set to 0 s instead of 30 s in a load balancer change. The change passed review because the staging environment has no long-lived connections.", tr: "Bir yük dengeleyici değişikliğinde bağlantı boşaltma süresi 30 sn yerine 0 sn olarak ayarlandı. Değişiklik incelemeden geçti çünkü test ortamında uzun süreli bağlantı yok." },
      actions: [
        { en: "Load balancer changes now roll out to one region first, with a 15-minute hold. Done.", tr: "Yük dengeleyici değişiklikleri artık önce tek bölgeye, 15 dakikalık bekleme ile çıkıyor. Tamamlandı." },
        { en: "Staging gets synthetic long-lived connections. Due 2026-11-30.", tr: "Test ortamına yapay uzun süreli bağlantılar ekleniyor. Termin 2026-11-30." },
        { en: "Alert on 503 rate above 0.5% for 2 minutes (was 5 minutes). Done.", tr: "503 oranı 2 dakika boyunca %0,5’i aşarsa uyarı (önceden 5 dakika). Tamamlandı." },
      ],
    },
  },
  {
    id: "maint-1002",
    title: { en: "Queue cluster upgrade — US", tr: "Kuyruk kümesi yükseltmesi — ABD" },
    impact: "maintenance",
    components: ["us"],
    start: "2026-10-02T02:00:00Z",
    end: "2026-10-02T02:40:00Z",
    updates: [
      { at: "2026-10-02T02:40:00Z", phase: "completed", text: { en: "The upgrade is complete. Deliveries were delayed by up to 20 seconds during the switch-over.", tr: "Yükseltme tamamlandı. Geçiş sırasında teslimler en fazla 20 saniye gecikti." } },
      { at: "2026-09-25T10:00:00Z", phase: "scheduled", text: { en: "We will upgrade the US queue cluster on 2 October between 02:00 and 03:00 UTC.", tr: "ABD kuyruk kümesini 2 Ekim’de 02:00–03:00 UTC arasında yükselteceğiz." } },
    ],
  },
  {
    id: "inc-0930",
    title: { en: "Slow portal loading in APAC", tr: "APAC’ta portal yavaş açılıyor" },
    impact: "degraded",
    components: ["portal"],
    start: "2026-09-30T05:15:00Z",
    end: "2026-09-30T06:50:00Z",
    updates: [
      { at: "2026-09-30T06:50:00Z", phase: "resolved", text: { en: "Portal load times are back to normal after the CDN provider fixed a routing issue in Singapore.", tr: "CDN sağlayıcısı Singapur’daki bir yönlendirme sorununu düzeltti; portal yükleme süreleri normale döndü." } },
      { at: "2026-09-30T05:15:00Z", phase: "investigating", text: { en: "The embedded portal takes 8–12 seconds to load for some visitors in Asia.", tr: "Gömülü portal Asya’daki bazı ziyaretçiler için 8–12 saniyede açılıyor." } },
    ],
  },
  {
    id: "inc-0917",
    title: { en: "Delivery delays — US", tr: "Teslim gecikmeleri — ABD" },
    impact: "degraded",
    components: ["us"],
    start: "2026-09-17T19:22:00Z",
    end: "2026-09-17T20:00:00Z",
    updates: [
      { at: "2026-09-17T20:00:00Z", phase: "resolved", text: { en: "Delays have cleared. A single customer’s fan-out of 2.4M events saturated shared workers; per-tenant fairness is now enforced.", tr: "Gecikmeler giderildi. Tek bir müşterinin 2,4M olaylık dağıtımı ortak işçileri doldurmuştu; artık kiracı başına adil paylaşım uygulanıyor." } },
      { at: "2026-09-17T19:22:00Z", phase: "investigating", text: { en: "Deliveries from us-east-1 are delayed by 1–3 minutes.", tr: "us-east-1’den teslimler 1–3 dakika gecikiyor." } },
    ],
  },
  {
    id: "inc-0828",
    title: { en: "Docs site unreachable", tr: "Belge sitesine erişilemiyor" },
    impact: "major",
    components: ["docs"],
    start: "2026-08-28T11:03:00Z",
    end: "2026-08-28T11:17:00Z",
    updates: [
      { at: "2026-08-28T11:17:00Z", phase: "resolved", text: { en: "An expired certificate on docs.relay.example.com was renewed. Renewal is now monitored.", tr: "docs.relay.example.com’daki süresi dolmuş sertifika yenilendi. Yenileme artık izleniyor." } },
      { at: "2026-08-28T11:03:00Z", phase: "investigating", text: { en: "The docs site shows a certificate error.", tr: "Belge sitesi sertifika hatası gösteriyor." } },
    ],
  },
];

export const upcoming = {
  title: { en: "Database upgrade — EU control plane", tr: "Veritabanı yükseltmesi — AB kontrol düzlemi" } as L,
  start: "2026-11-18T02:00:00Z",
  end: "2026-11-18T03:00:00Z",
  text: { en: "The dashboard will be read-only for about 10 minutes. Deliveries and the API are not affected.", tr: "Panel yaklaşık 10 dakika salt okunur olacak. Teslimler ve API etkilenmez." } as L,
};

/* ------------------------------------------------------------------ */
/* 90-day history per component                                         */
/* ------------------------------------------------------------------ */

export interface DayCell {
  date: string;
  health: Health | "none";
  /** 0–100, for the tooltip. */
  uptime: number;
  incidents: { id: string; title: L }[];
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return isoDay(d);
};
const minutesBetween = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
const rank: Record<Health, number> = { operational: 0, maintenance: 1, degraded: 2, partial: 3, major: 4 };

/** The last 90 days (oldest first) for one component, built from the incident list. */
export function historyFor(c: StatusComponent): DayCell[] {
  const out: DayCell[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = addDays(TODAY, -i);
    if (c.since && date < c.since) {
      out.push({ date, health: "none", uptime: 0, incidents: [] });
      continue;
    }
    const today = incidents.filter((x) => x.components.includes(c.id) && x.start.slice(0, 10) === date);
    let health: Health = "operational";
    let down = 0;
    for (const x of today) {
      if (rank[x.impact] > rank[health]) health = x.impact;
      const mins = minutesBetween(x.start, x.end ?? CHECKED_AT);
      // Outages count fully against uptime, partial at half, degraded at a quarter; maintenance not at all.
      down += x.impact === "major" ? mins : x.impact === "partial" ? mins / 2 : x.impact === "degraded" ? mins / 4 : 0;
    }
    out.push({ date, health, uptime: Math.max(0, 100 - (down / 1440) * 100), incidents: today.map((x) => ({ id: x.id, title: x.title })) });
  }
  return out;
}

/** Uptime over the days that have data. */
export function uptimeOf(cells: DayCell[]): number {
  const days = cells.filter((d) => d.health !== "none");
  return days.reduce((s, d) => s + d.uptime, 0) / Math.max(1, days.length);
}

/** p95 API latency for the last 14 days (ms). */
export const latency = [
  { date: "2026-10-29", p95: 182 },
  { date: "2026-10-30", p95: 176 },
  { date: "2026-10-31", p95: 171 },
  { date: "2026-11-01", p95: 160 },
  { date: "2026-11-02", p95: 158 },
  { date: "2026-11-03", p95: 174 },
  { date: "2026-11-04", p95: 189 },
  { date: "2026-11-05", p95: 181 },
  { date: "2026-11-06", p95: 177 },
  { date: "2026-11-07", p95: 166 },
  { date: "2026-11-08", p95: 159 },
  { date: "2026-11-09", p95: 162 },
  { date: "2026-11-10", p95: 178 },
  { date: "2026-11-11", p95: 241 },
];

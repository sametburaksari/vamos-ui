// Release notes of "Relay", the fictional webhooks API also shown in site-devtool-01 and
// site-status-01. Every human-readable field is `Localized` ({ en, tr }); dates are
// `YYYY-MM-DD` and formatted per locale. Domains are example.com, the phone is fictional.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const PHONE = "+902160000000";
export const EMAIL = "changelog@relay.example.com";
export const RSS = "https://relay.example.com/changelog.rss";

export function copyFor(locale: SiteLocale) {
  const t = (value: L) => pickLocale(value, locale) ?? "";
  const intl = locale === "tr" ? "tr-TR" : "en-US";
  const f = createFormatter(intl, { currency: "USD", timeZone: "UTC" });
  return {
    locale,
    t,
    f,
    intl,
    labels: locale === "tr" ? { ...blockLabelsTr, ...site1LabelsTr, ...site2LabelsTr } : undefined,
  };
}
export type Copy = ReturnType<typeof copyFor>;

export type Kind = "feature" | "improvement" | "fix";
export const KINDS: Kind[] = ["feature", "improvement", "fix"];
export const kindLabel: Record<Kind, L> = {
  feature: { en: "Feature", tr: "Özellik" },
  improvement: { en: "Improvement", tr: "İyileştirme" },
  fix: { en: "Fix", tr: "Düzeltme" },
};
export const kindPlural: Record<Kind, L> = {
  feature: { en: "Features", tr: "Özellikler" },
  improvement: { en: "Improvements", tr: "İyileştirmeler" },
  fix: { en: "Fixes", tr: "Düzeltmeler" },
};

export interface Change {
  kind: Kind;
  title: L;
  text: L;
}

export interface Release {
  version: string;
  date: string;
  title: L;
  lead: L;
  author: { name: string; role: L };
  changes: Change[];
  /** Optional code shown in the entry. */
  code?: { language: string; text: string };
  /** Optional upgrade note shown in the entry. */
  note?: L;
}

export const releases: Release[] = [
  {
    version: "4.12",
    date: "2026-11-04",
    title: { en: "Replay by time window", tr: "Zaman aralığına göre yeniden gönderim" },
    lead: {
      en: "When a customer’s server is down for 40 minutes, you no longer replay deliveries one by one. Pick the window, see how many events it holds, and send them again — in their original order.",
      tr: "Bir müşterinin sunucusu 40 dakika kapalı kaldığında teslimleri artık tek tek yeniden göndermiyorsunuz. Aralığı seçin, kaç olay içerdiğini görün ve hepsini özgün sıralarıyla yeniden gönderin.",
    },
    author: { name: "Defne Aydın", role: { en: "Product engineer, Delivery", tr: "Ürün mühendisi, Teslim" } },
    changes: [
      { kind: "feature", title: { en: "Replay a time window from the dashboard", tr: "Panelden zaman aralığını yeniden gönderin" }, text: { en: "Endpoint › Deliveries › Replay window. A preview shows the event count before anything is sent.", tr: "Uç nokta › Teslimler › Aralığı yeniden gönder. Hiçbir şey gönderilmeden önce bir önizleme olay sayısını gösterir." } },
      { kind: "feature", title: { en: "POST /v4/replays", tr: "POST /v4/replays" }, text: { en: "The same thing from the API, with a dry_run flag that returns the count only.", tr: "Aynısı API’den; yalnızca sayıyı döndüren bir dry_run bayrağıyla." } },
      { kind: "fix", title: { en: "Replays kept the original signature timestamp", tr: "Yeniden gönderimler eski imza zamanını koruyordu" }, text: { en: "Replayed deliveries are now signed at send time, so strict receivers no longer reject them as stale.", tr: "Yeniden gönderilen teslimler artık gönderim anında imzalanıyor; katı alıcılar onları eski diye reddetmiyor." } },
    ],
    code: {
      language: "bash",
      text: `curl $RELAY_API/v4/replays \\
  -u "$RELAY_KEY:" \\
  -d endpoint="ep_4Hq1" \\
  -d from="2026-11-03T02:10:00Z" \\
  -d to="2026-11-03T02:55:00Z" \\
  -d dry_run=true`,
    },
    note: { en: "Replays count toward your monthly events only once per original event, however many times you replay it.", tr: "Yeniden gönderimler, kaç kez tekrarlanırsa tekrarlansın, her özgün olay için aylık olay sayınıza yalnızca bir kez eklenir." },
  },
  {
    version: "4.11",
    date: "2026-10-21",
    title: { en: "Static egress IPs in Singapore", tr: "Singapur’da sabit çıkış IP’leri" },
    lead: { en: "Scale projects in ap-southeast-1 now deliver from two fixed addresses that your customers can put on an allow-list.", tr: "ap-southeast-1’deki Scale projeleri artık müşterilerinizin izin listesine ekleyebileceği iki sabit adresten teslim ediyor." },
    author: { name: "Emre Kılıç", role: { en: "Infrastructure", tr: "Altyapı" } },
    changes: [
      { kind: "feature", title: { en: "Two static IPs per region", tr: "Bölge başına iki sabit IP" }, text: { en: "Listed under Settings › Network, and at GET /v4/egress for automation.", tr: "Ayarlar › Ağ altında ve otomasyon için GET /v4/egress’te listelenir." } },
      { kind: "improvement", title: { en: "Faster TLS handshakes to APAC endpoints", tr: "APAC uç noktalarına daha hızlı TLS el sıkışması" }, text: { en: "Session resumption cut median connect time from 212 ms to 74 ms.", tr: "Oturum sürdürme ortanca bağlantı süresini 212 ms’den 74 ms’ye indirdi." } },
    ],
  },
  {
    version: "4.10",
    date: "2026-10-07",
    title: { en: "Portal logs load four times faster", tr: "Portal kayıtları dört kat hızlı" },
    lead: { en: "The embedded portal now streams the first 50 deliveries instead of waiting for the whole page.", tr: "Gömülü portal artık tüm sayfayı beklemek yerine ilk 50 teslimi akış olarak getiriyor." },
    author: { name: "Selin Ersoy", role: { en: "Frontend, Portal", tr: "Ön yüz, Portal" } },
    changes: [
      { kind: "improvement", title: { en: "Streaming delivery log", tr: "Akışlı teslim kaydı" }, text: { en: "Time to first row fell from 1.9 s to 0.45 s for endpoints with more than 100k deliveries.", tr: "100 binden fazla teslimi olan uç noktalarda ilk satır süresi 1,9 sn’den 0,45 sn’ye düştü." } },
      { kind: "improvement", title: { en: "Search by delivery ID", tr: "Teslim kimliğiyle arama" }, text: { en: "Paste dlv_… into the portal search to jump straight to it.", tr: "Doğrudan gitmek için portal aramasına dlv_… yapıştırın." } },
      { kind: "fix", title: { en: "Dark theme contrast in the portal", tr: "Portalda koyu tema kontrastı" }, text: { en: "Status chips now meet 4.5:1 on dark backgrounds.", tr: "Durum etiketleri artık koyu arka planda 4,5:1’i karşılıyor." } },
    ],
  },
  {
    version: "4.9",
    date: "2026-09-23",
    title: { en: "Failure alerts by webhook", tr: "Webhook ile hata uyarıları" },
    lead: { en: "Get told about failing endpoints the way your customers get told about everything else: with a signed event.", tr: "Hata veren uç noktalardan, müşterilerinizin her şeyi öğrendiği yolla haberdar olun: imzalı bir olayla." },
    author: { name: "Defne Aydın", role: { en: "Product engineer, Delivery", tr: "Ürün mühendisi, Teslim" } },
    changes: [
      { kind: "feature", title: { en: "endpoint.failing and endpoint.recovered events", tr: "endpoint.failing ve endpoint.recovered olayları" }, text: { en: "Sent to an operator endpoint of your choice after 5 consecutive failures, and again on the first success.", tr: "Art arda 5 hatadan sonra ve ilk başarıda, seçtiğiniz bir operatör uç noktasına gönderilir." } },
      { kind: "fix", title: { en: "Duplicate alert emails", tr: "Yinelenen uyarı e-postaları" }, text: { en: "Endpoints that flapped within a minute sent two emails; now one.", tr: "Bir dakika içinde gidip gelen uç noktalar iki e-posta gönderiyordu; artık bir." } },
    ],
  },
  {
    version: "4.8",
    date: "2026-09-09",
    title: { en: "Idempotency keys on every write", tr: "Her yazmada tekillik anahtarı" },
    lead: { en: "Retrying your own send call after a timeout no longer risks sending the event twice.", tr: "Zaman aşımından sonra kendi gönderim çağrınızı yinelemek artık olayı iki kez gönderme riski taşımıyor." },
    author: { name: "Can Özkan", role: { en: "API platform", tr: "API platformu" } },
    changes: [
      { kind: "feature", title: { en: "Idempotency-Key header", tr: "Idempotency-Key başlığı" }, text: { en: "Keys are kept for 24 hours; a repeat returns the first response with relay-idempotent-replay: true.", tr: "Anahtarlar 24 saat saklanır; tekrar, ilk yanıtı relay-idempotent-replay: true ile döndürür." } },
      { kind: "improvement", title: { en: "SDKs set keys for you", tr: "SDK’lar anahtarı sizin için koyar" }, text: { en: "Node, Python, Go and Ruby SDKs generate a key per call and reuse it on their own retries.", tr: "Node, Python, Go ve Ruby SDK’ları her çağrıya bir anahtar üretir ve kendi yeniden denemelerinde kullanır." } },
    ],
    code: {
      language: "bash",
      text: `curl $RELAY_API/v4/events \\
  -u "$RELAY_KEY:" \\
  -H "Idempotency-Key: inv_2041-paid" \\
  -d type="invoice.paid"`,
    },
  },
  {
    version: "4.7",
    date: "2026-08-26",
    title: { en: "Per-endpoint rate limits", tr: "Uç nokta başına hız sınırı" },
    lead: { en: "A slow customer no longer slows down everyone else: each endpoint gets its own limit and its own queue.", tr: "Yavaş bir müşteri artık herkesi yavaşlatmıyor: her uç noktanın kendi sınırı ve kendi kuyruğu var." },
    author: { name: "Emre Kılıç", role: { en: "Infrastructure", tr: "Altyapı" } },
    changes: [
      { kind: "feature", title: { en: "rate_limit on endpoints", tr: "Uç noktalarda rate_limit" }, text: { en: "Requests per second, 1 to 500. Over the limit, deliveries wait in the endpoint’s queue instead of failing.", tr: "Saniyede istek, 1 ile 500 arası. Sınır aşılınca teslimler başarısız olmak yerine uç noktanın kuyruğunda bekler." } },
      { kind: "fix", title: { en: "Retry-After was ignored on 429", tr: "429’da Retry-After yok sayılıyordu" }, text: { en: "We now honour Retry-After up to 10 minutes.", tr: "Artık Retry-After’a 10 dakikaya kadar uyuyoruz." } },
      { kind: "fix", title: { en: "Wrong timezone in CSV exports", tr: "CSV dışa aktarmada yanlış saat dilimi" }, text: { en: "Timestamps are UTC with a Z suffix, as documented.", tr: "Zaman damgaları belgelendiği gibi Z son ekiyle UTC’dir." } },
    ],
  },
  {
    version: "4.6",
    date: "2026-08-12",
    title: { en: "Event catalog, public", tr: "Herkese açık olay kataloğu" },
    lead: { en: "Publish your event types and their JSON schemas as a page your customers can browse before they subscribe.", tr: "Olay türlerinizi ve JSON şemalarını, müşterilerinizin abone olmadan önce gezebileceği bir sayfa olarak yayınlayın." },
    author: { name: "Selin Ersoy", role: { en: "Frontend, Portal", tr: "Ön yüz, Portal" } },
    changes: [
      { kind: "feature", title: { en: "Catalog page per project", tr: "Proje başına katalog sayfası" }, text: { en: "Hosted at your-project.relay-catalog.example.com or embedded in your docs.", tr: "your-project.relay-catalog.example.com’da barındırılır ya da belgelerinize gömülür." } },
      { kind: "improvement", title: { en: "Schema diff on publish", tr: "Yayında şema farkı" }, text: { en: "Publishing a new schema version shows which fields were added, removed or retyped.", tr: "Yeni şema sürümünü yayınlamak hangi alanların eklendiğini, kaldırıldığını ya da tür değiştirdiğini gösterir." } },
    ],
  },
];

/** "4.12" → "v4-12" (anchor and entry id). */
export const releaseId = (version: string) => `v${version.replace(/\./g, "-")}`;

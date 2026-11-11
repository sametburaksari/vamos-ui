// Sample content for "Relay", a fictional webhooks API. Every human-readable field is
// `Localized` ({ en, tr }) and resolved with `pickLocale`. Code samples stay in English (as code
// does); everything around them is translated. Domains are example.com, the phone is fictional.
import { blockLabelsTr, pickLocale, site1LabelsTr, site2LabelsTr, type Localized } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";

export type SiteLocale = "en" | "tr";
export type L = Localized<string>;

export const ACCENT = "#06B6D4";
export const PHONE = "+902160000000";
export const EMAIL = "devs@relay.example.com";
export const API = "https://api.relay.example.com";

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

/* ------------------------------------------------------------------ */
/* Languages and code samples — the signature: one choice, every block */
/* ------------------------------------------------------------------ */

export const LANGS = ["curl", "node", "python", "go", "ruby"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_LABEL: Record<Lang, string> = { curl: "cURL", node: "Node.js", python: "Python", go: "Go", ruby: "Ruby" };
/** File name shown in a code panel's header, per sample and language. */
export const FILE: Record<Lang, string> = { curl: "terminal", node: "send.ts", python: "send.py", go: "send.go", ruby: "send.rb" };

export type Sample = "send" | "install" | "endpoint" | "verify" | "retry";

export const CODE: Record<Sample, Record<Lang, string>> = {
  send: {
    curl: `curl ${API}/v4/events \\
  -H "Authorization: Bearer $RELAY_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "invoice.paid",
    "tenant": "ten_8Kq2",
    "data": { "invoice": "inv_2041", "amount": 12900 }
  }'`,
    node: `import { Relay } from "@relay/node";

const relay = new Relay(process.env.RELAY_KEY);

await relay.events.send({
  type: "invoice.paid",
  tenant: "ten_8Kq2",
  data: { invoice: "inv_2041", amount: 12900 },
});`,
    python: `import os
from relay import Relay

relay = Relay(os.environ["RELAY_KEY"])

relay.events.send(
    type="invoice.paid",
    tenant="ten_8Kq2",
    data={"invoice": "inv_2041", "amount": 12900},
)`,
    go: `client := relay.New(os.Getenv("RELAY_KEY"))

_, err := client.Events.Send(ctx, &relay.Event{
    Type:   "invoice.paid",
    Tenant: "ten_8Kq2",
    Data:   map[string]any{"invoice": "inv_2041", "amount": 12900},
})`,
    ruby: `relay = Relay::Client.new(ENV.fetch("RELAY_KEY"))

relay.events.send(
  type: "invoice.paid",
  tenant: "ten_8Kq2",
  data: { invoice: "inv_2041", amount: 12_900 }
)`,
  },
  install: {
    curl: `# No SDK needed: every endpoint is plain HTTPS.
export RELAY_KEY="rk_test_51HxQv8"`,
    node: `npm install @relay/node`,
    python: `pip install relay-webhooks`,
    go: `go get example.com/relay-go/v4`,
    ruby: `bundle add relay-ruby`,
  },
  endpoint: {
    curl: `curl ${API}/v4/endpoints \\
  -H "Authorization: Bearer $RELAY_KEY" \\
  -d url="https://hooks.example.com/relay" \\
  -d tenant="ten_8Kq2" \\
  -d "events[]=invoice.*"`,
    node: `const endpoint = await relay.endpoints.create({
  url: "https://hooks.example.com/relay",
  tenant: "ten_8Kq2",
  events: ["invoice.*"],
});`,
    python: `endpoint = relay.endpoints.create(
    url="https://hooks.example.com/relay",
    tenant="ten_8Kq2",
    events=["invoice.*"],
)`,
    go: `endpoint, err := client.Endpoints.Create(ctx, &relay.EndpointParams{
    URL:    "https://hooks.example.com/relay",
    Tenant: "ten_8Kq2",
    Events: []string{"invoice.*"},
})`,
    ruby: `endpoint = relay.endpoints.create(
  url: "https://hooks.example.com/relay",
  tenant: "ten_8Kq2",
  events: ["invoice.*"]
)`,
  },
  verify: {
    curl: `# Every delivery is signed:
#   relay-signature: t=1762851600,v1=5f2b9c…
# v1 = HMAC-SHA256(secret, "{t}.{raw body}")
echo -n "$T.$BODY" | openssl dgst -sha256 -hmac "$RELAY_SECRET"`,
    node: `import { verify } from "@relay/node/webhooks";

app.post("/relay", express.raw({ type: "*/*" }), (req, res) => {
  const event = verify(req.body, req.headers, process.env.RELAY_SECRET);
  console.log(event.type); // "invoice.paid"
  res.sendStatus(204);
});`,
    python: `from relay.webhooks import verify

@app.post("/relay")
def receive(request):
    event = verify(request.body, request.headers, os.environ["RELAY_SECRET"])
    print(event.type)  # "invoice.paid"
    return Response(status=204)`,
    go: `http.HandleFunc("/relay", func(w http.ResponseWriter, r *http.Request) {
    event, err := webhooks.Verify(r, os.Getenv("RELAY_SECRET"))
    if err != nil {
        http.Error(w, "bad signature", 400)
        return
    }
    log.Println(event.Type) // "invoice.paid"
    w.WriteHeader(204)
})`,
    ruby: `post "/relay" do
  event = Relay::Webhooks.verify(request.body.read, request.env, ENV["RELAY_SECRET"])
  logger.info(event.type) # "invoice.paid"
  status 204
end`,
  },
  retry: {
    curl: `curl "${API}/v4/deliveries?status=failed&limit=20" \\
  -H "Authorization: Bearer $RELAY_KEY"

curl -X POST ${API}/v4/deliveries/dlv_93Fz/retry \\
  -H "Authorization: Bearer $RELAY_KEY"`,
    node: `const failed = await relay.deliveries.list({ status: "failed", limit: 20 });

for (const delivery of failed.data) {
  await relay.deliveries.retry(delivery.id);
}`,
    python: `failed = relay.deliveries.list(status="failed", limit=20)

for delivery in failed.data:
    relay.deliveries.retry(delivery.id)`,
    go: `failed, _ := client.Deliveries.List(ctx, &relay.ListParams{Status: "failed", Limit: 20})

for _, d := range failed.Data {
    client.Deliveries.Retry(ctx, d.ID)
}`,
    ruby: `failed = relay.deliveries.list(status: "failed", limit: 20)

failed.data.each { |delivery| relay.deliveries.retry(delivery.id) }`,
  },
};

/** What the install line in the hero shows per language. */
export const INSTALL_LINE: Record<Lang, string> = {
  curl: "export RELAY_KEY=rk_test_51HxQv8",
  node: "npm install @relay/node",
  python: "pip install relay-webhooks",
  go: "go get example.com/relay-go/v4",
  ruby: "bundle add relay-ruby",
};

/* ------------------------------------------------------------------ */
/* Delivery trace under the hero code                                  */
/* ------------------------------------------------------------------ */

export const trace: { time: string; attempt: number; status: number; ms: number; note: L }[] = [
  { time: "09:41:07.112", attempt: 1, status: 503, ms: 2140, note: { en: "endpoint busy — retry in 30 s", tr: "uç nokta meşgul — 30 sn sonra yeniden" } },
  { time: "09:41:37.204", attempt: 2, status: 503, ms: 1980, note: { en: "still busy — retry in 2 min", tr: "hâlâ meşgul — 2 dk sonra yeniden" } },
  { time: "09:43:37.391", attempt: 3, status: 200, ms: 142, note: { en: "delivered, signature verified", tr: "teslim edildi, imza doğrulandı" } },
];

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

export const features: { icon: string; title: L; text: L }[] = [
  { icon: "rotate-ccw", title: { en: "Retries that back off", tr: "Geri çekilen yeniden denemeler" }, text: { en: "Eight attempts over 27 hours with jittered backoff. A 410 Gone stops the schedule; nothing else does.", tr: "Rastgele aralıklı geri çekilmeyle 27 saatte sekiz deneme. Programı yalnızca 410 Gone durdurur." } },
  { icon: "fingerprint", title: { en: "Signed, every time", tr: "Her seferinde imzalı" }, text: { en: "HMAC-SHA256 with a timestamp in the signed payload, so a replayed request older than five minutes fails.", tr: "İmzalanan içerikte zaman damgasıyla HMAC-SHA256; beş dakikadan eski tekrar istekleri reddedilir." } },
  { icon: "history", title: { en: "Replay any window", tr: "İstediğiniz aralığı yeniden gönderin" }, text: { en: "Your customer’s server was down from 02:10 to 02:55? Replay exactly those 1,204 events, in order.", tr: "Müşterinizin sunucusu 02:10–02:55 arası kapalı mıydı? Tam o 1.204 olayı sırasıyla yeniden gönderin." } },
  { icon: "split", title: { en: "Fan-out per tenant", tr: "Kiracı başına dağıtım" }, text: { en: "One send, every subscribed endpoint of that tenant. Filters by event type and wildcard.", tr: "Tek gönderim, o kiracının abone olduğu tüm uç noktalar. Olay türü ve joker karakterle filtre." } },
  { icon: "gauge", title: { en: "Rate limits per endpoint", tr: "Uç nokta başına hız sınırı" }, text: { en: "A slow customer gets 5 requests a second and a queue — your other customers don’t wait behind them.", tr: "Yavaş bir müşteri saniyede 5 istek ve bir kuyruk alır; diğer müşterileriniz onun arkasında beklemez." } },
  { icon: "layout-panel-left", title: { en: "A portal for your customers", tr: "Müşterileriniz için bir portal" }, text: { en: "Embed the endpoint portal: your customers add URLs, read logs and rotate secrets without a ticket.", tr: "Uç nokta portalını gömün: müşterileriniz destek talebi açmadan URL ekler, kayıtları okur, anahtarları yeniler." } },
];

export const steps: { sample: Sample; title: L; text: L; time: L }[] = [
  { sample: "install", title: { en: "Install the SDK", tr: "SDK’yı kurun" }, text: { en: "Or skip it: the API is plain HTTPS and JSON. Test keys start with rk_test_ and never deliver outside your sandbox.", tr: "Ya da atlayın: API düz HTTPS ve JSON. Test anahtarları rk_test_ ile başlar ve sandbox dışına teslim etmez." }, time: { en: "30 s", tr: "30 sn" } },
  { sample: "endpoint", title: { en: "Register your customer’s endpoint", tr: "Müşterinizin uç noktasını kaydedin" }, text: { en: "One endpoint per URL, scoped to a tenant. Relay generates its signing secret and shows it once.", tr: "Her URL için bir uç nokta, bir kiracıya bağlı. İmza anahtarını Relay üretir ve bir kez gösterir." }, time: { en: "1 min", tr: "1 dk" } },
  { sample: "verify", title: { en: "Verify on the receiving side", tr: "Alan tarafta doğrulayın" }, text: { en: "Hand this to your customers. Three lines in their framework; a wrong secret fails loudly, not silently.", tr: "Bunu müşterilerinize verin. Kendi çatılarında üç satır; yanlış anahtar sessizce değil, açıkça hata verir." }, time: { en: "2 min", tr: "2 dk" } },
];

export const stats: { value: number | string; unit?: string; label: L; source: L }[] = [
  { value: "99.995", unit: "%", label: { en: "Delivery API uptime, last 90 days", tr: "Teslim API’si erişilebilirliği, son 90 gün" }, source: { en: "status.relay.example.com", tr: "status.relay.example.com" } },
  { value: 38, unit: "ms", label: { en: "Median time from send to first attempt", tr: "Gönderimden ilk denemeye ortanca süre" }, source: { en: "October 2026, all regions", tr: "Ekim 2026, tüm bölgeler" } },
  { value: 2.1, unit: "B", label: { en: "Events delivered last month", tr: "Geçen ay teslim edilen olay" }, source: { en: "Across 1,840 teams", tr: "1.840 ekip genelinde" } },
  { value: 99.2, unit: "%", label: { en: "Of failures recovered by retries", tr: "Yeniden denemeyle kurtarılan hatalar" }, source: { en: "Deliveries that failed once, Oct 2026", tr: "Bir kez başarısız olan teslimler, Ekim 2026" } },
];

/* Pricing — per event. Amounts are decimal strings in USD. */
export interface Plan {
  id: "hobby" | "team" | "scale";
  name: string;
  base: number;
  included: number;
  /** USD per 100,000 events above `included`; null = hard cap. */
  per100k: number | null;
  blurb: L;
  features: L[];
}
export const plans: Plan[] = [
  {
    id: "hobby",
    name: "Hobby",
    base: 0,
    included: 50_000,
    per100k: null,
    blurb: { en: "Side projects and staging.", tr: "Yan projeler ve test ortamı." },
    features: [
      { en: "50,000 events a month, hard cap", tr: "Ayda 50.000 olay, kesin sınır" },
      { en: "3 endpoints", tr: "3 uç nokta" },
      { en: "3-day delivery logs", tr: "3 günlük teslim kayıtları" },
      { en: "Community support", tr: "Topluluk desteği" },
    ],
  },
  {
    id: "team",
    name: "Team",
    base: 39,
    included: 1_000_000,
    per100k: 0.45,
    blurb: { en: "Production webhooks for a growing product.", tr: "Büyüyen bir ürün için canlı webhook’lar." },
    features: [
      { en: "1M events included, then $0.45 per 100k", tr: "1M olay dahil, sonrası 100 bin başına 0,45 $" },
      { en: "Unlimited endpoints and tenants", tr: "Sınırsız uç nokta ve kiracı" },
      { en: "30-day logs and replay", tr: "30 günlük kayıt ve yeniden gönderim" },
      { en: "Embeddable customer portal", tr: "Gömülebilir müşteri portalı" },
    ],
  },
  {
    id: "scale",
    name: "Scale",
    base: 249,
    included: 20_000_000,
    per100k: 0.2,
    blurb: { en: "High volume, strict networks, an SLA.", tr: "Yüksek hacim, sıkı ağlar, bir SLA." },
    features: [
      { en: "20M events included, then $0.20 per 100k", tr: "20M olay dahil, sonrası 100 bin başına 0,20 $" },
      { en: "90-day logs, static egress IPs", tr: "90 günlük kayıt, sabit çıkış IP’leri" },
      { en: "99.99% delivery SLA", tr: "%99,99 teslim SLA’sı" },
      { en: "SSO, audit log, 4-hour support", tr: "SSO, denetim kaydı, 4 saatte destek" },
    ],
  },
];

/** Monthly cost of a plan at a volume, or null when the plan can't carry it. */
export function planCost(p: Plan, events: number): number | null {
  if (p.per100k === null) return events <= p.included ? p.base : null;
  const over = Math.max(0, events - p.included);
  return p.base + Math.ceil(over / 100_000) * p.per100k;
}

/** Slider stops for the estimator (events per month). */
export const VOLUMES = [25_000, 50_000, 250_000, 1_000_000, 3_000_000, 8_000_000, 20_000_000, 45_000_000, 100_000_000];

export const faq: { q: L; a: L }[] = [
  { q: { en: "What counts as an event?", tr: "Olay olarak ne sayılır?" }, a: { en: "One call to send, whatever the fan-out. An event delivered to four endpoints is one event; retries are free.", tr: "Dağıtım ne olursa olsun bir gönderim çağrısı. Dört uç noktaya teslim edilen bir olay tek olaydır; yeniden denemeler ücretsizdir." } },
  { q: { en: "Where is data stored?", tr: "Veriler nerede saklanır?" }, a: { en: "You choose the region per project: Frankfurt, Virginia or Singapore. Payloads never leave it, logs included.", tr: "Bölgeyi proje başına siz seçersiniz: Frankfurt, Virginia ya da Singapur. İçerikler kayıtlar dahil oradan çıkmaz." } },
  { q: { en: "Can I move from my own queue?", tr: "Kendi kuyruğumdan geçebilir miyim?" }, a: { en: "Yes. Keep your existing signing secrets: import them per endpoint and your customers change nothing.", tr: "Evet. Mevcut imza anahtarlarınızı koruyun: uç nokta başına içe aktarın, müşterileriniz hiçbir şey değiştirmez." } },
];

/* ------------------------------------------------------------------ */
/* Docs landing                                                        */
/* ------------------------------------------------------------------ */

export type DocGroup = "start" | "send" | "receive" | "operate" | "reference";
export const docGroups: Record<DocGroup, L> = {
  start: { en: "Get started", tr: "Başlarken" },
  send: { en: "Sending", tr: "Gönderme" },
  receive: { en: "Receiving", tr: "Alma" },
  operate: { en: "Operating", tr: "İşletme" },
  reference: { en: "Reference", tr: "Başvuru" },
};

export const docs: { id: string; group: DocGroup; title: L; summary: L; minutes: number }[] = [
  { id: "quickstart", group: "start", title: { en: "Quickstart", tr: "Hızlı başlangıç" }, summary: { en: "Send your first signed event in under five minutes.", tr: "İlk imzalı olayınızı beş dakikadan kısa sürede gönderin." }, minutes: 5 },
  { id: "concepts", group: "start", title: { en: "Events, endpoints and tenants", tr: "Olaylar, uç noktalar ve kiracılar" }, summary: { en: "The three objects everything else is built on.", tr: "Her şeyin üzerine kurulduğu üç nesne." }, minutes: 6 },
  { id: "test-mode", group: "start", title: { en: "Test mode and sandboxes", tr: "Test modu ve sandbox’lar" }, summary: { en: "rk_test_ keys, the capture inbox and fake endpoints.", tr: "rk_test_ anahtarları, yakalama kutusu ve sahte uç noktalar." }, minutes: 4 },
  { id: "event-types", group: "send", title: { en: "Event types and schemas", tr: "Olay türleri ve şemalar" }, summary: { en: "Name events, version their payloads and publish a catalog.", tr: "Olayları adlandırın, içeriklerini sürümleyin, bir katalog yayınlayın." }, minutes: 8 },
  { id: "fan-out", group: "send", title: { en: "Fan-out and filters", tr: "Dağıtım ve filtreler" }, summary: { en: "Wildcards, per-endpoint filters and ordering guarantees.", tr: "Joker karakterler, uç nokta filtreleri ve sıralama garantileri." }, minutes: 7 },
  { id: "idempotency", group: "send", title: { en: "Idempotency keys", tr: "Tekillik anahtarları" }, summary: { en: "Retry your own send calls without sending twice.", tr: "Kendi gönderim çağrılarınızı iki kez göndermeden yineleyin." }, minutes: 3 },
  { id: "verify", group: "receive", title: { en: "Verifying signatures", tr: "İmzaları doğrulama" }, summary: { en: "HMAC-SHA256, timestamps and rotating secrets without downtime.", tr: "HMAC-SHA256, zaman damgaları ve kesintisiz anahtar yenileme." }, minutes: 6 },
  { id: "portal", group: "receive", title: { en: "Embedding the customer portal", tr: "Müşteri portalını gömme" }, summary: { en: "A drop-in iframe or React component, themed to your app.", tr: "Uygulamanıza göre temalanan hazır iframe ya da React bileşeni." }, minutes: 9 },
  { id: "retries", group: "operate", title: { en: "Retries and backoff", tr: "Yeniden denemeler ve geri çekilme" }, summary: { en: "The schedule, what stops it and how to tune it per endpoint.", tr: "Program, onu neyin durdurduğu ve uç nokta başına ayarı." }, minutes: 5 },
  { id: "replay", group: "operate", title: { en: "Replay and recovery", tr: "Yeniden gönderim ve kurtarma" }, summary: { en: "Re-deliver a time window or a single failed delivery.", tr: "Bir zaman aralığını ya da tek bir başarısız teslimi yeniden gönderin." }, minutes: 5 },
  { id: "alerts", group: "operate", title: { en: "Failure alerts", tr: "Hata uyarıları" }, summary: { en: "Email, Slack-style chat hooks or a webhook when an endpoint keeps failing.", tr: "Bir uç nokta sürekli hata verdiğinde e-posta, sohbet kancası ya da webhook." }, minutes: 4 },
  { id: "api", group: "reference", title: { en: "REST API reference", tr: "REST API başvurusu" }, summary: { en: "Every endpoint, parameter and error code of API v4.", tr: "API v4’ün tüm uç noktaları, parametreleri ve hata kodları." }, minutes: 30 },
  { id: "errors", group: "reference", title: { en: "Errors and status codes", tr: "Hatalar ve durum kodları" }, summary: { en: "What 409, 422 and 429 mean here, and what to do.", tr: "Burada 409, 422 ve 429’un anlamı ve ne yapılacağı." }, minutes: 4 },
  { id: "limits", group: "reference", title: { en: "Limits", tr: "Sınırlar" }, summary: { en: "Payload size (256 KB), rate limits and retention per plan.", tr: "İçerik boyutu (256 KB), hız sınırları ve pakete göre saklama." }, minutes: 2 },
];

export const sdks: { lang: Lang; pkg: string; version: string; runtime: string; released: string }[] = [
  { lang: "node", pkg: "@relay/node", version: "4.6.1", runtime: "Node 18+, Bun, Deno", released: "2026-11-04" },
  { lang: "python", pkg: "relay-webhooks", version: "4.5.0", runtime: "Python 3.9+", released: "2026-10-28" },
  { lang: "go", pkg: "example.com/relay-go/v4", version: "4.4.2", runtime: "Go 1.21+", released: "2026-10-21" },
  { lang: "ruby", pkg: "relay-ruby", version: "4.3.0", runtime: "Ruby 3.1+", released: "2026-09-30" },
];

/* ------------------------------------------------------------------ */
/* Changelog teaser — the same releases as the full changelog site     */
/* ------------------------------------------------------------------ */

export type ChangeKind = "feature" | "improvement" | "fix";
export const kindLabel: Record<ChangeKind, L> = {
  feature: { en: "Feature", tr: "Özellik" },
  improvement: { en: "Improvement", tr: "İyileştirme" },
  fix: { en: "Fix", tr: "Düzeltme" },
};

export const releases: { version: string; date: string; title: L; summary: L; kinds: ChangeKind[] }[] = [
  {
    version: "4.12",
    date: "2026-11-04",
    title: { en: "Replay by time window", tr: "Zaman aralığına göre yeniden gönderim" },
    summary: { en: "Pick a start and end, preview the count, replay in order. Also in the API as POST /v4/replays.", tr: "Başlangıç ve bitiş seçin, sayıyı önizleyin, sırayla yeniden gönderin. API’de POST /v4/replays olarak da var." },
    kinds: ["feature", "fix"],
  },
  {
    version: "4.11",
    date: "2026-10-21",
    title: { en: "Static egress IPs in Singapore", tr: "Singapur’da sabit çıkış IP’leri" },
    summary: { en: "Scale projects in ap-southeast-1 now deliver from two fixed addresses your customers can allow-list.", tr: "ap-southeast-1’deki Scale projeleri artık müşterilerinizin izin listesine ekleyebileceği iki sabit adresten teslim ediyor." },
    kinds: ["feature", "improvement"],
  },
  {
    version: "4.10",
    date: "2026-10-07",
    title: { en: "Portal logs load 4× faster", tr: "Portal kayıtları 4 kat hızlı" },
    summary: { en: "The embedded portal streams the first 50 deliveries instead of waiting for the full page.", tr: "Gömülü portal tam sayfayı beklemek yerine ilk 50 teslimi akış olarak getiriyor." },
    kinds: ["improvement", "fix"],
  },
];

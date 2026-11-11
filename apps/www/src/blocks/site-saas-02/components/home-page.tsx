import { Badge, Button, Kbd } from "@vamos-ui/react";
import { Container, Cta, LogoStrip, Section, StatsBand, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { createFormatter } from "@vamos-ui/react/format";
import { ArrowRight } from "lucide-react";
import { alerts, copyFor, customerLogos, PHONE, type L, type SiteLocale } from "./content";
import { QueryConsole } from "./query-console";

/** Static class names so Tailwind sees them. */
const DOT = { danger: "bg-danger", warning: "bg-warning", success: "bg-success", info: "bg-info" } as const;

const eyebrow = "font-mono text-[11px] uppercase tracking-[0.16em] text-fg-subtle";

/** Twelve capabilities as a hairline spec sheet: index, name, one line, one measurable fact. */
const capabilities: { title: L; text: L; spec: L }[] = [
  { title: { en: "SQL or no SQL", tr: "SQL’li ya da SQL’siz" }, text: { en: "Analysts write SQL; everyone else clicks the same metrics.", tr: "Analistler SQL yazar; diğerleri aynı metriklere tıklar." }, spec: { en: "autocomplete from your schema", tr: "şemanızdan otomatik tamamlama" } },
  { title: { en: "Metric layer", tr: "Metrik katmanı" }, text: { en: "Define revenue once. Every chart, alert and export uses that definition.", tr: "Ciroyu bir kez tanımlayın. Her grafik, uyarı ve dışa aktarım onu kullanır." }, spec: { en: "versioned, with owners", tr: "sürümlü, sahipli" } },
  { title: { en: "Anomaly alerts", tr: "Anomali uyarıları" }, text: { en: "Seasonality-aware bands; a ping only when a number leaves them.", tr: "Mevsimselliği bilen bantlar; sayı banttan çıkınca tek uyarı." }, spec: { en: "median 1 alert / week / team", tr: "ekip başına haftada ortanca 1 uyarı" } },
  { title: { en: "Drill to rows", tr: "Satıra kadar in" }, text: { en: "Click a point, see the orders behind it, export them as CSV.", tr: "Bir noktaya tıklayın, arkasındaki siparişleri görün, CSV alın." }, spec: { en: "up to 1M rows per export", tr: "dışa aktarımda 1M satıra kadar" } },
  { title: { en: "Fast on big tables", tr: "Büyük tablolarda hızlı" }, text: { en: "Result cache plus incremental aggregates on your own replica.", tr: "Kendi kopyanızda sonuç önbelleği ve artımlı toplamlar." }, spec: { en: "p95 1.4 s on 50M rows", tr: "50M satırda p95 1,4 sn" } },
  { title: { en: "Keyboard first", tr: "Önce klavye" }, text: { en: "Command bar, run with a shortcut, jump between tabs without a mouse.", tr: "Komut çubuğu, kısayolla çalıştırma, faresiz sekme geçişi." }, spec: { en: "⌘K · ⌘↵ · ⌘/", tr: "⌘K · ⌘↵ · ⌘/" } },
  { title: { en: "Row-level access", tr: "Satır düzeyinde erişim" }, text: { en: "Store managers see their store; finance sees all. One rule, everywhere.", tr: "Mağaza müdürü kendi mağazasını, finans hepsini görür. Tek kural, her yerde." }, spec: { en: "rules tested before saving", tr: "kurallar kaydetmeden test edilir" } },
  { title: { en: "Weekly digests", tr: "Haftalık özetler" }, text: { en: "Monday 09:00: the five numbers that moved, in plain sentences.", tr: "Pazartesi 09:00: kıpırdayan beş sayı, düz cümlelerle." }, spec: { en: "opened by 71% of recipients", tr: "alıcıların %71’i açıyor" } },
  { title: { en: "Embeds", tr: "Gömme" }, text: { en: "Put a live chart in your own admin panel with a signed URL.", tr: "İmzalı adresle kendi yönetim panelinize canlı grafik koyun." }, spec: { en: "filters passed per viewer", tr: "izleyici başına filtre" } },
  { title: { en: "Audit trail", tr: "Denetim kaydı" }, text: { en: "Who changed which definition, when, and what it did to the numbers.", tr: "Kim hangi tanımı ne zaman değiştirdi, sayılara ne oldu." }, spec: { en: "kept for 400 days", tr: "400 gün saklanır" } },
  { title: { en: "Turkish and English", tr: "Türkçe ve İngilizce" }, text: { en: "Every screen, digest and alert in both; numbers in each locale’s format.", tr: "Her ekran, özet ve uyarı iki dilde; sayılar her dilin biçiminde." }, spec: { en: "₺1.250,50 and $1,250.50", tr: "₺1.250,50 ve $1,250.50" } },
  { title: { en: "Read-only by design", tr: "Tasarım gereği salt okunur" }, text: { en: "We ask for a read-only user. Plumbline cannot write to your database.", tr: "Salt okunur kullanıcı isteriz. Plumbline veritabanınıza yazamaz." }, spec: { en: "credentials encrypted per workspace", tr: "kimlik bilgileri alan başına şifreli" } },
];

/**
 * Home of the Plumbline site. Server component; the query console in the hero is the one
 * client island. Dense on purpose: a data team reads specs, not slogans.
 */
export function HomePage({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const f = createFormatter(intl, { timeZone: "Europe/Istanbul" });
  const when = (iso: string) => f.date(iso, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

  return (
    <>
      {/* Hero: headline above, the live console full width under it */}
      <Section anchor="top" headingId="pl-hero-title" className="relative overflow-hidden pt-[calc(var(--section-y,4rem)*0.6)]!">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(var(--line)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
        <Container size="wide">
          <div className="grid items-end gap-x-10 gap-y-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div>
              <a href={sitePageHref("connectors")} className="focus-ring inline-flex items-center gap-2 rounded-ui-sm border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-fg-muted hover:text-fg">
                <Badge size="sm" tone="accent">5.0</Badge>
                {t({ en: "18 connectors, e-invoice XML in beta", tr: "18 bağlayıcı, e-fatura XML beta’da" })}
                <ArrowRight aria-hidden className="size-3 rtl:rotate-180" />
              </a>
              <h1 id="pl-hero-title" className="mt-5 font-display text-display-l text-balance">
                {t({ en: "Ask the warehouse. Get the chart, not a ticket.", tr: "Veriye sorun. Talep açmadan grafiği alın." })}
              </h1>
            </div>
            <div className="grid gap-5 lg:pb-2">
              <p className="max-w-[46ch] text-[15px] leading-relaxed text-fg-muted">
                {t({
                  en: "Plumbline connects to your database, lets you define each metric once, and turns it into charts, alerts and Monday digests your whole company reads the same way.",
                  tr: "Plumbline veritabanınıza bağlanır, her metriği bir kez tanımlamanızı sağlar ve onu tüm şirketin aynı okuduğu grafiklere, uyarılara ve pazartesi özetlerine çevirir.",
                })}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="primary" size="lg">
                  <a href="/signup">{t({ en: "Connect a database", tr: "Veritabanı bağlayın" })}</a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href={sitePageHref("pricing")}>{t({ en: "See pricing", tr: "Fiyatları görün" })}</a>
                </Button>
              </div>
              <p className="font-mono text-[11px] text-fg-subtle">{t({ en: "Free for 3 editors · read-only access · data stays in your database", tr: "3 editöre kadar ücretsiz · salt okunur erişim · veri sizin veritabanınızda kalır" })}</p>
            </div>
          </div>
          <div className="mt-10">
            <QueryConsole />
          </div>
        </Container>
      </Section>

      <LogoStrip {...common} anchor="customers" variant="row" theme={{ rhythm: "tight" }} caption={t({ en: "Read every Monday by teams at", tr: "Her pazartesi okuyan ekipler" })} logos={customerLogos} />

      {/* Dense capability sheet */}
      <Section anchor="product" headingId="pl-product-title">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>{t({ en: "Product · 12 parts", tr: "Ürün · 12 parça" })}</p>
              <h2 id="pl-product-title" className="mt-3 max-w-[22ch] font-display text-display-m text-balance">
                {t({ en: "Everything a data team does on a Monday", tr: "Bir veri ekibinin pazartesi yaptığı her şey" })}
              </h2>
            </div>
            <p className="max-w-[40ch] text-sm text-fg-muted">
              {t({ en: "No slide-deck features. Each line below ships today and has a number you can check in the trial.", tr: "Sunum için özellik yok. Aşağıdaki her satır bugün çalışıyor ve denemede kontrol edebileceğiniz bir sayısı var." })}
            </p>
          </div>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-ui-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {capabilities.map((c, i) => (
              <li key={c.title.en} className="group flex min-h-44 flex-col bg-surface p-5 transition-colors hover:bg-surface-2">
                <span className="font-mono text-[11px] text-fg-subtle tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-[15px] font-semibold">{t(c.title)}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{t(c.text)}</p>
                <p className="mt-auto flex items-center gap-2 pt-4 font-mono text-[11px] text-accent-ink">
                  <span aria-hidden className="h-px w-4 bg-accent transition-[width] duration-300 group-hover:w-7 motion-reduce:transition-none" />
                  {i === 5 ? (
                    <span className="flex gap-1 text-fg-muted">
                      <Kbd>⌘K</Kbd>
                      <Kbd>⌘↵</Kbd>
                      <Kbd>⌘/</Kbd>
                    </span>
                  ) : (
                    t(c.spec)
                  )}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* Metric layer */}
      <Section anchor="metrics" headingId="pl-metrics-title" theme={{ surface: "surface-2" }}>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
            <div>
              <p className={eyebrow}>{t({ en: "Metric layer", tr: "Metrik katmanı" })}</p>
              <h2 id="pl-metrics-title" className="mt-3 font-display text-display-m text-balance">
                {t({ en: "One definition of revenue. Not four.", tr: "Ciro için tek tanım. Dört değil." })}
              </h2>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-fg-muted">
                {t({
                  en: "Finance, ops and the founders used to bring different revenue numbers to the same meeting. In Plumbline a metric is a reviewed file with an owner; change it and you see which dashboards and alerts move before you merge.",
                  tr: "Finans, operasyon ve kurucular aynı toplantıya farklı ciro rakamlarıyla gelirdi. Plumbline’da metrik, sahibi olan ve incelenen bir dosyadır; değiştirdiğinizde hangi panoların ve uyarıların etkileneceğini birleştirmeden görürsünüz.",
                })}
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-px overflow-hidden rounded-ui border border-line bg-line text-center">
                {[
                  { v: "23", l: { en: "dashboards use it", tr: "pano kullanıyor" } },
                  { v: "4", l: { en: "alerts watch it", tr: "uyarı izliyor" } },
                  { v: "v7", l: { en: "reviewed versions", tr: "incelenmiş sürüm" } },
                ].map((s) => (
                  <div key={s.v} className="bg-surface p-3">
                    <dt className="sr-only">{t(s.l)}</dt>
                    <dd className="font-mono text-xl text-fg tabular-nums">{s.v}</dd>
                    <dd aria-hidden className="mt-0.5 text-[11px] text-fg-muted">
                      {t(s.l)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <figure className="surface overflow-hidden rounded-ui-lg border border-line">
              <figcaption className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 font-mono text-[11px] text-fg-muted">
                <span>metrics/net_revenue.yml</span>
                <Badge size="sm" tone="success" dot>
                  {t({ en: "approved by finance", tr: "finans onayladı" })}
                </Badge>
              </figcaption>
              <pre tabIndex={0} aria-label={t({ en: "Metric definition file", tr: "Metrik tanım dosyası" })} className="focus-ring overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75] text-fg-muted">
                <code>
                  <span className="text-accent-ink">metric</span>: net_revenue{"\n"}
                  <span className="text-accent-ink">label</span>: {t({ en: "Net revenue", tr: "Net ciro" })}{"\n"}
                  <span className="text-accent-ink">owner</span>: finance <span className="text-fg-subtle"># Selin Kaya</span>{"\n"}
                  <span className="text-accent-ink">format</span>: currency(USD){"\n"}
                  <span className="text-accent-ink">sql</span>: |{"\n"}
                  {"  "}sum(o.net_total){"\n"}
                  {"  "}- coalesce(sum(r.amount), 0){"\n"}
                  <span className="text-accent-ink">filters</span>:{"\n"}
                  {"  "}- o.status = <span className="text-fg">&apos;paid&apos;</span>{"\n"}
                  {"  "}- o.is_test = false{"\n"}
                  <span className="text-accent-ink">time</span>: o.paid_at <span className="text-fg-subtle"># Europe/Istanbul</span>{"\n"}
                  <span className="text-accent-ink">alert</span>:{"\n"}
                  {"  "}band: seasonal(52w){"\n"}
                  {"  "}notify: [#finance, selin@tepe.example.com]
                </code>
              </pre>
              <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 font-mono text-[11px] text-fg-muted">
                <span>{t({ en: "Lineage", tr: "Köken" })}</span>
                {["orders", "refunds", "net_revenue", "aov", "weekly_digest"].map((n, i, a) => (
                  <span key={n} className="flex items-center gap-2">
                    <span className={i === 2 ? "rounded-ui-sm bg-accent px-1.5 py-0.5 text-accent-fg" : "rounded-ui-sm border border-line px-1.5 py-0.5"}>{n}</span>
                    {i < a.length - 1 ? <ArrowRight aria-hidden className="size-3 rtl:rotate-180" /> : null}
                  </span>
                ))}
              </div>
            </figure>
          </div>
        </Container>
      </Section>

      {/* Alerts feed */}
      <Section anchor="alerts" headingId="pl-alerts-title">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className={eyebrow}>{t({ en: "Alerts", tr: "Uyarılar" })}</p>
              <h2 id="pl-alerts-title" className="mt-3 font-display text-display-m text-balance">
                {t({ en: "It tells you on Tuesday night, not at the month-end review", tr: "Ay sonu toplantısında değil, salı gecesi haber verir" })}
              </h2>
              <p className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-fg-muted">
                {t({ en: "Bands learn each metric’s weekly and yearly rhythm, so a quiet Sunday is not an incident and a quiet Tuesday is. This is one week from the demo workspace.", tr: "Bantlar her metriğin haftalık ve yıllık ritmini öğrenir; sakin bir pazar olay değildir, sakin bir salı olaydır. Bu, demo çalışma alanından bir hafta." })}
              </p>
            </div>
            <ol className="relative grid gap-3 before:absolute before:inset-y-2 before:start-[7px] before:w-px before:bg-line">
              {alerts.map((a) => (
                <li key={a.at} className="relative ps-7">
                  <span aria-hidden className={`absolute start-0 top-5 size-[15px] rounded-full border-4 border-scene ${DOT[a.tone]}`} />
                  <article className="surface rounded-ui-lg border border-line p-4">
                    <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Badge size="sm" tone={a.tone}>
                        {t(a.metric)}
                      </Badge>
                      <time dateTime={a.at} className="font-mono text-[11px] text-fg-subtle">
                        {when(a.at)}
                      </time>
                    </header>
                    <p className="mt-2 text-[14px] leading-relaxed text-fg">{t(a.text)}</p>
                    <p className="mt-2 font-mono text-[11px] text-fg-muted">→ {t(a.channel)}</p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <StatsBand
        {...common}
        anchor="numbers"
        variant="ledger"
        theme={{ surface: "surface-2" }}
        eyebrow={t({ en: "Measured, not claimed", tr: "İddia değil, ölçüm" })}
        title={t({ en: "What changes in the first quarter", tr: "İlk çeyrekte ne değişiyor" })}
        items={[
          { value: 62, unit: "%", label: t({ en: "Fewer ad-hoc data requests to the analysts", tr: "Analistlere gelen anlık veri talebinde azalma" }), source: t({ en: "Median of 41 teams, Q2–Q3 2026", tr: "41 ekibin ortancası, 2026 Ç2–Ç3" }) },
          { value: 3.2, unit: t({ en: "days", tr: "gün" }), label: t({ en: "Earlier detection of a broken funnel step", tr: "Bozuk bir huni adımının daha erken fark edilmesi" }), source: t({ en: "Alert log vs. ticket date, n = 118 incidents", tr: "Uyarı kaydı ve talep tarihi, n = 118 olay" }) },
          { value: 1.4, unit: "s", unitLabel: t({ en: "seconds", tr: "saniye" }), label: t({ en: "p95 chart load on 50M-row tables", tr: "50M satırlık tablolarda p95 grafik yükleme" }), source: t({ en: "Plumbline telemetry, Oct 2026", tr: "Plumbline telemetrisi, Ekim 2026" }) },
          { value: 71, unit: "%", label: t({ en: "Of digest recipients open it on Monday", tr: "Özet alıcılarının pazartesi açma oranı" }), source: t({ en: "Digest opens, last 8 weeks", tr: "Özet açılışları, son 8 hafta" }) },
        ]}
      />

      <Testimonials
        {...common}
        variant="wall"
        eyebrow={t({ en: "From the people who read it", tr: "Okuyanlardan" })}
        title={t({ en: "The Monday meeting got *shorter*", tr: "Pazartesi toplantısı *kısaldı*" })}
        items={[
          { quote: t({ en: "We stopped arguing about whose revenue was right. Now we argue about what to do with it, which is a much better meeting.", tr: "Kimin cirosunun doğru olduğunu tartışmayı bıraktık. Artık onunla ne yapacağımızı tartışıyoruz; çok daha iyi bir toplantı." }), author: "Selin Kaya", role: t({ en: "Finance lead", tr: "Finans lideri" }), company: "Tepe Outdoor" },
          { quote: t({ en: "The refund alert fired at two in the morning. By nine we had pulled the faulty batch from two marketplaces.", tr: "İade uyarısı gece ikide geldi. Sabah dokuzda hatalı partiyi iki pazaryerinden çekmiştik." }), author: "Emre Doğan", role: t({ en: "Operations manager", tr: "Operasyon müdürü" }), company: "Tepe Outdoor" },
          { quote: t({ en: "I write SQL, my store managers don’t. We look at the same chart and the same definition. That’s the whole pitch, and it works.", tr: "Ben SQL yazarım, mağaza müdürlerim yazmaz. Aynı grafiğe, aynı tanıma bakıyoruz. Bütün mesele bu ve işe yarıyor." }), author: "Burak Aydın", role: t({ en: "Data analyst", tr: "Veri analisti" }), company: "Nordvik Tools" },
        ]}
      />

      <Cta
        {...common}
        variant="band"
        theme={{ surface: "accent" }}
        title={t({ en: "Connect a read-only replica and see *your* Monday", tr: "Salt okunur bir kopya bağlayın, *kendi* pazartesinizi görün" })}
        lead={t({ en: "Setup takes about 20 minutes. We help on a call if your database sits behind a firewall.", tr: "Kurulum yaklaşık 20 dakika. Veritabanınız güvenlik duvarının arkasındaysa görüşmede yardım ederiz." })}
        actions={[
          { link: { href: "/signup", label: t({ en: "Start free", tr: "Ücretsiz başlayın" }) }, style: "primary" },
          { link: { href: sitePageHref("pricing"), label: t({ en: "Compare plans", tr: "Paketleri karşılaştırın" }) }, style: "secondary" },
        ]}
        contact={{ phone: PHONE }}
        fineprint={t({ en: "No card for the free plan. KVKK and GDPR data processing agreement on every plan.", tr: "Ücretsiz paket için kart gerekmez. Her pakette KVKK ve GDPR veri işleme sözleşmesi." })}
      />
    </>
  );
}

import { Badge, Kbd } from "@vamos-ui/react";
import { BlockHeading, Container, Cta, Faq, FeatureGrid, Footer, Navbar, PricingTable, Section, SectionHeader, SiteShellPage, StatsBand, sitePageHref } from "@vamos-ui/react/blocks";
import { ChangelogTeaser } from "./changelog-page";
import { CodePanel } from "./code-panel";
import { copyFor, EMAIL, faq, features, PHONE, plans, stats, steps, type SiteLocale } from "./content";
import { DocsPage } from "./docs-page";
import { CostEstimator, DeliveryTrace, InstallLine } from "./home-parts";

const home = (anchor?: string) => sitePageHref("home", anchor);
const docsHref = sitePageHref("docs");
const changelogHref = sitePageHref("changelog");

/** The Relay mark: a dark tile with one cyan dot — the event leaving. */
export function RelayWordmark() {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[17px] font-semibold tracking-[-0.04em] text-fg">
      <span aria-hidden className="relative inline-grid size-[22px] place-items-center rounded-[6px] bg-fg">
        <span className="absolute start-[5px] h-[2px] w-[9px] rounded-full bg-scene" />
        <span className="absolute end-[4px] size-[6px] rounded-full bg-accent" />
      </span>
      relay
    </span>
  );
}

/**
 * One language version of the Relay site: navbar and footer around three pages (home, docs
 * landing, changelog teaser). Server component; the code panels, install line, estimator and
 * docs search are client islands sharing the selected language through LangProvider.
 */
export function DevtoolSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const common = { locale: intl, labels };
  const codeLabels = {
    tabsLabel: t({ en: "Code language", tr: "Kod dili" }),
    copyLabel: t({ en: "Copy code", tr: "Kodu kopyala" }),
    copiedLabel: t({ en: "Copied", tr: "Kopyalandı" }),
  };

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<RelayWordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Quick start", tr: "Hızlı başlangıç" }), href: home("quickstart") },
          { label: t({ en: "Pricing", tr: "Fiyatlar" }), href: home("pricing") },
          { label: t({ en: "Docs", tr: "Belgeler" }), href: docsHref },
          { label: t({ en: "Changelog", tr: "Değişiklikler" }), href: changelogHref },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[
          { link: { href: "https://dashboard.relay.example.com/signup", label: t({ en: "Get an API key", tr: "API anahtarı al" }) }, style: "primary" },
        ]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Relay — webhooks your customers can trust", tr: "Relay — müşterilerinizin güvenebileceği webhook’lar" })}>
          {/* Hero: words on the start side on a dot grid, the code window and its delivery log on the end side. */}
          <Section anchor="top" theme={{ rhythm: "tight" }} className="relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--line)_1.2px,transparent_1.2px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black_30%,transparent)]"
            />
            <Container className="relative">
              <div className="grid items-start gap-12 pt-4 pb-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14 lg:pt-10">
                <div className="min-w-0 lg:pt-6">
                  <a
                    href="https://status.relay.example.com"
                    className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1 ps-2 pe-3 font-mono text-[12px] text-fg-muted no-underline focus-ring hover:text-fg"
                  >
                    <span aria-hidden className="size-2 rounded-full bg-success" />
                    <span className="truncate">{t({ en: "All systems normal · 99.995% over 90 days", tr: "Tüm sistemler normal · 90 günde %99,995" })}</span>
                  </a>
                  <BlockHeading
                    level={1}
                    size="display-xl"
                    className="mt-7 max-w-[13ch] font-mono"
                    text={t({ en: "Webhooks that *arrive.*", tr: "Webhook’lar *ulaşır.*" })}
                  />
                  <p className="mt-6 max-w-[46ch] text-lead text-fg-muted">
                    {t({
                      en: "Relay is the sending side of your webhooks: one API call, and we sign, queue, retry and log every delivery to every customer endpoint — with a portal they can debug in themselves.",
                      tr: "Relay webhook’larınızın gönderen tarafıdır: tek API çağrısı; her müşteri uç noktasına her teslimi biz imzalar, kuyruğa alır, yeniden dener ve kaydederiz — müşterilerin kendi hata ayıklayabileceği bir portalla.",
                    })}
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <a href="https://dashboard.relay.example.com/signup" className="inline-flex h-11 items-center rounded-ui bg-accent px-5 text-[15px] font-medium text-accent-fg no-underline focus-ring hover:brightness-105">
                      {t({ en: "Start free — 50k events", tr: "Ücretsiz başla — 50 bin olay" })}
                    </a>
                    <a href={docsHref} className="inline-flex h-11 items-center gap-2 rounded-ui border border-field-border px-5 text-[15px] font-medium text-fg no-underline focus-ring hover:bg-hover">
                      {t({ en: "Read the docs", tr: "Belgeleri oku" })}
                      <Kbd size="sm" aria-hidden>
                        /
                      </Kbd>
                    </a>
                  </div>
                  <div className="mt-8">
                    <InstallLine locale={locale} />
                  </div>
                </div>

                <div className="grid min-w-0 gap-3">
                  <CodePanel sample="send" {...codeLabels} />
                  <DeliveryTrace locale={locale} />
                </div>
              </div>
            </Container>
          </Section>

          {/* Quick start: each step carries its code, in the language picked anywhere on the page. */}
          <Section anchor="quickstart" headingId="relay-qs-title">
            <Container>
              <SectionHeader
                headingId="relay-qs-title"
                align="split"
                index="01"
                eyebrow={t({ en: "Quick start", tr: "Hızlı başlangıç" })}
                title={t({ en: "From key to *first delivery* in four minutes", tr: "Anahtardan *ilk teslime* dört dakikada" })}
                lead={t({ en: "Switch the language in any code window: every sample on this site follows, and it’s remembered for the docs.", tr: "Herhangi bir kod penceresinde dili değiştirin: bu sitedeki tüm örnekler onu izler ve belgeler için hatırlanır." })}
              />
              <ol className="m-0 mt-12 grid list-none gap-0 p-0">
                {steps.map((s, i) => (
                  <li key={s.sample} className="grid gap-x-10 gap-y-5 border-t border-line py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    <div className="grid grid-cols-[auto_1fr] gap-x-5">
                      <span aria-hidden className="font-mono text-[length:var(--text-display-m)] leading-none font-semibold text-accent-ink tabular">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h3 className="m-0 text-h3 font-semibold tracking-[-0.015em] text-fg">{t(s.title)}</h3>
                        <p className="m-0 mt-2 max-w-[44ch] text-fg-muted">{t(s.text)}</p>
                        <span className="mt-3 inline-flex rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-fg-muted">~ {t(s.time)}</span>
                      </div>
                    </div>
                    <CodePanel sample={s.sample} numbers={s.sample !== "install"} {...codeLabels} />
                  </li>
                ))}
              </ol>
            </Container>
          </Section>

          <FeatureGrid
            {...common}
            anchor="features"
            variant="grid"
            columns={3}
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "02 · What you stop building", tr: "02 · Artık yazmayacağınız şeyler" })}
            title={t({ en: "The queue, the retries, the *3 a.m.* page", tr: "Kuyruk, yeniden denemeler, *gece 3* alarmı" })}
            items={features.map((it) => ({ icon: it.icon, title: t(it.title), text: t(it.text) }))}
          />

          <StatsBand
            {...common}
            anchor="numbers"
            variant="ledger"
            theme={{ mode: "dark" }}
            eyebrow={t({ en: "03 · Measured, not promised", tr: "03 · Vaat değil, ölçüm" })}
            title={t({ en: "Uptime you can *check*", tr: "*Kontrol* edebileceğiniz erişilebilirlik" })}
            items={stats.map((s) => ({ value: s.value, unit: s.unit, label: t(s.label), source: t(s.source) }))}
          />

          <Section anchor="pricing" headingId="relay-pricing-title">
            <Container>
              <SectionHeader
                headingId="relay-pricing-title"
                align="split"
                index="04"
                eyebrow={t({ en: "Pricing", tr: "Fiyatlar" })}
                title={t({ en: "Pay per event. Retries are *on us.*", tr: "Olay başına ödeyin. Yeniden denemeler *bizden.*" })}
                lead={t({ en: "An event is one send call, however many endpoints it fans out to. Drag to your volume.", tr: "Bir olay, kaç uç noktaya dağılırsa dağılsın tek gönderim çağrısıdır. Hacminize sürükleyin." })}
              />
              <div className="mt-10">
                <CostEstimator locale={locale} />
              </div>
            </Container>
          </Section>
          <PricingTable
            {...common}
            variant="columns"
            billing="monthly"
            theme={{ rhythm: "tight" }}
            plans={plans.map((p) => ({
              name: p.name,
              description: t(p.blurb),
              price: { monthly: { amount: String(p.base), currency: "USD" } },
              features: p.features.map((x) => ({ text: t(x) })),
              highlight: p.id === "team" ? t({ en: "Most teams", tr: "Çoğu ekip" }) : undefined,
              cta: {
                link: { href: `https://dashboard.relay.example.com/signup?plan=${p.id}`, label: p.id === "hobby" ? t({ en: "Start free", tr: "Ücretsiz başla" }) : t({ en: `Choose ${p.name}`, tr: `${p.name} seç` }) },
                style: p.id === "team" ? "primary" : "secondary",
              },
            }))}
            taxNote={t({ en: "USD, billed monthly. VAT added where it applies.", tr: "USD, aylık faturalandırılır. Gerekli yerlerde KDV eklenir." })}
            footnote={t({ en: "Over 100M events a month or need a private region? Talk to us about Enterprise.", tr: "Ayda 100M olayın üstünde mi, ya da özel bölge mi gerekiyor? Kurumsal için bize yazın." })}
          />

          <Faq
            {...common}
            anchor="faq"
            variant="split"
            eyebrow={t({ en: "05 · Questions", tr: "05 · Sorular" })}
            title={t({ en: "Before you *switch*", tr: "*Geçmeden* önce" })}
            items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))}
            contact={{ link: { href: `mailto:${EMAIL}`, label: t({ en: "Ask an engineer", tr: "Bir mühendise sorun" }) }, style: "link" }}
          />

          <Cta
            {...common}
            variant="split"
            theme={{ surface: "accent" }}
            title={t({ en: "Ship the webhooks your customers *keep asking for*", tr: "Müşterilerinizin *sürekli istediği* webhook’ları çıkarın" })}
            lead={t({ en: "Free up to 50,000 events a month. No card, no sales call.", tr: "Ayda 50.000 olaya kadar ücretsiz. Kart yok, satış görüşmesi yok." })}
            actions={[
              { link: { href: "https://dashboard.relay.example.com/signup", label: t({ en: "Get an API key", tr: "API anahtarı al" }) }, style: "primary" },
              { link: { href: docsHref, label: t({ en: "Read the quickstart", tr: "Hızlı başlangıcı oku" }) }, style: "secondary" },
            ]}
            fineprint={
              <span className="inline-flex flex-wrap items-center gap-2">
                <Badge tone="neutral" size="sm" shape="square" className="font-mono">
                  SOC 2 Type II
                </Badge>
                <Badge tone="neutral" size="sm" shape="square" className="font-mono">
                  GDPR · KVKK
                </Badge>
                {t({ en: `Last audit ${f.date("2026-08-14")}`, tr: `Son denetim ${f.date("2026-08-14")}` })}
              </span>
            }
          />
        </SiteShellPage>

        <SiteShellPage id="docs" title={t({ en: "Docs — Relay", tr: "Belgeler — Relay" })}>
          <DocsPage locale={locale} />
        </SiteShellPage>

        <SiteShellPage id="changelog" title={t({ en: "Changelog — Relay", tr: "Değişiklikler — Relay" })}>
          <ChangelogTeaser locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Relay", logo: <RelayWordmark />, href: home() }}
        about={t({ en: "Webhooks infrastructure, built and run from Kadıköy, Istanbul and Rotterdam.", tr: "Kadıköy, İstanbul ve Rotterdam’dan geliştirilen ve işletilen webhook altyapısı." })}
        columns={[
          { title: t({ en: "Product", tr: "Ürün" }), links: [{ href: home("quickstart"), label: t({ en: "Quick start", tr: "Hızlı başlangıç" }) }, { href: home("pricing"), label: t({ en: "Pricing", tr: "Fiyatlar" }) }, { href: changelogHref, label: t({ en: "Changelog", tr: "Değişiklikler" }) }] },
          { title: t({ en: "Developers", tr: "Geliştiriciler" }), links: [{ href: docsHref, label: t({ en: "Docs", tr: "Belgeler" }) }, { href: sitePageHref("docs", "sdks"), label: "SDK" }, { href: "https://status.relay.example.com", label: t({ en: "Status", tr: "Durum" }), newTab: true }] },
          { title: t({ en: "Company", tr: "Şirket" }), links: [{ href: "https://relay.example.com/security", label: t({ en: "Security", tr: "Güvenlik" }) }, { href: "https://relay.example.com/dpa", label: "DPA" }, { href: "https://relay.example.com/careers", label: t({ en: "Careers", tr: "Kariyer" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE }}
        social={[{ network: "linkedin", href: "https://linkedin.com/company/relay-example" }, { network: "x", href: "https://x.com/relay_example" }]}
        legalLinks={[{ href: "https://relay.example.com/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "https://relay.example.com/terms", label: t({ en: "Terms", tr: "Koşullar" }) }]}
        year={2026}
      />
    </>
  );
}

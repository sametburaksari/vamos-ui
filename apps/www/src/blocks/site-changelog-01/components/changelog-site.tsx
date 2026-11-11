import { Container, Footer, Navbar, Section, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, EMAIL, PHONE, releases, type SiteLocale } from "./content";
import { EntryPage } from "./entry-page";
import { ReleaseList } from "./release-list";
import { Subscribe } from "./subscribe";

const home = (anchor?: string) => sitePageHref("home", anchor);

/** The Relay mark, as on the product site, with a serif "changelog" beside it. */
function Wordmark() {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="inline-flex items-center gap-2 self-center font-mono text-[16px] font-semibold tracking-[-0.04em] text-fg">
        <span aria-hidden className="relative inline-grid size-[20px] place-items-center rounded-[5px] bg-fg">
          <span className="absolute start-[4px] h-[2px] w-[8px] rounded-full bg-scene" />
          <span className="absolute end-[4px] size-[5px] rounded-full bg-accent" />
        </span>
        relay
      </span>
      <span className="font-display text-[19px] text-fg-muted italic">changelog</span>
    </span>
  );
}

/**
 * One language version of the Relay changelog: a narrow masthead with subscribe + RSS, the
 * release list with the sticky date rail and kind filters, and one release as an article.
 * Server component; the list, filters, subscribe box and entry are client islands.
 */
export function ChangelogSite({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const latest = releases[0]!;
  const changes = releases.reduce((n, r) => n + r.changes.length, 0);

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<Wordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "All releases", tr: "Tüm sürümler" }), href: home("releases") },
          { label: t({ en: "Latest", tr: "Son sürüm" }), href: sitePageHref("entry") },
          { label: t({ en: "Product", tr: "Ürün" }), href: "https://relay.example.com" },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("subscribe"), label: t({ en: "Subscribe", tr: "Abone ol" }) }, style: "secondary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Changelog — Relay", tr: "Değişiklikler — Relay" })}>
          <Section anchor="top" theme={{ rhythm: "tight" }}>
            <Container>
              <div className="mx-auto grid max-w-[54rem] gap-10 pt-6 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end lg:gap-14 lg:pt-12">
                <div>
                  <p className="m-0 font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">
                    {t({ en: `Release notes · ${releases.length} releases, ${changes} changes since August`, tr: `Sürüm notları · Ağustos’tan beri ${releases.length} sürüm, ${changes} değişiklik` })}
                  </p>
                  <h1 className="m-0 mt-5 font-display text-[length:var(--text-display-xl)] leading-[0.98] text-fg">
                    {t({ en: "What’s new", tr: "Neler yeni" })}
                    <em className="text-accent-ink"> {t({ en: "in Relay", tr: "Relay’de" })}</em>
                  </h1>
                  <p className="m-0 mt-6 max-w-[48ch] text-lead text-fg-muted">
                    {t({
                      en: "Everything we ship to the webhooks API, the dashboard and the customer portal — every other Tuesday, written by the engineer who built it.",
                      tr: "Webhook API’sine, panele ve müşteri portalına çıkardığımız her şey — iki salıda bir, onu geliştiren mühendisin kaleminden.",
                    })}
                  </p>
                </div>
                <dl className="m-0 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 lg:grid-cols-1 lg:border-t-0 lg:border-s lg:ps-6 lg:pt-0">
                  <div>
                    <dt className="font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">{t({ en: "Latest", tr: "Son sürüm" })}</dt>
                    <dd className="m-0 mt-1 font-display text-2xl text-fg">v{latest.version}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">{t({ en: "Released", tr: "Yayın" })}</dt>
                    <dd className="m-0 mt-1 text-fg">{f.date(latest.date, "long")}</dd>
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <dt className="font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">{t({ en: "API", tr: "API" })}</dt>
                    <dd className="m-0 mt-1 text-fg">{t({ en: "v4, supported until June 2028", tr: "v4, Haziran 2028’e kadar destekli" })}</dd>
                  </div>
                </dl>
              </div>
            </Container>
          </Section>

          <Section anchor="releases" headingId="cl-releases-title" theme={{ rhythm: "tight" }} className="pt-0!">
            <Container>
              <div className="mx-auto max-w-[54rem]">
                <h2 id="cl-releases-title" className="sr-only">
                  {t({ en: "Releases", tr: "Sürümler" })}
                </h2>
                <ReleaseList locale={locale} />
              </div>
            </Container>
          </Section>

          <Section anchor="subscribe" headingId="cl-sub-title" theme={{ surface: "surface-2" }}>
            <Container>
              <div className="mx-auto grid max-w-[54rem] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14">
                <div>
                  <h2 id="cl-sub-title" className="m-0 font-display text-[length:var(--text-display-m)] leading-[1.05] text-fg">
                    {t({ en: "Read it the day it ships", tr: "Çıktığı gün okuyun" })}
                  </h2>
                  <p className="m-0 mt-4 max-w-[44ch] text-fg-muted">
                    {t({ en: "One short email per release, or the feed in your reader. Breaking changes are announced 90 days ahead, here first.", tr: "Sürüm başına kısa bir e-posta ya da okuyucunuzda akış. Uyumsuz değişiklikler 90 gün önceden, önce burada duyurulur." })}
                  </p>
                </div>
                <Subscribe locale={locale} />
              </div>
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="entry" title={t({ en: "Release notes — Relay", tr: "Sürüm notları — Relay" })}>
          <EntryPage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "Relay", href: home() }}
        about={t({ en: "Webhooks infrastructure from Kadıköy, Istanbul and Rotterdam.", tr: "Kadıköy, İstanbul ve Rotterdam’dan webhook altyapısı." })}
        contact={{ email: EMAIL, phone: PHONE }}
        legalLinks={[
          { href: "https://relay.example.com/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) },
          { href: "https://status.relay.example.com", label: t({ en: "Status", tr: "Durum" }) },
          { href: "https://relay.example.com/changelog.rss", label: "RSS" },
        ]}
        year={2026}
      />
    </>
  );
}

import { Badge } from "@vamos-ui/react";
import { Container, Cta, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, kindLabel, releases, type ChangeKind, type SiteLocale } from "./content";

const tone: Record<ChangeKind, "accent" | "outline" | "neutral"> = { feature: "accent", improvement: "outline", fix: "neutral" };

/** Changelog teaser: the last three releases as a version ledger, then a link to the full log. */
export function ChangelogTeaser({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const latest = releases[0]!;

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Relay", href: sitePageHref("home") }, { label: t({ en: "Changelog", tr: "Değişiklikler" }) }]}
        eyebrow={t({ en: "Shipped", tr: "Yayında" })}
        title={t({ en: "What changed *lately*", tr: "Son *değişenler*" })}
        lead={t({ en: "A release every other Tuesday. Breaking changes only with a new API version — v4 is supported until June 2028.", tr: "İki salıda bir sürüm. Uyumsuz değişiklikler yalnızca yeni API sürümüyle — v4 Haziran 2028’e kadar destekleniyor." })}
        meta={[
          { label: t({ en: "Latest", tr: "Son sürüm" }), value: `v${latest.version}` },
          { label: t({ en: "Released", tr: "Yayın" }), value: f.date(latest.date, "long") },
        ]}
      />
      <Section anchor="recent" headingId="relay-recent-title" theme={{ rhythm: "tight" }}>
        <Container>
          <h2 id="relay-recent-title" className="sr-only">
            {t({ en: "Recent releases", tr: "Son sürümler" })}
          </h2>
          <ol className="m-0 grid list-none gap-0 p-0">
            {releases.map((r) => (
              <li key={r.version} className="grid gap-x-10 gap-y-3 border-t border-line py-8 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <div className="flex items-baseline gap-3 sm:flex-col sm:gap-1">
                  <span className="font-mono text-2xl font-semibold tracking-[-0.03em] text-fg tabular">v{r.version}</span>
                  <time dateTime={r.date} className="font-mono text-xs text-fg-muted">
                    {f.date(r.date, "long")}
                  </time>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-1.5">
                    {r.kinds.map((k) => (
                      <Badge key={k} tone={tone[k]} size="sm" shape="square">
                        {t(kindLabel[k])}
                      </Badge>
                    ))}
                  </div>
                  <h3 className="m-0 mt-3 text-h3 font-semibold tracking-[-0.015em] text-fg">{t(r.title)}</h3>
                  <p className="m-0 mt-2 max-w-[60ch] text-fg-muted">{t(r.summary)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </Section>
      <Cta
        {...common}
        variant="minimal"
        title={t({ en: "Every release since *v1*", tr: "*v1*’den bu yana tüm sürümler" })}
        lead={t({ en: "Filter by features, improvements and fixes, or follow by RSS.", tr: "Özellik, iyileştirme ve düzeltmeye göre süzün ya da RSS ile takip edin." })}
        actions={[
          { link: { href: "https://relay.example.com/changelog", label: t({ en: "Open the full changelog", tr: "Tüm değişiklikleri aç" }) }, style: "primary" },
          { link: { href: "https://relay.example.com/changelog.rss", label: "RSS" }, style: "link" },
        ]}
      />
    </>
  );
}

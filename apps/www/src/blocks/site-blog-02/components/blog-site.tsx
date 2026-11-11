import { Container, Footer, Navbar, SiteShellPage, SkipLink, sitePageHref } from "@vamos-ui/react/blocks";
import { ArchivePage } from "./archive-page";
import { ArticlePage } from "./article-page";
import { ThemeToggle } from "./blog-frame";
import { ARCHIVE_HREF, BRAND, copyFor, EMAIL, featured, posts, type SiteLocale } from "./content";
import { HomePage } from "./home-page";

const home = (anchor?: string) => sitePageHref("home", anchor);

/** The wordmark: lower-case, mono, with a blinking-cursor underscore in the accent. */
function Wordmark() {
  return (
    <span className="font-mono text-[1.05rem] font-semibold tracking-[-0.02em]">
      cold<span className="text-accent-ink">_</span>path
    </span>
  );
}

/**
 * One language version of the blog: navbar, a status line (branch-style breadcrumb, theme
 * switch, feeds), then home, the article and the archive; minimal footer.
 */
export function BlogSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };

  return (
    <>
      <SkipLink {...common} />
      <Navbar
        {...common}
        variant="bar"
        skipLink={false}
        wordmark={<Wordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Posts", tr: "Yazılar" }), href: home("posts") },
          { label: t({ en: "Archive", tr: "Arşiv" }), href: ARCHIVE_HREF },
          { label: t({ en: "Authors", tr: "Yazarlar" }), href: home("authors") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("subscribe"), label: t({ en: "Subscribe", tr: "Abone ol" }) }, style: "primary" }]}
      />

      <div className="@container border-y border-line bg-surface-2 font-mono text-eyebrow text-fg-muted">
        <Container className="flex h-9 items-center gap-4">
          <p className="flex min-w-0 items-center gap-2 truncate">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-accent" />
            <span className="text-fg">~/{BRAND.replace(" ", "-")}</span>
            <span className="hidden @md:inline">
              {t({ en: "on", tr: "dal" })} <span className="text-accent-ink">main</span>
            </span>
            <span className="hidden text-fg-subtle @3xl:inline">
              · {posts.length} {t({ en: "posts", tr: "yazı" })} · {t({ en: "last commit", tr: "son commit" })} {featured.date}
            </span>
          </p>
          <div className="ms-auto flex items-center gap-1">
            <a href="https://example.com/rss.xml" className="hidden h-7 items-center rounded-ui-sm px-2 hover:bg-hover hover:text-fg focus-ring @md:inline-flex">
              rss
            </a>
            <ThemeToggle
              label={t({ en: "Light mode", tr: "Açık mod" })}
              lightLabel={t({ en: "light", tr: "açık" })}
              darkLabel={t({ en: "dark", tr: "koyu" })}
            />
          </div>
        </Container>
      </div>

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "cold path — notes on systems engineering", tr: "cold path — sistem mühendisliği notları" })}>
          <HomePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="post" title={`${t(featured.title)} — cold path`}>
          <ArticlePage locale={locale} />
        </SiteShellPage>
        <SiteShellPage id="archive" title={t({ en: "Archive — cold path", tr: "Arşiv — cold path" })}>
          <ArchivePage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: BRAND, href: home() }}
        about={t({
          en: "An independent engineering blog. Opinions are the authors’; the incidents were real enough.",
          tr: "Bağımsız bir mühendislik blogu. Görüşler yazarlarındır; olaylar yeterince gerçekti.",
        })}
        contact={{ email: EMAIL }}
        legalLinks={[
          { href: "https://example.com/rss.xml", label: "RSS" },
          { href: "https://example.com/feed.json", label: "JSON Feed" },
          { href: "https://git.example.com/cold-path", label: t({ en: "Code samples repository", tr: "Kod örnekleri deposu" }) },
          { href: "https://example.com/license", label: t({ en: "Text CC BY 4.0 · code MIT", tr: "Metin CC BY 4.0 · kod MIT" }) },
        ]}
        social={[{ network: "x", href: "https://x.com/example" }]}
        year={2026}
      />
    </>
  );
}

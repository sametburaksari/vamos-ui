import { BlockHeading, BlockImage, Container, Faq, Footer, Navbar, PageIntro, Section, SiteShellPage, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { ArchiveSearch } from "./archive-search";
import { copyFor, EMAIL, faq, issues, photos, quotes, type SiteLocale } from "./content";
import { LatestLetter, RecentLetters, TopicIndex } from "./home-parts";
import { IssuePage } from "./issue-page";
import { ReaderCount, SubscribeForm } from "./subscribe-form";

const home = (anchor?: string) => sitePageHref("home", anchor);
const archive = sitePageHref("archive");

/**
 * One language version of The Slow Desk: home (newspaper nameplate with the subscribe form and
 * the latest letter, recent letters with a topic index, about the writer, readers, FAQ), the
 * searchable archive and one issue. Server component; subscribe, archive and issue are islands
 * sharing the provider in page.tsx.
 */
export function NewsletterSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, usd, intl, labels } = c;
  const common = { locale: intl, labels };
  const latest = issues[0]!;

  return (
    <>
      <Navbar
        {...common}
        variant="minimal"
        sticky
        wordmark={
          <span className="font-display text-[1.3rem] leading-none tracking-[-0.01em] italic">
            The Slow Desk<span className="text-accent-ink not-italic">.</span>
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "Latest", tr: "Son sayı" }), href: home("latest") },
          { label: t({ en: "Archive", tr: "Arşiv" }), href: archive },
          { label: t({ en: "About", tr: "Hakkında" }), href: home("about") },
          { label: "FAQ", href: home("faq") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("subscribe"), label: t({ en: "Subscribe", tr: "Abone ol" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "The Slow Desk — a letter every second Sunday", tr: "The Slow Desk — iki pazarda bir mektup" })}>
          {/* Nameplate */}
          <Section anchor="top" headingId="sd-sub-title" theme={{ rhythm: "tight" }} className="pt-10! sm:pt-14!">
            <Container>
              <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 border-y-2 border-fg py-2 font-mono text-[10px] tracking-[0.14em] text-fg uppercase sm:text-[11px]">
                <span>{t({ en: "Vol. V", tr: "Cilt V" })} · Nº {latest.n}</span>
                <span className="hidden sm:inline">{t({ en: "Every second Sunday · Istanbul", tr: "İki pazarda bir · İstanbul" })}</span>
                <span>{f.date(latest.date, { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <BlockHeading level={1} size="display-2xl" className="mt-6 text-center [--display-scale:1.08] sm:mt-8">
                The Slow <em>Desk</em>
              </BlockHeading>
              <p className="mx-auto mt-5 max-w-[34ch] text-center font-display text-[1.35rem] leading-snug text-fg-muted italic sm:text-[1.6rem]">
                {t({ en: "A letter every second Sunday about doing careful work in a hurried world.", tr: "Aceleci bir dünyada özenli iş yapmak üzerine, iki pazarda bir gelen bir mektup." })}
              </p>
              <div className="mt-8 border-t border-fg" />
              <div className="mt-px border-t border-fg" />
              <div id="subscribe" className="mt-14 grid scroll-mt-24 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-20">
                <div className="flex flex-col gap-6">
                  <h2 id="sd-sub-title" className="font-display text-[2.1rem] leading-[1.05] text-fg">
                    {t({ en: "Seven minutes, twice a month.", tr: "Ayda iki kez, yedi dakika." })}
                  </h2>
                  <p className="text-body leading-[1.7] text-fg-muted">
                    {t({
                      en: "I’m Nil Arden. I write about attention, tools and the craft of doing one thing properly — from a door-turned-desk in Kuzguncuk. No advice threads, no growth hacks, no tracking. Just a letter, in English and Turkish.",
                      tr: "Ben Nil Arden. Dikkat, araçlar ve tek bir işi doğru yapmanın zanaati üzerine yazıyorum — Kuzguncuk’ta kapıdan bozma bir masadan. Tavsiye zincirleri, büyüme taktikleri ya da izleme yok. Sadece bir mektup, İngilizce ve Türkçe.",
                    })}
                  </p>
                  <SubscribeForm locale={locale} idPrefix={`sd-home-${locale}`} />
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-fg-muted">
                    <ReaderCount locale={locale} className="text-fg" />
                    <span aria-hidden>·</span>
                    <span>{t({ en: "about 900 replies a year", tr: "yılda yaklaşık 900 yanıt" })}</span>
                    <span aria-hidden>·</span>
                    <span>{t({ en: "since 2022", tr: "2022’den beri" })}</span>
                  </p>
                </div>
                <div id="latest" className="pt-6 lg:pt-2">
                  <LatestLetter locale={locale} />
                </div>
              </div>
            </Container>
          </Section>

          <Section anchor="recent" headingId="sd-recent-title">
            <Container>
              <div className="grid gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,3fr)] lg:gap-16">
                <div>
                  <div className="flex items-baseline justify-between gap-4">
                    <BlockHeading id="sd-recent-title" size="display-m" text={t({ en: "Recent *letters*", tr: "Son *mektuplar*" })} />
                    <a href={archive} className="rounded-[2px] font-mono text-xs text-fg underline decoration-accent decoration-2 underline-offset-4 focus-ring">
                      {t({ en: "Search the archive", tr: "Arşivde ara" })}
                    </a>
                  </div>
                  <div className="mt-8">
                    <RecentLetters locale={locale} />
                  </div>
                </div>
                <aside aria-labelledby="sd-topics-title">
                  <h2 id="sd-topics-title" className="font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">
                    {t({ en: "By topic", tr: "Konuya göre" })}
                  </h2>
                  <div className="mt-4 border-t-2 border-fg">
                    <TopicIndex locale={locale} />
                  </div>
                </aside>
              </div>
            </Container>
          </Section>

          <Section anchor="about" headingId="sd-about-title" theme={{ surface: "surface-2" }}>
            <Container>
              <div className="grid items-center gap-12 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:gap-16">
                <BlockImage {...photos.desk} alt={t(photos.desk.alt)} aspect="4:5" className="rounded-[3px]" sizes="(min-width: 768px) 35vw, 100vw" />
                <div className="max-w-[36rem]">
                  <p className="font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">{t({ en: "About the writer", tr: "Yazar hakkında" })}</p>
                  <BlockHeading id="sd-about-title" size="display-m" className="mt-4" text={t({ en: "Written *by hand* first", tr: "Önce *elle* yazılır" })} />
                  <div className="mt-6 flex flex-col gap-4 text-body leading-[1.7] text-fg-muted">
                    <p>{t({ en: "Nil Arden spent twelve years as a product designer before deciding that the most useful thing she could design was her own week. She now writes, edits and teaches a small evening class on technical writing.", tr: "Nil Arden on iki yıl ürün tasarımcısı olarak çalıştıktan sonra tasarlayabileceği en faydalı şeyin kendi haftası olduğuna karar verdi. Şimdi yazıyor, editörlük yapıyor ve teknik yazım üzerine küçük bir akşam dersi veriyor." })}</p>
                    <p>{t({ en: "Every letter starts in a notebook on Thursday, gets typed on Friday and sits untouched until Saturday night. If it still makes sense then, it goes out on Sunday.", tr: "Her mektup perşembe bir defterde başlar, cuma daktilo edilir ve cumartesi akşamına kadar dokunulmadan bekler. Hâlâ anlamlıysa pazar günü gönderilir." })}</p>
                  </div>
                  <p className="mt-6 text-small text-fg">
                    {t({ en: `Reader-supported: ${usd(5)} a month or ${usd(50)} a year, optional.`, tr: `Okur destekli: ayda ${usd(5)} ya da yılda ${usd(50)}, isteğe bağlı.` })}{" "}
                    <a href={`mailto:${EMAIL}`} className="rounded-[2px] text-accent-ink underline underline-offset-4 focus-ring">
                      {EMAIL}
                    </a>
                  </p>
                </div>
              </div>
            </Container>
          </Section>

          <Testimonials {...common} variant="carousel" title={t({ en: "What readers *reply*", tr: "Okurlar ne *yanıtlıyor*" })} items={quotes.map((q) => ({ quote: t(q.quote), author: q.author, role: t(q.role) }))} />

          <Faq {...common} anchor="faq" variant="stacked" theme={{ surface: "surface-2" }} title={t({ en: "Small print, *large* type", tr: "İnce ayrıntı, *büyük* puntoyla" })} items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))} deepLink={false} />
        </SiteShellPage>

        <SiteShellPage id="archive" title={t({ en: "Archive — The Slow Desk", tr: "Arşiv — The Slow Desk" })}>
          <PageIntro
            {...common}
            variant="ruled"
            breadcrumb={[{ label: "The Slow Desk", href: home() }, { label: t({ en: "Archive", tr: "Arşiv" }) }]}
            title={t({ en: "Every *letter*", tr: "Bütün *mektuplar*" })}
            lead={t({ en: "112 letters since February 2022. The most recent twelve are below; search reads the full text in both languages.", tr: "Şubat 2022’den beri 112 mektup. En son on ikisi aşağıda; arama her iki dilde tam metni okur." })}
            meta={[
              { label: t({ en: "Letters", tr: "Mektup" }), value: "112" },
              { label: t({ en: "Next one", tr: "Sıradaki" }), value: f.date("2026-11-22", { weekday: "short", day: "numeric", month: "short" }) },
            ]}
          />
          <Section theme={{ rhythm: "tight" }} className="pt-0!">
            <Container>
              <div className="grid gap-12 lg:grid-cols-[minmax(0,8fr)_minmax(0,3fr)] lg:gap-16">
                <ArchiveSearch locale={locale} />
                <aside aria-labelledby="sd-archive-sub" className="lg:sticky lg:top-24 lg:self-start">
                  <h2 id="sd-archive-sub" className="font-display text-[1.5rem] leading-tight text-fg">
                    {t({ en: "Read them as they come", tr: "Geldikçe okuyun" })}
                  </h2>
                  <p className="mt-2 mb-5 text-small text-fg-muted">{t({ en: "Sunday, 07:00, in your inbox.", tr: "Pazar, 07.00, gelen kutunuzda." })}</p>
                  <SubscribeForm locale={locale} tone="card" idPrefix={`sd-archive-${locale}`} />
                </aside>
              </div>
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="issue" title={t({ en: "Letter — The Slow Desk", tr: "Mektup — The Slow Desk" })}>
          <IssuePage locale={locale} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="minimal"
        brand={{ name: "The Slow Desk", href: home() }}
        about={t({ en: "A fortnightly letter by Nil Arden. Written in Kuzguncuk, Istanbul.", tr: "Nil Arden’den iki haftada bir gelen mektup. Kuzguncuk, İstanbul’da yazılır." })}
        contact={{ email: EMAIL }}
        legalLinks={[{ href: archive, label: t({ en: "Archive", tr: "Arşiv" }) }, { href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/rss.xml", label: "RSS" }]}
        year={2026}
      />
    </>
  );
}

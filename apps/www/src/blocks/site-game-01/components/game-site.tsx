import { Button } from "@vamos-ui/react";
import { BlogList, Container, Cta, Footer, GallerySection, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { AtlasArt } from "./atlas";
import { awards, copyFor, diary, facts, GAME, HELLO_EMAIL, PHONE, pillars, quotes, RELEASE, shots, STUDIO, TRAILER_SRC, trailers, type ShotId, type SiteLocale } from "./content";
import { MediaPage } from "./media-page";
import { PressPage } from "./press-page";
import { EmberStill, TrailerFacade } from "./trailer";

const home = (anchor?: string) => sitePageHref("home", anchor);
const media = sitePageHref("media");
const press = sitePageHref("press");

/** The game's mark for the navbar: an ember inside two contour arcs. */
function Mark() {
  return (
    <svg viewBox="-50 -48 100 76" aria-hidden className="h-6 w-auto">
      <path d="M-46 0a46 40 0 1 1 92 0" fill="none" stroke="var(--fg)" strokeWidth="7" strokeLinecap="round" />
      <path d="M-28 6a28 25 0 1 1 56 0" fill="none" stroke="var(--fg)" strokeWidth="7" strokeLinecap="round" opacity=".5" />
      <circle cx="0" cy="12" r="12" fill="var(--accent)" />
    </svg>
  );
}

/**
 * One language version of the Ember Atlas site: navbar and footer around three pages (home,
 * media, press kit). Server component; the SiteShell in page.tsx picks page and language.
 */
export function GameSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, eur } = c;
  const common = { locale: c.intl, labels: c.labels };
  const reveal = trailers[0]!;
  const shot = (id: ShotId) => ({ src: shots[id].src, width: shots[id].width, height: shots[id].height, alt: t(shots[id].alt) });
  const play = t({ en: "Play trailer", tr: "Fragmanı oynat" });

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={
          <span className="inline-flex items-center gap-2.5 font-display text-[17px] leading-none tracking-[-0.02em]">
            <Mark />
            {GAME}
          </span>
        }
        homeHref={home()}
        items={[
          { label: t({ en: "The game", tr: "Oyun" }), href: home("game") },
          { label: t({ en: "Media", tr: "Medya" }), href: media },
          { label: t({ en: "Dev diary", tr: "Günlük" }), href: home("diary") },
          { label: t({ en: "Press kit", tr: "Basın kiti" }), href: press },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("wishlist"), label: t({ en: "Wishlist", tr: "İstek listesi" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Ember Atlas — carry the last fire", tr: "Ember Atlas — son ateşi taşı" })}>
          {/* Hero: the atlas behind, title and trailer in front. */}
          <Section anchor="top" headingId="ea-title" className="relative isolate overflow-hidden" theme={{ rhythm: "tight" }}>
            <AtlasArt className="absolute inset-0 -z-10 size-full opacity-90" />
            <div aria-hidden className="absolute inset-0 -z-10 [background:linear-gradient(180deg,transparent_55%,var(--scene))]" />
            <Container>
              <div className="grid items-end gap-10 pt-6 pb-4 lg:grid-cols-12 lg:gap-12 lg:pt-16">
                <div className="lg:col-span-6">
                  <p className="m-0 font-mono text-xs text-fg-muted">
                    {STUDIO} · {f.date(RELEASE, { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <h1 id="ea-title" className="m-0 mt-4 font-display text-[clamp(3.25rem,8.2cqi,7rem)] leading-[0.9] text-fg">
                    Ember
                    <br />
                    <span className="text-accent">Atlas</span>
                  </h1>
                  <p className="m-0 mt-6 max-w-[38ch] text-lead text-fg-muted">
                    {t({ en: "Carry the last fire across a drowned world. The map only exists where you have stood with the flame.", tr: "Son ateşi batık bir dünyada taşıyın. Harita yalnızca alevle durduğunuz yerde var." })}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild variant="primary" size="xl">
                      <a href={home("wishlist")}>{t({ en: "Wishlist now", tr: "İstek listene ekle" })}</a>
                    </Button>
                    <Button asChild variant="ghost" size="xl">
                      <a href={press}>
                        {t({ en: "Press kit", tr: "Basın kiti" })}
                        <ArrowRight aria-hidden />
                      </a>
                    </Button>
                  </div>
                  <p className="m-0 mt-6 font-mono text-[11px] text-fg-muted">
                    {t({ en: `PC & consoles · 1 player · ${eur(24.99)} at launch`, tr: `PC ve konsollar · tek oyunculu · çıkışta ${eur(24.99)}` })}
                  </p>
                </div>
                <div className="lg:col-span-6" id="trailer">
                  <TrailerFacade
                    src={TRAILER_SRC}
                    title={t(reveal.title)}
                    playLabel={play}
                    duration={reveal.duration}
                    meta={t(reveal.note)}
                    poster={shot(reveal.poster)}
                    className="shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--accent)_45%,transparent)]"
                  />
                </div>
              </div>

              {/* Press quotes + laurels */}
              <ul className="m-0 mt-12 grid list-none gap-6 border-t border-line p-0 pt-6 md:grid-cols-2 xl:grid-cols-4">
                {quotes.map((q) => (
                  <li key={q.source} className="xl:col-span-1">
                    <blockquote className="m-0 text-lg leading-snug font-medium text-fg">“{t(q.quote)}”</blockquote>
                    <p className="m-0 mt-2 font-mono text-[11px] text-fg-muted">— {q.source}</p>
                  </li>
                ))}
                {awards.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-small text-fg-muted">
                    <span aria-hidden className="mt-1.5 size-2 shrink-0 rotate-45 bg-accent" />
                    {t(a)}
                  </li>
                ))}
              </ul>
            </Container>
          </Section>

          {/* Pillars: numbered rows with a still, alternating sides. */}
          <Section anchor="game" headingId="ea-game-title">
            <Container>
              <SectionHeader
                headingId="ea-game-title"
                align="split"
                eyebrow={t({ en: "The game", tr: "Oyun" })}
                title={t({ en: "One flame. *No* waypoints.", tr: "Tek alev. Yol işareti *yok*." })}
                lead={t({ en: "A quiet exploration game for one player, about light, distance and what you choose to leave behind.", tr: "Işık, mesafe ve geride bırakmayı seçtikleriniz üzerine, tek oyunculu sakin bir keşif oyunu." })}
              />
              <ol className="m-0 mt-14 grid list-none gap-14 p-0 lg:gap-20">
                {pillars.map((p, i) => {
                  const id: ShotId = (["cloudsea", "tide", "lights"] as const)[i]!;
                  return (
                    <li key={i} className="grid items-center gap-6 md:grid-cols-12 md:gap-10">
                      <div className={i % 2 ? "md:order-2 md:col-span-5 md:col-start-8" : "md:col-span-5"}>
                        <span aria-hidden className="block font-display text-[clamp(4rem,9cqi,7rem)] leading-none text-transparent [-webkit-text-stroke:1.5px_var(--accent)]">
                          0{i + 1}
                        </span>
                        <h3 className="m-0 mt-2 font-display text-display-m text-fg">{t(p.title)}</h3>
                        <p className="m-0 mt-4 max-w-[46ch] text-body text-fg-muted">{t(p.text)}</p>
                      </div>
                      <figure className={i % 2 ? "m-0 md:order-1 md:col-span-7" : "m-0 md:col-span-7"}>
                        <EmberStill {...shot(id)} className="aspect-[16/9] rounded-ui border border-line" />
                        <figcaption className="mt-2 font-mono text-[11px] text-fg-muted">
                          {t(shots[id].region)} — {t(shots[id].caption)}
                        </figcaption>
                      </figure>
                    </li>
                  );
                })}
              </ol>
            </Container>
          </Section>

          {/* Facts ledger */}
          <Section anchor="facts" headingId="ea-facts-title" theme={{ surface: "surface-2", rhythm: "tight" }}>
            <Container>
              <h2 id="ea-facts-title" className="sr-only">
                {t({ en: "At a glance", tr: "Kısaca" })}
              </h2>
              <dl className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-ui border border-line bg-line lg:grid-cols-4">
                {facts.map((x, i) => (
                  <div key={i} className="flex flex-col-reverse gap-2 bg-surface-2 p-5 sm:p-7">
                    <dt className="text-small text-fg-muted">{t(x.label)}</dt>
                    <dd className="m-0 font-display text-display-m leading-none whitespace-nowrap text-fg tabular">{t(x.value)}</dd>
                  </div>
                ))}
              </dl>
            </Container>
          </Section>

          <GallerySection
            {...common}
            anchor="screens"
            variant="filmstrip"
            eyebrow={t({ en: "Pre-alpha mood frames", tr: "Pre-alfa atmosfer kareleri" })}
            title={t({ en: "Nine regions, all *drowning*", tr: "Dokuz bölge, hepsi *batıyor*" })}
            lead={
              <>
                {t({ en: "Six of them so far, straight from the pre-alpha. ", tr: "Şimdilik altısı, doğrudan pre-alfadan. " })}
                <a href={media} className="text-accent-ink underline underline-offset-4 focus-ring">
                  {t({ en: "All trailers and screenshots", tr: "Tüm fragmanlar ve görseller" })}
                </a>
              </>
            }
            images={(["summit", "tide", "cloudsea", "deep", "lights", "ridges"] as ShotId[]).map((id) => ({ image: shot(id), caption: t(shots[id].region) }))}
          />


          <BlogList
            {...common}
            anchor="diary"
            variant="list"
            eyebrow={t({ en: "Dev diary", tr: "Geliştirici günlüğü" })}
            title={t({ en: "Notes from *two rooms*", tr: "*İki odadan* notlar" })}
            allLink={{ href: "/diary", label: t({ en: "All entries", tr: "Tüm yazılar" }) }}
            posts={diary.map((d, i) => ({ href: `/diary/${i + 1}`, title: t(d.title), excerpt: t(d.excerpt), publishedAt: d.date, readingMinutes: d.minutes, author: { name: d.author } }))}
          />

          <Cta
            {...common}
            anchor="wishlist"
            variant="newsletter"
            eyebrow={t({ en: "Wishlist", tr: "İstek listesi" })}
            title={t({ en: "One email, on *12 March*", tr: "*12 Mart*’ta tek bir e-posta" })}
            lead={t({
              en: `We’ll write once when Ember Atlas is out — ${eur(24.99)}, 15% off in launch week. Store pages go live in December.`,
              tr: `Ember Atlas çıktığında bir kez yazacağız: ${eur(24.99)}, çıkış haftasında %15 indirimli. Mağaza sayfaları Aralık’ta açılıyor.`,
            })}
            newsletter={{
              action: "/newsletter",
              placeholder: t({ en: "you@example.com", tr: "siz@example.com" }),
              buttonLabel: t({ en: "Tell me", tr: "Haber ver" }),
              consent: t({ en: "Only the launch email. No newsletter unless you ask for it.", tr: "Yalnızca çıkış e-postası. İstemediğiniz sürece bülten yok." }),
            }}
          />
        </SiteShellPage>

        <SiteShellPage id="media" title={t({ en: "Media — Ember Atlas", tr: "Medya — Ember Atlas" })}>
          <MediaPage c={c} />
        </SiteShellPage>

        <SiteShellPage id="press" title={t({ en: "Press kit — Ember Atlas", tr: "Basın kiti — Ember Atlas" })}>
          <PressPage c={c} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: GAME, href: home(), logo: <span className="inline-flex items-center gap-2.5 font-display text-lg leading-none text-fg"><Mark />{GAME}</span> }}
        about={t({ en: `${GAME} is made by ${STUDIO}, six people in two rooms above a ferry ticket office.`, tr: `${GAME}, bir vapur gişesinin üstündeki iki odada çalışan altı kişilik ${STUDIO} tarafından yapılıyor.` })}
        columns={[
          { title: t({ en: "Game", tr: "Oyun" }), links: [{ href: home("game"), label: t({ en: "About", tr: "Hakkında" }) }, { href: media, label: t({ en: "Media", tr: "Medya" }) }, { href: home("diary"), label: t({ en: "Dev diary", tr: "Günlük" }) }] },
          { title: t({ en: "Press", tr: "Basın" }), links: [{ href: press, label: t({ en: "Press kit", tr: "Basın kiti" }) }, { href: sitePageHref("press", "keys"), label: t({ en: "Review keys", tr: "İnceleme anahtarı" }) }] },
        ]}
        contact={{ email: HELLO_EMAIL, phone: PHONE }}
        social={[
          { network: "youtube", href: "https://youtube.com/@lowtide.example" },
          { network: "instagram", href: "https://instagram.com/lowtide.example" },
        ]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }]}
        year={2026}
      />
    </>
  );
}

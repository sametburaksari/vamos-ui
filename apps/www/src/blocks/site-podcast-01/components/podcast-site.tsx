import { Badge } from "@vamos-ui/react";
import { BlockHeading, Container, Footer, MediaText, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref, Team } from "@vamos-ui/react/blocks";
import { copyFor, EMAIL, episodes, hosts, photos, type Copy, type SiteLocale } from "./content";
import { EpisodeList } from "./episode-list";
import { EpisodePage } from "./episode-page";
import { GuestForm } from "./guest-form";
import { ListenLinks } from "./listen-links";
import { EpisodePlayer } from "./player";

const home = (anchor?: string) => sitePageHref("home", anchor);
const episode = sitePageHref("episode");

/** Wordmark: the table seen from above — a long bar with chairs. */
function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden className="relative block h-4 w-9">
        <span className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-accent" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="absolute top-0 size-1 rounded-full bg-fg" style={{ insetInlineStart: `${18 + i * 30}%` }} />
        ))}
        {[0, 1, 2].map((i) => (
          <span key={`b${i}`} className="absolute bottom-0 size-1 rounded-full bg-fg" style={{ insetInlineStart: `${18 + i * 30}%` }} />
        ))}
      </span>
      <span className="font-display text-lg leading-none font-bold tracking-[-0.03em]">Long Table</span>
    </span>
  );
}

/**
 * One language version of the Long Table site: navbar and footer around two pages (home and
 * the latest episode). Server component; the SiteShell in page.tsx picks page and language.
 */
export function PodcastSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };

  return (
    <>
      <Navbar
        {...common}
        variant="rail"
        sticky
        wordmark={<Wordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Latest", tr: "Son bölüm" }), href: episode },
          { label: t({ en: "Episodes", tr: "Bölümler" }), href: home("episodes") },
          { label: t({ en: "Hosts", tr: "Sunucular" }), href: home("hosts") },
          { label: t({ en: "Suggest a guest", tr: "Konuk öner" }), href: home("suggest") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: home("listen"), label: t({ en: "Follow the show", tr: "Programı takip et" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Long Table — a podcast about food culture", tr: "Long Table — yemek kültürü üzerine bir podcast" })}>
          <HomeHero c={c} />

          <Section anchor="episodes" headingId="lt-eps-title">
            <Container>
              <SectionHeader
                headingId="lt-eps-title"
                align="split"
                eyebrow={t({ en: "Archive", tr: "Arşiv" })}
                title={t({ en: "Every *episode*", tr: "Bütün *bölümler*" })}
                lead={t({ en: "New conversations every other Thursday at 07:00. Search by guest, dish or idea.", tr: "İki haftada bir perşembe 07:00’de yeni sohbet. Konuğa, yemeğe ya da fikre göre arayın." })}
              />
              <div className="mt-10">
                <EpisodeList locale={c.locale} />
              </div>
            </Container>
          </Section>

          <Team
            {...common}
            anchor="hosts"
            variant="portrait"
            eyebrow={t({ en: "At the table", tr: "Sofradakiler" })}
            title={t({ en: "Your *hosts*", tr: "Sunucularınız" })}
            lead={t({ en: "A cook and a historian who disagree about almost everything except the bread.", tr: "Ekmek dışında neredeyse her konuda anlaşamayan bir aşçı ve bir tarihçi." })}
            members={hosts.map((h) => ({ name: h.name, role: t(h.role), bio: t(h.bio), photo: { src: h.photo.src, width: h.photo.width, height: h.photo.height, alt: t(h.photo.alt) } }))}
          />

          <MediaText
            {...common}
            variant="side"
            mediaSide="end"
            aspect="3:2"
            eyebrow={t({ en: "How we record", tr: "Nasıl kaydediyoruz" })}
            title={t({ en: "Recorded at a *real* kitchen table", tr: "*Gerçek* bir mutfak masasında kaydedildi" })}
            body={t({
              en: "No studio. Two microphones, a pot on the stove and whatever the guest brought. If you hear a kettle in the background, that is the episode’s third host.",
              tr: "Stüdyo yok. İki mikrofon, ocakta bir tencere ve konuğun getirdiği ne varsa. Arkada bir çaydanlık duyarsanız, o bölümün üçüncü sunucusu.",
            })}
            bullets={[t({ en: "48 episodes since March 2025", tr: "Mart 2025’ten beri 48 bölüm" }), t({ en: "Full transcripts for every new episode", tr: "Her yeni bölüm için tam döküm" }), t({ en: "No ads; supported by 640 listeners", tr: "Reklam yok; 640 dinleyici destekliyor" })]}
            media={{ src: photos.kitchen.src, width: photos.kitchen.width, height: photos.kitchen.height, alt: t(photos.kitchen.alt) }}
          />

          <Section anchor="listen" headingId="lt-listen-title" theme={{ surface: "surface-2", rhythm: "tight" }}>
            <Container>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
                <SectionHeader headingId="lt-listen-title" eyebrow={t({ en: "Follow", tr: "Takip" })} title={t({ en: "Pull up *a chair*", tr: "Bir *sandalye* çekin" })} />
                <ListenLinks locale={c.locale} />
              </div>
            </Container>
          </Section>

          <Section anchor="suggest" headingId="lt-suggest-title">
            <Container>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
                <div>
                  <SectionHeader
                    headingId="lt-suggest-title"
                    eyebrow={t({ en: "Suggest a guest", tr: "Konuk öner" })}
                    title={t({ en: "Who should sit *at the table*?", tr: "Sofraya *kim* oturmalı?" })}
                    lead={t({ en: "Half of our guests came from listeners: a market trader in Bakırköy, a baker on the night shift, a school cook in Van.", tr: "Konuklarımızın yarısı dinleyicilerden geldi: Bakırköy’de bir pazarcı, gece vardiyasında bir fırıncı, Van’da bir okul aşçısı." })}
                  />
                  <ul className="m-0 mt-8 flex list-none flex-wrap gap-2 p-0">
                    {episodes.slice(1, 5).map((e) => (
                      <li key={e.no}>
                        <Badge tone="outline" size="md">
                          #{e.no} · {e.guest}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
                <GuestForm locale={c.locale} />
              </div>
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="episode" title={t({ en: `Episode ${episodes[0]!.no}: ${t(episodes[0]!.title)} — Long Table`, tr: `${episodes[0]!.no}. bölüm: ${t(episodes[0]!.title)} — Long Table` })}>
          <EpisodePage c={c} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="wordmark"
        brand={{ name: "Long Table", href: home() }}
        about={t({ en: "An independent podcast about food culture, recorded in Moda, Kadıköy. Every other Thursday.", tr: "Moda, Kadıköy’de kaydedilen bağımsız bir yemek kültürü podcast’i. İki haftada bir perşembe." })}
        columns={[
          { title: t({ en: "Listen", tr: "Dinle" }), links: [{ href: episode, label: t({ en: "Latest episode", tr: "Son bölüm" }) }, { href: home("episodes"), label: t({ en: "All episodes", tr: "Tüm bölümler" }) }, { href: home("listen"), label: "RSS" }] },
          { title: t({ en: "Join in", tr: "Katıl" }), links: [{ href: home("suggest"), label: t({ en: "Suggest a guest", tr: "Konuk öner" }) }, { href: "mailto:kitchen@longtable.example.com", label: t({ en: "Ask a question", tr: "Soru sor" }) }, { href: "mailto:support@longtable.example.com", label: t({ en: "Support the show", tr: "Programı destekle" }) }] },
        ]}
        contact={{ email: EMAIL }}
        social={[{ network: "instagram", href: "https://instagram.com/longtable.example" }, { network: "youtube", href: "https://youtube.com/@longtable.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }]}
        year={2026}
      />
    </>
  );
}

function HomeHero({ c }: { c: Copy }) {
  const { t, f } = c;
  const latest = episodes[0]!;
  return (
    <Section anchor="top" theme={{ rhythm: "tight" }} className="relative overflow-hidden">
      {/* A plate seen from above, behind the glass player. */}
      <div aria-hidden className="pointer-events-none absolute -end-[22rem] top-[-6rem] hidden size-[54rem] rounded-full border border-line lg:block">
        <div className="absolute inset-[9%] rounded-full border border-line" />
        <div className="absolute inset-[24%] rounded-full bg-accent-soft" />
        <div className="absolute inset-[38%] rounded-full bg-accent opacity-70" />
      </div>
      <Container className="relative">
        <div className="grid gap-10 pt-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:items-center lg:gap-14 lg:pt-10">
          <div>
            <p className="m-0 font-mono text-xs tracking-[0.14em] text-fg-muted uppercase">
              {t({ en: "A podcast about food culture", tr: "Yemek kültürü üzerine bir podcast" })}
            </p>
            <BlockHeading level={1} size="display-2xl" className="mt-4" text={t({ en: "Long *Table*", tr: "Long *Table*" })} />
            <p className="mt-6 max-w-[38ch] text-lead text-fg-muted">
              {t({
                en: "Conversations about who cooks, who eats, who clears up — and what that says about everyone at the table.",
                tr: "Kimin pişirdiği, kimin yediği, kimin topladığı — ve bunun sofradaki herkes hakkında ne söylediği üzerine sohbetler.",
              })}
            </p>
            <dl className="m-0 mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-5">
              {[
                { k: t({ en: "Episodes", tr: "Bölüm" }), v: f.number(latest.no) },
                { k: t({ en: "Every", tr: "Her" }), v: t({ en: "2nd Thu", tr: "2. Perş." }) },
                { k: t({ en: "Average", tr: "Ortalama" }), v: t({ en: "45 min", tr: "45 dk" }) },
              ].map((x) => (
                <div key={x.k}>
                  <dt className="font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">{x.k}</dt>
                  <dd className="m-0 mt-1 font-display text-2xl font-bold tabular-nums">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="m-0 mb-3 flex items-center gap-2 font-mono text-xs text-fg-muted">
              <span className="size-2 rounded-full bg-accent" aria-hidden />
              {t({ en: "New this week", tr: "Bu hafta yeni" })} ·{" "}
              <a href={episode} className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
                {t({ en: "Episode page and full transcript", tr: "Bölüm sayfası ve tam döküm" })}
              </a>
            </p>
            <EpisodePlayer locale={c.locale} mode="hero" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

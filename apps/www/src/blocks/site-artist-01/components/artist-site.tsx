import { Badge, Button } from "@vamos-ui/react";
import { BlockHeading, BlockImage, Container, Faq, Footer, Navbar, PageIntro, Section, SectionHeader, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { band, copyFor, EMAIL, merch, photos, releases, shows, type Copy, type SiteLocale } from "./content";
import { CoverArt } from "./cover-art";
import { MailingList } from "./mailing-list";
import { ReleaseBrowser } from "./release-browser";
import { TourList } from "./tour-list";
import { VideoSwitcher } from "./video-switcher";

const home = (anchor?: string) => sitePageHref("home", anchor);
const tour = sitePageHref("tour");
const music = sitePageHref("releases");

/**
 * One language version of the Mira Sol site: navbar and footer around three pages (home, tour,
 * releases). Server component; the SiteShell in page.tsx picks page and language.
 */
export function ArtistSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<span className="font-display text-2xl leading-none lowercase">mira sol</span>}
        homeHref={home()}
        items={[
          { label: t({ en: "Tour", tr: "Turne" }), href: tour },
          { label: t({ en: "Music", tr: "Müzik" }), href: music },
          { label: t({ en: "Videos", tr: "Videolar" }), href: home("videos") },
          { label: t({ en: "Merch", tr: "Ürünler" }), href: home("merch") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: tour, label: t({ en: "Tickets", tr: "Biletler" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Mira Sol — Salt Hour, out 5 February. On tour 2027.", tr: "Mira Sol — Salt Hour 5 Şubat’ta çıkıyor. 2027 turnesi." })}>
          <Hero c={c} />
          <NewRelease c={c} />

          <Section anchor="tour" headingId="ms-tour-title">
            <Container>
              <SectionHeader
                headingId="ms-tour-title"
                align="split"
                eyebrow={t({ en: "Salt Hour tour", tr: "Salt Hour turnesi" })}
                title={t({ en: "On the *road*", tr: "Yollarda" })}
                lead={t({ en: `${shows.length} dates, 5 countries, January to March. Istanbul is gone — Izmir night two isn’t yet.`, tr: `${shows.length} tarih, 5 ülke, ocaktan marta. İstanbul tükendi — İzmir ikinci gece henüz değil.` })}
              />
              <div className="mt-10">
                <TourList locale={c.locale} variant="preview" limit={6} />
              </div>
            </Container>
          </Section>

          <Section anchor="videos" headingId="ms-videos-title" theme={{ surface: "surface-2" }}>
            <Container>
              <SectionHeader headingId="ms-videos-title" eyebrow={t({ en: "Watch", tr: "İzle" })} title={t({ en: "Videos", tr: "Videolar" })} />
            </Container>
            <VideoSwitcher locale={c.locale} labels={labels as Record<string, string> | undefined} />
          </Section>

          <Merch c={c} />

          <Section anchor="list" headingId="ms-list-title" theme={{ rhythm: "tight" }}>
            <Container>
              <div className="grid gap-8 border-t-2 border-fg pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-end">
                <SectionHeader
                  headingId="ms-list-title"
                  eyebrow={t({ en: "Mailing list", tr: "E-posta listesi" })}
                  title={t({ en: "Presale codes, *first*", tr: "Ön satış kodları *önce* size" })}
                  lead={t({ en: "One email a month at most. Presale codes 48 hours before general sale.", tr: "Ayda en fazla bir e-posta. Ön satış kodları genel satıştan 48 saat önce." })}
                />
                <MailingList locale={c.locale} />
              </div>
            </Container>
          </Section>
        </SiteShellPage>

        <SiteShellPage id="tour" title={t({ en: "Tour 2027 — Mira Sol", tr: "2027 turnesi — Mira Sol" })}>
          <PageIntro
            {...common}
            variant="ruled"
            headingLevel={1}
            breadcrumb={[{ label: "mira sol", href: home() }, { label: t({ en: "Tour", tr: "Turne" }) }]}
            eyebrow={t({ en: "Salt Hour tour · 2027", tr: "Salt Hour turnesi · 2027" })}
            title={t({ en: "Tour dates", tr: "Turne tarihleri" })}
            lead={t({ en: "Sold-out show? Join the waitlist — returned tickets go to the list in order, at face value.", tr: "Konser tükendi mi? Bekleme listesine katılın — iade biletler sırayla, nominal fiyattan listeye gider." })}
            meta={[
              { label: t({ en: "Shows", tr: "Konser" }), value: String(shows.length) },
              { label: t({ en: "Support", tr: "Konuklar" }), value: "Kıyı · Ada Kara · Lotte Fern" },
              { label: t({ en: "Ages", tr: "Yaş" }), value: t({ en: "16+ unless stated", tr: "Aksi belirtilmedikçe 16+" }) },
            ]}
          />
          <Section theme={{ rhythm: "tight" }}>
            <Container>
              <TourList locale={c.locale} variant="full" />
            </Container>
          </Section>
          <Faq
            {...common}
            variant="columns"
            eyebrow={t({ en: "Before the show", tr: "Konserden önce" })}
            title={t({ en: "Good to *know*", tr: "Bilmekte *fayda var*" })}
            items={[
              { q: t({ en: "How does the waitlist work?", tr: "Bekleme listesi nasıl işler?" }), a: t({ en: "When someone returns a ticket, the next person on the list gets an email with a 24-hour link at face value. No resale markup, ever.", tr: "Biri biletini iade ettiğinde listedeki sıradaki kişiye nominal fiyatlı, 24 saat geçerli bir bağlantı gider. Asla karaborsa fiyatı yok." }) },
              { q: t({ en: "Is there step-free access?", tr: "Basamaksız erişim var mı?" }), a: t({ en: "Every venue on this tour has step-free access and a viewing platform. Email access@mirasol.example.com and we’ll hold a space and a companion ticket.", tr: "Bu turnedeki her mekânda basamaksız erişim ve izleme platformu var. access@mirasol.example.com adresine yazın; size bir yer ve refakatçi bileti ayıralım." }) },
              { q: t({ en: "What time do you go on?", tr: "Sahneye saat kaçta çıkıyorsunuz?" }), a: t({ en: "Support about 45 minutes after doors, Mira Sol about an hour after that, for 90 minutes.", tr: "Konuk grup kapılardan yaklaşık 45 dakika sonra, Mira Sol bundan bir saat kadar sonra; 90 dakika." }) },
              { q: t({ en: "The Brussels date moved?", tr: "Brüksel tarihi mi değişti?" }), a: t({ en: "Yes, from 15 to 16 February — the venue had a flood. Tickets for the 15th are valid; refunds until 1 February.", tr: "Evet, 15 Şubat’tan 16 Şubat’a — mekânı su bastı. 15’i biletleri geçerli; iadeler 1 Şubat’a kadar." }) },
            ]}
            deepLink={false}
          />
        </SiteShellPage>

        <SiteShellPage id="releases" title={t({ en: "Releases — Mira Sol", tr: "Yayınlar — Mira Sol" })}>
          <PageIntro
            {...common}
            variant="simple"
            headingLevel={1}
            breadcrumb={[{ label: "mira sol", href: home() }, { label: t({ en: "Music", tr: "Müzik" }) }]}
            eyebrow={t({ en: "Discography", tr: "Diskografi" })}
            title={t({ en: "Releases", tr: "Yayınlar" })}
            lead={t({ en: "Two albums, an EP and the singles in between. Pick a sleeve for the tracklist.", tr: "İki albüm, bir EP ve aradaki tekliler. Şarkı listesi için bir kapak seçin." })}
          />
          <Section theme={{ rhythm: "tight" }}>
            <Container>
              <ReleaseBrowser locale={c.locale} />
            </Container>
          </Section>
          <Section headingId="ms-band-title" theme={{ surface: "surface-2", rhythm: "tight" }}>
            <Container>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                <SectionHeader headingId="ms-band-title" eyebrow={t({ en: "Who plays", tr: "Kim çalıyor" })} title={t({ en: "The *band*", tr: "Grup" })} lead={t({ en: "Formed in Izmir in 2021. Still rehearse above the same bakery.", tr: "2021’de İzmir’de kuruldu. Hâlâ aynı fırının üstünde prova yapıyor." })} />
                <ul className="m-0 grid list-none p-0 sm:grid-cols-2">
                  {band.map((b) => (
                    <li key={b.name} className="border-t border-line py-4 sm:pe-6">
                      <span className="block font-display text-2xl lowercase">{b.name}</span>
                      <span className="block font-mono text-xs text-fg-muted uppercase">{t(b.role)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </Section>
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: "Mira Sol", href: home() }}
        about={t({ en: "A four-piece from Izmir. Salt Hour is out on Low Tide Records on 5 February 2027.", tr: "İzmirli dört kişilik bir grup. Salt Hour, 5 Şubat 2027’de Low Tide Records’tan çıkıyor." })}
        columns={[
          { title: t({ en: "Band", tr: "Grup" }), links: [{ href: tour, label: t({ en: "Tour", tr: "Turne" }) }, { href: music, label: t({ en: "Releases", tr: "Yayınlar" }) }, { href: home("videos"), label: t({ en: "Videos", tr: "Videolar" }) }] },
          { title: t({ en: "Contact", tr: "İletişim" }), links: [{ href: "mailto:booking@mirasol.example.com", label: t({ en: "Booking", tr: "Organizasyon" }) }, { href: "mailto:press@mirasol.example.com", label: t({ en: "Press kit", tr: "Basın kiti" }) }, { href: "mailto:access@mirasol.example.com", label: t({ en: "Access requests", tr: "Erişim talepleri" }) }] },
        ]}
        contact={{ email: EMAIL }}
        social={[{ network: "instagram", href: "https://instagram.com/mirasol.example" }, { network: "youtube", href: "https://youtube.com/@mirasol.example" }, { network: "tiktok", href: "https://tiktok.com/@mirasol.example" }]}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/ticket-terms", label: t({ en: "Ticket terms", tr: "Bilet koşulları" }) }]}
        year={2026}
      />
    </>
  );
}

function Hero({ c }: { c: Copy }) {
  const { t, f } = c;
  const album = releases[0]!;
  const next = shows.find((s) => s.status !== "sold-out")!;
  return (
    <Section anchor="top" theme={{ surface: "media", background: { src: photos.hero.src, width: photos.hero.width, height: photos.hero.height, alt: photos.hero.alt }, rhythm: "tight" }} priority className="overflow-hidden">
      <Container size="full">
        <div className="flex min-h-[min(88svh,56rem)] flex-col justify-between gap-10 pt-4">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <p className="m-0 max-w-[30ch] font-mono text-xs leading-relaxed tracking-[0.12em] uppercase">
              {t({ en: "New album", tr: "Yeni albüm" })} <span className="text-accent-ink">salt hour</span>
              <br />
              {f.date(album.date, { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <a href={music} className="group surface flex w-full max-w-xs items-center gap-4 rounded-ui p-3 focus-ring sm:w-auto">
              <span className="@container block w-16 shrink-0">
                <CoverArt release={album} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{t({ en: "Pre-order Salt Hour", tr: "Salt Hour ön sipariş" })}</span>
                <span className="block text-small text-fg-muted">{t({ en: "LP, pink vinyl · 9 songs", tr: "LP, pembe plak · 9 şarkı" })}</span>
              </span>
              <ArrowRight aria-hidden className="ms-auto size-4 shrink-0 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </a>
          </div>
          <div>
            <BlockHeading level={1} className="text-[clamp(4.5rem,23vw,24rem)] leading-[0.78] lowercase" text="mira *sol*" />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-current/30 pt-4">
              <p className="m-0 text-lead">
                {t({ en: "Next:", tr: "Sıradaki:" })} <strong>{t(next.city)}</strong>, {next.venue} — {f.date(next.date, { day: "numeric", month: "long" })}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="primary" size="lg">
                  <a href={tour}>{t({ en: "Tour dates", tr: "Turne tarihleri" })}</a>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href={home("videos")}>{t({ en: "Watch “Lodos”", tr: "“Lodos”u izle" })}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function NewRelease({ c }: { c: Copy }) {
  const { t, f } = c;
  const album = releases[0]!;
  return (
    <Section anchor="release" headingId="ms-release-home">
      <Container>
        <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center lg:gap-16">
          <div className="@container">
            <CoverArt release={album} size="lg" />
          </div>
          <div>
            <Badge tone="accent" shape="square" size="md">
              {t({ en: "Out", tr: "Çıkış" })} {f.date(album.date, { day: "numeric", month: "long" })}
            </Badge>
            <h2 id="ms-release-home" className="m-0 mt-4 font-display text-display-xl lowercase">
              salt <em>hour</em>
            </h2>
            <p className="m-0 mt-4 max-w-[48ch] text-lead text-fg-muted">{t(album.note)}</p>
            <ol className="m-0 mt-6 grid list-none grid-cols-1 gap-x-8 p-0 font-mono text-sm sm:grid-cols-2">
              {album.tracks.map((tr, i) => (
                <li key={tr.title} className="flex justify-between gap-4 border-b border-line py-2">
                  <span>
                    <span className="text-fg-muted">{String(i + 1).padStart(2, "0")}</span> {tr.title}
                  </span>
                  <span className="text-fg-muted tabular-nums">{tr.length}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <a href="https://shop.mirasol.example.com/salt-hour" target="_blank" rel="noopener noreferrer">
                  {t({ en: "Pre-order the LP", tr: "LP’yi ön sipariş ver" })}
                  <span className="sr-only">{t({ en: " (opens in a new tab)", tr: " (yeni sekmede açılır)" })}</span>
                  <ArrowUpRight aria-hidden />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <a href={music}>{t({ en: "All releases", tr: "Tüm yayınlar" })}</a>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function Merch({ c }: { c: Copy }) {
  const { t, money } = c;
  return (
    <Section anchor="merch" headingId="ms-merch-title">
      <Container>
        <SectionHeader
          headingId="ms-merch-title"
          align="split"
          eyebrow={t({ en: "Merch", tr: "Ürünler" })}
          title={t({ en: "Take some *home*", tr: "Eve bir şey *götürün*" })}
          lead={t({ en: "Printed in Izmir, sold at every show and online. Tour tees in limited runs.", tr: "İzmir’de basıldı; her konserde ve internette satışta. Turne tişörtleri sınırlı sayıda." })}
        />
        <ul className="m-0 mt-10 grid list-none gap-6 p-0 sm:grid-cols-3">
          {merch.map((m) => (
            <li key={t(m.name)}>
              <a href="https://shop.mirasol.example.com" className="group block focus-ring">
                <BlockImage src={m.photo.src} width={m.photo.width} height={m.photo.height} alt={t(m.photo.alt)} aspect="4:5" sizes="(min-width: 640px) 30vw, 100vw" imgClassName="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none" className="overflow-hidden" />
                <span className="mt-3 flex items-baseline justify-between gap-4">
                  <span className="font-semibold">{t(m.name)}</span>
                  <span className="font-mono text-sm tabular-nums">{money(m.price, "TRY")}</span>
                </span>
                <span className="block text-small text-fg-muted">{t(m.note)}</span>
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

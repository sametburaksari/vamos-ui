import { Button } from "@vamos-ui/react";
import { BlockHeading, BlockImage, Container, Cta, Footer, Navbar, Section, SectionHeader, SiteShellPage, sitePageHref, StatsBand, Steps } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { BRAND, copyFor, EMAIL, impact, PHONE, photos, programmes, stories, type Copy, type SiteLocale } from "./content";
import { CampaignMeter } from "./campaign-meter";
import { DonatePage } from "./donate-page";
import { GiftBuilder } from "./gift-builder";
import { ReportPage } from "./report-page";

const home = (anchor?: string) => sitePageHref("home", anchor);
const donate = sitePageHref("donate");
const report = sitePageHref("report");

/** The wordmark: a catalogue card with its punch hole. */
function Wordmark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden className="relative grid h-6 w-8 place-items-end border-[1.5px] border-fg">
        <span className="absolute inset-x-1 top-1 h-[1.5px] bg-accent" />
        <span className="mx-auto mb-[3px] size-1.5 rounded-full border-[1.5px] border-fg" />
      </span>
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.01em]">Open Shelf</span>
    </span>
  );
}

/**
 * One language version of the Open Shelf Foundation site: navbar and footer around three pages
 * (home, donate, report). Server component; the SiteShell in page.tsx picks page and language.
 */
export function NonprofitSite({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, intl, labels } = c;
  const common = { locale: intl, labels };

  return (
    <>
      <Navbar
        {...common}
        variant="bar"
        sticky
        wordmark={<Wordmark />}
        homeHref={home()}
        items={[
          { label: t({ en: "Programmes", tr: "Programlar" }), href: home("programmes") },
          { label: t({ en: "Stories", tr: "Hikâyeler" }), href: home("stories") },
          { label: t({ en: "Where money goes", tr: "Paranın gittiği yer" }), href: report },
          { label: t({ en: "Volunteer", tr: "Gönüllü ol" }), href: home("volunteer") },
        ]}
        locales={[
          { code: "en", href: "?lang=en" },
          { code: "tr", href: "?lang=tr" },
        ]}
        actions={[{ link: { href: donate, label: t({ en: "Donate", tr: "Bağış yap" }) }, style: "primary" }]}
      />

      <main id="content">
        <SiteShellPage id="home" title={t({ en: "Open Shelf Foundation — a shelf of books on every street", tr: "Open Shelf Vakfı — her sokağa bir raf kitap" })}>
          <HomeHero c={c} />

          <StatsBand
            {...common}
            variant="inline"
            theme={{ rhythm: "tight" }}
            items={impact.map((s) => ({ value: s.value, label: t(s.label), source: t(s.source) }))}
          />

          {/* Signature: amount → what it buys */}
          <Section anchor="give" headingId="osf-give-title" theme={{ surface: "surface-2" }}>
            <Container>
              <SectionHeader
                headingId="osf-give-title"
                align="split"
                eyebrow={t({ en: "Your gift, itemised", tr: "Bağışınız, kalem kalem" })}
                title={t({ en: "See exactly *what it buys*", tr: "Tam olarak *neye dönüştüğünü* görün" })}
                lead={t({ en: "We price everything we do — a shelf, a box of books, a story hour, a child’s first card. Pick an amount and watch it fill a shelf.", tr: "Yaptığımız her şeyin bir fiyatı var — bir raf, bir koli kitap, bir masal saati, bir çocuğun ilk kartı. Bir tutar seçin, rafın dolmasını izleyin." })}
              />
              <div className="mt-10">
                <GiftBuilder locale={c.locale} headingId="osf-home-gift" />
              </div>
            </Container>
          </Section>

          <Programmes c={c} />

          <Stories c={c} />

          <Steps
            {...common}
            variant="horizontal"
            eyebrow={t({ en: "How a shelf opens", tr: "Bir raf nasıl açılır" })}
            title={t({ en: "From a request to *a full shelf* in six weeks", tr: "Bir talepten *dolu bir rafa* altı haftada" })}
            steps={[
              { title: t({ en: "A neighbour asks", tr: "Bir komşu ister" }), text: t({ en: "Anyone can nominate a wall. Most requests come from parents and shopkeepers.", tr: "Herkes bir duvar önerebilir. Taleplerin çoğu veliler ve esnaftan gelir." }), duration: t({ en: "Week 1", tr: "1. hafta" }) },
              { title: t({ en: "We find a keeper", tr: "Bir sorumlu buluruz" }), text: t({ en: "Someone who passes the shelf daily agrees to tidy it and send a monthly count.", tr: "Rafın önünden her gün geçen biri, rafı düzenlemeyi ve aylık sayım göndermeyi kabul eder." }), duration: t({ en: "Weeks 2–3", tr: "2–3. hafta" }) },
              { title: t({ en: "The shelf goes up", tr: "Raf kurulur" }), text: t({ en: "Built by a carpentry co-op in Bayrampaşa, stocked with 120 books chosen for that street.", tr: "Bayrampaşa’daki bir marangoz kooperatifi yapar; o sokak için seçilmiş 120 kitapla doldurulur." }), duration: t({ en: "Weeks 4–5", tr: "4–5. hafta" }) },
              { title: t({ en: "It reports back", tr: "Rapor verir" }), text: t({ en: "Every count goes into the public shelf register, so donors see what their shelf did.", tr: "Her sayım herkese açık raf kaydına girer; bağışçılar raflarının ne yaptığını görür." }), duration: t({ en: "Every month", tr: "Her ay" }) },
            ]}
          />

          <Cta
            {...common}
            anchor="volunteer"
            variant="split"
            theme={{ surface: "surface-2" }}
            eyebrow={t({ en: "Volunteer", tr: "Gönüllü ol" })}
            title={t({ en: "Read aloud on *a Saturday morning*", tr: "Bir *cumartesi sabahı* sesli okuyun" })}
            lead={t({ en: "Two hours of training with a children’s librarian, then one Saturday a month at a shelf near you. Next training: 7 December, Kadıköy.", tr: "Bir çocuk kütüphanecisiyle iki saatlik eğitim, sonra ayda bir cumartesi size yakın bir rafta. Sıradaki eğitim: 7 Aralık, Kadıköy." })}
            media={{ ...photos.open, alt: t(photos.open.alt) }}
            actions={[
              { link: { href: "mailto:volunteer@openshelf.example.com", label: t({ en: "Sign up for training", tr: "Eğitime kaydol" }) }, style: "primary" },
              { link: { href: "mailto:shelves@openshelf.example.com", label: t({ en: "Nominate a wall", tr: "Bir duvar öner" }) }, style: "secondary" },
            ]}
          />
        </SiteShellPage>

        <SiteShellPage id="donate" title={t({ en: "Donate — Open Shelf Foundation", tr: "Bağış yap — Open Shelf Vakfı" })}>
          <DonatePage c={c} />
        </SiteShellPage>

        <SiteShellPage id="report" title={t({ en: "Where the money went, 2025 — Open Shelf Foundation", tr: "Paranın gittiği yer, 2025 — Open Shelf Vakfı" })}>
          <ReportPage c={c} />
        </SiteShellPage>
      </main>

      <Footer
        {...common}
        variant="columns"
        brand={{ name: BRAND, href: home() }}
        about={t({ en: "Small libraries on ordinary streets, kept by the neighbours who use them. Istanbul, since 2019.", tr: "Sıradan sokaklarda, kullanan komşuların baktığı küçük kütüphaneler. 2019’dan beri İstanbul’da." })}
        columns={[
          { title: t({ en: "Give", tr: "Bağış" }), links: [{ href: donate, label: t({ en: "Donate", tr: "Bağış yap" }) }, { href: home("give"), label: t({ en: "What a gift buys", tr: "Bağış neye dönüşür" }) }, { href: "mailto:partners@openshelf.example.com", label: t({ en: "Company matching", tr: "Şirket eşleştirmesi" }) }] },
          { title: t({ en: "Accountability", tr: "Hesap verebilirlik" }), links: [{ href: report, label: t({ en: "Report 2025", tr: "2025 raporu" }) }, { href: sitePageHref("report", "files"), label: t({ en: "Audited accounts", tr: "Denetlenmiş hesaplar" }) }, { href: sitePageHref("report", "board"), label: t({ en: "Board of trustees", tr: "Mütevelli heyeti" }) }] },
          { title: t({ en: "Join in", tr: "Katıl" }), links: [{ href: home("volunteer"), label: t({ en: "Volunteer", tr: "Gönüllü ol" }) }, { href: "mailto:shelves@openshelf.example.com", label: t({ en: "Nominate a wall", tr: "Duvar öner" }) }, { href: home("programmes"), label: t({ en: "Programmes", tr: "Programlar" }) }] },
        ]}
        contact={{ email: EMAIL, phone: PHONE, address: t({ en: "Kemeraltı Cad. 00, Karaköy, 34425 Istanbul", tr: "Kemeraltı Cad. 00, Karaköy, 34425 İstanbul" }) }}
        social={[{ network: "instagram", href: "https://instagram.com/openshelf.example" }, { network: "youtube", href: "https://youtube.com/@openshelf.example" }]}
        company={{ legalName: t({ en: "Open Shelf Community Library Foundation", tr: "Açık Raf Mahalle Kütüphaneleri Vakfı" }), registry: [{ label: t({ en: "Foundation reg. no.", tr: "Vakıf sicil no." }), value: "0000" }, { label: t({ en: "Tax no.", tr: "Vergi no." }), value: "000 000 0000" }] }}
        legalLinks={[{ href: "/privacy", label: t({ en: "Privacy", tr: "Gizlilik" }) }, { href: "/donor-terms", label: t({ en: "Donor terms", tr: "Bağışçı koşulları" }) }]}
        year={2026}
      />
    </>
  );
}

function HomeHero({ c }: { c: Copy }) {
  const { t } = c;
  return (
    <Section anchor="top" theme={{ rhythm: "tight" }} className="overflow-hidden">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-fg pb-3 font-mono text-[11px] tracking-[0.14em] text-fg-muted uppercase">
          <span>{t({ en: "Community libraries · Istanbul · since 2019", tr: "Mahalle kütüphaneleri · İstanbul · 2019’dan beri" })}</span>
          <span>027.4 / OSF</span>
        </div>

        <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 lg:pt-14">
          <div className="flex flex-col">
            <BlockHeading level={1} size="display-xl" className="max-w-[14ch]" text={t({ en: "A shelf of books on *every street* that wants one", tr: "İsteyen *her sokağa* bir raf kitap" })} />
            <p className="mt-7 max-w-[46ch] text-lead text-fg-muted">
              {t({
                en: "We build small, weatherproof libraries on grocers’ walls, in mosque courtyards and health-centre waiting rooms — and stock them with books children actually want to take home.",
                tr: "Bakkal duvarlarına, cami avlularına ve sağlık ocağı bekleme salonlarına küçük, hava koşullarına dayanıklı kütüphaneler kuruyor; onları çocukların gerçekten eve götürmek istediği kitaplarla dolduruyoruz.",
              })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <a href={donate}>
                  {t({ en: "Give to the Winter Drive", tr: "Kış Kampanyası’na bağış yap" })}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <a href={report}>{t({ en: "Read where the money went", tr: "Paranın nereye gittiğini okuyun" })}</a>
              </Button>
            </div>
            <div className="mt-auto pt-10">
              <CampaignMeter c={c} />
            </div>
          </div>

          <figure className="relative m-0 self-start">
            <BlockImage src={photos.hero.src} width={photos.hero.width} height={photos.hero.height} alt={t(photos.hero.alt)} aspect="4:5" priority sizes="(min-width: 1024px) 40vw, 100vw" className="w-full" />
            <figcaption className="mt-3 flex justify-between gap-4 font-mono text-[11px] text-fg-muted">
              <span>{t({ en: "Saturday story hour, Tarlabaşı shelf no. 112", tr: "Cumartesi masal saati, Tarlabaşı 112 numaralı raf" })}</span>
              <span>11:00</span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}

/** Programmes as catalogue cards: call number, red rule, title, text, one fact. */
function Programmes({ c }: { c: Copy }) {
  const { t } = c;
  return (
    <Section anchor="programmes" headingId="osf-prog-title">
      <Container>
        <SectionHeader
          headingId="osf-prog-title"
          eyebrow={t({ en: "Programmes", tr: "Programlar" })}
          title={t({ en: "Four ways a book *reaches a child*", tr: "Bir kitabın çocuğa *ulaşmasının* dört yolu" })}
        />
        <ul className="m-0 mt-10 grid list-none gap-5 p-0 md:grid-cols-2">
          {programmes.map((p) => (
            <li key={p.code} className="flex flex-col border border-line bg-surface">
              <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-3 font-mono text-[11px] text-fg-muted">
                <span className="tracking-[0.08em]">{p.code}</span>
                <span>{t({ en: `Since ${p.since}`, tr: `${p.since}’dan beri` })}</span>
              </div>
              <div className="h-[2px] bg-accent" aria-hidden />
              <div
                className="flex flex-1 flex-col px-5 pt-4 pb-5 sm:px-6"
                style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0 calc(1.6rem - 1px), var(--line) calc(1.6rem - 1px) 1.6rem)", backgroundPosition: "0 0.35rem" }}
              >
                <h3 className="m-0 font-display text-h3 leading-[1.6rem]">{t(p.name)}</h3>
                <p className="m-0 mt-[1.6rem] text-body leading-[1.6rem] text-fg-muted">{t(p.text)}</p>
                <p className="m-0 mt-auto pt-[1.6rem] text-small leading-[1.6rem] font-semibold text-accent-ink">{t(p.fact)}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function Stories({ c }: { c: Copy }) {
  const { t } = c;
  return (
    <Section anchor="stories" headingId="osf-stories-title" theme={{ surface: "surface-2" }}>
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHeader headingId="osf-stories-title" eyebrow={t({ en: "From the shelves", tr: "Raflardan" })} title={t({ en: "What a shelf *changes*", tr: "Bir raf neyi *değiştirir*" })} />
            <BlockImage src={photos.reader.src} width={photos.reader.width} height={photos.reader.height} alt={t(photos.reader.alt)} aspect="3:2" className="mt-8 w-full" sizes="(min-width: 1024px) 35vw, 100vw" />
          </div>
          <div className="flex flex-col justify-center gap-10">
            {stories.map((s) => (
              <figure key={s.author} className="m-0 border-s-2 border-accent ps-6">
                <blockquote className="m-0 font-display text-[clamp(1.4rem,1.1rem+1.2cqi,2.1rem)] leading-[1.25]">“{t(s.quote)}”</blockquote>
                <figcaption className="mt-4 text-small">
                  <span className="font-semibold">{s.author}</span>
                  <span className="text-fg-muted"> · {t(s.role)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

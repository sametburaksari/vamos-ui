import { Button } from "@vamos-ui/react";
import { BlockImage, Container, Cta, Faq, MapHours, Section, SectionHeader, Testimonials, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowDown, ArrowRight } from "lucide-react";
import { CapacityFinder } from "./capacity-finder";
import { faq, history, included, mill, photos, quotes, type Copy } from "./content";

const caps = "font-mono text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase";

/**
 * Home: a ledger hero over a wide photograph of the Grain Hall, the capacity finder (signature),
 * the mill's history, what's included, two clients, viewings with map and hours, FAQ, CTA.
 */
export function VenueHome({ c }: { c: Copy }) {
  const { t, img, locale, intl, labels, lira } = c;
  const common = { locale: intl, labels };
  const ledger: [string, string][] = [
    [t({ en: "Built", tr: "Yapım" }), "1911"],
    [t({ en: "Restored", tr: "Restorasyon" }), "2019"],
    [t({ en: "Spaces", tr: "Alan" }), t({ en: "4 rooms + a terrace", tr: "4 oda + teras" })],
    [t({ en: "Largest room", tr: "En büyük oda" }), t({ en: "450 standing", tr: "450 ayakta" })],
    [t({ en: "From Kadıköy", tr: "Kadıköy’den" }), t({ en: "35 min by car", tr: "Arabayla 35 dk" })],
  ];
  return (
    <>
      <Section anchor="top" theme={{ rhythm: "tight" }} className="overflow-hidden">
        <Container>
          <div className="grid gap-10 pt-4 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end lg:gap-16">
            <div>
              <p className={caps}>{t({ en: "Event venue · Ömerli, Istanbul", tr: "Etkinlik mekânı · Ömerli, İstanbul" })}</p>
              <h1 className="m-0 mt-5 font-display text-display-2xl text-fg [--display-scale:1.08]">
                {t({ en: "A flour mill,", tr: "Bir un değirmeni," })}
                <br />
                <em className="text-accent-ink">{t({ en: "for 10 to 450.", tr: "10 ila 450 kişiye." })}</em>
              </h1>
              <p className="m-0 mt-6 max-w-[52ch] text-lead text-fg-muted">
                {t({
                  en: "Four rooms and a terrace on the Ömerli stream, kept as the Kalkan brothers built them: pine trusses, brick vaults, millstones in the floor. Weddings, company days, launches and conferences.",
                  tr: "Ömerli deresi kıyısında dört oda ve bir teras; Kalkan kardeşlerin inşa ettiği gibi korundu: çam makaslar, tuğla tonozlar, zemindeki değirmen taşları. Düğünler, şirket günleri, lansmanlar ve konferanslar.",
                })}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="primary" size="lg" className="rounded-none">
                  <a href={sitePageHref("home", "finder")}>
                    {t({ en: "Find a space that fits", tr: "Size uyan alanı bulun" })}
                    <ArrowDown aria-hidden />
                  </a>
                </Button>
                <Button asChild variant="secondary" size="lg" className="rounded-none border-fg">
                  <a href={sitePageHref("home", "visit")}>{t({ en: "Book a viewing", tr: "Gezi ayarlayın" })}</a>
                </Button>
              </div>
            </div>
            <dl className="m-0 border-t-2 border-fg">
              {ledger.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line py-2.5">
                  <dt className={caps}>{k}</dt>
                  <dd className="m-0 text-end font-display text-lg text-fg tabular">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="relative m-0 mt-12">
            <BlockImage {...img(photos.hall)} aspect={2.2} priority sizes="100vw" className="overflow-hidden" />
            <figcaption className="mt-3 flex flex-wrap justify-between gap-2 font-mono text-xs text-fg-muted">
              <span>{t({ en: "Grain Hall, laid for a wedding of 220", tr: "Tahıl Salonu, 220 kişilik bir düğün için" })}</span>
              <span>{t({ en: "Pine trusses, 1911 · hoist, 1928", tr: "Çam makaslar, 1911 · vinç, 1928" })}</span>
            </figcaption>
          </figure>
        </Container>
      </Section>

      <Section anchor="finder" headingId="om-finder-title">
        <Container>
          <SectionHeader
            headingId="om-finder-title"
            align="split"
            eyebrow={t({ en: "Capacity", tr: "Kapasite" })}
            title={t({ en: "How many, *and how?*", tr: "Kaç kişi, *nasıl?*" })}
            lead={t({ en: "Pick a layout and a head-count. The plan fills in the rooms that take you; numbers are fire-safety maximums, so a comfortable dinner is about 10% fewer.", tr: "Bir düzen ve kişi sayısı seçin. Plan sizi alan odaları doldurur; sayılar yangın güvenliği üst sınırıdır, rahat bir yemek için yaklaşık %10 az düşünün." })}
          />
          <div className="mt-10">
            <CapacityFinder locale={locale} />
          </div>
        </Container>
      </Section>

      <Section anchor="history" headingId="om-history-title" theme={{ surface: "surface-2" }}>
        <Container>
          <SectionHeader headingId="om-history-title" eyebrow={t({ en: "The building", tr: "Bina" })} title={t({ en: "Seventy-six years of flour, *then thirty of silence*", tr: "Yetmiş altı yıl un, *sonra otuz yıl sessizlik*" })} />
          <ol className="m-0 mt-12 grid list-none gap-0 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {history.map((h, i) => (
              <li key={h.year} className={`border-t-2 border-fg pt-4 pb-8 sm:pe-8 ${i ? "" : ""}`}>
                <span className="font-display text-display-l leading-none text-accent-ink tabular">{h.year}</span>
                <p className="m-0 mt-4 max-w-[30ch] text-fg-muted">{t(h.text)}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section anchor="included" headingId="om-incl-title">
        <Container>
          <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
            <div>
              <SectionHeader headingId="om-incl-title" eyebrow={t({ en: "Included in the hire", tr: "Kiraya dahil" })} title={t({ en: "No *surprise* line items", tr: "*Sürpriz* kalem yok" })} lead={t({ en: `Hire runs 08:00 to 01:30, set-up and clear-down included. Weekday rates from ${lira(22000)}.`, tr: `Kiralama 08:00–01:30 arası; kurulum ve toplama dahil. Hafta içi ${lira(22000)}’den başlayan fiyatlar.` })} />
              <Button asChild variant="secondary" className="mt-8 rounded-none border-fg">
                <a href={sitePageHref("spaces")}>
                  {t({ en: "Every space, every number", tr: "Tüm alanlar, tüm rakamlar" })}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
              </Button>
            </div>
            <ul className="m-0 grid list-none gap-0 p-0 sm:grid-cols-2 sm:gap-x-10">
              {included.map((x) => (
                <li key={t(x.title)} className="border-t border-line py-5">
                  <h3 className="m-0 font-display text-h3 text-fg">{t(x.title)}</h3>
                  <p className="m-0 mt-2 text-fg-muted">{t(x.body)}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      <Testimonials {...common} variant="wall" theme={{ surface: "surface" }} eyebrow={t({ en: "From the guestbook", tr: "Anı defterinden" })} title={t({ en: "What people *remember*", tr: "Akılda *kalanlar*" })} items={quotes.map((q) => ({ quote: t(q.quote), author: q.name, role: t(q.role) }))} />

      <MapHours {...common} anchor="visit" variant="map-split" eyebrow={t({ en: "Viewings", tr: "Gezi" })} title={t({ en: "Come and *walk it*", tr: "Gelin, *gezin*" })} lead={t({ en: "Viewings by appointment, usually with Selin, our venue manager. Bring your planner and your doubts.", tr: "Randevuyla gezi; genellikle mekân sorumlumuz Selin’le. Organizatörünüzü ve sorularınızı getirin." })} branches={[mill(t)]} businessType="EventVenue" />

      <Faq {...common} anchor="faq" variant="columns" eyebrow={t({ en: "Questions", tr: "Sorular" })} title={t({ en: "Before you *enquire*", tr: "Talep *öncesi*" })} items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))} deepLink={false} />

      <Cta
        {...common}
        variant="band"
        theme={{ surface: "accent" }}
        title={t({ en: "Hold a date for *seven days*, free", tr: "Bir tarihi *yedi gün* ücretsiz ayırtın" })}
        lead={t({ en: "Tell us the day, the head-count and the shape of it. We reply within one working day.", tr: "Günü, kişi sayısını ve akışı anlatın. Bir iş günü içinde dönüyoruz." })}
        actions={[
          { link: { href: sitePageHref("enquiry"), label: t({ en: "Send an enquiry", tr: "Talep gönderin" }) }, style: "primary" },
          { link: { href: "tel:+902160000000", label: "+90 216 000 00 00" }, style: "secondary" },
        ]}
      />
    </>
  );
}

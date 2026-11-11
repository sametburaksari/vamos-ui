import { Button } from "@vamos-ui/react";
import { BlockImage, Container, Faq, MapHours, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Truck } from "lucide-react";
import { Stagger, TextReveal } from "@vamos-ui/react/motion";
import { bouquets, CUTOFF, districts, faq, FREE_FROM, ISSUE, photos, shop, type Copy } from "./content";
import { ChooseBouquet, CutoffNote } from "./order-provider";

const caps = "font-mono text-[11px] font-medium tracking-[0.16em] uppercase";

/**
 * Home: a magazine masthead with this week's issue number and a live same-day cut-off, the weekly
 * edit as a feature spread, three refusals, subscriptions, delivery areas, the shop, FAQ.
 */
export function FloristHome({ c }: { c: Copy }) {
  const { t, date, img, lira, intl, labels } = c;
  const common = { locale: intl, labels };
  const edit = bouquets.filter((b) => b.edit);
  const [lead, ...rest] = edit;
  const order = t({ en: "Order this", tr: "Bunu sipariş et" });

  return (
    <>
      {/* ------------------------------------------------------------ Masthead */}
      <Section anchor="top" theme={{ rhythm: "tight" }} className="overflow-hidden">
        <Container size="wide">
          <div className={`${caps} vm-enter flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-y border-fg py-2.5 text-fg`}>
            <span>
              {t({ en: "No.", tr: "Sayı" })} {ISSUE.no}
            </span>
            <span className="hidden sm:inline">{t({ en: `Week of ${date(ISSUE.week, { day: "numeric", month: "long" })}`, tr: `${date(ISSUE.week, { day: "numeric", month: "long" })} haftası` })}</span>
            <span>Kuzguncuk, İstanbul</span>
          </div>

          <div className="grid gap-10 pt-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-12 lg:gap-16">
            <div className="flex flex-col">
              <h1 className="vm-enter vm-enter-title m-0 font-display text-display-2xl text-balance text-fg [--vm-i:1]">
                {t({ en: "Flowers from this week’s market,", tr: "Bu haftanın halinden çiçekler," })} <em className="text-accent-ink">{t({ en: "not a catalogue.", tr: "katalogdan değil." })}</em>
              </h1>
              <p className="vm-enter m-0 mt-8 max-w-[46ch] text-lead text-fg-muted [--vm-i:2]">
                {t({
                  en: "Every Monday at five we go to the flower market and build the week around what’s best. Bouquets are tied in Kuzguncuk, wrapped in paper and carried across the Asian side by bike and van.",
                  tr: "Her pazartesi sabah beşte çiçek haline gidip haftayı en güzel olanın etrafında kuruyoruz. Buketler Kuzguncuk’ta bağlanır, kâğıda sarılır ve Anadolu yakasına bisiklet ve minibüsle taşınır.",
                })}
              </p>
              <div className="vm-enter mt-8 flex flex-wrap items-center gap-3 [--vm-i:3]">
                <Button asChild variant="primary" size="lg" className="vm-press vm-nudge rounded-full px-7">
                  <a href={sitePageHref("bouquets")}>
                    {t({ en: "See all bouquets", tr: "Tüm buketler" })}
                    <ArrowRight aria-hidden className="rtl:rotate-180" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="lg" className="vm-press rounded-full">
                  <a href={sitePageHref("home", "delivery")}>{t({ en: "Where we deliver", tr: "Nereye teslim ediyoruz" })}</a>
                </Button>
              </div>
              <p role="status" className="vm-enter m-0 mt-auto flex [--vm-i:4] items-start gap-3 border-t border-line pt-5 text-small text-fg md:mt-12">
                <Truck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                <span>
                  <CutoffNote
                    copy={{
                      left: t({ en: "Order in the next {h} h {m} min for delivery this evening on the Asian side.", tr: "Anadolu yakasında bu akşam teslimat için {h} sa {m} dk içinde sipariş verin." }),
                      closed: t({ en: `Today’s cut-off (${CUTOFF}) has passed — order now for tomorrow morning.`, tr: `Bugünün son saati (${CUTOFF}) geçti — yarın sabah için şimdi sipariş verin.` }),
                      closedSat: t({ en: `Today’s cut-off (${CUTOFF}) has passed — next deliveries on Monday.`, tr: `Bugünün son saati (${CUTOFF}) geçti — sonraki teslimatlar pazartesi.` }),
                      sunday: t({ en: "We rest on Sundays — order now for Monday, fresh from the market.", tr: "Pazar günleri dinleniyoruz — halden taze, pazartesi için şimdi sipariş verin." }),
                    }}
                  />
                </span>
              </p>
            </div>

            {lead ? (
              <figure className="vm-enter vm-enter-media relative m-0 [--vm-i:1]">
                <BlockImage {...img(photos.shop)} aspect="4:5" focal={{ x: 0.45, y: 0.5 }} priority sizes="(min-width: 48rem) 40vw, 100vw" className="overflow-hidden rounded-ui" />
                {/* Price tag, tied on with a string. */}
                <figcaption className="ps-tag surface-popover absolute -bottom-5 start-4 w-[min(17rem,calc(100%-2rem))] rounded-ui p-4 sm:start-auto sm:-end-4">
                  <span aria-hidden className="absolute -top-8 start-8 h-8 w-px bg-fg-subtle" />
                  <span className={`${caps} text-fg-muted`}>
                    {t({ en: "In the window this week", tr: "Bu hafta vitrinde" })}
                  </span>
                  <span className="mt-1 block font-display text-2xl text-fg">{t(lead.name)}</span>
                  <span className="mt-1 block text-small text-fg-muted">{t(lead.stems)}</span>
                  <span className="mt-2 block font-mono text-sm text-fg tabular">
                    {t({ en: "from", tr: "başlangıç" })} {lira(lead.prices.s)}
                  </span>
                </figcaption>
              </figure>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ The edit */}
      <Section anchor="edit" headingId="ps-edit-title">
        <Container size="wide">
          <SectionHeader
            headingId="ps-edit-title"
            align="split"
            eyebrow={t({ en: `The weekly edit · No. ${ISSUE.no}`, tr: `Haftalık seçki · Sayı ${ISSUE.no}` })}
            title={t({ en: "Three bouquets, *until Saturday*", tr: "Üç buket, *cumartesiye kadar*" })}
            lead={t({ en: "What the market had on Monday. When a flower runs out, the edit changes — that’s the point.", tr: "Pazartesi halde ne varsa. Bir çiçek bitince seçki değişir — mesele de bu." })}
          />
          <Stagger asChild effect="blur" step={160}>
          <ol className="m-0 mt-12 grid list-none gap-x-10 gap-y-14 p-0 md:grid-cols-2">
            {[lead, ...rest].filter(Boolean).map((b, i) => (
              <li key={b!.id} className={i === 0 ? "md:row-span-2" : "grid gap-6 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] sm:items-end"}>
                <BlockImage {...img(b!.photo)} aspect={i === 0 ? "4:5" : "1:1"} sizes="(min-width: 48rem) 45vw, 100vw" className="overflow-hidden rounded-ui" />
                <div className={i === 0 ? "mt-6" : ""}>
                  <p className={`${caps} m-0 text-accent-ink`}>{String(i + 1).padStart(2, "0")}</p>
                  <h3 className={`m-0 mt-2 font-display text-fg ${i === 0 ? "text-display-m" : "text-h3"}`}>{t(b!.name)}</h3>
                  <p className="m-0 mt-2 text-fg-muted">{t(b!.line)}</p>
                  <p className="m-0 mt-3 font-mono text-xs leading-relaxed text-fg-muted">{t(b!.stems)}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <span className="font-mono text-sm text-fg tabular">
                      {lira(b!.prices.s)} – {lira(b!.prices.l)}
                    </span>
                    <ChooseBouquet id={b!.id} label={order} variant={i === 0 ? "primary" : "secondary"} />
                  </div>
                </div>
              </li>
            ))}
          </ol>
          </Stagger>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Refusals */}
      <Section anchor="principles" headingId="ps-no-title" theme={{ surface: "surface-2" }}>
        <Container size="wide">
          <h2 id="ps-no-title" className="sr-only">
            {t({ en: "What we don’t do", tr: "Yapmadıklarımız" })}
          </h2>
          <ul className="m-0 grid list-none gap-0 p-0 md:grid-cols-3">
            {[
              [t({ en: "No red roses.", tr: "Kırmızı gül yok." }), t({ en: "Flown in, identical everywhere. We’d rather send you something that grew a few hundred kilometres away.", tr: "Uçakla gelen, her yerde aynı. Size birkaç yüz kilometre ötede yetişmiş bir şey göndermeyi tercih ederiz." })],
              [t({ en: "No floral foam.", tr: "Çiçek süngeri yok." }), t({ en: "It’s a microplastic. Our bouquets are hand-tied and travel in a compostable water pouch.", tr: "Bir mikroplastik. Buketlerimiz elle bağlanır, kompostlanabilir su kesesiyle yolculuk eder." })],
              [t({ en: "No plastic wrap.", tr: "Plastik ambalaj yok." }), t({ en: "Paper, cotton ribbon and a card we write by hand. The whole lot goes in the recycling.", tr: "Kâğıt, pamuk kurdele ve elle yazdığımız bir kart. Hepsi geri dönüşüme gider." })],
            ].map(([head, body], i) => (
              <li key={head} className={`py-6 md:px-8 md:py-2 ${i ? "border-t border-line md:border-s md:border-t-0" : "md:ps-0"}`}>
                <TextReveal as="p" delay={i * 160} className="m-0 font-display text-display-m text-fg">{String(head)}</TextReveal>
                <p className="m-0 mt-3 max-w-[38ch] text-fg-muted">{body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Subscriptions */}
      <Section anchor="subscribe" headingId="ps-sub-title">
        <Container size="wide">
          <div className="grid gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
            <SectionHeader headingId="ps-sub-title" eyebrow={t({ en: "Subscriptions", tr: "Abonelik" })} title={t({ en: "A bunch on the table, *every week*", tr: "Masada her *hafta* bir demet" })} lead={t({ en: "A medium bouquet from the edit, delivered on the same weekday. Pause or skip with one email; no contract.", tr: "Seçkiden orta boy bir buket, her hafta aynı gün. Tek e-postayla duraklatın ya da atlayın; sözleşme yok." })} />
            <Stagger asChild step={100}>
            <ul className="m-0 grid list-none gap-0 self-end p-0">
              {[
                [t({ en: "Every week", tr: "Her hafta" }), 1590, t({ en: "Most popular for offices and shops", tr: "Ofis ve dükkânlar için en çok tercih edilen" })],
                [t({ en: "Every two weeks", tr: "İki haftada bir" }), 1790, t({ en: "Enough time to enjoy the last one", tr: "Bir öncekinin tadını çıkarmaya yetecek süre" })],
                [t({ en: "Once a month", tr: "Ayda bir" }), 1990, t({ en: "First Tuesday of the month", tr: "Her ayın ilk salısı" })],
              ].map(([name, price, note]) => (
                <li key={String(name)} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 border-t border-line py-5 last:border-b">
                  <span>
                    <span className="font-display text-xl text-fg">{name}</span>
                    <span className="block text-small text-fg-muted">{note}</span>
                  </span>
                  <span className="text-end font-mono text-fg tabular">
                    {lira(price as number)}
                    <span className="block text-xs text-fg-muted">{t({ en: "per delivery", tr: "teslimat başı" })}</span>
                  </span>
                </li>
              ))}
            </ul>
            </Stagger>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Delivery */}
      <Section anchor="delivery" headingId="ps-del-title" theme={{ surface: "surface" }}>
        <Container size="wide">
          <SectionHeader
            headingId="ps-del-title"
            align="split"
            eyebrow={t({ en: "Delivery", tr: "Teslimat" })}
            title={t({ en: "Same day on the *Asian side*", tr: "*Anadolu yakasına* aynı gün" })}
            lead={t({ en: `Order by ${CUTOFF} for an evening delivery today, Monday to Saturday. Free in every Asian-side district on orders from ${lira(FREE_FROM)}.`, tr: `Pazartesiden cumartesiye, bugün akşam teslimat için ${CUTOFF}’e kadar sipariş verin. Anadolu yakasında ${lira(FREE_FROM)} üzeri siparişlerde ücretsiz.` })}
          />
          <div className="mt-10 overflow-x-auto focus-ring" tabIndex={0} role="region" aria-labelledby="ps-del-title">
            <table className="w-full min-w-[30rem] border-collapse text-start">
              <caption className="sr-only">{t({ en: "Delivery fees by district", tr: "İlçeye göre teslimat ücretleri" })}</caption>
              <thead>
                <tr className={`${caps} text-fg-muted`}>
                  <th scope="col" className="border-b border-fg py-3 text-start font-medium">{t({ en: "District", tr: "İlçe" })}</th>
                  <th scope="col" className="border-b border-fg py-3 text-start font-medium">{t({ en: "Earliest", tr: "En erken" })}</th>
                  <th scope="col" className="border-b border-fg py-3 text-end font-medium">{t({ en: "Fee", tr: "Ücret" })}</th>
                </tr>
              </thead>
              <Stagger asChild effect="fade" step={45}>
              <tbody>
                {districts.map((d) => (
                  <tr key={d.id} className="border-b border-line">
                    <th scope="row" className="py-3.5 text-start font-display text-lg font-normal text-fg">{d.name}</th>
                    <td className="py-3.5 text-small text-fg-muted">{d.side === "asia" ? t({ en: "Today, 17:00–20:00", tr: "Bugün, 17:00–20:00" }) : t({ en: "Tomorrow, 10:00–13:00", tr: "Yarın, 10:00–13:00" })}</td>
                    <td className="py-3.5 text-end font-mono text-fg tabular">{d.fee === 0 ? t({ en: "Free", tr: "Ücretsiz" }) : lira(d.fee)}</td>
                  </tr>
                ))}
              </tbody>
              </Stagger>
            </table>
          </div>
        </Container>
      </Section>

      <MapHours {...common} anchor="shop" variant="map-split" eyebrow={t({ en: "The shop", tr: "Dükkân" })} title={t({ en: "Come and *choose your own*", tr: "Gelin, *kendiniz seçin*" })} branches={[shop(t)]} businessType="LocalBusiness" />

      <Faq
        {...common}
        anchor="faq"
        variant="stacked"
        eyebrow={t({ en: "Questions", tr: "Sorular" })}
        title={t({ en: "Before you *order*", tr: "Sipariş *öncesi*" })}
        items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        contact={{ link: { href: sitePageHref("order"), label: t({ en: "Send flowers", tr: "Çiçek gönder" }) }, style: "primary" }}
        deepLink={false}
      />
    </>
  );
}

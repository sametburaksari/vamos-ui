import { Timeline, TimelineContent, TimelineGroup, TimelineIndicator, TimelineItem, TimelineTitle } from "@vamos-ui/react";
import { Container, Faq, MapHours, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { Bus, Check, Coffee, Gem, Moon, Music, UtensilsCrossed, Wine, X, type LucideIcon } from "lucide-react";
import { days, dressCode, faq, hotels, RSVP_BY, travel, venue, weekend, WEEKEND, type Copy, type EventIcon } from "./content";
import { Sprig } from "./sprig";

const icons: Record<EventIcon, LucideIcon> = { wine: Wine, bus: Bus, rings: Gem, glass: Wine, dinner: UtensilsCrossed, music: Music, moon: Moon, coffee: Coffee };
const caps = "font-mono text-[11px] font-medium tracking-[0.22em] text-fg-muted uppercase";

/** Details: the full schedule, the estate on a map, getting there, where to stay, dress code, gifts, FAQ. */
export function DetailsPage({ c }: { c: Copy }) {
  const { t, time, date, lira, intl, labels } = c;
  const common = { locale: intl, labels };
  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Ece & Daniel", href: sitePageHref("home") }, { label: t({ en: "Details", tr: "Ayrıntılar" }) }]}
        eyebrow={t({ en: "Everything you need", tr: "Bilmeniz gereken her şey" })}
        title={t({ en: "The *details*", tr: "*Ayrıntılar*" })}
        lead={t({ en: "Times, the map, how to get to Urla, where to sleep and what to wear. If something is missing, ask Defne.", tr: "Saatler, harita, Urla’ya nasıl gelinir, nerede kalınır, ne giyilir. Eksik bir şey varsa Defne’ye sorun." })}
        meta={[
          { label: t({ en: "Ceremony", tr: "Tören" }), value: `${date("2027-06-12", { day: "numeric", month: "long" })}, ${time("17:00")}` },
          { label: t({ en: "Where", tr: "Nerede" }), value: "Bademli, Urla" },
          { label: t({ en: "Dress code", tr: "Kıyafet" }), value: t(dressCode.name) },
          { label: t({ en: "Reply by", tr: "Son yanıt" }), value: date(RSVP_BY, { day: "numeric", month: "long" }) },
        ]}
      />

      {/* Schedule ------------------------------------------------------- */}
      <Section anchor="schedule" headingId="wd-schedule-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeader headingId="wd-schedule-title" eyebrow={t({ en: "Schedule", tr: "Program" })} title={t({ en: "Three days in *Urla*", tr: "*Urla*’da üç gün" })} lead={t({ en: "Local time, GMT+3. Saturday is the only part we’ll ask you to be on time for.", tr: "Yerel saat, GMT+3. Yalnızca cumartesi için dakik olmanızı rica ediyoruz." })} />
            </div>
            <Timeline className="[--tl-ind:2.25rem]">
              {days.map((d, day) => (
                <TimelineGroup key={t(d.label)} className="[&+li]:mt-6" label={<span className="text-[12px] tracking-[0.18em] text-fg-muted uppercase">{`${t(d.label)} · ${date(WEEKEND[day]!, { day: "numeric", month: "long" })}`}</span>}>
                    {weekend
                      .filter((e) => e.day === day)
                      .map((e) => {
                        const Icon = icons[e.icon];
                        return (
                          <TimelineItem key={`${e.day}-${e.start}`}>
                            <TimelineIndicator icon={Icon} tone={e.key ? "accent" : "neutral"} />
                            <TimelineContent className="pb-2">
                              <TimelineTitle className="flex flex-wrap items-baseline gap-x-3">
                                <span className="font-mono text-sm text-fg-muted tabular">
                                  {time(e.start)}
                                  {e.end ? `–${time(e.end)}` : ""}
                                </span>
                                <span className="font-display text-lg text-fg">{t(e.title)}</span>
                              </TimelineTitle>
                              <p className="m-0 mt-0.5 text-small text-fg">{t(e.place)}</p>
                              {e.note ? <p className="m-0 mt-1 text-small text-fg-muted">{t(e.note)}</p> : null}
                            </TimelineContent>
                          </TimelineItem>
                        );
                      })}
                </TimelineGroup>
              ))}
            </Timeline>
          </div>
        </Container>
      </Section>

      {/* Venue ---------------------------------------------------------- */}
      <MapHours
        locale={intl}
        labels={{ ...labels, openingHours: t({ en: "The estate is ours", tr: "Zeytinlik bizim" }) }}
        now="2027-06-12T12:00:00+03:00"
        anchor="venue"
        variant="map-split"
        theme={{ surface: "surface" }}
        eyebrow={t({ en: "The estate", tr: "Mekân" })}
        title={t({ en: "Bademli *Olive Estate*", tr: "Bademli *Zeytinliği*" })}
        lead={t({ en: "Twelve minutes from Urla town, at the end of a lane through the groves. Open to us on the wedding day and for Sunday brunch.", tr: "Urla merkezden on iki dakika, zeytinliklerin arasından geçen bir yolun sonunda. Düğün günü ve pazar kahvaltısı için bizim." })}
        branches={[venue(t)]}
        businessType="EventVenue"
        hoursDisplay="open-days"
        showOpenNow={false}
      />

      {/* Travel + stay -------------------------------------------------- */}
      <Section anchor="travel" headingId="wd-travel-title">
        <Container>
          <SectionHeader headingId="wd-travel-title" eyebrow={t({ en: "Travel & stay", tr: "Ulaşım ve konaklama" })} title={t({ en: "Getting to *Urla*", tr: "*Urla*’ya varış" })} />
          <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
            {travel.map((x) => (
              <div key={t(x.mode)} className="bg-scene p-6">
                <p className={caps}>{t(x.mode)}</p>
                <h3 className="m-0 mt-2 font-display text-h3 text-fg">{t(x.title)}</h3>
                <p className="m-0 mt-2 text-small text-fg-muted">{t(x.body)}</p>
              </div>
            ))}
          </div>

          <h3 className="m-0 mt-16 font-display text-display-m text-fg">{t({ en: "Where to stay", tr: "Nerede kalınır" })}</h3>
          <p className="m-0 mt-2 max-w-[60ch] text-fg-muted">{t({ en: "We’ve held rooms in three places. Quote the code when you book directly; the shuttle stops at all three.", tr: "Üç yerde oda ayırdık. Doğrudan rezervasyonda kodu söyleyin; servis üçüne de uğruyor." })}</p>
          <ul className="m-0 mt-6 grid list-none gap-0 p-0">
            {hotels.map((h) => (
              <li key={h.name} className="grid gap-x-6 gap-y-1 border-t border-line py-5 last:border-b sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] sm:items-baseline">
                <div>
                  <span className="font-display text-lg text-fg">{h.name}</span>
                  <span className="block text-small text-fg-muted">
                    {t(h.kind)} · {t(h.distance)}
                  </span>
                </div>
                <div className="text-small text-fg-muted">
                  {t({ en: "Code", tr: "Kod" })} <span className="rounded-ui-sm bg-accent-soft px-1.5 py-0.5 font-mono text-accent-ink">{h.code}</span> · {t(h.until)}
                </div>
                <div className="text-fg tabular sm:text-end">
                  <span className="text-small text-fg-muted">{t({ en: "from", tr: "gecelik" })} </span>
                  {lira(h.from)}
                  <span className="text-small text-fg-muted">{t({ en: " a night", tr: "’den" })}</span>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Dress code ----------------------------------------------------- */}
      <Section anchor="dress" headingId="wd-dress-title" theme={{ surface: "surface-2" }}>
        <Container>
          <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
            <div>
              <p className={caps}>{t({ en: "Dress code", tr: "Kıyafet" })}</p>
              <h2 id="wd-dress-title" className="m-0 mt-3 font-display text-display-l text-fg">
                {t(dressCode.name)}
              </h2>
              <p className="m-0 mt-4 max-w-[44ch] text-fg-muted">{t(dressCode.lead)}</p>
              <Sprig className="mt-8 h-6 w-20 text-accent-ink" />
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="m-0 text-small font-semibold text-fg">{t({ en: "Please do", tr: "Lütfen" })}</h3>
                <ul className="m-0 mt-3 grid list-none gap-3 p-0">
                  {dressCode.yes.map((x) => (
                    <li key={t(x)} className="flex gap-3 text-fg">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent-ink" />
                      {t(x)}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="m-0 text-small font-semibold text-fg">{t({ en: "Please don’t", tr: "Lütfen yapmayın" })}</h3>
                <ul className="m-0 mt-3 grid list-none gap-3 p-0">
                  {dressCode.no.map((x) => (
                    <li key={t(x)} className="flex gap-3 text-fg">
                      <X aria-hidden className="mt-1 size-4 shrink-0 text-fg-muted" />
                      {t(x)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Gifts ---------------------------------------------------------- */}
      <Section anchor="gifts" headingId="wd-gift-title">
        <Container>
          <div className="grid gap-8 border-y border-line py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
            <h2 id="wd-gift-title" className="m-0 font-display text-display-m text-fg">
              {t({ en: "Gifts, *if you insist*", tr: "Hediye, *illa ki derseniz*" })
                .split("*")
                .map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part))}
            </h2>
            <div className="grid gap-4 text-fg-muted">
              <p className="m-0">
                {t({
                  en: "There’s no registry — we have one flat and too many mugs. We are saving for a month in Japan in October 2027: Kyoto, the Kumano trail, and an onsen Daniel has been talking about since 2019.",
                  tr: "Hediye listemiz yok — bir evimiz ve fazlasıyla kupamız var. Ekim 2027’de Japonya’da bir ay için biriktiriyoruz: Kyoto, Kumano yolu ve Daniel’ın 2019’dan beri sözünü ettiği bir kaplıca.",
                })}
              </p>
              <p className="m-0">
                {t({
                  en: "There will be a card box on the welcome table. For a bank transfer, ask Defne for the details — we would rather not put them on a website.",
                  tr: "Karşılama masasında bir kart kutusu olacak. Havale için bilgileri Defne’den isteyin — bunları bir web sitesine koymamayı tercih ediyoruz.",
                })}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Faq
        {...common}
        anchor="faq"
        variant="split"
        eyebrow={t({ en: "Questions", tr: "Sorular" })}
        title={t({ en: "Things people *ask*", tr: "En çok *sorulanlar*" })}
        items={faq.map((x) => ({ q: t(x.q), a: t(x.a) }))}
        contact={{ link: { href: sitePageHref("rsvp"), label: t({ en: "Reply to the invitation", tr: "Davete yanıt verin" }) }, style: "primary" }}
        deepLink={false}
      />
    </>
  );
}

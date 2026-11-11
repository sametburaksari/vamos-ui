import { Button } from "@vamos-ui/react";
import { BlockHeading, BlockImage, Container, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { days, photos, RSVP_BY, story, WEDDING_DAY, weekend, type Copy } from "./content";
import { Sprig } from "./sprig";
import { Reveal, Stagger } from "@vamos-ui/react/motion";

const rsvp = sitePageHref("rsvp");
const details = (anchor?: string) => sitePageHref("details", anchor);

/** Hairline small caps: the invitation's label style. */
const caps = "font-mono text-[11px] font-medium tracking-[0.22em] text-fg-muted uppercase";

/**
 * Home: the invitation itself (arched photo + typeset card), how we got here, the weekend at a
 * glance, the estate, a note on gifts and the RSVP call. Server component.
 */
export function WeddingHome({ c }: { c: Copy }) {
  const { t, date, time, img } = c;
  const replyBy = date(RSVP_BY, { day: "numeric", month: "long" });
  return (
    <>
      {/* ---------------------------------------------------------------- Invitation */}
      <Section anchor="top" theme={{ rhythm: "tight" }} className="overflow-hidden">
        <Container>
          <div className="grid items-center gap-10 py-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14 lg:gap-20">
            {/* Arched photograph with an offset hairline arch behind it. */}
            <div className="relative mx-auto w-full max-w-[26rem] md:mx-0 md:max-w-none">
              <span aria-hidden className="wd-arch absolute inset-0 translate-x-3 -translate-y-3 rounded-t-full border border-accent-ink/60" />
              <BlockImage {...img(photos.hills)} aspect="4:5" priority sizes="(min-width: 48rem) 40vw, 90vw" className="vm-enter vm-enter-media relative overflow-hidden rounded-t-full" />
              <p className={`${caps} vm-enter mt-4 flex items-center gap-3 [--vm-i:3]`}>
                <Sprig className="h-3 w-9 text-accent-ink" />
                {t({ en: "Urla, during the olive harvest", tr: "Urla, zeytin hasadında" })}
              </p>
            </div>

            {/* The card: double hairline frame, centred like stationery. */}
            <div className="vm-enter border border-line p-1.5 [--vm-i:1]">
              <div className="flex flex-col items-center border border-line px-5 py-10 text-center sm:px-10 sm:py-14">
                <p className={caps}>{t({ en: "Together with their families", tr: "Aileleriyle birlikte" })}</p>
                <BlockHeading level={1} size="display-xl" className="vm-enter vm-enter-title mt-6 text-balance [--vm-i:2]">
                  <span className="block">Ece Arslan</span>
                  <em className="my-1 block text-[0.62em] leading-none text-accent-ink">&amp;</em>
                  <span className="block">Daniel Whitlock</span>
                </BlockHeading>
                <p className="vm-enter mt-6 max-w-[34ch] font-display text-lead italic text-fg-muted [--vm-i:3]">
                  {t({ en: "would love you to join them as they marry, under an old olive tree, in June.", tr: "Haziran’da, yaşlı bir zeytin ağacının altında evlenirken yanlarında olmanızı çok isterler." })}
                </p>
                <dl className="vm-enter m-0 mt-9 grid w-full max-w-md grid-cols-3 border-y border-line [--vm-i:4]">
                  {[
                    [t({ en: "Day", tr: "Gün" }), date(WEDDING_DAY, { weekday: "long" })],
                    [t({ en: "Date", tr: "Tarih" }), "12 · 06 · 27"],
                    [t({ en: "Time", tr: "Saat" }), time("17:00")],
                  ].map(([k, v], i) => (
                    <div key={k} className={`px-2 py-3.5 ${i ? "border-s border-line" : ""}`}>
                      <dt className={`${caps} text-[10px]`}>{k}</dt>
                      <dd className="m-0 mt-1 font-display text-lg text-fg tabular sm:text-xl">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 text-fg">
                  Bademli Olive Estate
                  <span className="block text-small text-fg-muted">{t({ en: "Bademler, Urla · İzmir", tr: "Bademler, Urla · İzmir" })}</span>
                </p>
                <div className="vm-enter mt-9 flex flex-wrap justify-center gap-3 [--vm-i:5]">
                  <Button asChild variant="primary" size="lg" className="vm-press rounded-full px-7">
                    <a href={rsvp}>{t({ en: "Reply to the invitation", tr: "Davete yanıt verin" })}</a>
                  </Button>
                  <Button asChild variant="ghost" size="lg" className="vm-press vm-nudge rounded-full">
                    <a href={details()}>
                      {t({ en: "The weekend", tr: "Hafta sonu" })}
                      <ArrowRight aria-hidden className="rtl:rotate-180" />
                    </a>
                  </Button>
                </div>
                <p className={`${caps} mt-6 text-[10px]`}>{t({ en: `Kindly reply by ${replyBy}`, tr: `Lütfen 1 Nisan’a kadar yanıtlayın` })}</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- Story */}
      <Section anchor="story" headingId="wd-story-title" theme={{ surface: "surface" }}>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionHeader headingId="wd-story-title" eyebrow={t({ en: "Our story", tr: "Hikâyemiz" })} title={t({ en: "Seven years, *one* dictionary", tr: "Yedi yıl, *tek* sözlük" })} />
              <BlockImage {...img(photos.hands)} aspect="4:5" sizes="(min-width: 64rem) 28vw, 90vw" className="mt-10 hidden max-w-xs overflow-hidden rounded-t-full lg:block" />
            </div>
            <Stagger asChild step={150}>
            <ol className="m-0 grid list-none gap-0 p-0">
              {story.map((s, i) => (
                <li key={s.year} className="grid gap-x-8 gap-y-2 border-t border-line py-8 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_minmax(0,1fr)]">
                  <span className="font-display text-display-m leading-none text-accent-ink tabular">{s.year}</span>
                  <div>
                    <h3 className="m-0 font-display text-h3 text-fg">{t(s.title)}</h3>
                    <p className="m-0 mt-2 max-w-[58ch] text-fg-muted">{t(s.body)}</p>
                    {i === story.length - 1 ? <Sprig className="mt-5 h-5 w-16 text-accent-ink" /> : null}
                  </div>
                </li>
              ))}
            </ol>
            </Stagger>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- Weekend */}
      <Section anchor="weekend" headingId="wd-weekend-title">
        <Container>
          <SectionHeader
            headingId="wd-weekend-title"
            align="split"
            eyebrow={t({ en: "11–13 June 2027", tr: "11–13 Haziran 2027" })}
            title={t({ en: "A long *weekend*, not a long day", tr: "Uzun bir gün değil, uzun bir *hafta sonu*" })}
            lead={t({ en: "Everything is optional except Saturday at five. Times are local (GMT+3).", tr: "Cumartesi saat beş dışında her şey isteğe bağlı. Saatler yerel saattir (GMT+3)." })}
            actions={
              <Button asChild variant="secondary" className="rounded-full">
                <a href={details("schedule")}>{t({ en: "Full schedule", tr: "Tüm program" })}</a>
              </Button>
            }
          />
          <Stagger effect="fade" step={160} className="mt-12 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-[1fr_1.35fr_1fr]">
            {days.map((d, day) => {
              const items = weekend.filter((e) => e.day === day && (day === 1 || e.key));
              const main = day === 1;
              return (
                <div key={t(d.label)} className={`flex flex-col p-6 sm:p-8 ${main ? "bg-surface" : "bg-scene"}`}>
                  <p className={caps}>{t(d.theme)}</p>
                  <h3 className="m-0 mt-2 flex items-baseline justify-between gap-3 font-display text-display-m text-fg">
                    {t(d.label)}
                    <span className="font-mono text-sm text-fg-muted tabular">{c.date(["2027-06-11", "2027-06-12", "2027-06-13"][day]!, { day: "numeric", month: "short" })}</span>
                  </h3>
                  <ul className="m-0 mt-6 grid list-none gap-0 p-0">
                    {items.map((e) => (
                      <li key={e.start} className="flex items-baseline gap-2 py-2">
                        <span className={`min-w-0 ${e.key && main ? "font-medium text-fg" : "text-fg"}`}>{t(e.title)}</span>
                        <span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-fg-subtle" />
                        <span className="font-mono text-sm text-fg-muted tabular">{time(e.start)}</span>
                      </li>
                    ))}
                  </ul>
                  {main ? (
                    <p className="m-0 mt-auto pt-6 text-small text-fg-muted">{t({ en: "Shuttles from Urla at 16:15 — the lanes are narrow, the parking small.", tr: "Urla’dan servisler 16:15’te — yollar dar, otopark küçük." })}</p>
                  ) : null}
                </div>
              );
            })}
          </Stagger>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- Estate */}
      <Section anchor="estate" headingId="wd-estate-title" theme={{ surface: "surface-2" }}>
        <Container>
          <div className="grid items-end gap-10 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-14">
            <Reveal effect="clip" duration={1300}>
              <BlockImage {...img(photos.table)} aspect="4:3" sizes="(min-width: 48rem) 55vw, 100vw" className="overflow-hidden rounded-ui" />
            </Reveal>
            <div className="pb-2">
              <SectionHeader headingId="wd-estate-title" eyebrow={t({ en: "The estate", tr: "Mekân" })} title={t({ en: "Bademli, an olive grove above the *gulf*", tr: "Körfeze bakan bir zeytinlik: *Bademli*" })} />
              <p className="mt-6 max-w-[48ch] text-fg-muted">
                {t({
                  en: "Ece’s grandmother planted the almond trees in 1971; the olives are much older. We’ll marry under the oldest one, eat at a table that runs between the almonds and dance in the barn until the last shuttle.",
                  tr: "Badem ağaçlarını Ece’nin babaannesi 1971’de dikti; zeytinler çok daha yaşlı. En yaşlısının altında evlenecek, bademlerin arasına uzanan masada yemek yiyecek ve son servise kadar ahır salonunda dans edeceğiz.",
                })}
              </p>
              <a href={details("venue")} className="vm-nudge mt-6 inline-flex items-center gap-2 rounded-ui-sm font-medium text-accent-ink underline decoration-accent-ink/40 underline-offset-4 hover:decoration-accent-ink focus-ring">
                {t({ en: "Map, travel and where to stay", tr: "Harita, ulaşım ve konaklama" })}
                <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------- Gifts + reply */}
      <Section anchor="gifts" headingId="wd-gifts-title">
        <Reveal asChild>
        <Container size="prose" className="text-center">
          <Sprig className="mx-auto h-6 w-20 text-accent-ink" />
          <h2 id="wd-gifts-title" className="m-0 mt-6 font-display text-display-m text-fg">
            {t({ en: "On gifts", tr: "Hediyeler üzerine" })}
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-lead text-fg-muted">
            {t({
              en: "Having you there — some of you from four countries away — is the gift. If you would like to mark the day anyway, we are saving for a slow month in Japan next autumn.",
              tr: "Bazılarınızın dört ülke öteden gelmesi zaten en büyük hediye. Yine de günü anmak isterseniz, gelecek sonbahar Japonya’da geçireceğimiz yavaş bir ay için biriktiriyoruz.",
            })}
          </p>
          <a href={details("gifts")} className="mt-5 inline-block rounded-ui-sm text-small font-medium text-accent-ink underline decoration-accent-ink/40 underline-offset-4 hover:decoration-accent-ink focus-ring">
            {t({ en: "How to contribute", tr: "Nasıl katkıda bulunabilirsiniz" })}
          </a>
        </Container>
        </Reveal>
      </Section>

      <Section anchor="reply" headingId="wd-reply-title" theme={{ surface: "accent", rhythm: "tight" }}>
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 py-4 md:flex-row md:items-center">
            <div>
              <h2 id="wd-reply-title" className="m-0 font-display text-display-l">
                {t({ en: "Will you be there?", tr: "Orada olacak mısınız?" })}
              </h2>
              <p className="m-0 mt-3 max-w-[50ch] opacity-90">
                {t({ en: `Find your invitation by name, tell us who’s coming and what they’ll eat. It takes two minutes. Please reply by ${replyBy}.`, tr: `Davetiyenizi adınızla bulun, kimlerin geleceğini ve ne yiyeceklerini söyleyin. İki dakika sürer. Lütfen 1 Nisan’a kadar yanıtlayın.` })}
              </p>
            </div>
            <Button asChild variant="solid" size="lg" className="vm-press vm-nudge shrink-0 rounded-full px-7 text-accent">
              <a href={rsvp}>
                {t({ en: "Reply now", tr: "Şimdi yanıtla" })}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </a>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}

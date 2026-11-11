import { Button } from "@vamos-ui/react";
import { BlockHeading, Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { Countdown } from "./countdown";
import { DAYS, STARTS_AT, type Copy } from "./content";

/**
 * Date-and-venue hero: a stacked uppercase title beside a 3 × 3 poster of geometric shapes
 * (grid lines are the gaps), then a ruled band with the dates, the venue and the countdown.
 */
export function EventHero({ c }: { c: Copy }) {
  const { t, f, time, eur, intl } = c;
  const range = f.dateRange(DAYS[0], DAYS[1], { day: "numeric", month: "long", year: "numeric" });
  const stripes = { backgroundImage: "repeating-linear-gradient(135deg, var(--fg) 0 2px, transparent 2px 11px)" };
  return (
    <Section anchor="top" theme={{ rhythm: "tight" }} className="overflow-hidden">
      <Container size="wide">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b-2 border-fg pb-3 font-mono text-[11px] font-semibold tracking-[0.12em] text-fg uppercase">
          <span>{t({ en: "Design + engineering conference · 2nd edition", tr: "Tasarım + mühendislik konferansı · 2. yıl" })}</span>
          <span className="text-fg-muted">{t({ en: "Haliç, Istanbul", tr: "Haliç, İstanbul" })}</span>
        </div>

        <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
          <div className="flex flex-col">
            <BlockHeading level={1} size="display-2xl" className="uppercase [--display-scale:1.02]">
              <span className="block">Interface</span>
              <span className="block">Days</span>
              <em className="block not-italic">2027</em>
            </BlockHeading>
            <p className="mt-8 max-w-[44ch] text-lead text-fg-muted">
              {t({
                en: "Two days for the people who design interfaces and the people who build them — in the same rooms, on purpose. 900 seats, 18 talks, 4 workshops, one ferry.",
                tr: "Arayüz tasarlayanlar ve onları kodlayanlar için iki gün — bilerek aynı salonlarda. 900 koltuk, 18 konuşma, 4 atölye, bir vapur.",
              })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg" className="rounded-none">
                <a href={sitePageHref("tickets")}>
                  {t({ en: `Get tickets — from ${eur(95)}`, tr: `Bilet al — ${eur(95)}’dan başlayan` })}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </a>
              </Button>
              <Button asChild variant="secondary" size="lg" className="rounded-none border-fg">
                <a href={sitePageHref("schedule")}>{t({ en: "See the schedule", tr: "Programı gör" })}</a>
              </Button>
            </div>
          </div>

          {/* Poster: nine cells, gaps as grid lines. */}
          <div aria-hidden className="grid aspect-square w-full max-w-[34rem] grid-cols-3 grid-rows-3 gap-[2px] self-center justify-self-center border-2 border-fg bg-fg lg:justify-self-end">
            <div className="grid place-items-center bg-scene p-[12%]"><span className="size-full rounded-full bg-accent" /></div>
            <div className="relative overflow-hidden bg-scene"><span className="absolute inset-0 rounded-ee-full bg-fg" /></div>
            <div className="bg-scene" style={stripes} />
            <div className="relative col-span-2 flex items-end overflow-hidden bg-scene">
              <span className="absolute inset-x-[8%] -bottom-1/2 aspect-square rounded-full border-[clamp(10px,2.5cqi,22px)] border-fg" />
              <span className="relative m-3 font-mono text-[11px] font-semibold tracking-[0.12em] text-fg uppercase">{t({ en: "18 talks", tr: "18 konuşma" })}</span>
            </div>
            <div className="grid place-items-center bg-scene"><span className="h-3/5 w-3/5 bg-fg [clip-path:polygon(50%_0,100%_100%,0_100%)]" /></div>
            <div className="relative bg-accent"><span className="absolute inset-[30%] rounded-full bg-scene" /></div>
            <div className="col-span-2 flex flex-col justify-between bg-scene p-3 sm:p-4">
              <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-fg-muted uppercase">{t({ en: "Doors", tr: "Kapılar" })}</span>
              <span className="font-display text-[clamp(2rem,1rem+5cqi,4.5rem)] leading-[0.85] font-bold tracking-[-0.05em] text-fg uppercase">14—15.05</span>
            </div>
          </div>
        </div>

        <div className="mt-12 grid border-t-2 border-fg md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)]">
          <div className="border-b border-line py-4 md:border-e md:border-b-0 md:pe-5">
            <div className="font-mono text-[11px] font-semibold tracking-[0.12em] text-fg-muted uppercase">{t({ en: "When", tr: "Ne zaman" })}</div>
            <div className="mt-1.5 text-lg font-semibold text-fg">{range}</div>
            <div className="font-mono text-xs text-fg-muted">{t({ en: "Doors", tr: "Kapılar" })} {time("08:30")} · GMT+3</div>
          </div>
          <div className="border-b border-line py-4 md:border-e md:border-b-0 md:px-5">
            <div className="font-mono text-[11px] font-semibold tracking-[0.12em] text-fg-muted uppercase">{t({ en: "Where", tr: "Nerede" })}</div>
            <div className="mt-1.5 text-lg font-semibold text-fg">Kalafat Hall</div>
            <a href="#venue" className="rounded-ui-sm font-mono text-xs text-fg-muted underline decoration-line underline-offset-4 hover:text-fg focus-ring">
              {t({ en: "Hasköy, on the Golden Horn", tr: "Hasköy, Haliç kıyısında" })}
            </a>
          </div>
          <div className="@container py-4 md:ps-5">
            <div className="mb-2 font-mono text-[11px] font-semibold tracking-[0.12em] text-fg-muted uppercase">{t({ en: "Opening keynote in", tr: "Açılış konuşmasına" })}</div>
            <Countdown
              to={STARTS_AT}
              locale={intl}
              labels={{
                days: t({ en: "Days", tr: "Gün" }),
                hours: t({ en: "Hours", tr: "Saat" }),
                minutes: t({ en: "Min", tr: "Dk" }),
                seconds: t({ en: "Sec", tr: "Sn" }),
                live: t({ en: "Live now — see you in Dock A", tr: "Şu an canlı — Dok A’da görüşürüz" }),
                summary: t({ en: `The opening keynote starts on ${f.date(DAYS[0], { day: "numeric", month: "long", year: "numeric" })} at ${time("09:30")}, Istanbul time.`, tr: `Açılış konuşması ${f.date(DAYS[0], { day: "numeric", month: "long", year: "numeric" })} saat ${time("09:30")}’da (İstanbul saati) başlıyor.` }),
              }}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}

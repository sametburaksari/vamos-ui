import { Button } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { clubs, competitions, GROUND, matches, nextMatch, photos, SHORT, TICKETS_EMAIL, type Copy } from "./content";
import { Hoops } from "./crest";
import { FormGuide } from "./form-guide";

/**
 * Club home hero: the name set as a matchday poster, the floodlit photo in a hooped frame, the
 * next fixture as a ruled ticket stub and the last three results underneath.
 */
export function ClubHero({ c }: { c: Copy }) {
  const { t, f, time } = c;
  const opp = clubs[nextMatch.opponent]!;
  const comp = competitions.find((x) => x.id === nextMatch.comp)!;
  const outcome = { W: t({ en: "Win", tr: "Galibiyet" }), D: t({ en: "Draw", tr: "Beraberlik" }), L: t({ en: "Loss", tr: "Mağlubiyet" }) };
  const last = matches
    .filter((m) => m.team === "men" && m.score)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <Section anchor="top" headingId="hc-hero-title" className="overflow-hidden" theme={{ rhythm: "tight" }}>
      <Container>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-x-10">
          <div className="flex flex-col justify-end lg:col-span-8">
            <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs tracking-wide text-fg-muted">
              <span>{t({ en: "Est. 1923", tr: "Kuruluş 1923" })}</span>
              <span aria-hidden className="h-3 w-px bg-line" />
              <span>{t({ en: "The Pilots", tr: "Pilotlar" })}</span>
              <span aria-hidden className="h-3 w-px bg-line" />
              <span>{t({ en: "Member-owned since 1998", tr: "1998’den beri üyelerin" })}</span>
            </p>
            <h1 id="hc-hero-title" className="m-0 mt-5 font-display text-[clamp(4.25rem,15cqi,13.5rem)] leading-[0.82] tracking-[-0.01em] text-fg uppercase">
              Harbor
              <br />
              City <span className="text-accent-ink">FC</span>
            </h1>
            <p className="m-0 mt-6 max-w-[46ch] text-lead text-fg-muted">
              {t({
                en: "A harbour-town football club, owned by 3,212 members and second in the Coastal League. Saturdays at The Quayside, 15:00, since before the ferry terminal.",
                tr: "3.212 üyesine ait, Sahil Ligi’nde ikinci sıradaki bir liman kenti kulübü. Cumartesileri saat 15:00’te The Quayside’dayız; vapur iskelesinden bile eskiyiz.",
              })}
            </p>
          </div>

          <figure className="relative m-0 lg:col-span-4">
            <div className="relative aspect-[4/5] max-h-[34rem] w-full overflow-hidden rounded-ui-sm border-2 border-fg bg-surface-2 max-lg:aspect-[16/10]">
              <img src={photos.floodlights.src} width={photos.floodlights.width} height={photos.floodlights.height} alt={t(photos.floodlights.alt)} className="size-full object-cover" fetchPriority="high" />
              <Hoops className="absolute inset-x-0 bottom-0 h-[70px] opacity-95" />
            </div>
            <figcaption className="mt-2 font-mono text-[11px] text-fg-muted">{t({ en: "Under the lights at The Quayside", tr: "The Quayside’da ışıklar altında" })}</figcaption>
          </figure>
        </div>

        {/* Next match: a ticket stub. */}
        <div className="mt-10 grid border-2 border-fg bg-surface md:grid-cols-[1.4fr_1fr_auto]" data-next-match="">
          <div className="grid gap-1 border-b-2 border-fg p-5 md:border-e-2 md:border-b-0">
            <p className="m-0 flex flex-wrap items-center gap-2 font-mono text-[11px] tracking-wide text-fg-muted">
              <span className="rounded-ui-sm bg-accent px-1.5 py-0.5 font-semibold text-accent-fg">{t({ en: "Next match", tr: "Sıradaki maç" })}</span>
              {t(comp.name)} · {nextMatch.round ? t(nextMatch.round) : null}
            </p>
            <h2 className="m-0 mt-1 font-display text-display-m text-fg uppercase">
              {opp.name} <span className="text-fg-muted normal-case">v</span> {SHORT}
            </h2>
          </div>
          <dl className="m-0 grid grid-cols-2 gap-4 border-b-2 border-fg p-5 md:border-e-2 md:border-b-0">
            <div>
              <dt className="font-mono text-[11px] text-fg-muted">{f.date(nextMatch.date, { weekday: "long" })}</dt>
              <dd className="m-0 font-display text-3xl leading-none text-fg tabular">{f.date(nextMatch.date, { day: "numeric", month: "short" })}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] text-fg-muted">{t({ en: "Kick-off", tr: "Başlama" })}</dt>
              <dd className="m-0 font-display text-3xl leading-none text-fg tabular">{time(nextMatch.kickoff)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="sr-only">{t({ en: "Ground", tr: "Saha" })}</dt>
              <dd className="m-0 text-small text-fg-muted">
                {opp.ground} · {t({ en: "away end, 412 seats for Pilots fans", tr: "deplasman bölümü, Pilotlara 412 koltuk" })}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap items-center gap-3 p-5 md:flex-col md:items-stretch md:justify-center">
            <Button asChild variant="primary" size="lg">
              <a href={`mailto:${TICKETS_EMAIL}?subject=${encodeURIComponent("Away tickets: Saltmarsh")}`}>{t({ en: "Away tickets", tr: "Deplasman bileti" })}</a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href={sitePageHref("fixtures")}>
                {t({ en: "All fixtures", tr: "Tüm fikstür" })}
                <ArrowRight aria-hidden />
              </a>
            </Button>
          </div>
        </div>

        {/* Last three results. */}
        <section aria-labelledby="hc-last-title" className="mt-8">
          <h2 id="hc-last-title" className="m-0 font-mono text-[11px] font-semibold tracking-wide text-fg-muted">
            {t({ en: "Last three", tr: "Son üç maç" })}
          </h2>
          <ol className="m-0 mt-3 grid list-none gap-0 p-0 sm:grid-cols-3">
            {last.map((m) => {
              const o = m.score![0] > m.score![1] ? "W" : m.score![0] === m.score![1] ? "D" : "L";
              const other = clubs[m.opponent]!.name;
              return (
                <li key={m.id} className="flex items-center justify-between gap-4 border-t border-line py-3 sm:border-s sm:border-t-0 sm:px-5 sm:first:border-s-0 sm:first:ps-0">
                  <div className="min-w-0">
                    <p className="m-0 font-mono text-[11px] text-fg-muted">
                      {f.date(m.date, { day: "numeric", month: "short" })} · {m.home ? GROUND : clubs[m.opponent]!.ground}
                    </p>
                    <p className="m-0 truncate font-display text-xl leading-tight text-fg">
                      {m.home ? `${SHORT} ${m.score![0]}–${m.score![1]} ${other}` : `${other} ${m.score![1]}–${m.score![0]} ${SHORT}`}
                    </p>
                  </div>
                  <FormGuide form={[o]} labels={outcome} />
                </li>
              );
            })}
          </ol>
        </section>
      </Container>
    </Section>
  );
}

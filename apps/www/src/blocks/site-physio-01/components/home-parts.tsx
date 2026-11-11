"use client";

import { Container, Section } from "@vamos-ui/react/blocks";
import { AreaChips, AreaPanel, BodyFigure, mapCopy } from "./body-map";
import { useArea } from "./area-provider";

const c = {
  eyebrow: { en: "Physiotherapy · Suadiye, Kadıköy", tr: "Fizyoterapi · Suadiye, Kadıköy" },
  title: { en: "Back to *moving* without thinking about it", tr: "Düşünmeden *hareket etmeye* geri dönün" },
  lead: {
    en: "Assessment, hands-on treatment and a gym on the same floor. Pick where it hurts — the figure shows what we usually do for it, how long it takes and what it costs.",
    tr: "Değerlendirme, manuel tedavi ve aynı katta bir spor salonu. Ağrıyan yeri seçin — figür, genellikle ne yaptığımızı, ne kadar sürdüğünü ve ücretini gösterir.",
  },
  stats: [
    { v: "07:30", l: { en: "first appointment, weekdays", tr: "ilk randevu, hafta içi" } },
    { v: "45", l: { en: "minutes, never double-booked", tr: "dakika, asla çift randevu yok" } },
    { v: "1:1", l: { en: "physio in the gym with you", tr: "salonda yanınızda fizyoterapist" } },
  ],
};

const em = (s: string) => s.split("*").map((p, i) => (i === 1 ? <span key={i} className="text-accent-ink">{p}</span> : p));

/**
 * Home hero = the signature. A dark lab panel: headline and area chips on the start side, the
 * mannequin with hotspots in the middle, the selected area's treatments on the end side.
 */
export function PhysioHero() {
  const { t } = useArea();
  return (
    <Section aria-labelledby="ml-hero-title" theme={{ mode: "dark", rhythm: "tight" }} className="overflow-hidden">
      <Container>
        <div className="grid gap-10 @4xl:grid-cols-12 @4xl:gap-8">
          <div className="flex min-w-0 flex-col gap-6 @4xl:col-span-5 @4xl:pt-4">
            <p className="font-mono text-xs tracking-[0.12em] text-fg-muted uppercase">
              <span aria-hidden className="me-2 inline-block size-2 translate-y-[-1px] bg-accent" />
              {t(c.eyebrow)}
            </p>
            <h1 id="ml-hero-title" className="font-display text-display-l text-balance text-fg uppercase">
              {em(t(c.title))}
            </h1>
            <p className="max-w-[46ch] text-fg-muted">{t(c.lead)}</p>
            <div className="mt-2 flex flex-col gap-3">
              <p className="text-small font-semibold text-fg">{t(mapCopy.where)}</p>
              <AreaChips />
            </div>
            <dl className="mt-4 grid grid-cols-3 border-t border-line pt-4">
              {c.stats.map((s, i) => (
                <div key={i} className="flex flex-col gap-1 pe-3">
                  <dt className="order-2 text-xs text-fg-muted">{t(s.l)}</dt>
                  <dd className="order-1 font-mono text-h3 text-fg tabular">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <BodyFigure className="@4xl:col-span-3 @4xl:pt-2" />
          <div className="rounded-[var(--radius)] border border-line bg-surface p-5 @md:p-6 @4xl:col-span-4">
            <AreaPanel />
          </div>
        </div>
      </Container>
    </Section>
  );
}

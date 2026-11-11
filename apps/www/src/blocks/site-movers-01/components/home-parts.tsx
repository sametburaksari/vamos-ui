"use client";

import * as React from "react";
import { Button, Field, RadioGroup } from "@vamos-ui/react";
import { Container, Section } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { useQuote } from "./quote-provider";
import { DEFAULT_QUOTE, quote, sizeName, sizes, tl, type HomeSize, type ServiceKind } from "./content";

const c = {
  eyebrow: { en: "Home moves & cleaning · İstanbul", tr: "Ev taşıma ve temizlik · İstanbul" },
  title: { en: "Moves measured, not guessed.", tr: "Tahmin değil, ölçüyle taşınma." },
  lead: { en: "Tell us the size, the floors and the distance. You get a price range in a minute and a fixed price the next working day — crews, trucks and cleaners from one company.", tr: "Büyüklüğü, katları ve mesafeyi söyleyin. Bir dakikada fiyat aralığı, ertesi iş günü sabit fiyat — ekip, kamyon ve temizlik tek firmadan." },
  quick: { en: "Quick estimate", tr: "Hızlı tahmin" },
  service: { en: "Service", tr: "Hizmet" },
  size: { en: "Home size", tr: "Ev büyüklüğü" },
  move: { en: "Move", tr: "Taşınma" },
  clean: { en: "Clean", tr: "Temizlik" },
  both: { en: "Both", tr: "İkisi" },
  from: { en: "From", tr: "Başlangıç" },
  fromHint: { en: "Weekday, lifts at both ends, 14 km", tr: "Hafta içi, iki uçta asansör, 14 km" },
  exact: { en: "Get my exact quote", tr: "Kesin teklifimi al" },
  plan: { en: "Floor plan of a 2+1 flat with measured rooms", tr: "Ölçülü odalarıyla 2+1 dairenin kat planı" },
  living: { en: "Living", tr: "Salon" },
  bed1: { en: "Bed 1", tr: "Yatak 1" },
  bed2: { en: "Bed 2", tr: "Yatak 2" },
  kitchen: { en: "Kitchen", tr: "Mutfak" },
  bath: { en: "Bath", tr: "Banyo" },
};

/** A 2+1 floor plan drawn in tokens, with dimension lines like a survey sheet. */
function FloorPlan({ label, volume }: { label: string; volume: number }) {
  const { t } = useQuote();
  const room = "fill-none stroke-fg";
  const txt = "fill-fg-muted font-mono text-[11px] uppercase tracking-[0.12em]";
  const dim = "fill-accent-ink font-mono text-[10px]";
  return (
    <svg viewBox="0 0 440 300" role="img" aria-label={label} className="h-auto w-full">
      <g className={room} strokeWidth={3}>
        <rect x="20" y="30" width="380" height="240" />
      </g>
      <g className={room} strokeWidth={1.5}>
        <path d="M220 30 V160 M20 160 H300 M300 160 V270 M220 160 V270 M140 30 V160" />
      </g>
      <g className="stroke-accent" strokeWidth={6} strokeLinecap="butt">
        <path d="M170 160 H200 M250 160 H280 M140 90 V120" />
      </g>
      <text x="300" y="100" textAnchor="middle" className={txt}>{t(c.living)}</text>
      <text x="80" y="100" textAnchor="middle" className={txt}>{t(c.bed1)}</text>
      <text x="180" y="100" textAnchor="middle" className={txt}>{t(c.bed2)}</text>
      <text x="120" y="220" textAnchor="middle" className={txt}>{t(c.kitchen)}</text>
      <text x="260" y="220" textAnchor="middle" className={txt}>{t(c.bath)}</text>
      <g className="stroke-accent" strokeWidth={1}>
        <path d="M20 14 H400 M20 9 V19 M400 9 V19" />
        <path d="M410 30 V270 M405 30 H415 M405 270 H415" />
      </g>
      <text x="210" y="11" textAnchor="middle" className={dim}>{t({ en: "11.40 m", tr: "11,40 m" })}</text>
      <text x="424" y="150" className={dim} transform="rotate(90 424 150)" textAnchor="middle">{t({ en: "7.20 m", tr: "7,20 m" })}</text>
      <g className="fill-accent/15 stroke-accent" strokeWidth={1} strokeDasharray="3 3">
        <rect x="310" y="180" width="80" height="80" />
      </g>
      <text x="350" y="224" textAnchor="middle" className={dim}>~{volume} m³</text>
    </svg>
  );
}

export function MoversHero() {
  const { t, locale, start } = useQuote();
  const [kind, setKind] = React.useState<ServiceKind>("move");
  const [size, setSize] = React.useState<HomeSize>("2+1");
  const est = quote({ ...DEFAULT_QUOTE, kind, size, fromLift: true, toLift: true, km: 14 });

  return (
    <Section aria-labelledby="tf-hero-title" className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:32px_32px] opacity-50 [mask-image:radial-gradient(ellipse_at_70%_40%,black,transparent_70%)]" />
      <Container className="relative">
        <div className="grid items-center gap-12 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @5xl:gap-16">
          <div className="flex flex-col gap-7">
            <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-accent-ink">{t(c.eyebrow)}</p>
            <h1 id="tf-hero-title" className="font-display text-display-xl font-semibold tracking-[-0.025em] text-balance text-fg">
              {t(c.title)}
            </h1>
            <p className="max-w-[50ch] text-lead text-fg-muted">{t(c.lead)}</p>
          </div>
          <div className="surface-popover flex flex-col gap-6 rounded-ui-lg p-5 @md:p-7">
            <FloorPlan label={t(c.plan)} volume={sizes.find((x) => x.id === size)!.volume} />
            <div className="flex flex-col gap-5 border-t border-line pt-5">
              <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg-muted">{t(c.quick)}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-4">
                <Field label={t(c.service)}>
                  <RadioGroup variant="segmented" value={kind} onValueChange={(v) => setKind(v as ServiceKind)} items={[{ value: "move", label: t(c.move) }, { value: "clean", label: t(c.clean) }, { value: "both", label: t(c.both) }]} />
                </Field>
                <Field label={t(c.size)}>
                  <RadioGroup variant="segmented" value={size} onValueChange={(v) => setSize(v as HomeSize)} items={sizes.map((s) => ({ value: s.id, label: t(sizeName(s.id)) }))} />
                </Field>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col" aria-live="polite">
                  <span className="text-xs text-fg-muted">{t(c.from)}</span>
                  <span className="font-display text-[2.25rem] font-semibold leading-none tabular tracking-tight text-fg" data-testid="tf-hero-from">
                    {tl(est.low, locale)}
                  </span>
                  <span className="mt-1 text-xs text-fg-muted">{t(c.fromHint)}</span>
                </div>
                <Button variant="primary" size="lg" onClick={() => start({ kind, size, fromLift: true, toLift: true, km: 14 })}>
                  {t(c.exact)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

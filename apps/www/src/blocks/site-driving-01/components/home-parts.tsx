"use client";

import * as React from "react";
import { buttonVariants, cn } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { useCourse } from "./course-provider";
import { courses, fill, licences, tl, weeksFor } from "./content";

const c = {
  eyebrow: { en: "Driving school · Ataşehir · since 2014", tr: "Sürücü kursu · Ataşehir · 2014’ten beri" },
  title: { en: "Pass first time. Stay calm doing it.", tr: "İlk seferde geçin. Sakin kalarak." },
  lead: { en: "Patient instructors, dual-control cars and the real test route from your fourth lesson. Pick a course by how fast you want to go — the comparison shows exactly what each one includes.", tr: "Sabırlı eğitmenler, çift kumandalı araçlar ve dördüncü dersten itibaren gerçek sınav güzergâhı. Kursu ne kadar hızlı ilerlemek istediğinize göre seçin — karşılaştırma her birinin içeriğini tam olarak gösterir." },
  compare: { en: "Compare courses", tr: "Kursları karşılaştır" },
  trial: { en: "Free 30-minute trial lesson", tr: "Ücretsiz 30 dakikalık deneme dersi" },
  route: { en: "Today’s test route", tr: "Bugünkü sınav güzergâhı" },
  routeHint: { en: "We drive it in every mock test.", tr: "Her deneme sınavında bu yolu süreriz." },
  stops: [
    { en: "Roundabout, Kayışdağı junction", tr: "Kayışdağı kavşağı, göbek" },
    { en: "Hill start on Yeşil Sokak", tr: "Yeşil Sokak’ta rampa kalkışı" },
    { en: "Parallel park, two-car gap", tr: "İki araç boşluğa paralel park" },
    { en: "Emergency stop on signal", tr: "İşaretle ani duruş" },
  ],
  lanesEyebrow: { en: "Three ways to a licence", tr: "Ehliyete üç yol" },
  lanesTitle: { en: "Choose your lane", tr: "Şeridinizi seçin" },
  lanesLead: { en: "The bar is how long each course takes at three lessons a week. Change the pace and licence on the comparison.", tr: "Çubuk, haftada üç dersle her kursun ne kadar sürdüğünü gösterir. Hızı ve ehliyet sınıfını karşılaştırmada değiştirin." },
  lessons: { en: "{n} lessons", tr: "{n} ders" },
  weeks: { en: "{n} wk", tr: "{n} hf" },
  signFor: { en: "Sign up for {name}", tr: "{name} kursuna kayıt ol" },
  full: { en: "See the full comparison", tr: "Tam karşılaştırmayı gör" },
};

// A winding road through four test manoeuvres; points are the pins on the path.
const ROAD = "M24 300 C120 300 120 210 210 200 S330 120 300 70 S390 20 470 60 S560 200 500 250 S560 330 640 300";
const PINS = [
  { x: 210, y: 200 },
  { x: 300, y: 72 },
  { x: 500, y: 250 },
  { x: 618, y: 302 },
];

/** Split hero: a big statement and a test-route card with linked pins and stops. */
export function DrivingHero() {
  const { t } = useCourse();
  const [active, setActive] = React.useState<number | null>(null);
  return (
    <Section aria-labelledby="cr-hero-title" className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 @5xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @5xl:gap-16">
          <div className="flex flex-col gap-8">
            <p className="flex items-center gap-3 text-small font-medium text-fg-muted">
              <span aria-hidden className="grid size-8 place-items-center rounded-ui-sm border-2 border-accent bg-surface font-display text-lg font-black text-accent-ink">
                L
              </span>
              {t(c.eyebrow)}
            </p>
            <h1 id="cr-hero-title" className="font-display text-[clamp(2.5rem,6.4cqi,5.25rem)] font-black leading-[0.95] tracking-[-0.035em] text-balance text-fg">
              {t(c.title)}
            </h1>
            <p className="max-w-[50ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="flex flex-wrap gap-3">
              <a href={sitePageHref("courses")} className={buttonVariants({ variant: "primary", size: "xl" })}>
                {t(c.compare)}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </a>
              <a href={sitePageHref("signup")} className={buttonVariants({ variant: "ghost", size: "xl" })}>
                {t(c.trial)}
              </a>
            </div>
          </div>

          <figure className="surface flex flex-col gap-5 rounded-ui-lg p-5 @md:p-7">
            <figcaption className="flex items-baseline justify-between gap-4">
              <span className="font-display text-h3 font-extrabold tracking-tight text-fg">{t(c.route)}</span>
              <span className="text-xs text-fg-muted">{t(c.routeHint)}</span>
            </figcaption>
            <svg viewBox="0 0 664 340" role="img" aria-label={t(c.route)} className="h-auto w-full">
              <path d={ROAD} fill="none" className="stroke-line" strokeWidth={34} strokeLinecap="round" />
              <path d={ROAD} fill="none" className="stroke-fg/80" strokeWidth={26} strokeLinecap="round" />
              <path d={ROAD} fill="none" className="stroke-surface" strokeWidth={2.5} strokeDasharray="14 12" />
              {PINS.map((p, i) => (
                <g key={i} className="transition-transform duration-200 motion-reduce:transition-none" style={{ transformOrigin: `${p.x}px ${p.y}px`, transform: active === i ? "scale(1.25)" : undefined }}>
                  <circle cx={p.x} cy={p.y} r={17} className={cn(active === null || active === i ? "fill-accent" : "fill-accent/40")} />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" className="fill-accent-fg font-display text-[15px] font-black">
                    {i + 1}
                  </text>
                </g>
              ))}
            </svg>
            <ol className="grid gap-x-6 gap-y-1 @md:grid-cols-2">
              {c.stops.map((s, i) => (
                <li key={s.en}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-pressed={active === i}
                    className="flex w-full items-baseline gap-3 rounded-ui-sm px-2 py-1.5 text-start text-small text-fg hover:bg-hover focus-ring"
                  >
                    <span className="font-display font-black tabular text-accent-ink">{i + 1}</span>
                    {t(s)}
                  </button>
                </li>
              ))}
            </ol>
          </figure>
        </div>
      </Container>
    </Section>
  );
}

/** Courses as road lanes: bar length = weeks to test at three lessons a week. */
export function CourseLanes() {
  const { t, locale, licence, signUp } = useCourse();
  const max = Math.max(...courses.map((x) => weeksFor(x, licence, 3)));
  return (
    <Section anchor="courses" headingId="cr-lanes-title" theme={{ surface: "surface-2" }}>
      <Container>
        <div className="mb-10 grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @4xl:items-end">
          <div className="flex flex-col gap-3">
            <p className="text-small font-medium text-accent-ink">{t(c.lanesEyebrow)}</p>
            <h2 id="cr-lanes-title" className="font-display text-display-l font-black tracking-[-0.03em] text-fg">
              {t(c.lanesTitle)}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3">
            <p className="max-w-[48ch] text-fg-muted">{t(c.lanesLead)}</p>
            <span className="rounded-full border border-line px-3 py-1 text-xs text-fg">{t(licences.find((l) => l.id === licence)!.name)}</span>
          </div>
        </div>
        <ul className="flex flex-col">
          {courses.map((x) => {
            const w = weeksFor(x, licence, 3);
            return (
              <li key={x.id} className="grid gap-3 border-t border-line py-6 @3xl:grid-cols-[12rem_minmax(0,1fr)_7rem_10rem] @3xl:items-center @3xl:gap-8">
                <div className="flex flex-col">
                  <span className="font-display text-h3 font-black tracking-tight text-fg">{t(x.name)}</span>
                  <span className="text-xs text-fg-muted">{fill(t(c.lessons), { n: x.lessons[licence] })}</span>
                </div>
                <div className="relative h-10 overflow-hidden rounded-ui-sm bg-fg/85" aria-hidden>
                  <div className="absolute inset-y-0 start-0 bg-accent transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(w / max) * 100}%` }} />
                  <div className="absolute inset-x-3 top-1/2 h-[3px] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,var(--surface)_0_18px,transparent_18px_32px)]" />
                </div>
                <p className="flex items-baseline gap-3 @3xl:flex-col @3xl:items-end @3xl:gap-0">
                  <span className="font-display text-h3 font-black tabular text-fg">{fill(t(c.weeks), { n: w })}</span>
                  <span className="text-small tabular text-fg-muted">{tl(x.price[licence], locale)}</span>
                </p>
                <button type="button" onClick={() => signUp(x.id)} aria-label={fill(t(c.signFor), { name: t(x.name) })} className={cn(buttonVariants({ variant: x.recommended ? "primary" : "secondary", size: "sm" }), "justify-self-start @3xl:justify-self-end")}>
                  {t(x.name)}
                  <ArrowRight aria-hidden className="rtl:rotate-180" />
                </button>
              </li>
            );
          })}
        </ul>
        <a href={sitePageHref("courses")} className={cn(buttonVariants({ variant: "link" }), "mt-6")}>
          {t(c.full)}
          <ArrowRight aria-hidden className="rtl:rotate-180" />
        </a>
      </Container>
    </Section>
  );
}

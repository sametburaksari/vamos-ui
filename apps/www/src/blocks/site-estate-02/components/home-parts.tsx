"use client";

import * as React from "react";
import { Image, cn } from "@vamos-ui/react";
import { BlockHeading, Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Pause, Play } from "lucide-react";
import { eur, fill, num, photos, reel, residenceById, type Residence } from "./content";
import { SlowReveal, useEstate } from "./estate-provider";
import { Parallax } from "@vamos-ui/react/motion";

const c = {
  eyebrow: { en: "Vellacourt · Private residences, Istanbul", tr: "Vellacourt · Özel konutlar, İstanbul" },
  title: { en: "Houses that *take their time*", tr: "*Acele etmeyen* evler" },
  lead: { en: "A private office of six people. Around eleven houses a year, most of them never advertised.", tr: "Altı kişilik bir özel ofis. Yılda on bir kadar ev; çoğu hiç ilan edilmez." },
  chapters: { en: "Residences in the film", tr: "Filmdeki konutlar" },
  show: { en: "— {name}", tr: "— {name}" },
  pause: { en: "Pause the film", tr: "Filmi duraklat" },
  play: { en: "Play the film", tr: "Filmi oynat" },
  view: { en: "View the residence", tr: "Konutu inceleyin" },
  onRequest: { en: "Price on request", tr: "Fiyat talep üzerine" },
  beds: { en: "{n} bedrooms", tr: "{n} yatak odası" },
  sqm: { en: "{n} m²", tr: "{n} m²" },
  introEyebrow: { en: "The office", tr: "Ofis" },
  intro: {
    en: "We started Vellacourt in 2009 with a simple rule: sell fewer houses, and know each one completely. Every residence we take on has been walked, measured and photographed by us, in every season — and is shown only by the person who knows it best.",
    tr: "Vellacourt’u 2009’da basit bir kuralla kurduk: daha az ev satmak ve her birini eksiksiz tanımak. Üstlendiğimiz her konutu her mevsimde kendimiz gezer, ölçer ve fotoğraflarız — ve onu yalnızca en iyi tanıyan kişi gösterir.",
  },
  sign: { en: "— Selin Varol & Teoman Aker, founders", tr: "— Selin Varol ve Teoman Aker, kurucular" },
  featuredEyebrow: { en: "Now offered", tr: "Şimdi sunulanlar" },
  featuredTitle: { en: "Three houses, *seen slowly*", tr: "Yavaşça *görülen* üç ev" },
  all: { en: "The whole collection", tr: "Tüm koleksiyon" },
  offEyebrow: { en: "Off-market", tr: "Piyasa dışı" },
  offTitle: { en: "Two in three of our sales are *never online*", tr: "Satışlarımızın üçte ikisi *hiç internette* görünmez" },
  offBody: { en: "Registered buyers receive a private letter when a house that fits their brief comes to us — usually weeks before anyone else hears of it. Registration takes one conversation.", tr: "Kayıtlı alıcılar, aradıkları özelliklere uyan bir ev bize geldiğinde özel bir mektup alır — genellikle başkaları duymadan haftalar önce. Kayıt tek bir görüşme sürer." },
  offCta: { en: "Register as a buyer", tr: "Alıcı olarak kaydolun" },
};

const CHAPTER_MS = 9000;

/**
 * The film: full-bleed residences crossfading slowly while each one drifts in (a 12-second
 * zoom). Chapter list with a progress hairline, a pause button (WCAG 2.2.2), arrow keys.
 * Reduced motion: no drift, no autoplay.
 */
export function ResidenceFilm() {
  const { t, locale, open } = useEstate();
  const items = reel.map(residenceById);
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [reduced, setReduced] = React.useState(true);
  const barRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(r);
    setPlaying(!r);
  }, []);

  React.useEffect(() => {
    if (!playing) return;
    const bar = barRef.current?.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: CHAPTER_MS, easing: "linear", fill: "forwards" });
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % items.length), CHAPTER_MS);
    return () => {
      window.clearTimeout(id);
      bar?.cancel();
    };
  }, [playing, index, items.length]);

  const current = items[index]!;
  return (
    <Section
      theme={{ mode: "dark" }}
      aria-labelledby="vc-film-title"
      className="relative isolate flex min-h-[max(42rem,100svh)] flex-col justify-end overflow-hidden !py-0"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
        if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
      }}
    >
      <div className="absolute inset-0 -z-10 bg-scene">
        {items.map((r, i) => (
          <div
            key={r.id}
            aria-hidden={i !== index}
            className="absolute inset-0"
            style={{
              opacity: i === index ? 1 : 0,
              transform: !reduced && i === index ? "scale(1.09)" : "scale(1)",
              transition: reduced ? "opacity .4s ease" : `opacity 2.6s cubic-bezier(.4,0,.2,1), transform ${i === index ? 14 : 3}s linear`,
            }}
          >
            <Image src={r.hero.src} width={r.hero.width} height={r.hero.height} alt={i === index ? t(r.hero.alt) : ""} focal={r.hero.focal} priority={i === 0} sizes="100vw" className="size-full" imgClassName="size-full object-cover" />
          </div>
        ))}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--scene)_94%,transparent)_0%,color-mix(in_oklch,var(--scene)_72%,transparent)_42%,transparent_78%),linear-gradient(to_right,color-mix(in_oklch,var(--scene)_45%,transparent),transparent_60%),linear-gradient(to_bottom,color-mix(in_oklch,var(--scene)_60%,transparent),transparent_22%)]" />
      </div>

      <Container className="relative pb-10 pt-40 @3xl:pb-14">
        <div className="grid gap-10 @5xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] @5xl:items-end">
          <div className="flex flex-col gap-6">
            <p className="vm-enter text-small uppercase tracking-[0.22em] text-fg">{t(c.eyebrow)}</p>
            <BlockHeading id="vc-film-title" level={1} size="display-2xl" text={t(c.title)} className="vm-enter vm-enter-title max-w-[12ch] text-fg [--vm-i:1]" />
            <p className="vm-enter max-w-[42ch] text-lead text-fg [--vm-i:2]">{t(c.lead)}</p>
          </div>

          <div className="vm-enter flex flex-col gap-5 [--vm-i:3]">
            <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
              <div className="min-w-0" aria-live="polite">
                <p className="font-display text-[1.6rem] leading-tight text-fg">{current.name}</p>
                <p className="text-small text-fg-muted">
                  {t(current.place)} · {current.price ? eur(current.price, locale) : t(c.onRequest)}
                </p>
              </div>
              <button type="button" onClick={() => open(current.id)} className="vm-nudge inline-flex shrink-0 items-center gap-2 text-small font-medium text-fg underline decoration-line underline-offset-[6px] hover:decoration-current focus-ring rounded-[2px]">
                {t(c.view)} <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <ol aria-label={t(c.chapters)} className="grid flex-1 grid-cols-4 gap-3">
                {items.map((r, i) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-current={i === index ? "true" : undefined}
                      className="group flex w-full flex-col gap-2 py-1 text-start focus-ring rounded-[2px]"
                    >
                      <span className="relative block h-px w-full overflow-hidden bg-line">
                        {i === index ? <span ref={barRef} className="absolute inset-0 origin-left bg-fg" style={{ transform: playing ? "scaleX(0)" : "scaleX(1)" }} /> : i < index ? <span className="absolute inset-0 bg-fg-muted" /> : null}
                      </span>
                      <span className={cn("font-code text-[0.7rem] tabular-nums tracking-wider transition-colors", i === index ? "text-fg" : "text-fg-subtle group-hover:text-fg-muted")}>{String(i + 1).padStart(2, "0")}</span>
                      <span className="sr-only">{fill(t(c.show), { name: r.name })}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? t(c.pause) : t(c.play)} className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-fg transition-colors hover:bg-hover focus-ring">
                {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
              </button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function OfficeIntro() {
  const { t } = useEstate();
  return (
    <Section aria-label={t(c.introEyebrow)}>
      <Container>
        <SlowReveal className="grid gap-8 @4xl:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]">
          <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(c.introEyebrow)}</p>
          <div className="flex flex-col gap-8">
            <p className="font-display text-[clamp(1.6rem,1rem+2.4cqi,3.1rem)] leading-[1.18] text-fg text-pretty">{t(c.intro)}</p>
            <p className="text-small text-fg-muted">{t(c.sign)}</p>
          </div>
        </SlowReveal>
      </Container>
    </Section>
  );
}

function Facts({ r }: { r: Residence }) {
  const { t, locale } = useEstate();
  return (
    <p className="flex flex-wrap gap-x-5 gap-y-1 text-small text-fg-muted tabular-nums">
      <span>{fill(t(c.sqm), { n: num(r.area, locale) })}</span>
      <span>{fill(t(c.beds), { n: r.bedrooms })}</span>
      <span className="text-fg">{r.price ? eur(r.price, locale) : t(c.onRequest)}</span>
    </p>
  );
}

/** Featured: one full-bleed photograph per house, editorial caption underneath. No cards. */
export function FeaturedHouses() {
  const { t, open } = useEstate();
  const list = ["korusu", "macka", "gumusluk"].map(residenceById);
  return (
    <Section anchor="residences" aria-labelledby="vc-featured-title" className="!pb-8">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="flex flex-col gap-4">
            <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(c.featuredEyebrow)}</p>
            <BlockHeading id="vc-featured-title" level={2} size="display-l" text={t(c.featuredTitle)} />
          </div>
          <a href={sitePageHref("collection")} className="vm-nudge inline-flex items-center gap-2 text-small font-medium text-fg underline decoration-line underline-offset-[6px] hover:decoration-current focus-ring rounded-[2px]">
            {t(c.all)} <ArrowRight aria-hidden className="size-4" />
          </a>
        </div>
      </Container>
      <div className="mt-14 flex flex-col gap-20 @4xl:gap-28">
        {list.map((r, i) => (
          <article key={r.id} aria-labelledby={`vc-f-${r.id}`}>
            <SlowReveal effect="clip">
              <button type="button" onClick={() => open(r.id)} className="group block w-full overflow-hidden focus-ring" aria-labelledby={`vc-f-${r.id}`}>
                <Image src={r.hero.src} width={r.hero.width} height={r.hero.height} alt={t(r.hero.alt)} focal={r.hero.focal} aspect="21/9" sizes="100vw" className="w-full @max-3xl:aspect-[4/5]!" imgClassName="transition-transform duration-[2400ms] ease-out motion-safe:group-hover:scale-[1.035]" />
              </button>
            </SlowReveal>
            <Container>
              <div className="mt-6 grid gap-4 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,6fr)_minmax(0,5fr)] @4xl:items-baseline">
                <span className="font-code text-small text-fg-subtle tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex flex-col gap-1">
                  <h3 id={`vc-f-${r.id}`} className="font-display text-display-m leading-none text-fg">
                    {r.name}
                  </h3>
                  <p className="text-fg-muted">{t(r.place)}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <p className="text-fg text-pretty">{t(r.line)}</p>
                  <Facts r={r} />
                </div>
              </div>
            </Container>
          </article>
        ))}
      </div>
    </Section>
  );
}

/** Dark band over a still photograph: the off-market register. */
export function OffMarketBand() {
  const { t } = useEstate();
  return (
    <Section theme={{ mode: "dark" }} aria-labelledby="vc-off-title" className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Parallax shift={64} className="size-full">
          <Image src={photos.library.src} width={photos.library.width} height={photos.library.height} alt="" sizes="100vw" className="size-full" imgClassName="size-full object-cover" />
        </Parallax>
        <div className="absolute inset-0 bg-[color-mix(in_oklch,var(--scene)_80%,transparent)]" />
      </div>
      <Container>
        <SlowReveal className="grid gap-8 @4xl:grid-cols-[minmax(0,3fr)_minmax(0,9fr)]">
          <p className="text-small uppercase tracking-[0.22em] text-fg-muted">{t(c.offEyebrow)}</p>
          <div className="flex max-w-[52rem] flex-col items-start gap-6">
            <BlockHeading id="vc-off-title" level={2} size="display-l" text={t(c.offTitle)} className="text-fg" />
            <p className="max-w-[56ch] text-lead text-fg-muted">{t(c.offBody)}</p>
            <a href={sitePageHref("home", "contact")} className="vm-press vm-nudge inline-flex h-12 items-center gap-3 rounded-full bg-accent px-6 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 focus-ring">
              {t(c.offCta)} <ArrowRight aria-hidden className="size-4" />
            </a>
          </div>
        </SlowReveal>
      </Container>
    </Section>
  );
}

export { Facts };

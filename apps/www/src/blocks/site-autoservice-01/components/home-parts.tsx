"use client";

import * as React from "react";
import { buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { CountUp, Reveal, Stagger } from "@vamos-ui/react/motion";
import { useJob } from "./job-provider";
import { ServicePicker } from "./service-picker";
import { photos } from "./content";

const c = {
  eyebrow: { en: "Kozyatağı · five bays · since 2011", tr: "Kozyatağı · beş bölme · 2011’den beri" },
  title1: { en: "Drop it at", tr: "Sabah" },
  title2: { en: "Drive home by", tr: "Kahveden sonra" },
  title1b: { en: "08:30.", tr: "08:30’da bırak." },
  title2b: { en: "09:35.", tr: "09:35’te al." },
  lead: { en: "Servicing, tyres and a proper hand wash under one roof. Pick the work, see the exact time your car is ready and the price before you book — no call-backs, no guesswork.", tr: "Bakım, lastik ve gerçek bir elde yıkama tek çatı altında. İşleri seçin, aracınızın hazır olacağı saati ve fiyatı randevudan önce görün — geri arama yok, tahmin yok." },
  book: { en: "Book a bay", tr: "Bölme ayırt" },
  prices: { en: "Prices & times", tr: "Fiyatlar ve süreler" },
  board: { en: "Bay board · today", tr: "Bölme panosu · bugün" },
  live: { en: "Updated 08:52", tr: "08:52’de güncellendi" },
  stats: [
    { n: 9, before: { en: "", tr: "10’da " }, after: { en: " in 10", tr: "" }, v: { en: "cars ready on the quoted time", tr: "araç söylenen saatte hazır" } },
    { n: 2, before: { en: "", tr: "" }, after: { en: " years", tr: " yıl" }, v: { en: "warranty on parts and labour", tr: "parça ve işçilik garantisi" } },
    { n: 4.8, before: { en: "", tr: "" }, after: { en: " / 5", tr: " / 5" }, v: { en: "from 612 Google reviews", tr: "612 Google yorumundan" } },
  ],
  buildEyebrow: { en: "Build your job", tr: "İşinizi oluşturun" },
  buildTitle: { en: "Tick the work. Watch the clock.", tr: "İşleri seçin. Saati izleyin." },
  buildLead: { en: "Our most-booked jobs, timed for your car size. The full list with brakes, A/C and detailing is on the price page.", tr: "En çok ayırtılan işler, araç boyutunuza göre süreleriyle. Fren, klima ve detaylı temizlik dahil tam liste fiyat sayfasında." },
  all: { en: "See all 11 services", tr: "11 hizmetin tümü" },
};

const board = [
  { bay: "01", job: { en: "Oil & filter · A/C regas", tr: "Yağ-filtre · klima gazı" }, plate: "34 GL 0417", state: { en: "Ready 10:15", tr: "Hazır 10:15" }, tone: "ready" },
  { bay: "02", job: { en: "Front brake pads", tr: "Ön fren balatası" }, plate: "34 KZ 2286", state: { en: "On the lift", tr: "Lift’te" }, tone: "busy" },
  { bay: "03", job: { en: "Tyre swap · alignment", tr: "Lastik · rot ayarı" }, plate: "06 TR 5530", state: { en: "On the lift", tr: "Lift’te" }, tone: "busy" },
  { bay: "W1", job: { en: "Clay, polish & wax", tr: "Kil, pasta, cila" }, plate: "34 DY 7041", state: { en: "Ready 13:40", tr: "Hazır 13:40" }, tone: "ready" },
  { bay: "04", job: { en: "—", tr: "—" }, plate: "", state: { en: "Free from 11:00", tr: "11:00’den boş" }, tone: "free" },
] as const;

/** Dark, loud hero: the promise as two timestamps, and a live-looking bay board on the photo. */
export function GarageHero() {
  const { t, locale } = useJob();
  return (
    <Section aria-labelledby="gl-hero-title" className="relative overflow-hidden pb-0">
      <Container>
        <div className="grid gap-12 @5xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] @5xl:gap-16">
          <div className="flex flex-col gap-8 @5xl:py-6">
            <p className="vm-enter font-mono text-eyebrow uppercase tracking-[0.18em] text-accent-ink">{t(c.eyebrow)}</p>
            <h1 id="gl-hero-title" className="font-display text-[clamp(2.6rem,7.5cqi,6.25rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-fg">
              <span className="vm-enter block [--vm-i:1]">
                {t(c.title1)} <span className="tabular text-accent-ink">{t(c.title1b)}</span>
              </span>
              <span className="vm-enter block [--vm-i:2]">
                {t(c.title2)} <span className="tabular text-accent-ink">{t(c.title2b)}</span>
              </span>
            </h1>
            <p className="vm-enter max-w-[52ch] text-lead text-fg-muted [--vm-i:3]">{t(c.lead)}</p>
            <div className="vm-enter flex flex-wrap gap-3 [--vm-i:4]">
              <a href={sitePageHref("booking")} className={cn(buttonVariants({ variant: "primary", size: "xl" }), "vm-press")}>
                <CalendarCheck aria-hidden />
                {t(c.book)}
              </a>
              <a href={sitePageHref("services")} className={cn(buttonVariants({ variant: "secondary", size: "xl" }), "vm-press")}>
                {t(c.prices)}
              </a>
            </div>
          </div>

          <div className="vm-enter vm-enter-media relative min-h-[26rem] [--vm-i:1]">
            <Image src={photos.bay.src} width={photos.bay.width} height={photos.bay.height} alt={t(photos.bay.alt)} aspect="4/5" rounded="ui-lg" priority sizes="(min-width: 1024px) 40vw, 100vw" className="@5xl:absolute @5xl:inset-0 @5xl:h-full" imgClassName="grayscale-[35%]" />
            <div className="surface-popover relative -mt-24 mx-3 rounded-ui-lg p-4 @md:mx-6 @5xl:absolute @5xl:inset-x-auto @5xl:-start-10 @5xl:bottom-8 @5xl:mx-0 @5xl:mt-0 @5xl:w-[25rem]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-mono text-eyebrow uppercase tracking-[0.16em] text-fg">{t(c.board)}</p>
                <p className="inline-flex items-center gap-1.5 text-[11px] text-fg-muted">
                  <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-success motion-reduce:animate-none" />
                  {t(c.live)}
                </p>
              </div>
              <table className="w-full text-start font-mono text-xs tabular">
                <caption className="sr-only">{t(c.board)}</caption>
                <tbody className="gl-board">
                  {board.map((row, i) => (
                    <tr key={row.bay} className="border-t border-line" style={{ "--gl-i": i } as React.CSSProperties}>
                      <th scope="row" className="py-2 pe-3 text-start font-semibold text-accent-ink">{row.bay}</th>
                      <td className="py-2 pe-3 text-fg">
                        <span className="block truncate font-sans text-[13px]">{t(row.job)}</span>
                        {row.plate ? <span className="text-[11px] text-fg-subtle">{row.plate}</span> : null}
                      </td>
                      <td className={cn("py-2 text-end whitespace-nowrap", row.tone === "ready" ? "text-success" : row.tone === "free" ? "text-accent-ink" : "text-fg-muted")}>{t(row.state)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Container>

      <div className="mt-16 border-y border-line">
        <div aria-hidden className="gl-hazard h-3 bg-[repeating-linear-gradient(135deg,var(--accent)_0_14px,transparent_14px_28px)]" />
        <Container>
          <Stagger asChild step={80}>
          <dl className="grid divide-line py-8 @2xl:grid-cols-3 @2xl:divide-x rtl:divide-x-reverse">
            {c.stats.map(({ n, before, after, v }) => (
              <div key={v.en} className="flex items-baseline gap-3 py-3 @2xl:px-8 @2xl:first:ps-0">
                <dt className="sr-only">{t(v)}</dt>
                <dd className="whitespace-nowrap font-display text-display-m font-extrabold uppercase tracking-tight text-fg">
                  {t(before)}
                  <CountUp value={n} locale={locale === "tr" ? "tr-TR" : "en-GB"} duration={900} />
                  {t(after)}
                </dd>
                <dd className="text-small text-fg-muted">{t(v)}</dd>
              </div>
            ))}
          </dl>
          </Stagger>
        </Container>
      </div>
    </Section>
  );
}

/** Home section around the compact picker. */
export function BuildYourJob() {
  const { t } = useJob();
  return (
    <Section anchor="build" headingId="gl-build-title" theme={{ surface: "surface-2" }}>
      <Container>
        <Reveal className="mb-12 grid gap-6 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @4xl:items-end">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-eyebrow uppercase tracking-[0.18em] text-accent-ink">{t(c.buildEyebrow)}</p>
            <h2 id="gl-build-title" className="font-display text-display-l font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-fg">
              {t(c.buildTitle)}
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3">
            <p className="max-w-[48ch] text-fg-muted">{t(c.buildLead)}</p>
            <a href={sitePageHref("services")} className={cn(buttonVariants({ variant: "link" }), "vm-nudge")}>
              {t(c.all)}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </a>
          </div>
        </Reveal>
        <ServicePicker mode="compact" headingId="gl-jobcard-home" />
      </Container>
    </Section>
  );
}

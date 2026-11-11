"use client";

import { buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight } from "lucide-react";
import { copyFor, photos, presets, priceBuild, sessionById, tl } from "./content";
import { useBuild } from "./build-provider";
import { PackageBuilder } from "./package-builder";
import { Stagger } from "@vamos-ui/react/motion";

const c = {
  kicker: { en: "Photo studio · Kadıköy · est. 2019", tr: "Fotoğraf stüdyosu · Kadıköy · 2019’dan beri" },
  title: { en: "Lumen Room", tr: "Lumen Room" },
  line: { en: "A 140 m² white cyclorama, north-facing daylight and a photographer who will tell you when the light is wrong.", tr: "140 m² beyaz sonsuz fon, kuzeye bakan gün ışığı ve ışık yanlış olduğunda bunu size söyleyecek bir fotoğrafçı." },
  build: { en: "Build a package", tr: "Paket oluştur" },
  work: { en: "See the work", tr: "İşlere bakın" },
  specs: [
    { k: { en: "Floor", tr: "Alan" }, v: { en: "140 m²", tr: "140 m²" } },
    { k: { en: "Ceiling", tr: "Tavan" }, v: { en: "5.8 m", tr: "5,8 m" } },
    { k: { en: "Cyc wall", tr: "Sonsuz fon" }, v: { en: "7 × 4 m", tr: "7 × 4 m" } },
    { k: { en: "Daylight", tr: "Gün ışığı" }, v: { en: "North, 6 windows", tr: "Kuzey, 6 pencere" } },
  ],
  frame: { en: "Frame", tr: "Kare" },
  pEyebrow: { en: "Packages", tr: "Paketler" },
  pTitle: { en: "Three ways to *start*", tr: "Başlamanın üç yolu" },
  pLead: { en: "Each one opens in the package builder, where you can change the hours, images and extras before you book.", tr: "Her biri paket oluşturucuda açılır; ayırtmadan önce süreyi, kareleri ve ekstraları değiştirebilirsiniz." },
  open: { en: "Open in builder", tr: "Oluşturucuda aç" },
  incl: { en: "incl. VAT", tr: "KDV dahil" },
  crumb: { en: "Packages", tr: "Paketler" },
  bTitle: { en: "Build your *package*", tr: "Paketinizi *oluşturun*" },
  bLead: { en: "Choose a session, drag the time and image count, add what you need. The contact sheet on the side is your quote — exactly what you will pay.", tr: "Bir çekim seçin, süreyi ve kare sayısını kaydırın, ihtiyacınız olanı ekleyin. Yandaki kontak baskı teklifinizdir — ödeyeceğiniz tutarın ta kendisi." },
  presetsLabel: { en: "Start from", tr: "Şuradan başlayın" },
};

/** Hero: an oversized mono wordmark over a framed studio photo with crop marks and a spec strip. */
export function StudioHero() {
  const { t } = useBuild();
  return (
    <Section aria-labelledby="lr-hero-title" theme={{ rhythm: "tight" }} className="overflow-hidden">
      <Container>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 @4xl:flex-row @4xl:items-end @4xl:justify-between">
            <div className="flex flex-col gap-3">
              <p className="vm-enter font-mono text-[12px] tracking-tight text-fg-muted uppercase">{t(c.kicker)}</p>
              <h1 id="lr-hero-title" className="vm-enter [--vm-i:1] font-display text-display-2xl leading-[0.85] text-fg uppercase">
                {t(c.title)}
              </h1>
            </div>
            <p className="vm-enter max-w-[38ch] text-lead text-fg-muted [--vm-i:2] @4xl:pb-3 @4xl:text-end">{t(c.line)}</p>
          </div>

          <div className="lr-develop relative">
            <span aria-hidden className="lr-mark lr-mark-ts absolute -start-2 -top-2 z-[1] size-5 border-s border-t border-fg" />
            <span aria-hidden className="lr-mark lr-mark-te absolute -end-2 -top-2 z-[1] size-5 border-e border-t border-fg" />
            <span aria-hidden className="lr-mark lr-mark-bs absolute -start-2 -bottom-2 z-[1] size-5 border-s border-b border-fg" />
            <span aria-hidden className="lr-mark lr-mark-be absolute -end-2 -bottom-2 z-[1] size-5 border-e border-b border-fg" />
            <Image src={photos.studio.src} width={photos.studio.width} height={photos.studio.height} alt={t(photos.studio.alt)} aspect="21/9" priority sizes="100vw" className="grayscale" />
            <p aria-hidden className="lr-counter absolute start-3 bottom-3 bg-scene px-2 py-1 font-mono text-[11px] text-fg uppercase">
              {t(c.frame)} 01 / 24
            </p>
          </div>

          <div className="vm-enter grid gap-6 [--vm-i:3] @3xl:grid-cols-[minmax(0,1fr)_auto] @3xl:items-center">
            <dl className="grid grid-cols-2 border-s border-t border-line @3xl:grid-cols-4">
              {c.specs.map((s) => (
                <div key={s.k.en} className="flex flex-col gap-1 border-e border-b border-line p-3">
                  <dt className="font-mono text-[11px] text-fg-muted uppercase">{t(s.k)}</dt>
                  <dd className="text-fg">{t(s.v)}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-2">
              <a href={sitePageHref("packages")} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "vm-press vm-nudge")}>
                {t(c.build)}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </a>
              <a href={sitePageHref("home", "work")} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "vm-press")}>
                {t(c.work)}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Preset packages as numbered frames; each opens the builder pre-filled. */
export function PresetFrames() {
  const { t, locale, load } = useBuild();
  return (
    <Stagger asChild effect="fade" step={110}>
    <ul className="grid border-s border-t border-fg @3xl:grid-cols-3">
      {presets.map((p, i) => {
        const price = priceBuild(p.build);
        const s = sessionById(p.build.session);
        return (
          <li key={p.id} className="flex flex-col gap-4 border-e border-b border-fg p-5 @md:p-6">
            <div className="flex items-baseline justify-between font-mono text-[11px] text-fg-muted uppercase">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <span>{t(s.name)}</span>
            </div>
            <h3 className="font-display text-display-m text-fg uppercase">{t(p.name)}</h3>
            <p className="text-fg-muted">{t(p.line)}</p>
            <p className="mt-auto flex items-baseline gap-2">
              <span className="tabular font-mono text-h3 text-fg">{tl(price.total, locale)}</span>
              <span className="font-mono text-[11px] text-fg-muted uppercase">{t(c.incl)}</span>
            </p>
            <a
              href={sitePageHref("packages", "builder")}
              onClick={() => load(p.build)}
              className={cn(buttonVariants({ variant: "secondary" }), "vm-press vm-nudge justify-between")}
            >
              {t(c.open)}
              <span className="sr-only">: {t(p.name)}</span>
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </a>
          </li>
        );
      })}
    </ul>
    </Stagger>
  );
}

export function PresetsSection() {
  const { t } = useBuild();
  return (
    <Section anchor="packages" headingId="lr-pre-h">
      <Container>
        <SectionHeader eyebrow={t(c.pEyebrow)} title={t(c.pTitle)} lead={t(c.pLead)} align="split" headingId="lr-pre-h" className="mb-10" />
        <PresetFrames />
      </Container>
    </Section>
  );
}

export function PackagesPage() {
  const { t, locale } = useBuild();
  const { intl, labels } = copyFor(locale);
  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Lumen Room", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.bTitle)} lead={t(c.bLead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.bTitle).replace(/\*/g, "")} className="pt-0!">
        <Container>
          <p className="mb-4 font-mono text-[12px] text-fg-muted uppercase">{t(c.presetsLabel)}</p>
          <PresetFrames />
          <div id="builder" className="mt-16 scroll-mt-20">
            <PackageBuilder />
          </div>
        </Container>
      </Section>
    </>
  );
}


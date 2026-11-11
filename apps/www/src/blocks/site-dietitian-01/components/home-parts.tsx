import { buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { CountUp } from "@vamos-ui/react/motion";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { copyFor, photos, tl, type SiteLocale } from "./content";

const c = {
  eyebrow: { en: "Dietitians · Ataşehir and online", tr: "Diyetisyenler · Ataşehir ve çevrim içi" },
  title: { en: "Nutrition advice that fits *your week*", tr: "*Haftanıza* uyan beslenme danışmanlığı" },
  lead: {
    en: "Registered dietitians who plan around your shifts, your training and your family’s dinner table — never a printed list of banned foods.",
    tr: "Vardiyanıza, antrenmanınıza ve ailenizin sofrasına göre plan yapan diyetisyenler — asla basılı bir yasak yiyecekler listesi değil.",
  },
  find: { en: "Find your programme", tr: "Programınızı bulun" },
  book: { en: "Book a first consultation", tr: "İlk görüşmeyi ayırtın" },
  plate: { en: "The Greenplate rule of thumb", tr: "Greenplate pratik kuralı" },
  parts: [
    { share: { en: "½", tr: "½" }, label: { en: "vegetables & fruit", tr: "sebze ve meyve" } },
    { share: { en: "¼", tr: "¼" }, label: { en: "protein", tr: "protein" } },
    { share: { en: "¼", tr: "¼" }, label: { en: "whole grains", tr: "tam tahıl" } },
  ],
  facts: [
    { v: "", l: { en: "shortest programme, 4 weeks", tr: "en kısa program, 4 hafta" } },
    { v: "48", unit: { en: " h", tr: " sa" }, l: { en: "to your first appointment, usually", tr: "içinde ilk randevunuz, genellikle" } },
    { v: "0", l: { en: "supplements sold here", tr: "burada satılan takviye" } },
  ],
};

/**
 * Greenplate moves gently and with purpose. The signature: the plate ring draws itself around
 * the photo — the half, then each quarter — and the rule-of-thumb card lands once the ring
 * is complete. In the picker, the weeks of the plan fill in left to right when the plan
 * changes. Stroke and transform only; reduced motion shows the finished ring.
 */
const plateMotion = `
@keyframes gp-arc-1 { from { stroke-dasharray: 0 301.6; } }
@keyframes gp-arc-2 { from { stroke-dasharray: 0 301.6; } }
@keyframes gp-land { from { opacity: 0; transform: translate3d(0, 12px, 0) scale(0.96); } }
@keyframes gp-week { from { transform: scaleY(0.15); opacity: 0; } }
@media screen and (prefers-reduced-motion: no-preference) {
  .gp-ring:where(:not([data-motion="off"] *)) circle { animation: gp-arc-2 900ms var(--ease-in-out) backwards; }
  .gp-ring:where(:not([data-motion="off"] *)) circle:nth-child(1) { animation-name: gp-arc-1; animation-duration: 1200ms; animation-delay: 380ms; }
  .gp-ring:where(:not([data-motion="off"] *)) circle:nth-child(2) { animation-delay: 1400ms; }
  .gp-ring:where(:not([data-motion="off"] *)) circle:nth-child(3) { animation-delay: 1900ms; }
  .gp-caption:where(:not([data-motion="off"] *)) { animation: gp-land 620ms var(--ease-out-quint) 2200ms backwards; }
  .gp-week:where(:not([data-motion="off"] *)) { transform-origin: bottom; animation: gp-week 360ms var(--ease-out-quint) calc(var(--vm-i, 0) * 22ms) backwards; }
}
`;

const em = (s: string) => s.split("*").map((p, i) => (i === 1 ? <em key={i} className="text-accent-ink not-italic">{p}</em> : p));

/** Corporate split hero: a ruled grid, a square photo with the plate-proportion ring drawn over it. */
export function DietHero({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  return (
    <Section aria-labelledby="gp-hero-title" theme={{ rhythm: "tight" }} className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 @4xl:grid-cols-12 @4xl:gap-8">
          <div className="flex min-w-0 flex-col gap-6 @4xl:col-span-6">
            <p className="vm-enter inline-flex items-center gap-2 self-start rounded-[var(--radius)] border border-line bg-surface px-2.5 py-1 text-xs font-semibold tracking-wide text-fg-muted uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {t(c.eyebrow)}
            </p>
            <h1 id="gp-hero-title" className="vm-enter [--vm-i:1] font-display text-display-xl text-balance text-fg">
              {em(t(c.title))}
            </h1>
            <p className="vm-enter [--vm-i:2] max-w-[50ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="vm-enter [--vm-i:3] flex flex-wrap gap-3">
              <a href={sitePageHref("home", "picker")} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "vm-press vm-nudge")}>
                {t(c.find)}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </a>
              <a href={sitePageHref("booking")} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "vm-press")}>
                <CalendarCheck aria-hidden />
                {t(c.book)}
              </a>
            </div>
            <dl className="vm-enter [--vm-i:4] mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line">
              {c.facts.map((f, i) => (
                <div key={i} className="flex flex-col gap-1 bg-scene p-3 @md:p-4">
                  <dt className="order-2 text-xs text-fg-muted">{t(f.l)}</dt>
                  <dd className="order-1 font-display text-h3 font-bold text-fg tabular">
                    {f.v === "48" ? (
                      <>
                        <CountUp value={48} duration={1200} />
                        {t(f.unit!)}
                      </>
                    ) : (
                      f.v || tl(4900, locale)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="vm-enter vm-enter-media [--vm-i:1] relative @4xl:col-span-6">
            <style>{plateMotion}</style>
            <div className="relative mx-auto aspect-square w-full max-w-[34rem]">
              <Image
                src={photos.bowl.src}
                width={photos.bowl.width}
                height={photos.bowl.height}
                focal={photos.bowl.focal}
                alt={t(photos.bowl.alt)}
                aspect="1/1"
                priority
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="overflow-hidden rounded-full"
              />
              {/* The plate ring: ½ / ¼ / ¼ arcs around the photo. */}
              <svg aria-hidden viewBox="0 0 100 100" className="gp-ring pointer-events-none absolute -inset-[4%] size-[108%] -rotate-90">
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="149.3 152.3" pathLength="301.6" strokeLinecap="round" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--fg)" strokeWidth="1.6" strokeDasharray="72.4 229.2" strokeDashoffset="-152.3" pathLength="301.6" strokeLinecap="round" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--fg-subtle)" strokeWidth="1.6" strokeDasharray="72.4 229.2" strokeDashoffset="-227.7" pathLength="301.6" strokeLinecap="round" />
              </svg>
            </div>
            <figcaption className="gp-caption surface relative z-[1] mx-auto -mt-10 flex w-fit max-w-full flex-col gap-2 rounded-[var(--radius)] p-4 shadow-sm @4xl:absolute @4xl:end-0 @4xl:bottom-2 @4xl:mt-0">
              <span className="text-xs font-semibold tracking-wide text-fg-muted uppercase">{t(c.plate)}</span>
              <span className="flex flex-wrap gap-x-4 gap-y-1">
                {c.parts.map((p, i) => (
                  <span key={i} className="flex items-baseline gap-1.5 text-small text-fg">
                    <span aria-hidden className={cn("inline-block size-2 rounded-full", i === 0 ? "bg-accent" : i === 1 ? "bg-fg" : "bg-fg-subtle")} />
                    <span className="font-semibold tabular">{t(p.share)}</span>
                    {t(p.label)}
                  </span>
                ))}
              </span>
            </figcaption>
          </figure>
        </div>
      </Container>
    </Section>
  );
}

import { buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
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
    { v: "48 h", l: { en: "to your first appointment, usually", tr: "içinde ilk randevunuz, genellikle" } },
    { v: "0", l: { en: "supplements sold here", tr: "burada satılan takviye" } },
  ],
};

const em = (s: string) => s.split("*").map((p, i) => (i === 1 ? <em key={i} className="text-accent-ink not-italic">{p}</em> : p));

/** Corporate split hero: a ruled grid, a square photo with the plate-proportion ring drawn over it. */
export function DietHero({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  return (
    <Section aria-labelledby="gp-hero-title" theme={{ rhythm: "tight" }} className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 @4xl:grid-cols-12 @4xl:gap-8">
          <div className="flex min-w-0 flex-col gap-6 @4xl:col-span-6">
            <p className="inline-flex items-center gap-2 self-start rounded-[var(--radius)] border border-line bg-surface px-2.5 py-1 text-xs font-semibold tracking-wide text-fg-muted uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {t(c.eyebrow)}
            </p>
            <h1 id="gp-hero-title" className="font-display text-display-xl text-balance text-fg">
              {em(t(c.title))}
            </h1>
            <p className="max-w-[50ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="flex flex-wrap gap-3">
              <a href={sitePageHref("home", "picker")} className={buttonVariants({ variant: "primary", size: "lg" })}>
                {t(c.find)}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </a>
              <a href={sitePageHref("booking")} className={buttonVariants({ variant: "secondary", size: "lg" })}>
                <CalendarCheck aria-hidden />
                {t(c.book)}
              </a>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius)] border border-line bg-line">
              {c.facts.map((f, i) => (
                <div key={i} className="flex flex-col gap-1 bg-scene p-3 @md:p-4">
                  <dt className="order-2 text-xs text-fg-muted">{t(f.l)}</dt>
                  <dd className="order-1 font-display text-h3 font-bold text-fg tabular">{f.v || tl(4900, locale)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative @4xl:col-span-6">
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
              <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute -inset-[4%] size-[108%] -rotate-90">
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeDasharray="149.3 152.3" pathLength="301.6" strokeLinecap="round" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--fg)" strokeWidth="1.6" strokeDasharray="72.4 229.2" strokeDashoffset="-152.3" pathLength="301.6" strokeLinecap="round" />
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--fg-subtle)" strokeWidth="1.6" strokeDasharray="72.4 229.2" strokeDashoffset="-227.7" pathLength="301.6" strokeLinecap="round" />
              </svg>
            </div>
            <figcaption className="surface relative z-[1] mx-auto -mt-10 flex w-fit max-w-full flex-col gap-2 rounded-[var(--radius)] p-4 shadow-sm @4xl:absolute @4xl:end-0 @4xl:bottom-2 @4xl:mt-0">
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

"use client";

import { Badge, buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, CalendarHeart, Clock, PhoneCall } from "lucide-react";
import { fill, PHONE, pets, services, tl, type L, type Service, type SiteLocale } from "./content";
import { PET_ICONS, PetSwitch, usePet } from "./pet-provider";

const c = {
  eyebrow: { en: "Small-animal practice · Kadıköy", tr: "Küçük hayvan kliniği · Kadıköy" },
  title: { en: "A calmer vet visit for *every* kind of pet", tr: "Her türden dost için *daha sakin* bir veteriner ziyareti" },
  lead: { en: "Separate waiting areas for dogs, cats and small pets, appointments that are never shorter than 20 minutes, and a vet on the phone day and night.", tr: "Köpekler, kediler ve küçük dostlar için ayrı bekleme alanları, 20 dakikadan kısa olmayan randevular ve gece gündüz telefonda bir veteriner." },
  who: { en: "Who are we seeing?", tr: "Kimi muayene edeceğiz?" },
  book: { en: "Book a visit", tr: "Randevu iste" },
  call: { en: "Call the clinic", tr: "Kliniği arayın" },
  night: { en: "Out of hours?", tr: "Mesai dışında mı?" },
  nightText: { en: "Call the same number — a vet answers 24/7 and meets you here within 40 minutes.", tr: "Aynı numarayı arayın — bir veteriner 7/24 yanıtlar ve 40 dakika içinde burada karşılar." },
  popular: { en: "Most booked for {pets}", tr: "{pets} için en çok alınan randevular" },
  min: { en: "{n} min", tr: "{n} dk" },
  dayPatient: { en: "Day patient", tr: "Günübirlik" },
  from: { en: "from {price}", tr: "{price}’den başlar" },
  sEyebrow: { en: "Services & fees", tr: "Hizmetler ve ücretler" },
  sTitle: { en: "What we do for *{pets}*", tr: "*{pets}* için yaptıklarımız" },
  sLead: { en: "Fees include VAT and the consultation itself. Medicines are priced separately and always agreed with you first.", tr: "Ücretlere KDV ve muayenenin kendisi dahildir. İlaçlar ayrıca fiyatlanır ve her zaman önce sizinle konuşulur." },
  sAll: { en: "All {n} services for {pets}", tr: "{pets} için {n} hizmetin tümü" },
  showing: { en: "Showing services for {pets}.", tr: "{pets} için hizmetler gösteriliyor." },
  waiting: { en: "Where they wait", tr: "Nerede bekliyorlar" },
};

const em = (s: string) => s.split("*").map((p, i) => (i === 1 ? <em key={i} className="text-accent-ink not-italic">{p}</em> : p));

export function priceOf(s: Service, locale: SiteLocale, t: (v: L) => string) {
  return s.from ? fill(t(c.from), { price: tl(s.fee, locale) }) : tl(s.fee, locale);
}
export function lengthOf(s: Service, t: (v: L) => string) {
  return s.minutes ? fill(t(c.min), { n: s.minutes }) : t(c.dayPatient);
}

/** Home hero: the pet switch sits in the hero and swaps the photo, the care line and the top three services. */
export function VetHero() {
  const { pet, t, locale, setService } = usePet();
  const p = pets[pet];
  const Icon = PET_ICONS[pet];
  const featured = services[pet].filter((s) => s.featured).slice(0, 3);
  return (
    <Section aria-labelledby="pb-hero-title" theme={{ rhythm: "tight" }} className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 @4xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] @4xl:gap-16">
          <div className="flex min-w-0 flex-col gap-6">
            <p className="self-start rounded-full bg-accent-soft px-3 py-1 text-small font-semibold text-accent-ink">{t(c.eyebrow)}</p>
            <h1 id="pb-hero-title" className="font-display text-display-xl text-balance text-fg">
              {em(t(c.title))}
            </h1>
            <p className="max-w-[52ch] text-lead text-fg-muted">{t(c.lead)}</p>

            <div className="mt-2 flex flex-col gap-3">
              <p id="pb-who" className="text-small font-semibold text-fg">
                {t(c.who)}
              </p>
              <PetSwitch label={t(c.who)} />
            </div>

            <div className="rounded-[1.75rem] border border-line bg-surface p-5 @md:p-6" aria-live="polite">
              <p className="flex items-start gap-3 text-fg">
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-accent-ink" strokeWidth={2.2} />
                <span>{t(p.care)}</span>
              </p>
              <h2 className="mt-5 text-xs font-semibold tracking-wide text-fg-muted uppercase">{fill(t(c.popular), { pets: t(p.plural) })}</h2>
              <ul className="mt-2 divide-y divide-line">
                {featured.map((s) => (
                  <li key={s.id} className="flex items-baseline justify-between gap-4 py-2.5">
                    <a
                      href={`${sitePageHref("services", "book")}`}
                      onClick={() => setService(s.id)}
                      className="focus-ring min-w-0 rounded-sm font-medium text-fg underline-offset-4 hover:underline"
                    >
                      {t(s.name)}
                    </a>
                    <span className="flex shrink-0 items-baseline gap-3 text-small">
                      <span className="hidden text-fg-muted @md:inline">{lengthOf(s, t)}</span>
                      <span className="tabular font-semibold text-fg">{priceOf(s, locale, t)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href={sitePageHref("services", "book")} className={buttonVariants({ variant: "primary", size: "lg" })}>
                <CalendarHeart aria-hidden />
                {t(c.book)}
              </a>
              <a href={`tel:${PHONE}`} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                <PhoneCall aria-hidden />
                {t(c.call)}
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] pb-10 @4xl:pb-0">
            <div aria-hidden className="absolute -inset-3 rounded-[48%_52%_44%_56%/52%_46%_54%_48%] bg-accent-soft @4xl:-inset-6" />
            <div key={pet} className="relative animate-[ui-rise_420ms_cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:animate-none">
              <Image
                src={p.photo.src}
                width={p.photo.width}
                height={p.photo.height}
                focal={p.photo.focal}
                alt={t(p.photo.alt)}
                aspect="4/5"
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="overflow-hidden rounded-[46%_54%_42%_58%/50%_44%_56%_50%]"
              />
            </div>
            <div className="surface absolute inset-x-3 bottom-0 flex flex-col gap-1.5 rounded-[1.5rem] p-4 shadow-sm @md:inset-x-auto @md:start-0 @md:max-w-[19rem] @4xl:-start-8 @4xl:bottom-6">
              <p className="flex items-center gap-2 text-small font-semibold text-fg">
                <span aria-hidden className="size-2 rounded-full bg-accent" />
                {t(c.night)}
              </p>
              <p className="text-small text-fg-muted">{t(c.nightText)}</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Home services: the same switch again, the full list for that pet in two columns. */
export function ServicesPreview() {
  const { pet, t, locale, setService } = usePet();
  const p = pets[pet];
  const list = services[pet];
  return (
    <Section anchor="services" theme={{ surface: "surface-2" }} headingId="pb-services-h">
      <Container>
        <SectionHeader eyebrow={t(c.sEyebrow)} title={fill(t(c.sTitle), { pets: t(p.plural) })} lead={t(c.sLead)} align="split" headingId="pb-services-h" className="mb-8" />
        <PetSwitch label={t(c.who)} size="md" className="mb-8" />
        <p className="sr-only" aria-live="polite">
          {fill(t(c.showing), { pets: t(p.plural) })}
        </p>
        <ul key={pet} className="grid gap-3 @3xl:grid-cols-2">
          {list.slice(0, 6).map((s, i) => (
            <li
              key={s.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="flex animate-[ui-rise_360ms_cubic-bezier(0.2,0.8,0.2,1)_both] flex-col gap-2 rounded-[1.25rem] border border-line bg-surface p-5 motion-reduce:animate-none"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-body font-semibold text-fg">{t(s.name)}</h3>
                <span className="tabular shrink-0 font-semibold text-fg">{priceOf(s, locale, t)}</span>
              </div>
              <p className="text-small text-fg-muted">{t(s.text)}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                <Badge tone="outline">
                  <Clock aria-hidden className="size-3" />
                  {lengthOf(s, t)}
                </Badge>
                <a href={sitePageHref("services", "book")} onClick={() => setService(s.id)} className="focus-ring rounded-sm text-small font-semibold text-accent-ink underline-offset-4 hover:underline">
                  {t(c.book)}
                  <span className="sr-only"> — {t(s.name)}</span>
                </a>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-6 @3xl:flex-row @3xl:items-center @3xl:justify-between">
          <p className="max-w-[60ch] text-small text-fg-muted">
            <span className="font-semibold text-fg">{t(c.waiting)}: </span>
            {t(p.waiting)}
          </p>
          <a href={sitePageHref("services")} className={cn(buttonVariants({ variant: "secondary" }), "self-start rounded-full")}>
            {fill(t(c.sAll), { n: list.length, pets: t(p.plural) })}
            <ArrowRight aria-hidden className="rtl:rotate-180" />
          </a>
        </div>
      </Container>
    </Section>
  );
}

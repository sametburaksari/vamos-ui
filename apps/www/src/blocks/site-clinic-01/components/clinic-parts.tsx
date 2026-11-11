"use client";

import * as React from "react";
import { addIsoDays, Badge, buttonVariants, cn, Image, todayIso, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Container, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, CalendarCheck, Phone } from "lucide-react";
import { assignedClinician, BookLink, useBooking, type Booking } from "./booking-provider";
import { clinicians, copyFor, displayName, fill, PHONE, photos, serviceById, services, slotsFor, tl, type Clinician } from "./content";

const c = {
  eyebrow: { en: "General practice · Ataşehir", tr: "Aile hekimliği · Ataşehir" },
  title: { en: "A family doctor who *knows your name*", tr: "*Adınızı bilen* bir aile hekimi" },
  lead: { en: "Same-week appointments for adults and children, blood tests from 08:00 and a nurse on site six days a week. Book online in two minutes.", tr: "Yetişkin ve çocuklar için aynı hafta randevu, 08:00’den itibaren kan alma ve haftada altı gün hemşire. Çevrimiçi randevu iki dakika." },
  book: { en: "Book an appointment", tr: "Randevu al" },
  call: { en: "Call the desk", tr: "Danışmayı arayın" },
  next: { en: "Next free appointment", tr: "İlk boş randevu" },
  nextWho: { en: "General consultation with {name}", tr: "{name} ile genel muayene" },
  take: { en: "Take it", tr: "Bunu al" },
  hoursLabel: { en: "Open", tr: "Açık" },
  hours: { en: "Mon–Fri 08:00–20:00 · Sat 09:00–14:00", tr: "Pzt–Cum 08:00–20:00 · Cmt 09:00–14:00" },
  wait: { en: "Average wait in reception", tr: "Ortalama bekleme" },
  waitValue: { en: "7 minutes", tr: "7 dakika" },
  patients: { en: "Registered families", tr: "Kayıtlı aile" },
  servicesEyebrow: { en: "What we see you for", tr: "Hangi konularda" },
  servicesTitle: { en: "Seven reasons to *book*", tr: "Randevu için *yedi* neden" },
  servicesLead: { en: "Fees are for the appointment itself; tests and vaccines are priced separately and always told to you first.", tr: "Ücretler muayenenin kendisi içindir; tahlil ve aşılar ayrıca fiyatlanır ve her zaman önceden söylenir." },
  min: { en: "{n} min", tr: "{n} dk" },
  bookThis: { en: "Book {name}", tr: "{name} için randevu al" },
  // doctors page
  dTitle: { en: "Our *clinicians*", tr: "*Hekimlerimiz*" },
  dLead: { en: "Three doctors and a nurse practitioner. You can always ask to see the same person again.", tr: "Üç hekim ve bir uzman hemşire. Her zaman aynı kişiyle görüşmek isteyebilirsiniz." },
  dCrumb: { en: "Clinicians", tr: "Hekimler" },
  filter: { en: "Filter clinicians", tr: "Hekimleri süz" },
  all: { en: "Everyone", tr: "Tümü" },
  family: { en: "Family medicine", tr: "Aile hekimliği" },
  children: { en: "Children", tr: "Çocuk" },
  nursing: { en: "Nursing", tr: "Hemşirelik" },
  clinics: { en: "Clinic days", tr: "Çalışma günleri" },
  speaks: { en: "Speaks", tr: "Dilleri" },
  bookWith: { en: "Book with {name}", tr: "{name} ile randevu" },
};

const em = (s: string) => s.split("*").map((p, i) => (i === 1 ? <em key={i}>{p}</em> : p));
const DOW = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], tr: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] };

/** The first free general consultation from tomorrow on (computed after mount: it depends on today). */
function useNextFree(): Booking | null {
  const [next, setNext] = React.useState<Booking | null>(null);
  React.useEffect(() => {
    const today = todayIso("Europe/Istanbul");
    for (let i = 1; i < 14; i++) {
      const day = addIsoDays(today, i);
      const probe: Booking = { service: "checkup", clinician: "any", day, time: null };
      const who = assignedClinician(probe);
      if (!who) continue;
      const slot = slotsFor(day, serviceById("checkup").minutes, who).find((s) => s.available);
      if (slot) {
        setNext({ ...probe, clinician: who.id, time: slot.start });
        return;
      }
    }
  }, []);
  return next;
}

/** Calm hero: lots of space, one primary action, the next free slot as a quiet card on the photo. */
export function ClinicHero() {
  const { locale, t } = useBooking();
  const next = useNextFree();
  const intl = locale === "tr" ? "tr-TR" : "en-GB";
  const who = next?.clinician ? clinicians.find((x) => x.id === next.clinician) : undefined;
  return (
    <Section aria-labelledby="nl-hero-title" className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] @4xl:gap-20">
          <div className="flex flex-col gap-7">
            <p className="flex items-center gap-2 text-small font-medium text-accent-ink">
              <span aria-hidden className="size-1.5 rounded-full bg-accent" />
              {t(c.eyebrow)}
            </p>
            <h1 id="nl-hero-title" className="font-display text-display-xl text-balance text-fg">
              {em(t(c.title))}
            </h1>
            <p className="max-w-[46ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="flex flex-wrap items-center gap-3">
              <BookLink className={buttonVariants({ variant: "primary", size: "lg" })}>
                <CalendarCheck aria-hidden />
                {t(c.book)}
              </BookLink>
              <a href={`tel:${PHONE}`} className={buttonVariants({ variant: "ghost", size: "lg" })}>
                <Phone aria-hidden />
                {t(c.call)}
              </a>
            </div>
            <dl className="mt-6 grid gap-6 border-t border-line pt-6 @md:grid-cols-3">
              {[
                [c.hoursLabel, c.hours],
                [c.wait, c.waitValue],
                [c.patients, { en: "2,140", tr: "2.140" }],
              ].map(([k, v]) => (
                <div key={k!.en} className="flex flex-col gap-1">
                  <dt className="text-xs text-fg-muted">{t(k!)}</dt>
                  <dd className="text-small font-medium text-fg">{t(v!)}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <Image src={photos.reception.src} width={photos.reception.width} height={photos.reception.height} alt={t(photos.reception.alt)} aspect="4/5" rounded="ui-lg" priority sizes="(min-width: 1024px) 45vw, 100vw" className="@4xl:ms-8" />
            <div className="surface absolute inset-x-4 bottom-4 flex flex-col gap-3 rounded-ui-lg p-5 shadow-sm @md:inset-x-auto @md:end-6 @md:w-80 @4xl:-start-2 @4xl:end-auto">
              <p className="text-xs text-fg-muted">{t(c.next)}</p>
              <p className="min-h-[1.8rem] font-display text-[1.5rem] leading-tight text-fg">
                {next?.day ? `${new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${next.day}T12:00:00Z`))}, ${next.time}` : "—"}
              </p>
              <p className="text-small text-fg-muted">{who ? fill(t(c.nextWho), { name: displayName(who, locale) }) : "\u00a0"}</p>
              <BookLink preset={next ?? { service: "checkup" }} className={cn(buttonVariants({ variant: "soft", size: "sm" }), "self-start")}>
                {t(c.take)}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </BookLink>
            </div>
          </div>
        </div>
        <p className="sr-only" lang={locale}>
          {t(c.hours)}
        </p>
      </Container>
    </Section>
  );
}

/** Services as a quiet ruled list: name, what it is for, length, fee and a direct booking link. */
export function ServicesList() {
  const { locale, t } = useBooking();
  return (
    <Section anchor="services" theme={{ surface: "surface-2" }} headingId="nl-services-h">
      <Container>
        <SectionHeader eyebrow={t(c.servicesEyebrow)} title={t(c.servicesTitle)} lead={t(c.servicesLead)} align="split" headingId="nl-services-h" className="mb-12" />
        <ul className="border-t border-line">
          {services.map((s) => (
            <li key={s.id} className="grid gap-x-8 gap-y-2 border-b border-line py-6 @3xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_6rem_7rem_auto] @3xl:items-baseline">
              <h3 className="text-body font-semibold text-fg">{t(s.name)}</h3>
              <p className="text-small text-fg-muted">{t(s.text)}</p>
              <p className="font-mono text-[12px] text-fg-muted">{fill(t(c.min), { n: s.minutes })}</p>
              <p className="tabular text-small text-fg">{tl(s.fee, locale)}</p>
              <BookLink preset={{ service: s.id }} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "justify-self-start @3xl:justify-self-end")}>
                <span className="sr-only">{fill(t(c.bookThis), { name: t(s.name) })}</span>
                <span aria-hidden>{t(c.book)}</span>
              </BookLink>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function ClinicianCard({ person }: { person: Clinician }) {
  const { locale, t } = useBooking();
  const name = displayName(person, locale);
  return (
    <article className="flex flex-col gap-5 @2xl:flex-row">
      <Image src={person.photo.src} width={person.photo.width} height={person.photo.height} focal={person.photo.focal} alt={t(person.photo.alt)} aspect="4/5" rounded="ui-lg" className="w-full @2xl:w-56 @2xl:shrink-0" sizes="(min-width: 768px) 224px, 100vw" />
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-[1.6rem] leading-tight text-fg">{name}</h2>
          <p className="text-small text-accent-ink">{t(person.role)}</p>
        </div>
        <p className="text-fg">{t(person.focus)}</p>
        <p className="text-small text-fg-muted">{t(person.bio)}</p>
        <dl className="grid grid-cols-[7rem_minmax(0,1fr)] gap-y-2 text-small">
          <dt className="text-fg-muted">{t(c.clinics)}</dt>
          <dd className="flex flex-wrap gap-1">
            <span className="sr-only">{person.days.map((d) => DOW[locale][d]).join(", ")}</span>
            {[1, 2, 3, 4, 5, 6].map((d) => {
              const on = person.days.includes(d as Clinician["days"][number]);
              return (
                <Badge key={d} aria-hidden tone={on ? "accent" : "outline"} shape="square" className={on ? undefined : "border-dashed text-fg-subtle"}>
                  {DOW[locale][d]}
                </Badge>
              );
            })}
          </dd>
          <dt className="text-fg-muted">{t(c.speaks)}</dt>
          <dd className="text-fg">{t(person.languages)}</dd>
        </dl>
        <BookLink preset={{ clinician: person.id }} className={cn(buttonVariants({ variant: "secondary" }), "mt-auto self-start")}>
          {fill(t(c.bookWith), { name: person.title ? person.name.split(" ").slice(-1)[0]! : person.name.split(" ")[0]! })}
          <ArrowRight aria-hidden className="rtl:rotate-180" />
        </BookLink>
      </div>
    </article>
  );
}

/** Clinicians page: intro, a specialty filter and one card per clinician with clinic days. */
export function DoctorsPage() {
  const { locale, t } = useBooking();
  const { intl, labels } = copyFor(locale);
  const [filter, setFilter] = React.useState<"all" | Clinician["specialty"]>("all");
  const list = clinicians.filter((p) => filter === "all" || p.specialty === filter);
  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Northline", href: sitePageHref("home") }, { label: t(c.dCrumb) }]} title={t(c.dTitle)} lead={t(c.dLead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.dCrumb)} className="pb-24">
        <Container>
          <ToggleGroup type="single" variant="segmented" aria-label={t(c.filter)} value={filter} onValueChange={(v) => setFilter((v || "all") as typeof filter)} className="mb-12">
            <ToggleGroupItem value="all">{t(c.all)}</ToggleGroupItem>
            <ToggleGroupItem value="family">{t(c.family)}</ToggleGroupItem>
            <ToggleGroupItem value="children">{t(c.children)}</ToggleGroupItem>
            <ToggleGroupItem value="nursing">{t(c.nursing)}</ToggleGroupItem>
          </ToggleGroup>
          <ul className="grid gap-x-12 gap-y-16 @5xl:grid-cols-2" aria-live="polite">
            {list.map((p) => (
              <li key={p.id}>
                <ClinicianCard person={p} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}

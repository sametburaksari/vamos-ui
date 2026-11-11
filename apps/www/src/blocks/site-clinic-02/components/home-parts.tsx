"use client";

import * as React from "react";
import { Button, buttonVariants, cn } from "@vamos-ui/react";
import { BlockHeading, Container, hoursStatus, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Baby, BookOpen, ClipboardCheck, Phone, Syringe, Thermometer, Wind } from "lucide-react";
import { doctors, fill, hours, ink, PHONE, services, tl, type ReasonId } from "./content";
import { DoctorAvatar, HeroScene, KiteMark } from "./illustrations";
import { useVisit } from "./visit-provider";

const c = {
  eyebrow: { en: "Children’s clinic · Koşuyolu, Kadıköy", tr: "Çocuk kliniği · Koşuyolu, Kadıköy" },
  title: { en: "Doctors who *kneel down* to say hello", tr: "Merhaba demek için *diz çöken* doktorlar" },
  lead: { en: "Check-ups, unwell days and vaccines for children from birth to sixteen — in rooms with kites on the ceiling and a sticker drawer that never runs out.", tr: "Doğumdan on altı yaşa kadar çocuklar için kontroller, hasta günler ve aşılar — tavanında uçurtmalar, hiç bitmeyen bir çıkartma çekmecesi olan odalarda." },
  book: { en: "Book a visit", tr: "Randevu al" },
  unwell: { en: "Unwell today? Call", tr: "Bugün hasta mı? Arayın" },
  openNow: { en: "Open now · until {time}", tr: "Şu an açık · kapanış {time}" },
  closed: { en: "Closed now · opens {time}", tr: "Şu an kapalı · açılış {time}" },
  ages: { en: "Birth to 16", tr: "Doğumdan 16 yaşa" },
  sameDay: { en: "6 same-day slots every morning", tr: "Her sabah 6 aynı gün randevusu" },
  sEyebrow: { en: "What we see children for", tr: "Hangi durumlarda" },
  sTitle: { en: "Six reasons to *come and see us*", tr: "Bize gelmek için *altı neden*" },
  sLead: { en: "The fee is for the visit itself. Tests and private vaccines are priced separately and always told to you first.", tr: "Ücret ziyaretin kendisi içindir. Tahliller ve özel aşılar ayrıca fiyatlanır ve her zaman önce size söylenir." },
  min: { en: "{n} min", tr: "{n} dk" },
  bookThis: { en: "Book", tr: "Randevu" },
  bookThisLabel: { en: "Book: {name}", tr: "Randevu al: {name}" },
  dEyebrow: { en: "The people in the rooms", tr: "Odalardaki insanlar" },
  dTitle: { en: "Three paediatricians and *one sticker boss*", tr: "Üç çocuk hekimi ve *bir çıkartma patronu*" },
  dLead: { en: "Every child has a named doctor. You can always book the same person again.", tr: "Her çocuğun adı belli bir doktoru vardır. Her zaman aynı kişiden randevu alabilirsiniz." },
  works: { en: "Clinic days: {days}", tr: "Klinik günleri: {days}" },
  storyEyebrow: { en: "First time here?", tr: "İlk kez mi geliyorsunuz?" },
  storyTitle: { en: "Read the visit *together* before you come", tr: "Gelmeden önce ziyareti *birlikte* okuyun" },
  storyLead: { en: "A six-page picture story for children — what happens at the door, on the scale and at the sticker drawer — with a note for grown-ups on every page.", tr: "Çocuklar için altı sayfalık resimli bir hikâye — kapıda, tartıda ve çıkartma çekmecesinde ne olur — her sayfada büyükler için bir not." },
  storyCta: { en: "Open the picture story", tr: "Resimli hikâyeyi açın" },
};

const ICONS: Record<ReasonId, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  checkup: ClipboardCheck,
  unwell: Thermometer,
  vaccine: Syringe,
  newborn: Baby,
  allergy: Wind,
  forms: BookOpen,
};

/** Today's status from the opening hours (after mount: it depends on the clock). */
function useOpenLine() {
  const { t, locale } = useVisit();
  const [line, setLine] = React.useState<string | null>(null);
  React.useEffect(() => {
    const st = hoursStatus(hours, new Date());
    setLine(st.state !== "closed" && st.closesAt ? fill(t(c.openNow), { time: st.closesAt }) : fill(t(c.closed), { time: st.opensAt?.time ?? "08:30" }));
  }, [t, locale]);
  return line;
}

/** Hero: big rounded headline, the open-now line, and the illustrated hill with the kite. */
export function KiteHero() {
  const { t, start } = useVisit();
  const open = useOpenLine();
  return (
    <Section aria-labelledby="pk-hero-title" className="overflow-hidden !pt-8 @4xl:!pt-12">
      <Container>
        <div className="grid items-center gap-10 @4xl:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] @4xl:gap-14">
          <div className="flex flex-col items-start gap-7">
            <p className="inline-flex items-center gap-2 rounded-full border-2 border-fg bg-surface px-3.5 py-1.5 text-small font-semibold text-fg">
              <KiteMark className="h-4 w-3" />
              {t(c.eyebrow)}
            </p>
            <BlockHeading id="pk-hero-title" level={1} size="display-xl" text={t(c.title)} className="max-w-[14ch] text-balance [&_em]:text-accent-ink" />
            <p className="max-w-[48ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="xl" className="rounded-full" onClick={() => start({ reason: "checkup" })}>
                {t(c.book)}
                <ArrowRight aria-hidden />
              </Button>
              <a href={`tel:${PHONE}`} className={cn(buttonVariants({ variant: "secondary", size: "xl" }), "rounded-full border-2 border-fg")}>
                <Phone aria-hidden />
                {t(c.unwell)}
              </a>
            </div>
            <ul className="flex flex-wrap gap-2 text-small font-medium text-fg">
              <li className="rounded-full px-3 py-1.5" style={{ background: ink.mint }} aria-live="polite">
                {open ?? " "}
              </li>
              <li className="rounded-full px-3 py-1.5" style={{ background: ink.sand }}>
                {t(c.ages)}
              </li>
              <li className="rounded-full px-3 py-1.5" style={{ background: ink.sky }}>
                {t(c.sameDay)}
              </li>
            </ul>
          </div>
          <HeroScene className="mx-auto w-full max-w-[560px]" />
        </div>
      </Container>
    </Section>
  );
}

/** Services as pastel tiles with a round icon, length, fee and a direct booking button. */
export function ServiceTiles() {
  const { t, locale, start } = useVisit();
  return (
    <Section anchor="services" aria-labelledby="pk-services-title">
      <Container>
        <SectionHeader headingId="pk-services-title" align="split" eyebrow={t(c.sEyebrow)} title={t(c.sTitle)} lead={t(c.sLead)} />
        <ul className="mt-12 grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
          {services.map((s, i) => {
            const Icon = ICONS[s.id];
            return (
              <li key={s.id} className={cn("flex flex-col gap-5 rounded-[calc(var(--radius)*1.8)] border-2 border-fg p-6", i % 3 === 1 && "@5xl:translate-y-6")} style={{ background: `color-mix(in oklch, ${ink[s.tone]} 62%, var(--surface))` }}>
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-14 place-items-center rounded-full border-2 border-fg bg-surface text-fg">
                    <Icon aria-hidden className="size-6" />
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1 text-small font-semibold text-fg tabular-nums">{fill(t(c.min), { n: s.minutes })}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-h3 font-bold text-fg">{t(s.name)}</h3>
                  <p className="text-fg">{t(s.text)}</p>
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 border-t-2 border-dashed border-fg/30 pt-4">
                  <p className="flex flex-col">
                    <span className="font-display text-[1.6rem] font-bold leading-none text-fg tabular-nums">{tl(s.fee, locale)}</span>
                    {s.note ? <span className="mt-1 text-small text-fg">{t(s.note)}</span> : null}
                  </p>
                  <Button variant="solid" className="rounded-full" onClick={() => start({ reason: s.id })} aria-label={fill(t(c.bookThisLabel), { name: t(s.name) })}>
                    {t(c.bookThis)}
                    <ArrowRight aria-hidden />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

/** Clinicians as illustrated round portraits with one child-friendly fact each. */
export function DoctorCircle() {
  const { t } = useVisit();
  return (
    <Section anchor="team" aria-labelledby="pk-team-title" theme={{ surface: "surface-2" }}>
      <Container>
        <SectionHeader headingId="pk-team-title" eyebrow={t(c.dEyebrow)} title={t(c.dTitle)} lead={t(c.dLead)} />
        <ul className="mt-12 grid gap-x-6 gap-y-12 @2xl:grid-cols-2 @5xl:grid-cols-4">
          {doctors.map((d, i) => (
            <li key={d.id} className="flex flex-col items-center gap-4 text-center">
              <DoctorAvatar doctor={d} className={cn("size-40 transition-transform duration-500 motion-safe:hover:rotate-3", i % 2 ? "-rotate-2" : "rotate-2")} />
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-h3 font-bold text-fg">
                  {t(d.title)} {d.name}
                </h3>
                <p className="text-small font-medium text-accent-ink">{t(d.role)}</p>
                <p className="text-small text-fg-muted">{t(d.focus)}</p>
              </div>
              <p className="relative max-w-[26ch] rounded-[1.4rem] border-2 border-fg bg-surface px-4 py-3 text-small text-fg before:absolute before:-top-[9px] before:left-1/2 before:size-4 before:-translate-x-1/2 before:rotate-45 before:border-s-2 before:border-t-2 before:border-fg before:bg-surface">
                {t(d.fact)}
              </p>
              <p className="text-small text-fg-muted">{fill(t(c.works), { days: t(d.days) })}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

/** Teaser for the picture-story page. */
export function StoryTeaser({ preview }: { preview: React.ReactNode }) {
  const { t } = useVisit();
  return (
    <Section aria-labelledby="pk-story-title">
      <Container>
        <div className="grid items-center gap-10 overflow-hidden rounded-[calc(var(--radius)*2.4)] border-2 border-fg p-6 @3xl:grid-cols-2 @3xl:p-12" style={{ background: ink.sky }}>
          <div className="flex flex-col items-start gap-5">
            <p className="text-small font-semibold text-fg">{t(c.storyEyebrow)}</p>
            <BlockHeading id="pk-story-title" level={2} size="display-m" text={t(c.storyTitle)} />
            <p className="max-w-[48ch] text-fg">{t(c.storyLead)}</p>
            <a href={sitePageHref("visit")} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-full")}>
              {t(c.storyCta)}
              <ArrowRight aria-hidden />
            </a>
          </div>
          <div className="rotate-[1.5deg]">{preview}</div>
        </div>
      </Container>
    </Section>
  );
}

"use client";

import { buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, CalendarDays, Sprout } from "lucide-react";
import { fill, GROUPS, groups, longDate, openMornings, photos, plans, REGISTRATION, tl } from "./content";
import { DailyRhythm } from "./daily-rhythm";
import { useSchool } from "./school-provider";

const c = {
  eyebrow: { en: "Bilingual preschool · Suadiye", tr: "İki dilli anaokulu · Suadiye" },
  title: { en: "Small groups, a big garden and *a day that makes sense* to a three-year-old", tr: "Küçük gruplar, büyük bir bahçe ve üç yaşındaki birine *anlamlı gelen* bir gün" },
  lead: { en: "Little Orchard looks after 40 children aged 2 to 6 in Turkish and English, with the same teachers all year and lunch cooked downstairs every day.", tr: "Little Orchard, 2–6 yaş arası 40 çocuğa Türkçe ve İngilizce eğitim veriyor; tüm yıl aynı öğretmenler ve her gün alt katta pişen öğle yemeğiyle." },
  enrol: { en: "Apply for September 2027", tr: "Eylül 2027 için başvurun" },
  see: { en: "See a day", tr: "Bir güne göz atın" },
  next: { en: "Next open morning", tr: "Sıradaki tanışma sabahı" },
  nextWhen: { en: "{date}, 10:00–11:30", tr: "{date}, 10:00–11:30" },
  nextNote: { en: "Bring your child; coffee for you, the sand garden for them.", tr: "Çocuğunuzu getirin; size kahve, ona kum bahçesi." },
  dayEyebrow: { en: "Daily rhythm", tr: "Günlük ritim" },
  dayTitle: { en: "What *right now* looks like", tr: "*Şu an* neler oluyor" },
  dayLead: { en: "Children feel safe when the day has a shape. Choose a group and walk through it — the dark line is the time in Istanbul.", tr: "Günün bir şekli olduğunda çocuklar kendini güvende hisseder. Bir grup seçin ve günü gezin — koyu çizgi İstanbul’daki saati gösterir." },
  groupsEyebrow: { en: "Three groups", tr: "Üç grup" },
  groupsTitle: { en: "One room per *age*, never more than 16 children", tr: "Her *yaşa* bir oda, en fazla 16 çocuk" },
  children: { en: "{n} children", tr: "{n} çocuk" },
  adults: { en: "{n} adults", tr: "{n} yetişkin" },
  more: { en: "The programme", tr: "Program" },
  feesEyebrow: { en: "Fees 2026–27", tr: "2026–27 ücretleri" },
  feesTitle: { en: "One monthly fee, *meals included*", tr: "Tek aylık ücret, *yemekler dahil*" },
  feesLead: { en: "Breakfast, lunch, snacks, nappies, waterproofs and all materials are included. Siblings get 10% off.", tr: "Kahvaltı, öğle yemeği, ara öğünler, bez, yağmurluk ve tüm malzemeler dahil. Kardeşlere %10 indirim." },
  perMonth: { en: "/ month", tr: "/ ay" },
  reg: { en: "One-off registration fee {fee}, refunded if you cancel before 1 June 2027.", tr: "Bir kerelik kayıt ücreti {fee}; 1 Haziran 2027’den önce vazgeçerseniz iade edilir." },
};

const em = (s: string) => s.split("*").map((p, i) => (i === 1 ? <em key={i} className="not-italic text-accent-ink">{p}</em> : p));

/** Hero: headline + open-morning card on one side, three soft photo "tiles" stacked on the other. */
export function SchoolHero() {
  const { t, locale } = useSchool();
  return (
    <Section aria-labelledby="lo-hero-title" theme={{ rhythm: "tight" }} className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 @4xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] @4xl:gap-14">
          <div className="flex min-w-0 flex-col gap-6">
            <p className="flex items-center gap-2 text-small font-semibold text-accent-ink">
              <Sprout aria-hidden className="size-4" />
              {t(c.eyebrow)}
            </p>
            <h1 id="lo-hero-title" className="font-display text-display-l text-balance text-fg">
              {em(t(c.title))}
            </h1>
            <p className="max-w-[54ch] text-lead text-fg-muted">{t(c.lead)}</p>
            <div className="flex flex-wrap gap-3">
              <a href={sitePageHref("enrol")} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-full")}>
                {t(c.enrol)}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </a>
              <a href={sitePageHref("home", "day")} className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full")}>
                {t(c.see)}
              </a>
            </div>
            <div className="mt-2 flex max-w-md items-start gap-4 rounded-[1.5rem] border border-line bg-surface p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent-ink">
                <CalendarDays aria-hidden className="size-5" />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-fg-muted">{t(c.next)}</p>
                <p className="font-semibold text-fg">{fill(t(c.nextWhen), { date: longDate(openMornings[0]!, locale, { weekday: "long", day: "numeric", month: "long" }) })}</p>
                <p className="text-small text-fg-muted">{t(c.nextNote)}</p>
              </div>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-[36rem]">
            <div aria-hidden className="absolute -end-6 -top-6 size-[38%] rounded-full bg-accent-soft" />
            <div aria-hidden className="absolute -bottom-2 start-[4%] size-[20%] rounded-full border-[10px] border-accent-soft" />
            <Image src={photos.paint.src} width={photos.paint.width} height={photos.paint.height} focal={photos.paint.focal} alt={t(photos.paint.alt)} aspect="4/5" priority sizes="(min-width: 1024px) 24vw, 62vw" className="absolute start-0 top-0 w-[60%] overflow-hidden rounded-[2rem] shadow-sm" />
            <Image src={photos.reading.src} width={photos.reading.width} height={photos.reading.height} alt={t(photos.reading.alt)} aspect={0.8} sizes="(min-width: 1024px) 15vw, 40vw" className="absolute end-0 top-[14%] w-[36%] overflow-hidden rounded-[1.5rem] shadow-sm" />
            <Image src={photos.blocks.src} width={photos.blocks.width} height={photos.blocks.height} alt={t(photos.blocks.alt)} aspect="1/1" sizes="(min-width: 1024px) 15vw, 40vw" className="absolute end-[12%] bottom-0 w-[40%] overflow-hidden rounded-[1.5rem] shadow-sm" />
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** The signature section on the home page. */
export function RhythmSection() {
  const { t } = useSchool();
  return (
    <Section anchor="day" theme={{ surface: "surface-2" }} headingId="lo-day-h">
      <Container>
        <SectionHeader eyebrow={t(c.dayEyebrow)} title={t(c.dayTitle)} lead={t(c.dayLead)} align="split" headingId="lo-day-h" className="mb-10" />
        <DailyRhythm />
      </Container>
    </Section>
  );
}

export function GroupsOverview() {
  const { t, setGroup } = useSchool();
  return (
    <Section headingId="lo-groups-h">
      <Container>
        <SectionHeader eyebrow={t(c.groupsEyebrow)} title={t(c.groupsTitle)} headingId="lo-groups-h" className="mb-10" />
        <ul className="grid gap-4 @3xl:grid-cols-3">
          {GROUPS.map((id, i) => {
            const g = groups[id];
            return (
              <li key={id} className={cn("flex flex-col gap-4 rounded-[1.75rem] border border-line p-6", i === 1 ? "bg-accent-soft" : "bg-surface")}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-h3 text-fg">{t(g.name)}</h3>
                  <span className="text-small font-semibold text-fg">{t(g.ages)}</span>
                </div>
                <p className="text-fg-muted">{t(g.focus)}</p>
                <p className="mt-auto flex gap-4 border-t border-line pt-4 text-small text-fg">
                  <span>{fill(t(c.children), { n: g.size })}</span>
                  <span>{fill(t(c.adults), { n: g.adults })}</span>
                </p>
                <a href={sitePageHref("programme", id)} onClick={() => setGroup(id)} className="focus-ring self-start rounded-sm text-small font-semibold text-accent-ink underline-offset-4 hover:underline">
                  {t(c.more)} — {t(g.name)}
                </a>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

export function FeesSummary({ anchor }: { anchor?: string }) {
  const { t, locale } = useSchool();
  return (
    <Section anchor={anchor} theme={{ surface: "surface-2" }} headingId="lo-fees-h">
      <Container>
        <div className="grid gap-10 @4xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] @4xl:gap-16">
          <SectionHeader eyebrow={t(c.feesEyebrow)} title={t(c.feesTitle)} lead={t(c.feesLead)} headingId="lo-fees-h" />
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-3">
              {plans.map((p) => (
                <li key={p.id} className="flex flex-col gap-1 rounded-[1.5rem] border border-line bg-surface p-5 @md:flex-row @md:items-center @md:justify-between @md:gap-6">
                  <span className="flex flex-col">
                    <span className="font-semibold text-fg">{t(p.name)}</span>
                    <span className="text-small text-fg-muted">{t(p.hours)}</span>
                  </span>
                  <span className="tabular shrink-0 text-fg">
                    <span className="font-display text-h3">{tl(p.monthly, locale)}</span> <span className="text-small text-fg-muted">{t(c.perMonth)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-small text-fg-muted">{fill(t(c.reg), { fee: tl(REGISTRATION, locale) })}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}

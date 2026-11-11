"use client";

import { buttonVariants, cn, Image } from "@vamos-ui/react";
import { Container, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowRight, Backpack } from "lucide-react";
import { copyFor, fill, GROUPS, groups, longDate, photos, terms, type GroupId } from "./content";
import { DailyRhythm } from "./daily-rhythm";
import { FeesSummary } from "./school-parts";
import { useSchool } from "./school-provider";

const c = {
  crumb: { en: "Programme", tr: "Program" },
  title: { en: "The programme, *group by group*", tr: "Program, *grup grup*" },
  lead: { en: "Mornings are for learning together, afternoons for making things and being outside. Half of every day is in English, led by a native speaker.", tr: "Sabahlar birlikte öğrenmeye, öğleden sonralar bir şeyler yapmaya ve dışarıda olmaya ayrılır. Her günün yarısı ana dili İngilizce olan bir öğretmenle İngilizce geçer." },
  ratio: { en: "Ratio", tr: "Oran" },
  size: { en: "Group size", tr: "Grup mevcudu" },
  room: { en: "Room", tr: "Sınıf" },
  ratioVal: { en: "1 adult to {n} children", tr: "{n} çocuğa 1 yetişkin" },
  children: { en: "{n} children", tr: "{n} çocuk" },
  dayTitle: { en: "The full *day*", tr: "Günün *tamamı*" },
  dayLead: { en: "Every block has a named adult. Times move by ten minutes at most — children notice when they do.", tr: "Her bölümün adı belli bir yetişkini var. Saatler en fazla on dakika kayar — kaydığında çocuklar fark eder." },
  termEyebrow: { en: "School year 2026–27", tr: "2026–27 eğitim yılı" },
  termTitle: { en: "Term *dates*", tr: "Dönem *tarihleri*" },
  packTitle: { en: "In the bag", tr: "Çantada" },
  pack: [
    { en: "A full change of clothes, labelled", tr: "İsim yazılı bir takım yedek kıyafet" },
    { en: "Indoor shoes with a velcro strap", tr: "Cırt cırtlı ev ayakkabısı" },
    { en: "A sun hat (April–October)", tr: "Güneş şapkası (nisan–ekim)" },
    { en: "A small comfort toy for nap time (Sprouts)", tr: "Uyku için küçük bir oyuncak (Filizler)" },
    { en: "Water bottle — we refill it all day", tr: "Su matarası — gün boyu dolduruyoruz" },
  ],
  apply: { en: "Apply for a place", tr: "Yer için başvurun" },
};

function GroupCard({ id, img }: { id: GroupId; img: { src: string; width: number; height: number; alt: { en: string; tr: string } } }) {
  const { t, setGroup, group } = useSchool();
  const g = groups[id];
  const ratio = Math.round(g.size / g.adults);
  return (
    <article id={id} className={cn("flex scroll-mt-28 flex-col overflow-hidden rounded-[2rem] border bg-surface", group === id ? "border-accent" : "border-line")}>
      <Image src={img.src} width={img.width} height={img.height} alt={t(img.alt)} aspect="3/2" sizes="(min-width: 1024px) 30vw, 100vw" />
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-display-m text-fg">{t(g.name)}</h2>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-small font-semibold text-accent-ink">{t(g.ages)}</span>
        </div>
        <p className="text-fg-muted">{t(g.focus)}</p>
        <dl className="mt-auto grid grid-cols-[6rem_minmax(0,1fr)] gap-y-2 border-t border-line pt-4 text-small">
          <dt className="text-fg-muted">{t(c.size)}</dt>
          <dd className="text-fg">{fill(t(c.children), { n: g.size })}</dd>
          <dt className="text-fg-muted">{t(c.ratio)}</dt>
          <dd className="text-fg">{fill(t(c.ratioVal), { n: ratio })}</dd>
          <dt className="text-fg-muted">{t(c.room)}</dt>
          <dd className="text-fg">{t(g.room)}</dd>
        </dl>
        <a href="#rhythm" onClick={() => setGroup(id)} className="focus-ring self-start rounded-sm text-small font-semibold text-accent-ink underline-offset-4 hover:underline">
          {fill(t({ en: "See the {group} day", tr: "{group} gününe bakın" }), { group: t(g.name) })}
        </a>
      </div>
    </article>
  );
}

export function ProgrammePage() {
  const { t, locale } = useSchool();
  const { intl, labels } = copyFor(locale);
  const imgs = [photos.camera, photos.crayons, photos.garden];
  return (
    <>
      <PageIntro locale={intl} labels={labels} variant="ruled" breadcrumb={[{ label: "Little Orchard", href: sitePageHref("home") }, { label: t(c.crumb) }]} title={t(c.title)} lead={t(c.lead)} />
      <Section theme={{ rhythm: "tight" }} aria-label={t(c.crumb)} className="pt-0!">
        <Container>
          <div className="grid gap-5 @4xl:grid-cols-3">
            {GROUPS.map((id, i) => (
              <GroupCard key={id} id={id} img={imgs[i]!} />
            ))}
          </div>
        </Container>
      </Section>

      <Section anchor="rhythm" theme={{ surface: "surface-2" }} headingId="lo-pday-h">
        <Container>
          <SectionHeader eyebrow={t({ en: "Daily rhythm", tr: "Günlük ritim" })} title={t(c.dayTitle)} lead={t(c.dayLead)} align="split" headingId="lo-pday-h" className="mb-10" />
          <DailyRhythm />
        </Container>
      </Section>

      <Section headingId="lo-terms-h">
        <Container>
          <div className="grid gap-12 @4xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] @4xl:gap-16">
            <div>
              <SectionHeader eyebrow={t(c.termEyebrow)} title={t(c.termTitle)} headingId="lo-terms-h" className="mb-8" />
              <ol className="border-t border-line">
                {terms.map((term) => (
                  <li key={term.from} className="grid gap-1 border-b border-line py-5 @2xl:grid-cols-[11rem_minmax(0,1fr)] @2xl:gap-6">
                    <span className="font-semibold text-fg">{t(term.name)}</span>
                    <span className="flex flex-col gap-0.5">
                      <span className="tabular text-fg">
                        {longDate(term.from, locale)} – {longDate(term.to, locale)}
                      </span>
                      {term.note ? <span className="text-small text-fg-muted">{t(term.note)}</span> : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <aside aria-labelledby="lo-pack-h" className="self-start rounded-[2rem] bg-accent-soft p-7">
              <h2 id="lo-pack-h" className="flex items-center gap-2 font-display text-h3 text-fg">
                <Backpack aria-hidden className="size-5 text-accent-ink" />
                {t(c.packTitle)}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.pack.map((p) => (
                  <li key={p.en} className="flex gap-2.5 text-fg">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent-ink" />
                    {t(p)}
                  </li>
                ))}
              </ul>
              <a href={sitePageHref("enrol")} className={cn(buttonVariants({ variant: "primary" }), "mt-6 rounded-full")}>
                {t(c.apply)}
                <ArrowRight aria-hidden className="rtl:rotate-180" />
              </a>
            </aside>
          </div>
        </Container>
      </Section>

      <FeesSummary />
    </>
  );
}

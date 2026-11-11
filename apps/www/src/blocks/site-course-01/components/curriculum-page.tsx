import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge } from "@vamos-ui/react";
import { Container, Cta, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, kindLabel, modules, totals, type SiteLocale } from "./content";
import { LessonMap } from "./lesson-map";

/** Curriculum page: the lesson map at full width, then every module with its lessons and lengths. */
export function CurriculumPage({ locale }: { locale: SiteLocale }) {
  const { t, f, intl, labels } = copyFor(locale);
  const common = { locale: intl, labels };
  const dur = (minutes: number) => f.duration(minutes, { unit: "min" });

  return (
    <>
      <PageIntro
        {...common}
        variant="ruled"
        breadcrumb={[{ label: "Atlas Academy", href: sitePageHref("home") }, { label: t({ en: "Curriculum", tr: "Müfredat" }) }]}
        eyebrow={t({ en: "Data analysis · 2027 edition", tr: "Veri analizi · 2027 sürümü" })}
        title={t({ en: "Thirty-three lessons, in the *order* you will need them", tr: "Otuz üç ders, onlara *ihtiyaç duyacağınız* sırayla" })}
        lead={t({ en: "Lesson lengths are what you watch or do with us. Plan about three times that with practice and write-ups.", tr: "Ders süreleri bizimle izlediğiniz ya da yaptığınız kısımdır. Pratik ve yazımla birlikte bunun yaklaşık üç katını planlayın." })}
        meta={[
          { label: t({ en: "Modules", tr: "Modül" }), value: String(totals.modules) },
          { label: t({ en: "Lessons", tr: "Ders" }), value: String(totals.lessons) },
          { label: t({ en: "Lesson time", tr: "Ders süresi" }), value: dur(totals.minutes) },
          { label: t({ en: "With practice", tr: "Pratikle" }), value: t({ en: `≈ ${Math.round(totals.studyHours)} h`, tr: `≈ ${Math.round(totals.studyHours)} sa` }) },
        ]}
      />

      <Section theme={{ surface: "surface-2", rhythm: "tight" }} aria-label={t({ en: "Curriculum map", tr: "Müfredat haritası" })}>
        <Container size="wide">
          <LessonMap locale={locale} idPrefix="cur-map" />
        </Container>
      </Section>

      <Section headingId="modules-title">
        <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12">
          <div className="@4xl:col-span-4">
            <div className="@4xl:sticky @4xl:top-24">
              <SectionHeader {...common} headingId="modules-title" eyebrow={t({ en: "Module by module", tr: "Modül modül" })} title={t({ en: "What each *week* holds", tr: "Her *hafta* neler var" })} lead={t({ en: "Every module ends with a lab on a real, messy dataset. Reviews are 30-minute calls with your mentor.", tr: "Her modül gerçek ve dağınık bir veri setiyle bir uygulamayla biter. Değerlendirmeler mentorunuzla 30 dakikalık görüşmelerdir." })} />
            </div>
          </div>
          <div className="@4xl:col-span-8">
            <Accordion type="multiple" defaultValue={["01"]} headingLevel={3}>
              {modules.map((m) => {
                const minutes = m.lessons.reduce((s, l) => s + l.minutes, 0);
                return (
                  <AccordionItem key={m.code} value={m.code}>
                    <AccordionTrigger meta={<span className="font-mono text-[11px] tabular">{t({ en: `${m.lessons.length} lessons · ${dur(minutes)}`, tr: `${m.lessons.length} ders · ${dur(minutes)}` })}</span>}>
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono text-small text-accent-ink">{m.code}</span>
                        <span className="font-display text-[1.35rem] leading-tight">{t(m.title)}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4 text-fg-muted text-pretty">
                        {t({ en: "You will be able to ", tr: "Bu modülün sonunda: " })}
                        <span className="text-fg">{t(m.outcome)}</span>.
                      </p>
                      <ol className="flex flex-col border-t border-line">
                        {m.lessons.map((l, i) => (
                          <li key={i} className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 border-b border-line py-3 text-small">
                            <span className="font-mono text-[11px] tabular text-fg-muted">
                              {m.code}.{i + 1}
                            </span>
                            <span className="flex flex-wrap items-center gap-2 text-fg">
                              {t(l.title)}
                              {l.kind !== "video" ? (
                                <Badge tone={l.kind === "lab" ? "neutral" : "outline"} shape="square">
                                  {t(kindLabel[l.kind])}
                                </Badge>
                              ) : null}
                            </span>
                            <span className="font-mono text-[11px] tabular text-fg-muted">{dur(l.minutes)}</span>
                          </li>
                        ))}
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </Container>
      </Section>

      <Cta
        {...common}
        variant="band"
        theme={{ surface: "accent" }}
        title={t({ en: "Winter cohort starts *18 January*", tr: "Kış dönemi *18 Ocak*’ta başlıyor" })}
        actions={[
          { link: { href: sitePageHref("enrol"), label: t({ en: "Hold a seat", tr: "Yer ayırın" }) }, style: "primary" },
          { link: { href: sitePageHref("home", "pricing"), label: t({ en: "See pricing", tr: "Fiyatları görün" }) }, style: "secondary" },
        ]}
        fineprint={t({ en: "Nothing is charged until after your call.", tr: "Görüşmenizden önce hiçbir ücret alınmaz." })}
      />
    </>
  );
}

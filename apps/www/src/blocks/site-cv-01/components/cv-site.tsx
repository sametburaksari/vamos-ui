import { ArrowUpRight } from "lucide-react";
import { Badge, Button, DescriptionList, Separator, Timeline, TimelineBody, TimelineContent, TimelineIndicator, TimelineItem, TimelineTitle } from "@vamos-ui/react";
import { Footer, SiteShellPage, sitePageHref } from "@vamos-ui/react/blocks";
import { copyFor, education, EMAIL, GITHUB, jobs, LINKEDIN, PHONE, posts, profile, projects, skills, spoken, talks, type SiteLocale } from "./content";
import { CvPage } from "./cv-page";
import { CvSheet } from "./cv-sheet";
import { PrintButton } from "./print-button";

export const cvPages = ["home", "cv"];

const FILE_NAME = "Deniz-Arcan-CV-2026";

/**
 * One language version of the personal site: a sticky identity column (name, status, section
 * links, Download PDF, language) beside a single column of numbered sections — about,
 * experience, projects, writing, skills, contact. `?page=cv` shows the same CV as a sheet of
 * paper; printing either page prints only that sheet.
 */
export function CvSite({ locale }: { locale: SiteLocale }) {
  const { t, intl, labels, ym, ymd, span } = copyFor(locale);
  const sections = [
    { id: "about", label: t({ en: "About", tr: "Hakkımda" }) },
    { id: "experience", label: t({ en: "Experience", tr: "Deneyim" }) },
    { id: "projects", label: t({ en: "Projects", tr: "Projeler" }) },
    { id: "writing", label: t({ en: "Writing", tr: "Yazılar" }) },
    { id: "skills", label: t({ en: "Skills", tr: "Yetkinlikler" }) },
    { id: "contact", label: t({ en: "Contact", tr: "İletişim" }) },
  ];
  const n = (id: string) => String(sections.findIndex((s) => s.id === id) + 1).padStart(2, "0");
  const pdfHint = t({ en: "Opens the print dialog; choose “Save as PDF”.", tr: "Yazdırma penceresini açar; “PDF olarak kaydet”i seçin." });
  const pdf = t({ en: "Download PDF", tr: "PDF indir" });

  const SectionHead = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <h2 id={`cv-${id}`} className="mb-5 flex items-baseline gap-3 text-small font-semibold text-fg">
      <span className="font-mono text-[0.75rem] font-normal tabular-nums text-accent-ink">{n(id)}</span>
      {children}
    </h2>
  );

  return (
    <>
      <SiteShellPage id="home" title={t({ en: "Deniz Arcan — product engineer", tr: "Deniz Arcan — ürün mühendisi" })}>
        <div className="@container print:hidden">
          <div className="vb-container grid gap-10 py-10 @5xl:grid-cols-[19rem_minmax(0,1fr)] @5xl:gap-20 @5xl:py-0">
            <header className="flex flex-col gap-6 @5xl:sticky @5xl:top-0 @5xl:h-dvh @5xl:py-16">
              <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:rounded-ui focus:bg-surface focus:px-3 focus:py-2 focus-ring">
                {t({ en: "Skip to content", tr: "İçeriğe geç" })}
              </a>
              <div>
                <p className="font-mono text-[0.75rem] text-fg-muted">deniz@arcan ~ cv</p>
                <h1 className="mt-3 text-[2.5rem] font-[680] leading-[0.95] tracking-[-0.035em]">{profile.name}</h1>
                <p className="mt-2 text-fg-muted">
                  {t(profile.role)} · {t({ en: "Istanbul", tr: "İstanbul" })}
                </p>
              </div>
              <Badge tone="outline" dot className="self-start text-fg">
                {t(profile.status)}
              </Badge>
              <nav aria-label={t({ en: "Sections", tr: "Bölümler" })} className="hidden @5xl:block">
                <ul className="flex flex-col border-s border-line">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="-ms-px flex items-baseline gap-3 border-s border-transparent py-1.5 ps-4 text-small text-fg-muted hover:border-accent hover:text-fg focus-ring rounded-e-[3px]">
                        <span className="font-mono text-[0.6875rem] tabular-nums">{n(s.id)}</span>
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="flex flex-wrap gap-2">
                <PrintButton variant="primary" fileName={FILE_NAME} hint={pdfHint}>
                  {pdf}
                </PrintButton>
                <Button variant="secondary" asChild>
                  <a href={sitePageHref("cv")}>{t({ en: "Printable CV", tr: "Yazdırılabilir CV" })}</a>
                </Button>
              </div>
              <div className="flex items-center gap-4 text-small @5xl:mt-auto">
                <a href={GITHUB} className="text-fg-muted hover:text-fg focus-ring rounded-[2px]">GitHub</a>
                <a href={LINKEDIN} className="text-fg-muted hover:text-fg focus-ring rounded-[2px]">LinkedIn</a>
                <Separator orientation="vertical" className="h-4" />
                <nav aria-label={t({ en: "Language", tr: "Dil" })} className="flex gap-2 font-mono text-[0.75rem]">
                  <a href="?lang=en" hrefLang="en" lang="en" aria-current={locale === "en" ? "true" : undefined} className="rounded-[2px] text-fg-muted hover:text-fg aria-[current]:text-fg aria-[current]:underline underline-offset-4 focus-ring">EN</a>
                  <a href="?lang=tr" hrefLang="tr" lang="tr" aria-current={locale === "tr" ? "true" : undefined} className="rounded-[2px] text-fg-muted hover:text-fg aria-[current]:text-fg aria-[current]:underline underline-offset-4 focus-ring">TR</a>
                </nav>
              </div>
            </header>

            <main id="content" tabIndex={-1} className="flex min-w-0 flex-col gap-16 outline-none @5xl:py-16">
              <section id="about" aria-labelledby="cv-about" className="scroll-mt-8">
                <SectionHead id="about">{t({ en: "About", tr: "Hakkımda" })}</SectionHead>
                <p className="max-w-[58ch] text-pretty text-[1.3125rem] leading-[1.5] tracking-[-0.01em]">{t(profile.intro)}</p>
                <p className="mt-4 max-w-[58ch] text-fg-muted">
                  {t({
                    en: "Right now: pricing and permissions at Tilda Ledger. Before that, freight software that had to work in tunnels.",
                    tr: "Şu sıralar: Tilda Ledger’da fiyatlama ve yetkiler. Öncesinde, tünellerde de çalışması gereken nakliye yazılımı.",
                  })}
                </p>
              </section>

              <section id="experience" aria-labelledby="cv-experience" className="scroll-mt-8">
                <SectionHead id="experience">{t({ en: "Experience", tr: "Deneyim" })}</SectionHead>
                <Timeline variant="steps">
                  {jobs.map((j, i) => (
                    <TimelineItem key={j.id} status={i === 0 ? "current" : "done"}>
                      <TimelineIndicator status={i === 0 ? "current" : "done"} />
                      <TimelineContent className="pb-8">
                        <TimelineTitle>
                          <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                            <span className="font-semibold">
                              {t(j.role)} <span className="text-fg-muted">·</span> {j.company}
                            </span>
                            <span className="font-mono text-[0.75rem] font-normal tabular-nums text-fg-muted">
                              {ym(j.from)} – {j.to ? ym(j.to) : t({ en: "present", tr: "halen" })} · {span(j.from, j.to)}
                            </span>
                          </span>
                        </TimelineTitle>
                        <TimelineBody variant="plain" className="text-small">
                          <p className="text-small text-fg-muted">
                            {t(j.about)} · {t(j.place)}
                          </p>
                          <ul className="mt-2 flex max-w-[64ch] list-disc flex-col gap-1 ps-4 text-fg marker:text-fg-subtle">
                            {j.points.map((p) => (
                              <li key={p.en} className="text-pretty">{t(p)}</li>
                            ))}
                          </ul>
                          <p className="mt-2 font-mono text-[0.75rem] text-fg-muted">{j.stack.join(" / ")}</p>
                        </TimelineBody>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </section>

              <section id="projects" aria-labelledby="cv-projects" className="scroll-mt-8">
                <SectionHead id="projects">{t({ en: "Selected projects", tr: "Seçili projeler" })}</SectionHead>
                <ul className="flex flex-col border-t border-line">
                  {projects.map((p) => (
                    <li key={p.id} className="border-b border-line">
                      <a href={p.href} className="group grid gap-x-6 gap-y-2 rounded-[3px] py-5 focus-ring @2xl:grid-cols-[4.5rem_minmax(0,1fr)]">
                        <span className="font-mono text-[0.75rem] tabular-nums text-fg-muted">{p.year}</span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 font-semibold group-hover:text-accent-ink">
                            {t(p.title)}
                            <ArrowUpRight aria-hidden className="size-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 motion-reduce:transition-none" />
                          </span>
                          <span className="mt-1 block max-w-[64ch] text-pretty text-fg-muted">{t(p.text)}</span>
                          <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                            <span className="font-mono text-[0.75rem] text-accent-ink">{t(p.outcome)}</span>
                            {p.tags.map((tag) => (
                              <Badge key={tag} tone="outline" size="sm">
                                {tag}
                              </Badge>
                            ))}
                          </span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="writing" aria-labelledby="cv-writing" className="scroll-mt-8">
                <SectionHead id="writing">{t({ en: "Writing and talks", tr: "Yazılar ve konuşmalar" })}</SectionHead>
                <ul className="flex flex-col">
                  {posts.map((p) => (
                    <li key={p.href}>
                      <a href={p.href} className="group grid gap-x-6 gap-y-0.5 rounded-[3px] py-2.5 focus-ring @2xl:grid-cols-[7.5rem_minmax(0,1fr)_auto]">
                        <time dateTime={p.date} className="font-mono text-[0.75rem] tabular-nums text-fg-muted">
                          {ymd(p.date)}
                        </time>
                        <span className="text-pretty group-hover:text-accent-ink group-hover:underline underline-offset-4">{t(p.title)}</span>
                        <span className="text-[0.75rem] text-fg-muted">{t({ en: `${p.minutes} min read`, tr: `${p.minutes} dk okuma` })}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <ul className="flex flex-col gap-1.5 text-small">
                  {talks.map((k) => (
                    <li key={k.date} className="grid gap-x-6 @2xl:grid-cols-[7.5rem_minmax(0,1fr)]">
                      <time dateTime={k.date} className="font-mono text-[0.75rem] tabular-nums text-fg-muted">
                        {ymd(k.date)}
                      </time>
                      <span>
                        <span className="text-fg-muted">{t({ en: "Talk", tr: "Konuşma" })} · </span>“{t(k.title)}”, {k.event}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="skills" aria-labelledby="cv-skills" className="scroll-mt-8">
                <SectionHead id="skills">{t({ en: "Skills", tr: "Yetkinlikler" })}</SectionHead>
                <DescriptionList labelWidth="10rem" items={skills.map((s) => ({ key: s.key, label: t(s.label), value: t(s.value) }))} />
                <DescriptionList
                  className="mt-6"
                  layout="grid"
                  columns={2}
                  items={[
                    { key: "spoken", label: t({ en: "Spoken languages", tr: "Konuştuğu diller" }), value: spoken.map((s) => `${t(s.lang)} (${t(s.level)})`).join(", ") },
                    { key: "edu", label: t({ en: "Education", tr: "Eğitim" }), value: `${t(education.degree)}, ${t(education.school)}, ${education.years}. ${t(education.note)}.` },
                  ]}
                />
              </section>

              <section id="contact" aria-labelledby="cv-contact" className="scroll-mt-8">
                <SectionHead id="contact">{t({ en: "Contact", tr: "İletişim" })}</SectionHead>
                <p className="max-w-[40ch] text-[1.3125rem] leading-[1.45] tracking-[-0.01em]">
                  {t({ en: "Hiring for a team that owns something hard? Write to me — I reply within a day.", tr: "Zor bir işi sahiplenen bir ekip için mi arıyorsunuz? Yazın — bir gün içinde yanıt veririm." })}
                </p>
                <DescriptionList
                  className="mt-6"
                  labelWidth="10rem"
                  items={[
                    { key: "email", label: t({ en: "Email", tr: "E-posta" }), value: <a href={`mailto:${EMAIL}`} className="font-medium text-accent-ink underline underline-offset-4">{EMAIL}</a>, copyable: EMAIL },
                    { key: "phone", label: t({ en: "Phone", tr: "Telefon" }), value: <span><a href={`tel:${PHONE}`} className="underline-offset-4 hover:underline">+90 216 000 00 00</a> <span className="text-fg-muted">· {t({ en: "weekdays 10:00–18:00 (GMT+3)", tr: "hafta içi 10.00–18.00 (GMT+3)" })}</span></span> },
                    { key: "cv", label: "CV", value: <PrintButton variant="secondary" size="sm" fileName={FILE_NAME} hint={pdfHint}>{pdf}</PrintButton> },
                  ]}
                />
              </section>
            </main>
          </div>
        </div>
        <CvSheet locale={locale} printOnly />
      </SiteShellPage>

      <SiteShellPage id="cv" title={t({ en: "CV — Deniz Arcan", tr: "Özgeçmiş — Deniz Arcan" })}>
        <CvPage locale={locale} fileName={FILE_NAME} />
      </SiteShellPage>

      <div className="print:hidden">
        <Footer
          locale={intl}
          labels={labels}
          variant="minimal"
          brand={{ name: "Deniz Arcan", href: sitePageHref("home") }}
          social={[
            { network: "linkedin", href: LINKEDIN },
            { network: "x", href: "https://x.com/example" },
          ]}
          legalLinks={[{ href: sitePageHref("cv"), label: t({ en: "Printable CV", tr: "Yazdırılabilir CV" }) }]}
          cookieSettings={false}
          year={2026}
        />
      </div>
    </>
  );
}

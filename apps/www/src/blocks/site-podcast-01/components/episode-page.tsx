import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from "@vamos-ui/react";
import { Container, PageIntro, Section, SectionHeader, sitePageHref } from "@vamos-ui/react/blocks";
import { clock, episodes, showNotes, type Copy } from "./content";
import { EpisodePlayer } from "./player";

/** Episode 48: intro, the full player with the synced transcript, notes / recipes / credits tabs. */
export function EpisodePage({ c }: { c: Copy }) {
  const { t, f, intl, labels } = c;
  const ep = episodes[0]!;
  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: "Long Table", href: sitePageHref("home") }, { label: t({ en: "Episodes", tr: "Bölümler" }), href: sitePageHref("home", "episodes") }, { label: `#${ep.no}` }]}
        eyebrow={t({ en: `Episode ${ep.no} · with ${ep.guest}`, tr: `${ep.no}. bölüm · konuk: ${ep.guest}` })}
        title={t(ep.title)}
        lead={t(ep.summary)}
        meta={[
          { label: t({ en: "Released", tr: "Yayın" }), value: f.date(ep.date, { day: "numeric", month: "long", year: "numeric" }) },
          { label: t({ en: "Length", tr: "Süre" }), value: clock(ep.length) },
          { label: t({ en: "Guest", tr: "Konuk" }), value: `${ep.guest}, ${t(ep.guestRole).toLocaleLowerCase(intl)}` },
        ]}
      />

      <Section anchor="listen" theme={{ rhythm: "tight" }}>
        <Container>
          <EpisodePlayer locale={c.locale} mode="full" />
        </Container>
      </Section>

      <Section anchor="notes" headingId="lt-notes-title">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <SectionHeader headingId="lt-notes-title" eyebrow={t({ en: "Show notes", tr: "Bölüm notları" })} title={t({ en: "From the *table*", tr: "Sofradan" })} />
            <Tabs defaultValue="mentioned">
              <TabsList aria-label={t({ en: "Show notes", tr: "Bölüm notları" })}>
                <TabsTrigger value="mentioned">{t({ en: "Mentioned", tr: "Bahsedilenler" })}</TabsTrigger>
                <TabsTrigger value="recipes">{t({ en: "Recipes", tr: "Tarifler" })}</TabsTrigger>
                <TabsTrigger value="credits">{t({ en: "Credits", tr: "Künye" })}</TabsTrigger>
              </TabsList>
              <TabsContent value="mentioned" className="pt-6">
                <ul className="m-0 grid list-none gap-0 p-0">
                  {showNotes.mentioned.map((m) => (
                    <li key={t(m.title)} className="border-b border-line py-4 first:pt-0">
                      <p className="m-0 font-semibold">{t(m.title)}</p>
                      <p className="m-0 mt-1 text-small text-fg-muted">{t(m.note)}</p>
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="recipes" className="pt-4">
                <Accordion type="single" collapsible defaultValue="r0" headingLevel={3}>
                  {showNotes.recipes.map((r, i) => (
                    <AccordionItem key={i} value={`r${i}`}>
                      <AccordionTrigger>{t(r.title)}</AccordionTrigger>
                      <AccordionContent>
                        <p className="m-0 max-w-[62ch] text-fg-muted">{t(r.body)}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              <TabsContent value="credits" className="pt-6">
                <dl className="m-0 grid gap-0">
                  {showNotes.credits.map((cr) => (
                    <div key={cr.who} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-4 border-b border-line py-3 first:pt-0">
                      <dt className="font-mono text-xs tracking-[0.1em] text-fg-muted uppercase">{t(cr.role)}</dt>
                      <dd className="m-0">{cr.who}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>
            </Tabs>
          </div>
        </Container>
      </Section>

      <Section anchor="more" headingId="lt-more-title" theme={{ surface: "surface-2", rhythm: "tight" }}>
        <Container>
          <SectionHeader headingId="lt-more-title" eyebrow={t({ en: "Next up", tr: "Sıradaki" })} title={t({ en: "Keep *listening*", tr: "Dinlemeye *devam*" })} />
          <ul className="m-0 mt-8 grid list-none gap-4 p-0 md:grid-cols-3">
            {episodes.slice(1, 4).map((e) => (
              <li key={e.no} className="surface flex flex-col rounded-ui-lg p-5">
                <span className="font-mono text-xs text-accent-ink">#{e.no} · {clock(e.length)}</span>
                <span className="mt-2 font-display text-h3 leading-tight font-semibold">{t(e.title)}</span>
                <span className="mt-1 text-small text-fg-muted">{e.guest}</span>
                <a href={sitePageHref("home", "episodes")} className="mt-auto pt-4 text-small font-medium underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
                  {t({ en: "Show in the archive", tr: "Arşivde göster" })}
                  <span className="sr-only">: {t(e.title)}</span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}

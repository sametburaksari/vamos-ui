"use client";

import { ArrowRight, Mail, MessageSquare } from "lucide-react";
import { ArticleLayout, Container, sitePageHref, type RichDoc } from "@vamos-ui/react/blocks";
import { articleById, articlesIn, categoryById, copyFor, EMAIL, type SiteLocale } from "./content";
import { Helpful } from "./helpful";
import { ArticleLink } from "./help-links";
import { useHelp } from "./help-provider";
import { HelpSearch } from "./help-search";

/** One help article: compact search, the article (steps as an ordered list), "was this helpful", related and contact. */
export function ArticlePage({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const { articleId } = useHelp();
  const a = articleById(articleId) ?? articleById("frost-date")!;
  const cat = categoryById(a.category)!;
  const related = articlesIn(a.category).filter((x) => x.id !== a.id);

  const body: RichDoc = {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ text: t(a.intro) }] },
      { type: "heading", level: 2, anchor: "steps", content: [{ text: t({ en: "Steps", tr: "Adımlar" }) }] },
      { type: "list", ordered: true, items: a.steps.map((s) => ({ content: [{ type: "paragraph", content: [{ text: t(s) }] }] })) },
      { type: "heading", level: 2, anchor: "good-to-know", content: [{ text: t({ en: "Good to know", tr: "Bilmekte fayda var" }) }] },
      { type: "blockquote", content: [{ type: "paragraph", content: [{ text: t(a.tip) }] }] },
    ],
  };

  return (
    <>
      <div className="border-b border-line bg-surface-2">
        <Container size="content">
          <div className="py-4">
            <HelpSearch locale={locale} size="md" />
          </div>
        </Container>
      </div>

      <ArticleLayout
        key={a.id}
        locale={intl}
        labels={labels}
        variant="minimal"
        theme={{ rhythm: "tight" }}
        toc={false}
        share={["copy", "email"]}
        post={{
          title: t(a.title),
          dek: t(a.summary),
          body,
          publishedAt: a.updated,
          updatedAt: a.updated,
          readingMinutes: a.minutes,
          category: { href: sitePageHref("category"), label: t(cat.title) },
          breadcrumb: [
            { href: sitePageHref("home"), label: t({ en: "Help centre", tr: "Yardım merkezi" }) },
            { href: sitePageHref("category"), label: t(cat.title) },
          ],
        }}
      />

      <div id="feedback">
        <Container size="content">
          <div className="grid gap-10 pt-4 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
            <div className="flex flex-col gap-10">
              <Helpful key={a.id} locale={locale} count={a.helpful} />
              {related.length ? (
                <nav aria-labelledby="help-related">
                  <h2 id="help-related" className="m-0 font-mono text-xs tracking-[0.1em] text-fg-muted uppercase">
                    {t({ en: `More in ${t(cat.title)}`, tr: `${t(cat.title)} içinde diğerleri` })}
                  </h2>
                  <ul className="m-0 mt-3 list-none p-0">
                    {related.map((r) => (
                      <li key={r.id} className="border-t border-line">
                        <ArticleLink id={r.id} className="focus-ring group flex items-center justify-between gap-4 rounded-ui-sm py-3.5 text-fg">
                          <span className="font-medium group-hover:text-accent-ink">{t(r.title)}</span>
                          <span className="flex shrink-0 items-center gap-2 text-sm text-fg-muted">
                            {f.number(r.minutes)} {t({ en: "min", tr: "dk" })}
                            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
                          </span>
                        </ArticleLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
            <aside aria-labelledby="help-stuck" className="surface h-fit rounded-ui-lg p-6">
              <h2 id="help-stuck" className="m-0 text-lg font-semibold text-fg">
                {t({ en: "Still stuck?", tr: "Hâlâ takıldınız mı?" })}
              </h2>
              <p className="m-0 mt-2 text-sm text-fg-muted">{t({ en: "A gardener on our team answers, usually within 15 minutes on weekdays.", tr: "Ekibimizden bir bahçıvan yanıtlar; hafta içi genellikle 15 dakika içinde." })}</p>
              <ul className="m-0 mt-5 flex list-none flex-col gap-3 p-0 text-sm">
                <li>
                  <a href={sitePageHref("home", "contact")} className="focus-ring inline-flex items-center gap-2 rounded-ui-sm font-medium text-accent-ink hover:underline">
                    <MessageSquare aria-hidden className="size-4" />
                    {t({ en: "Chat in the app", tr: "Uygulamada sohbet" })}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${EMAIL}?subject=${encodeURIComponent(t(a.title))}`} className="focus-ring inline-flex items-center gap-2 rounded-ui-sm font-medium text-accent-ink hover:underline">
                    <Mail aria-hidden className="size-4" />
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </aside>
          </div>
        </Container>
      </div>
    </>
  );
}

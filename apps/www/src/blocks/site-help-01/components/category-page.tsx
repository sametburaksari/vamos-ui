"use client";

import * as React from "react";
import { ArrowRight, Search } from "lucide-react";
import { Input, foldText } from "@vamos-ui/react";
import { Container, PageIntro, sitePageHref } from "@vamos-ui/react/blocks";
import { articlesIn, categories, categoryById, copyFor, type SiteLocale } from "./content";
import { CategoryIcon } from "./category-icon";
import { ArticleLink, CategoryLink } from "./help-links";
import { useHelp } from "./help-provider";

/** One category: intro, the other categories as a side list, and its articles with a filter. */
export function CategoryPage({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const { categoryId } = useHelp();
  const cat = categoryById(categoryId)!;
  const list = articlesIn(cat.id);
  const [filter, setFilter] = React.useState("");
  React.useEffect(() => setFilter(""), [cat.id]);
  const q = foldText(filter.trim(), intl);
  const shown = q ? list.filter((a) => foldText(`${t(a.title)} ${t(a.summary)} ${t(a.keywords)}`, intl).includes(q)) : list;
  const latest = list.reduce((m, a) => (a.updated > m ? a.updated : m), "");

  return (
    <>
      <PageIntro
        key={cat.id}
        locale={intl}
        labels={labels}
        variant="ruled"
        headingLevel={1}
        breadcrumb={[{ label: t({ en: "Help centre", tr: "Yardım merkezi" }), href: sitePageHref("home") }, { label: t(cat.title) }]}
        eyebrow={t({ en: "Category", tr: "Kategori" })}
        title={t(cat.title)}
        lead={t(cat.text)}
        meta={[
          { label: t({ en: "Articles", tr: "Makale" }), value: f.number(list.length) },
          { label: t({ en: "Last updated", tr: "Son güncelleme" }), value: f.date(latest, "long") },
        ]}
      />

      <Container size="content">
        <div className="grid gap-10 pb-24 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
            <nav aria-label={t({ en: "Categories", tr: "Kategoriler" })} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 pb-1 lg:flex-col lg:overflow-visible">
                {categories.map((x) => {
                  const current = x.id === cat.id;
                  return (
                    <li key={x.id} className="shrink-0">
                      <CategoryLink
                        id={x.id}
                        aria-current={current ? "page" : undefined}
                        className={[
                          "focus-ring flex items-center gap-2.5 rounded-ui px-3 py-2 text-sm whitespace-nowrap transition-colors",
                          current ? "bg-selected font-semibold text-fg shadow-[inset_2px_0_0_var(--accent)] rtl:shadow-[inset_-2px_0_0_var(--accent)]" : "text-fg-muted hover:bg-hover hover:text-fg",
                        ].join(" ")}
                      >
                        <CategoryIcon id={x.id} className="size-4 shrink-0" />
                        {t(x.title)}
                      </CategoryLink>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="min-w-0">
              <div className="max-w-md">
                <Input
                  type="search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  leading={<Search aria-hidden />}
                  aria-label={t({ en: `Filter articles in ${t(cat.title)}`, tr: `${t(cat.title)} içinde filtrele` })}
                  placeholder={t({ en: "Filter this category", tr: "Bu kategoride filtrele" })}
                />
              </div>
              <p className="m-0 mt-4 text-sm text-fg-muted" aria-live="polite">
                {t({ en: `${shown.length} of ${list.length} articles`, tr: `${list.length} makaleden ${shown.length} tanesi` })}
              </p>
              <ol className="m-0 mt-3 list-none p-0">
                {shown.map((a) => (
                  <li key={a.id} className="border-t border-line last:border-b">
                    <ArticleLink id={a.id} className="focus-ring group grid gap-1 rounded-ui-sm py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8">
                      <span className="text-lg font-semibold text-fg group-hover:text-accent-ink">{t(a.title)}</span>
                      <span className="row-span-2 hidden items-center gap-2 self-center text-sm text-fg-muted sm:flex">
                        {f.number(a.minutes)} {t({ en: "min", tr: "dk" })}
                        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
                      </span>
                      <span className="text-fg-muted">{t(a.summary)}</span>
                    </ArticleLink>
                  </li>
                ))}
              </ol>
              {!shown.length ? <p className="m-0 mt-6 text-fg-muted">{t({ en: "Nothing here matches — try the search at the top of the help centre.", tr: "Burada eşleşen yok — yardım merkezinin üstündeki aramayı deneyin." })}</p> : null}
            </div>
        </div>
      </Container>
    </>
  );
}

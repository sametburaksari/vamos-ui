"use client";

import * as React from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Badge, Button, Input, Kbd, Table, TableBody, TableCaption, TableCell, TableContainer, TableHead, TableHeader, TableRow } from "@vamos-ui/react";
import { Container, PageIntro, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { CodePanel } from "./code-panel";
import { copyFor, docGroups, docs, LANG_LABEL, sdks, type DocGroup, type SiteLocale } from "./content";
import { useLang } from "./lang-provider";

const groups = Object.keys(docGroups) as DocGroup[];

/** Docs landing: search with a "/" shortcut, guides grouped by job, the first request in your language, SDKs. */
export function DocsPage({ locale }: { locale: SiteLocale }) {
  const c = copyFor(locale);
  const { t, f, intl, labels } = c;
  const { lang, setLang } = useLang();
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // "/" focuses the search, as on most developer docs.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLocaleLowerCase(intl);
  const hits = docs.filter((d) => !q || `${t(d.title)} ${t(d.summary)} ${t(docGroups[d.group])}`.toLocaleLowerCase(intl).includes(q));

  return (
    <>
      <PageIntro
        locale={intl}
        labels={labels}
        variant="ruled"
        breadcrumb={[{ label: "Relay", href: sitePageHref("home") }, { label: t({ en: "Docs", tr: "Belgeler" }) }]}
        eyebrow={t({ en: "Documentation · API v4", tr: "Belgeler · API v4" })}
        title={t({ en: "Everything between *send* and 204", tr: "*Gönder* ile 204 arasındaki her şey" })}
        lead={t({
          en: "Guides for the three jobs — sending, receiving, operating — and the full API reference. Code samples follow the language you pick, on every page.",
          tr: "Üç iş için rehberler — gönderme, alma, işletme — ve tam API başvurusu. Kod örnekleri her sayfada seçtiğiniz dili izler.",
        })}
        meta={[
          { label: t({ en: "API version", tr: "API sürümü" }), value: "v4 · 2026-06-01" },
          { label: t({ en: "Guides", tr: "Rehber" }), value: f.number(docs.length) },
          { label: t({ en: "Your language", tr: "Diliniz" }), value: LANG_LABEL[lang] },
        ]}
      />

      <Section anchor="guides" headingId="relay-guides-title" theme={{ rhythm: "tight" }}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-14">
            <div className="min-w-0">
              <h2 id="relay-guides-title" className="sr-only">
                {t({ en: "Guides", tr: "Rehberler" })}
              </h2>
              <div role="search" className="max-w-xl">
                <label htmlFor="relay-docs-search" className="mb-2 block font-mono text-[11px] tracking-[0.08em] text-fg-muted uppercase">
                  {t({ en: "Search the docs", tr: "Belgelerde ara" })}
                </label>
                <Input
                  id="relay-docs-search"
                  ref={inputRef}
                  size="lg"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t({ en: "retries, signature, 429…", tr: "yeniden deneme, imza, 429…" })}
                  leading={<Search aria-hidden />}
                  trailing={<Kbd aria-hidden>/</Kbd>}
                  aria-describedby="relay-docs-count"
                />
                <p id="relay-docs-count" aria-live="polite" className="m-0 mt-2 text-xs text-fg-muted">
                  {q
                    ? t({ en: hits.length === 1 ? "1 guide matches" : `${hits.length} guides match`, tr: `${hits.length} rehber eşleşti` })
                    : t({ en: "Press / anywhere on this page to search.", tr: "Aramak için bu sayfada herhangi bir yerde / tuşuna basın." })}
                </p>
              </div>

              {hits.length === 0 ? (
                <div className="mt-10 rounded-ui-lg border border-dashed border-line px-6 py-10 text-center">
                  <p className="m-0 font-medium text-fg">{t({ en: `Nothing for “${query}”`, tr: `“${query}” için sonuç yok` })}</p>
                  <p className="m-0 mt-1 text-sm text-fg-muted">{t({ en: "Try “signature” or “replay”, or ask us.", tr: "“imza” ya da “yeniden” deneyin, veya bize sorun." })}</p>
                  <Button className="mt-4" variant="secondary" size="sm" onClick={() => setQuery("")}>
                    {t({ en: "Clear search", tr: "Aramayı temizle" })}
                  </Button>
                </div>
              ) : (
                <div className="mt-10 grid gap-10">
                  {groups.map((g) => {
                    const items = hits.filter((d) => d.group === g);
                    if (!items.length) return null;
                    return (
                      <section key={g} aria-labelledby={`relay-docs-${g}`}>
                        <h3 id={`relay-docs-${g}`} className="m-0 flex items-baseline gap-3 font-mono text-[11px] tracking-[0.1em] text-fg-muted uppercase">
                          <span className="text-accent-ink">{String(groups.indexOf(g) + 1).padStart(2, "0")}</span>
                          {t(docGroups[g])}
                        </h3>
                        <ul className="m-0 mt-3 grid list-none overflow-hidden rounded-ui-lg border border-line bg-surface p-0 sm:grid-cols-2">
                          {items.map((d) => (
                            <li key={d.id} className="border-t border-line first:border-t-0 sm:odd:border-e sm:[&:nth-child(2)]:border-t-0">
                              <a href={`https://docs.relay.example.com/${d.id}`} className="group flex h-full flex-col gap-1 px-4 py-3.5 no-underline focus-ring hover:bg-hover">
                                <span className="flex items-center justify-between gap-3 font-medium text-fg">
                                  {t(d.title)}
                                  <ArrowUpRight aria-hidden className="size-4 shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-ink" />
                                </span>
                                <span className="text-sm text-fg-muted">{t(d.summary)}</span>
                                <span className="mt-1 font-mono text-[11px] text-fg-subtle">{t({ en: `${d.minutes} min read`, tr: `${d.minutes} dk okuma` })}</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>

            <aside aria-labelledby="relay-first-title" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
              <h2 id="relay-first-title" className="m-0 font-display text-xl text-fg">
                {t({ en: "Retry every failed delivery", tr: "Başarısız tüm teslimleri yeniden deneyin" })}
              </h2>
              <p className="m-0 mt-2 text-sm text-fg-muted">
                {t({ en: "The most-copied snippet in our docs. Pick a language: the whole site follows.", tr: "Belgelerimizde en çok kopyalanan örnek. Bir dil seçin: tüm site onu izler." })}
              </p>
              <CodePanel
                sample="retry"
                className="mt-4"
                numbers={false}
                tabsLabel={t({ en: "Code language", tr: "Kod dili" })}
                copyLabel={t({ en: "Copy code", tr: "Kodu kopyala" })}
                copiedLabel={t({ en: "Copied", tr: "Kopyalandı" })}
              />
            </aside>
          </div>
        </Container>
      </Section>

      <Section anchor="sdks" headingId="relay-sdks-title" theme={{ surface: "surface-2" }}>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="m-0 font-mono text-[11px] tracking-[0.1em] text-fg-muted uppercase">SDK</p>
              <h2 id="relay-sdks-title" className="m-0 mt-2 font-display text-[length:var(--text-display-m)] leading-[1.05] text-fg">
                {t({ en: "Four official SDKs", tr: "Dört resmî SDK" })}
              </h2>
            </div>
            <p className="m-0 max-w-[40ch] text-sm text-fg-muted">{t({ en: "Generated from the same OpenAPI file, released on the same day as the API.", tr: "Aynı OpenAPI dosyasından üretilir, API ile aynı gün yayımlanır." })}</p>
          </div>
          <TableContainer className="mt-8">
            <Table>
              <TableCaption className="sr-only">{t({ en: "Official SDKs with package name, version and runtime", tr: "Paket adı, sürüm ve çalışma ortamıyla resmî SDK’lar" })}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>{t({ en: "Language", tr: "Dil" })}</TableHead>
                  <TableHead>{t({ en: "Package", tr: "Paket" })}</TableHead>
                  <TableHead>{t({ en: "Version", tr: "Sürüm" })}</TableHead>
                  <TableHead>{t({ en: "Runtime", tr: "Çalışma ortamı" })}</TableHead>
                  <TableHead>{t({ en: "Released", tr: "Yayın" })}</TableHead>
                  <TableHead>
                    <span className="sr-only">{t({ en: "Use in samples", tr: "Örneklerde kullan" })}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sdks.map((s) => (
                  <TableRow key={s.lang} selected={s.lang === lang}>
                    <TableCell className="font-medium text-fg">{LANG_LABEL[s.lang]}</TableCell>
                    <TableCell className="font-mono text-[13px]">{s.pkg}</TableCell>
                    <TableCell>
                      <Badge tone="outline" shape="square" className="font-mono">
                        {s.version}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-fg-muted">{s.runtime}</TableCell>
                    <TableCell className="text-fg-muted tabular">{f.date(s.released)}</TableCell>
                    <TableCell className="text-end">
                      <Button
                        size="xs"
                        variant={s.lang === lang ? "soft" : "ghost"}
                        aria-pressed={s.lang === lang}
                        onClick={() => setLang(s.lang)}
                      >
                        {s.lang === lang ? t({ en: "In use", tr: "Kullanılıyor" }) : t({ en: "Use in samples", tr: "Örneklerde kullan" })}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Section>
    </>
  );
}

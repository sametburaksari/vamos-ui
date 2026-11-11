"use client";

import * as React from "react";
import { cn, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowUpRight } from "lucide-react";
import { copyFor, projectPage, projects, statuses, typologies, type SiteLocale, type Typology } from "./content";

/** The project index as a drawing register: typology filter, numbered rows, linked when a page exists. */
export function ProjectIndex({ locale }: { locale: SiteLocale }) {
  const { t, intl } = copyFor(locale);
  const [type, setType] = React.useState<Typology | "all">("all");
  const rows = projects.filter((p) => type === "all" || p.typology === type).sort((a, b) => b.year - a.year);
  const nf = new Intl.NumberFormat(intl);
  const typeOf = (id: Typology) => t(typologies.find((x) => x.id === id)!.label);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-fg pb-3">
        <ToggleGroup variant="ghost" size="sm" aria-label={t({ en: "Typology", tr: "Tipoloji" })} value={type} onValueChange={(v) => setType(v as Typology | "all")}>
          <ToggleGroupItem value="all">{t({ en: "All", tr: "Tümü" })}</ToggleGroupItem>
          {typologies.map((ty) => (
            <ToggleGroupItem key={ty.id} value={ty.id}>
              {t(ty.label)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p aria-live="polite" className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
          {t({ en: `${rows.length} of ${projects.length} projects`, tr: `${projects.length} projeden ${rows.length}` })}
        </p>
      </div>
      <table className="w-full border-collapse text-small">
        <caption className="sr-only">{t({ en: "Project register", tr: "Proje dizini" })}</caption>
        <thead>
          <tr className="border-b border-line text-start font-mono text-[10px] uppercase tracking-[0.14em] text-fg-muted">
            <th scope="col" className="w-20 py-2 pe-3 text-start font-normal">{t({ en: "No.", tr: "No." })}</th>
            <th scope="col" className="py-2 pe-3 text-start font-normal">{t({ en: "Project", tr: "Proje" })}</th>
            <th scope="col" className="hidden py-2 pe-3 text-start font-normal @3xl:table-cell">{t({ en: "Location", tr: "Yer" })}</th>
            <th scope="col" className="hidden py-2 pe-3 text-start font-normal @5xl:table-cell">{t({ en: "Typology", tr: "Tipoloji" })}</th>
            <th scope="col" className="hidden py-2 pe-3 text-end font-normal @5xl:table-cell">m²</th>
            <th scope="col" className="hidden py-2 pe-3 text-start font-normal @3xl:table-cell">{t({ en: "Status", tr: "Durum" })}</th>
            <th scope="col" className="w-14 py-2 text-end font-normal">{t({ en: "Year", tr: "Yıl" })}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className={cn("group border-b border-line align-baseline", p.page && "hover:bg-hover")}>
              <td className="py-3 pe-3 font-mono text-[11px] text-fg-muted">{p.no}</td>
              <th scope="row" className="py-3 pe-3 text-start font-normal">
                {p.page ? (
                  <a href={sitePageHref(projectPage(p.id))} className="inline-flex items-baseline gap-1.5 rounded-[2px] text-body text-fg underline-offset-4 focus-ring group-hover:underline">
                    {t(p.name)}
                    <ArrowUpRight aria-hidden className="size-3.5 self-center text-accent-ink" />
                  </a>
                ) : (
                  <span className="text-body text-fg">{t(p.name)}</span>
                )}
                <span className="block text-fg-muted @3xl:hidden">{t(p.place)}</span>
              </th>
              <td className="hidden py-3 pe-3 text-fg-muted @3xl:table-cell">{t(p.place)}</td>
              <td className="hidden py-3 pe-3 text-fg-muted @5xl:table-cell">{typeOf(p.typology)}</td>
              <td className="tabular hidden py-3 pe-3 text-end text-fg-muted @5xl:table-cell">{nf.format(p.area)}</td>
              <td className="hidden py-3 pe-3 @3xl:table-cell">
                <span className="inline-flex items-center gap-1.5 text-fg-muted">
                  <span aria-hidden className={cn("size-1.5 rounded-full", p.status === "site" || p.status === "design" ? "bg-accent" : "bg-fg-subtle")} />
                  {t(statuses[p.status])}
                </span>
              </td>
              <td className="tabular py-3 text-end font-mono text-[12px] text-fg">{p.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

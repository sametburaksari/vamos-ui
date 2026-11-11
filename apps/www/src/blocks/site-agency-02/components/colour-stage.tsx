"use client";

import * as React from "react";
import { Button, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { accentScope, BrandMark, ColourBlock } from "./colour-block";
import { projectById, projects, STUDIO_ACCENT, STUDIO_PALETTE, type ProjectId } from "./content";
import { nextProject, useCopy, useProject } from "./project-provider";

type StageId = ProjectId | "studio";

/**
 * The signature: a full-bleed colour stage under oversized type. Pick a client and the whole
 * stage takes that brand's colour (contrast-checked), its mark, palette, typeface and result —
 * a brand system you can flip through. Arrow keys move between clients; the choice carries to
 * the case page.
 */
export function ColourStage() {
  const { t } = useCopy();
  const { setProject } = useProject();
  const [stage, setStage] = React.useState<StageId>("studio");
  const project = stage === "studio" ? null : projectById(stage);
  const colour = project?.colour ?? STUDIO_ACCENT;

  const choose = (id: StageId) => {
    setStage(id);
    if (id !== "studio") setProject(id);
  };
  const step = (dir: 1 | -1) => choose(stage === "studio" ? (dir === 1 ? projects[0]!.id : projects[projects.length - 1]!.id) : nextProject(stage, dir));

  return (
    <section aria-labelledby="tt-hero-title" {...accentScope(colour)} className="relative isolate overflow-hidden bg-accent text-accent-fg transition-[background-color,color] duration-500 ease-out motion-reduce:transition-none [container-type:inline-size]">
      <div className="vb-container grid gap-8 pt-8 pb-6 sm:pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[11px] uppercase tracking-[0.16em]">
          <span>{t({ en: "Tamtam — brand studio, Karaköy · since 2014", tr: "Tamtam — marka stüdyosu, Karaköy · 2014’ten beri" })}</span>
          <span aria-live="polite">{project ? `${t({ en: "Now showing", tr: "Şu an" })}: ${project.client}, ${project.year}` : t({ en: "Now showing: the studio", tr: "Şu an: stüdyo" })}</span>
        </div>

        <h1 id="tt-hero-title" className="font-display text-[clamp(3.4rem,15cqi,15.5rem)] leading-[0.84] tracking-[-0.055em] text-balance">
          {t({ en: "Brands you can point at.", tr: "Parmakla gösterilen markalar." })}
        </h1>

        <div className="grid gap-6 border-t-2 border-current pt-6 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,0.9fr)] md:items-start">
          <div className="flex size-24 items-center justify-center sm:size-32">
            {project ? <BrandMark shape={project.mark} className="size-full" /> : <span aria-hidden className="font-display text-[5rem] leading-none tracking-[-0.06em] sm:text-[7rem]">tt</span>}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[clamp(1.9rem,5cqi,4.25rem)] leading-[0.95] tracking-[-0.04em]">{project ? project.client : "Tamtam"}</p>
            <p className="mt-3 max-w-[38ch] text-[15px] leading-snug">
              {project
                ? t(project.headline)
                : t({ en: "Nine people who make names, identities and packaging for companies that would rather be remembered than liked.", tr: "Beğenilmektense hatırlanmayı tercih eden şirketler için isim, kimlik ve ambalaj yapan dokuz kişi." })}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px]">
            <div className="col-span-2">
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "Palette", tr: "Palet" })}</dt>
              <dd className="mt-2 flex gap-2">
                {(project?.palette ?? STUDIO_PALETTE).map((c) => (
                  <ColourBlock key={c.hex} colour={c.hex} className="flex h-14 min-w-0 flex-1 flex-col justify-end rounded-ui-sm px-2 py-1.5 ring-2 ring-current">
                    <span className="truncate font-mono text-[10px] leading-tight">{c.name}</span>
                    <span className="truncate font-mono text-[10px] leading-tight">{c.hex}</span>
                  </ColourBlock>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "Type", tr: "Yazı" })}</dt>
              <dd className="mt-1">{project?.typeface ?? t({ en: "Studio grotesk, set heavy", tr: "Stüdyo groteski, kalın" })}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{project ? t({ en: "Result", tr: "Sonuç" }) : t({ en: "Since 2014", tr: "2014’ten beri" })}</dt>
              <dd className="mt-1">{project ? `${project.results[0]!.value} ${t(project.results[0]!.label)}` : t({ en: "64 identities, 11 countries", tr: "64 kimlik, 11 ülke" })}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t-2 border-current pt-5">
          <span id="tt-stage-label" className="font-mono text-[11px] uppercase tracking-[0.14em]">
            {t({ en: "Recolour the page", tr: "Sayfayı boyayın" })}
          </span>
          <ToggleGroup
            aria-labelledby="tt-stage-label"
            variant="ghost"
            size="sm"
            value={stage}
            onValueChange={(v) => v && choose(v as StageId)}
            className="flex-wrap [&>[data-state=on]]:bg-accent-fg [&>[data-state=on]]:text-accent [&>*]:text-current [&>*:hover]:bg-[color-mix(in_oklch,var(--accent-fg)_14%,transparent)]"
          >
            <ToggleGroupItem value="studio">Tamtam</ToggleGroupItem>
            {projects.map((p) => (
              <ToggleGroupItem key={p.id} value={p.id}>
                <span aria-hidden {...accentScope(p.colour)} className="size-2.5 rounded-full bg-accent ring-1 ring-current" />
                {p.client}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <div className="ms-auto flex items-center gap-2">
            <Button size="icon-sm" variant="ghost" className="text-current hover:bg-[color-mix(in_oklch,var(--accent-fg)_14%,transparent)]" onClick={() => step(-1)} aria-label={t({ en: "Previous client", tr: "Önceki müşteri" })}>
              <ArrowLeft className="rtl:rotate-180" />
            </Button>
            <Button size="icon-sm" variant="ghost" className="text-current hover:bg-[color-mix(in_oklch,var(--accent-fg)_14%,transparent)]" onClick={() => step(1)} aria-label={t({ en: "Next client", tr: "Sonraki müşteri" })}>
              <ArrowRight className="rtl:rotate-180" />
            </Button>
            {project ? (
              <Button asChild size="sm" className="border-0 bg-accent-fg text-accent hover:bg-accent-fg">
                <a href={sitePageHref("case")}>
                  {t({ en: "Read the case", tr: "Vakayı okuyun" })}
                  <ArrowUpRight aria-hidden className="rtl:-scale-x-100" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

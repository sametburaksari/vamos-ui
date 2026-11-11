"use client";

import { sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowUpRight } from "lucide-react";
import { accentScope, BrandMark } from "./colour-block";
import { projects } from "./content";
import { useCopy, useProject } from "./project-provider";

/**
 * The work index: client names set huge, one per row. Hover or focus floods the row with the
 * client's colour from the bottom; the link opens that project's case page.
 */
export function ProjectIndex() {
  const { t } = useCopy();
  const { setProject } = useProject();
  return (
    <ol className="border-t-2 border-fg [container-type:inline-size]">
      {projects.map((p, i) => (
        <li key={p.id} {...accentScope(p.colour)} className="group relative isolate overflow-hidden border-b-2 border-fg">
          <span aria-hidden className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-accent transition-transform duration-300 ease-out group-focus-within:scale-y-100 group-hover:scale-y-100 motion-reduce:transition-none" />
          <a
            href={sitePageHref("case")}
            onClick={() => setProject(p.id)}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-5 outline-none transition-colors group-hover:text-accent-fg focus-visible:text-accent-fg sm:grid-cols-[3.5rem_minmax(0,1fr)_auto_auto] sm:py-6"
          >
            <span className="font-mono text-[12px] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <span className="min-w-0">
              <span className="block font-display text-[clamp(2.1rem,8.5cqi,7.5rem)] [overflow-wrap:anywhere] leading-[0.9] tracking-[-0.05em]">{p.client}</span>
              <span className="mt-2 block text-[13px]">
                {t(p.sector)} · {p.disciplines.map((d) => t(d)).join(", ")}
              </span>
            </span>
            <BrandMark shape={p.mark} className="hidden size-14 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none sm:block" />
            <span className="flex items-center gap-2 font-mono text-[12px] tabular-nums">
              {p.year}
              <ArrowUpRight aria-hidden className="size-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none rtl:-scale-x-100" />
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}

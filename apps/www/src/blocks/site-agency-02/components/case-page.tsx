"use client";

import { Badge, Button } from "@vamos-ui/react";
import { Container, Section, sitePageHref } from "@vamos-ui/react/blocks";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { accentScope, BrandMark, ColourBlock } from "./colour-block";
import { projectById } from "./content";
import { nextProject, useCopy, useProject } from "./project-provider";

/**
 * Case study for the chosen project (from the stage or the index). The whole header is the
 * client's colour block; applications are drawn from its mark and palette; "Next project"
 * walks through all six without leaving the page.
 */
export function CasePage() {
  const { t } = useCopy();
  const { project: id, setProject } = useProject();
  const p = projectById(id);
  const next = projectById(nextProject(id));

  const applications = [
    { label: p.deliverables[0]!, wide: true },
    { label: p.deliverables[1]!, wide: false },
    { label: p.deliverables[2]!, wide: false },
  ];

  return (
    <>
      <section aria-labelledby="tt-case-title" {...accentScope(p.colour)} className="bg-accent text-accent-fg [container-type:inline-size]">
        <div className="vb-container grid gap-8 pt-8 pb-10 sm:pt-12">
          <nav aria-label={t({ en: "Breadcrumb", tr: "İçerik yolu" })} className="font-mono text-[11px] uppercase tracking-[0.16em]">
            <a href={sitePageHref("home", "work")} className="underline-offset-4 hover:underline focus-ring rounded-ui-sm">
              {t({ en: "Work", tr: "İşler" })}
            </a>
            <span aria-hidden> / </span>
            <span aria-current="page">{p.client}</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 id="tt-case-title" className="max-w-full font-display text-[clamp(3.2rem,13cqi,13rem)] leading-[0.85] tracking-[-0.055em] [overflow-wrap:anywhere]">
              {p.client}
            </h1>
            <BrandMark shape={p.mark} title={t({ en: `${p.client} mark`, tr: `${p.client} işareti` })} className="size-28 shrink-0 sm:size-40" />
          </div>
          <p className="max-w-[30ch] font-display text-[clamp(1.5rem,3.4cqi,2.75rem)] leading-[1.05] tracking-[-0.035em]">{t(p.headline)}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t-2 border-current pt-5 text-[14px] sm:grid-cols-4">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "Client", tr: "Müşteri" })}</dt>
              <dd className="mt-1">{t(p.sector)}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "Year", tr: "Yıl" })}</dt>
              <dd className="mt-1">{p.year}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "Scope", tr: "Kapsam" })}</dt>
              <dd className="mt-1">{p.disciplines.map((d) => t(d)).join(", ")}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-[0.14em]">{t({ en: "Duration", tr: "Süre" })}</dt>
              <dd className="mt-1">
                {p.weeks} {t({ en: "weeks", tr: "hafta" })}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <Section anchor="story" headingId="tt-story-title">
        <Container size="wide">
          <h2 id="tt-story-title" className="sr-only">
            {t({ en: "The story", tr: "Hikâye" })}
          </h2>
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">{t({ en: "The problem", tr: "Sorun" })}</p>
              <p className="mt-3 text-[clamp(1.1rem,1.6vw,1.35rem)] leading-relaxed">{t(p.problem)}</p>
            </div>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">{t({ en: "What we did", tr: "Ne yaptık" })}</p>
              <p className="mt-3 text-[clamp(1.1rem,1.6vw,1.35rem)] leading-relaxed">{t(p.approach)}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {p.deliverables.map((d) => (
                  <li key={d.en}>
                    <Badge tone="outline" size="md">
                      {t(d)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* Applications: drawn from the brand's own palette */}
      <Section anchor="system" headingId="tt-system-title" theme={{ rhythm: "tight" }}>
        <Container size="wide">
          <h2 id="tt-system-title" className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-muted">
            {t({ en: "The system", tr: "Sistem" })}
          </h2>
          <ul className="mt-6 grid auto-rows-[minmax(12rem,auto)] gap-2 md:grid-cols-3">
            {applications.map((a, i) => {
              const c = p.palette[i % p.palette.length]!;
              return (
                <ColourBlock as="li" key={a.label.en} colour={c.hex} className={`relative flex flex-col justify-between overflow-hidden rounded-ui p-5 ${a.wide ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <span className="font-mono text-[11px]">
                    {c.name} · {c.hex}
                  </span>
                  <BrandMark shape={p.mark} className={a.wide ? "absolute end-5 top-5 size-16 md:end-8 md:top-8 md:size-[min(12rem,28%)]" : "absolute end-5 top-5 size-14"} />
                  <span className={a.wide ? "max-w-[18ch] font-display text-[clamp(2rem,4.5vw,4rem)] leading-[0.95] tracking-[-0.04em]" : "max-w-[20ch] font-display text-2xl leading-tight tracking-[-0.03em]"}>{t(a.label)}</span>
                </ColourBlock>
              );
            })}
          </ul>
          <p className="mt-4 font-mono text-[12px] text-fg-muted">
            {t({ en: "Typeface", tr: "Yazı karakteri" })}: {p.typeface}
          </p>
        </Container>
      </Section>

      <Section anchor="results" headingId="tt-results-title" theme={{ surface: "surface-2" }}>
        <Container size="wide">
          <h2 id="tt-results-title" className="font-display text-display-m">
            {t({ en: "What changed", tr: "Ne değişti" })}
          </h2>
          <dl className="mt-8 grid gap-px overflow-hidden border-y-2 border-fg sm:grid-cols-3">
            {p.results.map((r) => (
              <div key={r.label.en} className="py-6 sm:pe-6">
                <dt className="sr-only">{t(r.label)}</dt>
                <dd className="font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] tracking-[-0.05em] tabular-nums">{r.value}</dd>
                <dd aria-hidden className="mt-2 max-w-[26ch] text-[14px] text-fg-muted">
                  {t(r.label)}
                </dd>
              </div>
            ))}
          </dl>
          <figure className="mt-12 max-w-[52ch]">
            <blockquote className="font-display text-[clamp(1.5rem,2.8vw,2.4rem)] leading-[1.1] tracking-[-0.03em]">“{t(p.quote.text)}”</blockquote>
            <figcaption className="mt-4 text-[14px]">
              <span className="font-semibold">{p.quote.author}</span> <span className="text-fg-muted">— {t(p.quote.role)}</span>
            </figcaption>
          </figure>
        </Container>
      </Section>

      <ColourBlock as="section" colour={next.colour} aria-labelledby="tt-next-title" className="[container-type:inline-size]">
        <div className="vb-container flex flex-wrap items-end justify-between gap-6 py-12">
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em]">{t({ en: "Next project", tr: "Sonraki proje" })}</p>
            <h2 id="tt-next-title" className="mt-2 font-display text-[clamp(2.6rem,9cqi,8rem)] leading-[0.88] tracking-[-0.055em] [overflow-wrap:anywhere]">
              {next.client}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button size="lg" className="border-0 bg-accent-fg text-accent hover:bg-accent-fg" onClick={() => setProject(nextProject(id, -1))}>
              <ArrowLeft aria-hidden className="rtl:rotate-180" />
              {t({ en: "Previous", tr: "Önceki" })}
            </Button>
            <Button
              size="lg"
              className="border-0 bg-accent-fg text-accent hover:bg-accent-fg"
              onClick={() => {
                setProject(next.id);
                document.getElementById("tt-case-title")?.scrollIntoView({ block: "start" });
              }}
            >
              {t({ en: "Open", tr: "Aç" })} {next.client}
              <ArrowRight aria-hidden className="rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </ColourBlock>
    </>
  );
}

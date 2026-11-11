"use client";

import { Button } from "@vamos-ui/react";
import { ArrowRight } from "lucide-react";
import { Stagger } from "@vamos-ui/react/motion";
import { IssueRow } from "./archive-search";
import { useDesk } from "./desk-provider";
import { copyFor, issues, topics, type SiteLocale } from "./content";

/** The latest letter as a postmarked page: first paragraph with a drop cap, then "continue". */
export function LatestLetter({ locale }: { locale: SiteLocale }) {
  const { t, f } = copyFor(locale);
  const { openIssue } = useDesk();
  const latest = issues[0]!;
  return (
    <article aria-labelledby="sd-latest-title" className="relative rounded-[3px] border border-fg/70 bg-surface p-6 pt-8 shadow-[8px_8px_0_-1px_var(--surface-2),8px_8px_0_0_var(--line)] sm:p-8">
      <div aria-hidden className="sd-stamp absolute -top-8 end-5 grid size-[5.5rem] rotate-[8deg] place-items-center rounded-full border-2 border-accent-ink text-center font-mono text-[8px] leading-tight tracking-[0.08em] text-accent-ink uppercase motion-reduce:rotate-0">
        <span>
          Slow Desk
          <br />
          <span className="font-display text-[1.6rem] leading-none tracking-normal normal-case">{latest.n}</span>
          <br />
          {f.date(latest.date, { day: "2-digit", month: "2-digit" })}
        </span>
      </div>
      <p className="font-mono text-[11px] tracking-[0.12em] text-fg-muted uppercase">{t({ en: "Latest letter", tr: "Son mektup" })}</p>
      <h2 id="sd-latest-title" className="mt-3 max-w-[16ch] font-display text-[2rem] leading-[1.05] text-fg">
        {t(latest.title)}
      </h2>
      <p className="mt-5 text-body leading-[1.7] text-fg first-letter:float-start first-letter:me-2 first-letter:font-display first-letter:text-[3.4rem] first-letter:leading-[0.85] first-letter:text-accent-ink">{t(latest.body[0]!)}</p>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-fg/30 pt-4">
        <span className="font-mono text-[11px] text-fg-muted">
          {f.date(latest.date, { day: "numeric", month: "long", year: "numeric" })} · {latest.minutes} {t({ en: "min", tr: "dk" })}
        </span>
        <Button type="button" variant="link" className="vm-nudge" onClick={() => openIssue(latest.n)}>
          {t({ en: "Continue reading", tr: "Okumaya devam edin" })}
          <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </article>
  );
}

/** Five recent letters as archive rows. */
export function RecentLetters({ locale }: { locale: SiteLocale }) {
  return (
    <Stagger asChild effect="fade" step={90}>
      <ul className="border-t-2 border-fg">
        {issues.slice(1, 6).map((i) => (
          <IssueRow key={i.n} issue={i} locale={locale} />
        ))}
      </ul>
    </Stagger>
  );
}

/** Topics with letter counts; each opens the archive filtered to it. */
export function TopicIndex({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const { browseTopic } = useDesk();
  return (
    <Stagger asChild effect="fade" step={70}>
    <ul className="flex flex-col">
      {topics.map((tp) => {
        const n = issues.filter((i) => i.topic === tp.id).length;
        return (
          <li key={tp.id} className="border-b border-line">
            <button type="button" onClick={() => browseTopic(tp.id)} className="group flex w-full items-baseline justify-between gap-4 py-3 text-start focus-ring">
              <span className="font-display text-[1.3rem] text-fg group-hover:text-accent-ink">{t(tp.name)}</span>
              <span className="font-mono text-xs text-fg-muted tabular">{n}</span>
            </button>
          </li>
        );
      })}
    </ul>
    </Stagger>
  );
}

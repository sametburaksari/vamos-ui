import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn2 as cn } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import type { CtaStyle } from "../schema/types";
import { site2Text, type Site2BlockLabels, type Site2Text } from "./shared/labels-2";
import { fieldAttr, textOf, useBlockIds2, type SiteLink2 } from "./shared/kit-2";

export type ComparisonVariant = "table" | "versus";
/** `true` = yes, `false` = no, a string = the value ("5 GB"), `null` = not applicable (—). */
export type ComparisonValue = boolean | string | null;

export interface ComparisonColumn {
  name: React.ReactNode;
  /** Small line under the name ("$49 / mo"). */
  note?: React.ReactNode;
  cta?: { link: SiteLink2; style?: CtaStyle };
  /** Faint accent band down the column. */
  highlight?: boolean;
}

export interface ComparisonRow {
  feature: React.ReactNode;
  /** Small text under the feature — never a "?" tooltip. */
  hint?: React.ReactNode;
  /** One value per column. */
  values: ComparisonValue[];
}

export interface ComparisonGroup {
  title?: React.ReactNode;
  rows: ComparisonRow[];
}

export interface ComparisonTableProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /** table: plans × features with sticky header and a mobile plan picker. versus: "Us" vs "Template site", two columns everywhere. */
  variant?: ComparisonVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** 2–5 columns. */
  columns: ComparisonColumn[];
  groups: ComparisonGroup[];
  /** Table caption for screen readers. Default: the title. */
  caption?: string;
  labels?: Site2BlockLabels;
}

/**
 * Plan × feature detail table, or a two-column "us vs. them" comparison. A real `<table>` with
 * scoped headers and a caption; booleans carry hidden Yes/No text. On narrow containers a radio
 * plan picker shows one column at a time (0 JS). Server component.
 *
 * ```tsx
 * <ComparisonTable columns={[{ name: "Starter" }, { name: "Studio", highlight: true }]}
 *   groups={[{ title: "Publishing", rows: [{ feature: "Pages", values: ["10", "Unlimited"] }] }]} />
 * ```
 */
export function ComparisonTable({
  variant = "table",
  eyebrow,
  title,
  lead,
  columns: columnsProp,
  groups,
  caption,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: ComparisonTableProps) {
  const t = site2Text(labels, locale);
  const { base, headingId } = useBlockIds2(id, "comparison");
  const versus = variant === "versus";
  const columns = versus ? columnsProp.slice(0, 2) : columnsProp.slice(0, 5);
  if (process.env.NODE_ENV !== "production" && columnsProp.length > 5) console.warn("[vamos-ui] ComparisonTable: more than 5 columns are not supported; extra columns were dropped.");
  const picked = Math.max(0, columns.findIndex((c) => c.highlight));
  const pickerName = `${base}-plan`;

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="comparison" editMode={editMode} className={cn("vb-cmp", className)} data-variant={variant} data-cols={columns.length}>
      <Container className="flex flex-col gap-10 @4xl:gap-14">
        {title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} editMode={editMode} labels={labels} locale={locale} /> : null}

        {!versus && columns.length > 1 ? (
          <fieldset className="vb-cmp-pick flex flex-col gap-2 @2xl:hidden">
            <legend className="mb-2 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{t("showPlan")}</legend>
            <div className="flex flex-wrap gap-2">
              {columns.map((c, i) => (
                <label key={i} className="vb-cmp-option inline-flex h-11 cursor-pointer items-center rounded-ui border border-line px-4 text-sm font-medium text-fg-muted">
                  <input type="radio" name={pickerName} value={i} defaultChecked={i === picked} className="sr-only" />
                  {c.name}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        <table className="vb-cmp-table w-full table-fixed border-collapse text-small">
          <caption className="sr-only">{caption ?? (textOf(title).replace(/\*/g, "") || t("comparePlans"))}</caption>
          <colgroup>
            <col className={versus ? "w-[34%]" : "w-[40%] @4xl:w-[34%]"} />
            {columns.map((c, i) => (
              <col key={i} data-col={i} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="vb-cmp-head pb-5 text-start align-bottom font-mono text-eyebrow font-normal uppercase tracking-[0.08em] text-fg-muted">
                {t("feature")}
              </th>
              {columns.map((c, i) => (
                <th key={i} scope="col" data-col={i} data-highlight={c.highlight ? "" : undefined} className={cn("vb-cmp-head px-3 pb-5 text-start align-bottom font-normal @4xl:px-5", versus && i === 1 && "text-fg-muted")}>
                  <span className="flex flex-col items-start gap-1.5">
                    <span className={cn("text-h3 font-semibold tracking-[-0.012em]", versus && i === 1 ? "text-fg-muted" : "text-fg")} {...fieldAttr(editMode, `columns.${i}.name`)}>
                      {c.name}
                    </span>
                    {c.note ? <span className="text-small text-fg-muted">{c.note}</span> : null}
                    {c.cta ? (
                      <BlockLink
                        href={c.cta.link.href}
                        newTab={c.cta.link.newTab}
                        appearance={c.cta.style === "primary" && c.highlight ? "primary" : c.cta.style === "link" ? "link" : "secondary"}
                        size="md"
                        components={components}
                        labels={labels}
                        locale={locale}
                        className="mt-2"
                        data-track={`comparison:${i}`}
                      >
                        {c.cta.link.label}
                      </BlockLink>
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g, gi) => (
            <tbody key={gi}>
              {g.title ? (
                <tr>
                  <th scope="colgroup" colSpan={columns.length + 1} className="bg-surface-2 px-3 py-2.5 text-start font-mono text-eyebrow font-normal uppercase tracking-[0.08em] text-fg-muted @4xl:px-4">
                    {g.title}
                  </th>
                </tr>
              ) : null}
              {g.rows.map((r, ri) => (
                <tr key={ri} className="border-b border-line">
                  <th scope="row" className="py-4 pe-4 text-start align-top font-normal">
                    <span className="block text-fg">{r.feature}</span>
                    {r.hint ? <span className="mt-1 block text-xs text-fg-muted text-pretty">{r.hint}</span> : null}
                  </th>
                  {columns.map((c, ci) => (
                    <td key={ci} data-col={ci} data-highlight={c.highlight ? "" : undefined} className={cn("px-3 py-4 align-top @4xl:px-5", versus && ci === 1 ? "text-fg-muted" : "text-fg")}>
                      <ValueCell value={r.values[ci] ?? null} t={t} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </Container>
    </Section>
  );
}

function ValueCell({ value, t }: { value: ComparisonValue; t: Site2Text }) {
  if (value === true)
    return (
      <>
        <Check aria-hidden strokeWidth={1.5} className="size-[18px] text-fg" />
        <span className="sr-only">{t("yes")}</span>
      </>
    );
  if (value === false)
    return (
      <>
        <Minus aria-hidden strokeWidth={1.5} className="size-[18px] text-fg-subtle" />
        <span className="sr-only">{t("no")}</span>
      </>
    );
  if (value === null || value === "")
    return (
      <>
        <span aria-hidden className="text-fg-subtle">
          —
        </span>
        <span className="sr-only">{t("no")}</span>
      </>
    );
  return <span className="tabular">{value}</span>;
}

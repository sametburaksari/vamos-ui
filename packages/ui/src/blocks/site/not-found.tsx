import * as React from "react";
import { ArrowRight, RotateCcw, Search } from "lucide-react";
import { cn2 as cn } from "./shared/kit-2";
import { buttonVariants } from "../../components/button";
import { Section, Container } from "../section";
import { BlockHeading } from "../block-heading";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { site2Text, type Site2BlockLabels } from "./shared/labels-2";
import { fieldAttr, prettyPhone, telHref, useBlockIds2, type SiteLink2 } from "./shared/kit-2";
import { headingLines } from "./shared/heading-lines";

export type NotFoundVariant = "plain" | "links";
export type NotFoundKind = "404" | "500" | "maintenance";

export interface NotFoundProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /** plain: small mono code, a sentence title and one "Back to home" link. links: plus popular pages, a search field and a phone line. */
  variant?: NotFoundVariant;
  /** Default `"404"`. */
  kind?: NotFoundKind;
  /** Default per kind ("This page moved, or never existed."). One `*emphasis*`. */
  title?: React.ReactNode;
  text?: React.ReactNode;
  /** Up to 6 popular pages (`links`). */
  links?: SiteLink2[];
  /** Default `"/"`. */
  homeHref?: string;
  /** Plain GET search form (`action="/search"`, `param="q"`). */
  search?: { action: string; param?: string };
  /** E.164 phone for "Still stuck? Call …". */
  phone?: string;
  /** `error.tsx`: Next.js's `reset()` — renders a "Try again" button (client usage only). */
  reset?: () => void;
  labels?: Site2BlockLabels;
}

const KIND = {
  "404": { code: "notFoundCode", title: "notFoundTitle", text: "notFoundText" },
  "500": { code: "serverErrorCode", title: "serverErrorTitle", text: "serverErrorText" },
  maintenance: { code: "maintenanceCode", title: "maintenanceTitle", text: "maintenanceText" },
} as const;

/**
 * Branded, useful not-found / error / maintenance page for `not-found.tsx` and `error.tsx`. No
 * giant numerals: a small mono code, a sentence title (`h1`), the way back. Works as a server
 * component, and inside `error.tsx` (client) with `reset`.
 *
 * ```tsx
 * // app/not-found.tsx
 * export default function NotFoundPage() { return <NotFound variant="links" links={popular} search={{ action: "/search" }} />; }
 * ```
 */
export function NotFound({
  variant = "plain",
  kind = "404",
  title,
  text,
  links = [],
  homeHref = "/",
  search,
  phone,
  reset,
  id,
  anchor,
  theme,
  headingLevel = 1,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: NotFoundProps) {
  const t = site2Text(labels, locale);
  const { base, headingId } = useBlockIds2(id, "not-found");
  const k = KIND[kind];
  const showLinks = variant === "links";

  return (
    <Section theme={theme} anchor={anchor} headingId={headingId} blockId={id} blockType="not-found" editMode={editMode} className={cn("vb-not-found", className)} data-kind={kind} data-variant={variant}>
      <Container className="grid gap-x-(--gutter) gap-y-14 @4xl:grid-cols-12">
        <div className="flex flex-col gap-6 @4xl:col-span-8">
          <p className="flex items-center gap-3 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">
            <span className="tabular text-fg">{t(k.code)}</span>
            <span aria-hidden className="h-px w-8 bg-current opacity-40" />
          </p>
          <BlockHeading id={headingId} level={headingLevel} size="display-l" text={headingLines(title ?? t(k.title))} editMode={editMode} field="props.title" labels={labels} locale={locale} className="max-w-[20ch]" />
          <p className="max-w-[52ch] text-lead text-fg-muted text-pretty" {...fieldAttr(editMode, "text")}>
            {text ?? t(k.text)}
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            {reset ? (
              <button type="button" onClick={reset} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "vb-action-primary")}>
                <RotateCcw aria-hidden strokeWidth={1.75} />
                {t("tryAgain")}
              </button>
            ) : null}
            <BlockLink href={homeHref} appearance={reset ? "link" : kind === "maintenance" && phone ? "secondary" : "primary"} components={components} labels={labels} locale={locale}>
              {t("backHome")}
              {reset ? <ArrowRight aria-hidden strokeWidth={1.5} className="size-[1em] rtl:-scale-x-100" /> : null}
            </BlockLink>
            {kind === "maintenance" && phone ? (
              <a href={telHref(phone)} className={cn(buttonVariants({ variant: "primary", size: "lg" }), "vb-action-primary tabular")} data-track="call">
                {prettyPhone(phone)}
              </a>
            ) : null}
          </div>
        </div>

        {showLinks ? (
          <div className="flex flex-col gap-10 border-t border-line pt-8 @4xl:col-span-12">
            {search ? (
              <form role="search" action={search.action} method="get" className="flex max-w-xl flex-col gap-2">
                <label htmlFor={`${base}-q`} className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">
                  {t("searchSite")}
                </label>
                <div className="flex gap-2">
                  <span className="relative flex-1">
                    <Search aria-hidden strokeWidth={1.5} className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-fg-muted" />
                    <input
                      id={`${base}-q`}
                      type="search"
                      name={search.param ?? "q"}
                      placeholder={t("searchPlaceholder")}
                      className="h-12 w-full rounded-ui border border-field-border bg-field ps-9 pe-3 text-body text-fg placeholder:text-fg-subtle transition-colors hover:border-field-border-hover focus-ring"
                    />
                  </span>
                  <button type="submit" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                    {t("search")}
                  </button>
                </div>
              </form>
            ) : null}
            {links.length ? (
              <nav aria-labelledby={`${base}-pop`} className="flex flex-col gap-4">
                <p id={`${base}-pop`} className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">
                  {t("popularPages")}
                </p>
                <ul className="grid gap-x-(--gutter) @2xl:grid-cols-2">
                  {links.slice(0, 6).map((l, i) => (
                    <li key={i} className="border-t border-line">
                      <BlockLink href={l.href} newTab={l.newTab} components={components} labels={labels} locale={locale} className="group/nf flex items-center justify-between gap-4 py-4 text-body text-fg transition-colors hover:text-accent-ink focus-ring rounded-[2px]">
                        <span>{l.label}</span>
                        <ArrowRight aria-hidden strokeWidth={1.5} className="size-4 text-fg-subtle transition-colors group-hover/nf:text-current rtl:-scale-x-100" />
                      </BlockLink>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
            {phone && kind !== "maintenance" ? (
              <p className="text-small text-fg-muted">
                {t("stillStuck", { phone: "\u0000" })
                  .split("\u0000")
                  .flatMap((part, i) =>
                    i === 0
                      ? [part]
                      : [
                          <a key="p" href={telHref(phone)} className="font-medium tabular text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]" data-track="call">
                            {prettyPhone(phone)}
                          </a>,
                          part,
                        ],
                  )}
              </p>
            ) : null}
          </div>
        ) : null}
      </Container>
    </Section>
  );
}

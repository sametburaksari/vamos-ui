import * as React from "react";
import { Check, X, type LucideIcon } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { DataLabel, LoadMoreButton, RelativeTime, TimelineDayLabel } from "../lib/data-islands";
import type { timelineLabels } from "../lib/data-islands";
import { dayKey, toIsoInstant } from "../lib/value-format";
import { Avatar } from "./avatar";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./skeleton";

export { RelativeTime, type RelativeTimeProps } from "../lib/data-islands";

export type TimelineLabels = Partial<typeof timelineLabels>;
export type TimelineTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";
export type TimelineStatus = "done" | "current" | "upcoming" | "failed";

/** One event of `ActivityTimeline items`. */
export interface TimelineEntry {
  id: string;
  /** When it happened: a Date, an ISO instant, or `"YYYY-MM-DD"`. */
  at: Date | string;
  /** Lucide icon component shown in the indicator. */
  icon?: LucideIcon;
  /** Person who did it — shown as an Avatar in the indicator (wins over `icon`). */
  avatar?: { src?: string | null; name: string };
  tone?: TimelineTone;
  /** What happened. */
  title: React.ReactNode;
  /** Note, quoted comment or details under the title. */
  body?: React.ReactNode;
  /** Actor name, bolded before the title ("Meltem scheduled a post"). */
  actor?: string;
  /** Makes the title a link to the record. */
  href?: string;
  /** Steps variant: progress state. */
  status?: TimelineStatus;
  /** Trailing actions (Undo, View). */
  actions?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Parts                                                                */
/* ------------------------------------------------------------------ */

export interface TimelineProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /** `"feed"` (events) or `"steps"` (a process with done / current / upcoming). Default `"feed"`. */
  variant?: "feed" | "steps";
  /** `"inherit"` follows the page `data-density`. Default `"inherit"`. */
  density?: "inherit" | "compact" | "comfortable";
}

/**
 * Composable timeline (`<ol>`). For data use `ActivityTimeline`; compose these parts for
 * custom rows: `Timeline › TimelineGroup › TimelineItem › TimelineIndicator + TimelineContent`.
 */
export const Timeline = /*#__PURE__*/ React.forwardRef<HTMLOListElement, TimelineProps>(function Timeline({ variant = "feed", density = "inherit", className, ...props }, ref) {
  return (
    <ol
      ref={ref}
      data-slot="timeline"
      data-variant={variant}
      data-density={density === "inherit" ? undefined : density}
      className={cn(
        "group/timeline m-0 grid list-none gap-(--tl-gap) p-0 [--tl-gap:calc(var(--row-h)*0.3)] [--tl-ind:1.75rem]",
        "data-[density=compact]:[--tl-ind:1.5rem] [[data-density=compact]_&]:[--tl-ind:1.5rem]",
        className,
      )}
      {...props}
    />
  );
});

export interface TimelineGroupProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** Day as `"YYYY-MM-DD"` — rendered as "Today", "Yesterday" or "Monday, Nov 8" in the current locale. */
  date?: string;
  /** Custom heading (wins over `date`). */
  label?: React.ReactNode;
  /** Fix the reference time for "Today" (docs, tests). */
  now?: Date | string | number;
  labels?: TimelineLabels;
}

/** A labelled section (a day). Children are TimelineItems. */
export const TimelineGroup = /*#__PURE__*/ React.forwardRef<HTMLLIElement, TimelineGroupProps>(function TimelineGroup({ date, label, now, labels, className, children, ...props }, ref) {
  const id = React.useId();
  return (
    <li ref={ref} data-slot="timeline-group" aria-labelledby={id} className={cn("grid gap-(--tl-gap)", className)} {...props}>
      <div id={id} className="flex items-center gap-3 font-mono text-[11px] font-medium tracking-[0.06em] text-fg-subtle">
        <span className="shrink-0">{label ?? (date ? <TimelineDayLabel date={date} now={now} labels={labels} /> : null)}</span>
        <span aria-hidden className="h-px flex-1 bg-line" />
      </div>
      <ol className="m-0 grid list-none gap-(--tl-gap) p-0">{children}</ol>
    </li>
  );
});

export interface TimelineItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Steps variant: drives the indicator, connector and `aria-current="step"`. */
  status?: TimelineStatus;
  /** Brief accent highlight for a just-arrived item (none under reduced motion). */
  highlight?: boolean;
}

export const TimelineItem = /*#__PURE__*/ React.forwardRef<HTMLLIElement, TimelineItemProps>(function TimelineItem({ status, highlight, className, ...props }, ref) {
  return (
    <li
      ref={ref}
      data-slot="timeline-item"
      data-status={status}
      data-highlight={highlight ? "" : undefined}
      aria-current={status === "current" ? "step" : undefined}
      className={cn(
        "relative grid grid-cols-[var(--tl-ind)_minmax(0,1fr)] gap-x-3",
        // connector from below this indicator to the next one (start side, RTL-aware)
        "before:absolute before:start-[calc(var(--tl-ind)/2-0.5px)] before:top-[calc(var(--tl-ind)+0.25rem)] before:-bottom-[calc(var(--tl-gap)-0.25rem)] before:w-px before:bg-line last:before:hidden",
        "data-[status=upcoming]:before:w-0 data-[status=upcoming]:before:border-s data-[status=upcoming]:before:border-dashed data-[status=upcoming]:before:border-line data-[status=upcoming]:before:bg-transparent",
        "data-[status=current]:before:w-0 data-[status=current]:before:border-s data-[status=current]:before:border-dashed data-[status=current]:before:border-line data-[status=current]:before:bg-transparent",
        className,
      )}
      {...props}
    />
  );
});

const indicatorVariants = /*#__PURE__*/ cva(
  "relative z-[1] grid size-(--tl-ind) shrink-0 place-items-center rounded-full border text-fg-muted [&_svg]:size-[calc(var(--tl-ind)*0.5)] [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-line bg-[color-mix(in_oklch,var(--surface)_90%,var(--scene))]",
        accent: "tone-accent border-[color-mix(in_srgb,var(--tone)_35%,var(--line))] bg-[color-mix(in_oklch,var(--tone)_14%,color-mix(in_oklch,var(--surface)_92%,var(--scene)))] text-(--tone-ink)",
        success: "tone-success border-[color-mix(in_srgb,var(--tone)_35%,var(--line))] bg-[color-mix(in_oklch,var(--tone)_14%,color-mix(in_oklch,var(--surface)_92%,var(--scene)))] text-(--tone-ink)",
        warning: "tone-warning border-[color-mix(in_srgb,var(--tone)_35%,var(--line))] bg-[color-mix(in_oklch,var(--tone)_14%,color-mix(in_oklch,var(--surface)_92%,var(--scene)))] text-(--tone-ink)",
        danger: "tone-danger border-[color-mix(in_srgb,var(--tone)_35%,var(--line))] bg-[color-mix(in_oklch,var(--tone)_14%,color-mix(in_oklch,var(--surface)_92%,var(--scene)))] text-(--tone-ink)",
        info: "tone-info border-[color-mix(in_srgb,var(--tone)_35%,var(--line))] bg-[color-mix(in_oklch,var(--tone)_14%,color-mix(in_oklch,var(--surface)_92%,var(--scene)))] text-(--tone-ink)",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface TimelineIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon?: LucideIcon | React.ReactNode;
  avatar?: { src?: string | null; name: string };
  tone?: TimelineTone;
  /** Steps: picks the look (check for done, ring for current, hollow for upcoming, × for failed). */
  status?: TimelineStatus;
  labels?: TimelineLabels;
}

/** The dot / icon / avatar on the connector. Opaque in glass so the line never shows through. */
export function TimelineIndicator({ icon, avatar, tone, status, labels, className, children, ...props }: TimelineIndicatorProps) {
  const statusText = status ? (
    <span className="sr-only">
      <DataLabel ns="timeline" id={status} override={labels} />
    </span>
  ) : null;
  if (avatar && !status) {
    return (
      <span data-slot="timeline-indicator" className={cn("relative z-[1] grid size-(--tl-ind) place-items-center", className)} {...props}>
        <Avatar name={avatar.name} src={avatar.src} size="sm" className="size-(--tl-ind)! ring-2 ring-[color-mix(in_oklch,var(--surface)_90%,var(--scene))]" />
      </span>
    );
  }
  if (status) {
    return (
      <span
        data-slot="timeline-indicator"
        data-status={status}
        className={cn(
          indicatorVariants({ tone: status === "done" ? "success" : status === "failed" ? "danger" : "neutral" }),
          status === "current" && "border-accent-ink border-[1.5px] text-accent-ink",
          status === "upcoming" && "border-dashed text-fg-subtle",
          className,
        )}
        {...props}
      >
        {status === "done" ? <Check aria-hidden strokeWidth={2.5} /> : status === "failed" ? <X aria-hidden strokeWidth={2.5} /> : status === "current" ? <span aria-hidden className="size-2 rounded-full bg-accent-ink" /> : <span aria-hidden className="size-1.5 rounded-full bg-current" />}
        {statusText}
        {children}
      </span>
    );
  }
  const Icon = typeof icon === "function" || (typeof icon === "object" && icon !== null && !React.isValidElement(icon) && "render" in (icon as object)) ? (icon as LucideIcon) : undefined;
  return (
    <span data-slot="timeline-indicator" className={cn(indicatorVariants({ tone }), className)} {...props}>
      {Icon ? <Icon aria-hidden /> : icon ? (icon as React.ReactNode) : children ?? <span aria-hidden className="size-1.5 rounded-full bg-current opacity-70" />}
    </span>
  );
}

/** Text column: title, time, body, actions. */
export function TimelineContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="timeline-content" className={cn("min-w-0 pt-[calc((var(--tl-ind)-1.25rem)/2)] text-[13px] leading-5 text-fg-muted", className)} {...props} />;
}

export function TimelineTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="timeline-title" className={cn("text-pretty [&_b]:font-medium [&_b]:text-fg [&_strong]:font-medium [&_strong]:text-fg", className)} {...props} />;
}

export interface TimelineBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `"card"` (default) sets the note on an inset surface; `"plain"` is unstyled text for typographic layouts (CVs, changelogs). */
  variant?: "card" | "plain";
}

/** Note or quoted comment under the title. */
export function TimelineBody({ className, variant = "card", ...props }: TimelineBodyProps) {
  return (
    <div
      data-slot="timeline-body"
      data-variant={variant}
      className={cn(variant === "card" ? "surface-2 mt-2 rounded-ui-sm px-3 py-2 text-[13px] leading-relaxed text-fg" : "mt-1 leading-relaxed text-fg", className)}
      {...props}
    />
  );
}

export interface TimelineTimeProps {
  value: Date | string | number;
  /** Fix the reference time (docs, tests). */
  now?: Date | string | number;
  /** `"absolute"` shows the time of day ("9:30 AM") — useful inside day groups. Default `"relative"`. */
  mode?: "relative" | "absolute";
  className?: string;
}

/** `<time>` with "4 minutes ago" (full date on hover). Server render shows the absolute time. */
export function TimelineTime({ value, now, mode = "relative", className }: TimelineTimeProps) {
  return <RelativeTime value={value} now={now} display={mode === "absolute" ? "time" : "relative"} className={cn("mt-0.5 block text-[11.5px] text-fg-subtle", className)} />;
}

export function TimelineActions({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="timeline-actions" className={cn("mt-2 flex flex-wrap items-center gap-1.5", className)} {...props} />;
}

export interface TimelineNewItemsProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Number of waiting items. */
  count: number;
  labels?: TimelineLabels;
}

/** "3 new updates" pill for live feeds: new items wait above instead of shifting the list. */
export const TimelineNewItems = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, TimelineNewItemsProps>(function TimelineNewItems({ count, labels, className, children, ...props }, ref) {
  if (count <= 0) return null;
  return (
    <button
      ref={ref}
      type="button"
      data-slot="timeline-new-items"
      className={cn(
        "mx-auto inline-flex h-7 items-center gap-1.5 rounded-full bg-accent-soft px-3 text-xs font-medium text-accent-ink transition-[filter] hover:brightness-95 focus-ring motion-safe:ui-fade",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children ?? <DataLabel ns="timeline" id="newItems" vars={{ count }} override={labels} />}
    </button>
  );
});

/** Placeholder items while the feed loads. */
export function TimelineSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div data-slot="timeline-skeleton" aria-busy="true" className={cn("grid gap-4 [--tl-ind:1.75rem]", className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="grid grid-cols-[var(--tl-ind)_1fr] gap-x-3">
          <Skeleton shape="circle" className="size-(--tl-ind)" />
          <div className="grid gap-2 pt-1">
            <Skeleton shape="text" className="h-3" style={{ width: `${78 - ((i * 19) % 30)}%` }} />
            <Skeleton shape="text" className="h-2.5 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data-driven                                                          */
/* ------------------------------------------------------------------ */

export interface ActivityTimelineProps extends Omit<TimelineProps, "children"> {
  items: TimelineEntry[];
  /** `"day"` groups under "Today / Yesterday / Monday, Nov 8". Default `"none"`. */
  groupBy?: "day" | "none";
  /** Default `"desc"` (newest first) for feeds, `"asc"` for steps. */
  order?: "desc" | "asc";
  /** Time zone used to split days — pass the same one as your LocaleProvider. Default `"UTC"`. */
  timeZone?: string;
  /** Fix the reference time ("4 minutes ago", "Today") — docs, tests, snapshots. */
  now?: Date | string | number;
  /** Times as `"relative"` ("4 minutes ago") or `"absolute"` time of day. Default: relative, absolute inside day groups. */
  timeMode?: "relative" | "absolute";
  /** Three skeleton items. */
  loading?: boolean;
  /** Shown when there are no items. Default: "No activity yet". */
  empty?: React.ReactNode;
  /** Show the "Load older activity" button. */
  hasMore?: boolean;
  /** Called by the load-more button; return a promise for the busy state. */
  onLoadMore?: () => void | Promise<void>;
  /** Waiting live items — shows the "3 new updates" pill. */
  newCount?: number;
  onShowNew?: () => void;
  /** Polite live region text for screen readers (batched by you, e.g. "2 new comments"). */
  announcement?: string;
  /** Filter chips above the list. */
  filter?: React.ReactNode;
  labels?: TimelineLabels;
}

/**
 * A chronological, human-readable history: dashboard activity, record history, approval steps.
 * Server-component compatible: relative times and day names are small client islands
 * (`Intl.RelativeTimeFormat`, one shared ticker).
 *
 * ```tsx
 * <ActivityTimeline groupBy="day" items={[
 *   { id: "1", at: "2026-11-10T09:12:00Z", icon: Inbox, title: <>New submission on <b>Contact form</b></> },
 *   { id: "2", at: "2026-11-09T16:40:00Z", avatar: { name: "Ahmet Kaya" }, actor: "Ahmet Kaya", title: "commented on “QR menus guide”" },
 * ]} />
 * ```
 */
export const ActivityTimeline = /*#__PURE__*/ React.forwardRef<HTMLOListElement, ActivityTimelineProps>(function ActivityTimeline(
  {
    items,
    variant = "feed",
    groupBy = "none",
    order,
    timeZone = "UTC",
    now,
    timeMode,
    loading,
    empty,
    hasMore,
    onLoadMore,
    newCount = 0,
    onShowNew,
    announcement,
    filter,
    labels,
    className,
    density,
    ...props
  },
  ref,
) {
  const dir = order ?? (variant === "steps" ? "asc" : "desc");
  const sorted = variant === "steps" && order === undefined ? items : [...items].sort((a, b) => cmp(a.at, b.at) * (dir === "asc" ? 1 : -1));

  const renderItem = (it: TimelineEntry, inGroup: boolean) => (
    <TimelineItem key={it.id} status={it.status}>
      <TimelineIndicator icon={it.icon} avatar={it.avatar} tone={it.tone} status={variant === "steps" ? (it.status ?? "upcoming") : undefined} labels={labels} />
      <TimelineContent>
        <TimelineTitle className={it.status === "upcoming" ? "text-fg-subtle" : undefined}>
          {it.actor ? <b>{it.actor} </b> : null}
          {it.href ? (
            <a href={it.href} className="rounded-[2px] underline-offset-2 hover:text-fg hover:underline focus-ring">
              {it.title}
            </a>
          ) : (
            it.title
          )}
        </TimelineTitle>
        {variant === "steps" && it.status === "upcoming" ? null : <TimelineTime value={toIsoInstant(it.at)} now={now} mode={timeMode ?? (inGroup ? "absolute" : "relative")} />}
        {it.body ? <TimelineBody>{it.body}</TimelineBody> : null}
        {it.actions ? <TimelineActions>{it.actions}</TimelineActions> : null}
      </TimelineContent>
    </TimelineItem>
  );

  let list: React.ReactNode;
  if (loading) list = <TimelineSkeleton />;
  else if (sorted.length === 0)
    list = empty ?? <EmptyState size="sm" title={<DataLabel ns="timeline" id="empty" override={labels} />} />;
  else if (groupBy === "day") {
    const groups = new Map<string, TimelineEntry[]>();
    for (const it of sorted) {
      const k = dayKey(it.at, timeZone);
      groups.set(k, [...(groups.get(k) ?? []), it]);
    }
    list = (
      <Timeline ref={ref} variant={variant} density={density} className={className} {...props}>
        {[...groups].map(([day, entries]) => (
          <TimelineGroup key={day} date={day} now={now} labels={labels}>
            {entries.map((e) => renderItem(e, true))}
          </TimelineGroup>
        ))}
      </Timeline>
    );
  } else {
    list = (
      <Timeline ref={ref} variant={variant} density={density} className={className} {...props}>
        {sorted.map((e) => renderItem(e, false))}
      </Timeline>
    );
  }

  const wrapped = Boolean(filter || newCount > 0 || announcement !== undefined || (hasMore && onLoadMore) || loading || sorted.length === 0);
  if (!wrapped) return list;
  return (
    <div data-slot="activity-timeline" className="grid gap-4">
      {filter ? <div className="flex flex-wrap items-center gap-1.5">{filter}</div> : null}
      {newCount > 0 ? <TimelineNewItems count={newCount} onClick={onShowNew} labels={labels} /> : null}
      {list}
      {hasMore && onLoadMore && !loading ? (
        <div className="flex justify-center">
          <LoadMoreButton onLoadMore={onLoadMore} labels={labels} />
        </div>
      ) : null}
      {announcement !== undefined ? (
        <div aria-live="polite" role="status" className="sr-only">
          {announcement}
        </div>
      ) : null}
    </div>
  );
});

function cmp(a: Date | string, b: Date | string) {
  const t = (v: Date | string) => (v instanceof Date ? v.getTime() : Date.parse(v.length === 10 ? `${v}T00:00:00Z` : v));
  return t(a) - t(b);
}

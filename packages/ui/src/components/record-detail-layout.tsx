"use client";

import * as React from "react";
import { Collapsible } from "radix-ui";
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, LockKeyhole, SearchX } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { SmartLink, useNavigation } from "../lib/provider";
import { useHotkeys } from "../lib/use-hotkeys";
import { useContainerWidth } from "../lib/use-container-width";
import { useControllableState } from "../lib/use-controllable-state";
import { useComposedRefs } from "../lib/compose-refs";
import { useEdgeFade } from "../lib/use-edge-fade";
import { Button } from "./button";
import { EmptyStateDescription, EmptyStateIcon, emptyStateVariants } from "./empty-state";
import { Skeleton, SkeletonAvatar, SkeletonText } from "./skeleton";
import { Spinner } from "./spinner";

/* ------------------------------------------------------------------ */
/* Labels & context                                                    */
/* ------------------------------------------------------------------ */

const recordLabels = {
  pager: "{index} of {total}",
  pagerLabel: "Record navigation",
  previous: "Previous record",
  next: "Next record",
  details: "Details",
  facts: "Key facts",
  saving: "Saving…",
  notFound: "Record not found",
  notFoundDescription: "It may have been deleted, merged into another record, or the link is out of date.",
  forbidden: "You don't have access to this record",
  forbiddenDescription: "Ask an admin of this workspace to share it with you.",
  loading: "Loading record",
  resizeAside: "Resize side column",
};

export type RecordLayoutLabels = Partial<typeof recordLabels>;

/** Below this container width (42rem) the side column moves under the header as collapsed sections. Matches navigation.css. */
const NARROW = 672;

interface RecordLayoutContextValue {
  narrow: boolean;
  readOnly: boolean;
  asidePosition: "start" | "end";
  resizable: boolean;
  asideWidth: number;
  minAsideWidth: number;
  maxAsideWidth: number;
  defaultAsideWidth: number;
  setAsideWidth: (w: number) => void;
  labels?: RecordLayoutLabels;
}

const RecordLayoutContext = React.createContext<RecordLayoutContextValue>({
  narrow: false,
  readOnly: false,
  asidePosition: "end",
  resizable: false,
  asideWidth: 320,
  minAsideWidth: 260,
  maxAsideWidth: 520,
  defaultAsideWidth: 320,
  setAsideWidth: () => {},
});

/* ------------------------------------------------------------------ */
/* SidePaneHandle (shared by Record detail and Editor layouts)         */
/* ------------------------------------------------------------------ */

export interface SidePaneHandleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Current pane width in px. */
  value: number;
  min?: number;
  max?: number;
  /** Width restored on double-click. */
  defaultValue?: number;
  onValueChange: (width: number) => void;
  /** Which edge of the pane the handle sits on. A pane at the inline end has its handle on its `start` edge. */
  edge?: "start" | "end";
  /** Keyboard step in px. Default 16 (Shift: ×4). */
  step?: number;
  /** Accessible name. */
  "aria-label": string;
}

/**
 * The drag edge of a side column (WAI-ARIA window splitter: focusable `separator` with
 * `aria-valuenow`; arrows resize, Shift+arrows in bigger steps, Home/End jump to min/max,
 * double-click resets). Logical: works in RTL.
 */
export const SidePaneHandle = React.forwardRef<HTMLDivElement, SidePaneHandleProps>(function SidePaneHandle(
  { value, min = 240, max = 560, defaultValue, onValueChange, edge = "start", step = 16, className, onKeyDown, onDoubleClick, ...props },
  ref,
) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  const composed = useComposedRefs(ref, innerRef);
  const [dragging, setDragging] = React.useState(false);
  const clamp = (w: number) => Math.round(Math.min(max, Math.max(min, w)));
  const dir = () => (innerRef.current && getComputedStyle(innerRef.current).direction === "rtl" ? -1 : 1);
  // dx is a visual (screen) movement of the handle; turn it into a width change.
  const grow = (dx: number) => (edge === "start" ? -dx : dx) * dir();

  return (
    <div
      ref={composed}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      data-slot="side-pane-handle"
      data-dragging={dragging ? "" : undefined}
      className={cn(
        "vui-pane-handle group/pane absolute inset-y-0 z-[1] w-2 cursor-col-resize touch-none outline-none",
        edge === "start" ? "-start-[calc(var(--gap)/2+4px)]" : "-end-[calc(var(--gap)/2+4px)]",
        className,
      )}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        const el = e.currentTarget;
        el.setPointerCapture?.(e.pointerId);
        const startX = e.clientX;
        const startW = value;
        setDragging(true);
        const move = (ev: PointerEvent) => onValueChange(clamp(startW + grow(ev.clientX - startX)));
        const up = () => {
          setDragging(false);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        const s = e.shiftKey ? step * 4 : step;
        let next: number | null = null;
        if (e.key === "ArrowLeft") next = value + grow(-s);
        else if (e.key === "ArrowRight") next = value + grow(s);
        else if (e.key === "Home") next = min;
        else if (e.key === "End") next = max;
        else if (e.key === "Enter" && defaultValue !== undefined) next = defaultValue;
        if (next === null) return;
        e.preventDefault();
        onValueChange(clamp(next));
      }}
      onDoubleClick={(e) => {
        onDoubleClick?.(e);
        if (defaultValue !== undefined) onValueChange(clamp(defaultValue));
      }}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-y-2 start-1/2 w-px -translate-x-1/2 rounded-full bg-transparent transition-[background-color,width] duration-150 rtl:translate-x-1/2",
          "group-hover/pane:bg-field-border-hover group-focus-visible/pane:w-0.5 group-focus-visible/pane:bg-ring group-data-dragging/pane:w-0.5 group-data-dragging/pane:bg-accent-ink",
        )}
      />
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* RecordLayout                                                        */
/* ------------------------------------------------------------------ */

export type RecordLayoutState = "ready" | "loading" | "not-found" | "forbidden";

export interface RecordLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Side column at the inline `end` (default) or `start`. */
  asidePosition?: "end" | "start";
  /** Side column width in px (controlled with `onAsideWidthChange`). */
  asideWidth?: number;
  /** Initial width when uncontrolled. Default 320. */
  defaultAsideWidth?: number;
  onAsideWidthChange?: (width: number) => void;
  /** Lets the user drag (or arrow-key) the side column's edge. */
  resizable?: boolean;
  minAsideWidth?: number;
  maxAsideWidth?: number;
  /** `loading` shows a skeleton page; `not-found` / `forbidden` a full-page empty state. */
  state?: RecordLayoutState;
  /** Replace the default not-found page. */
  notFound?: React.ReactNode;
  /** Replace the default forbidden page. */
  forbidden?: React.ReactNode;
  /** Hides header actions. Pair with read-only fields. */
  readOnly?: boolean;
  labels?: RecordLayoutLabels;
}

/**
 * The "show one record" page: record header (media, title, status, key facts, actions, pager),
 * a main column (tabs, overview, activity, related lists) and a side column of details.
 * Below 42rem (672px) of its own width the side column moves under the header and its
 * sections fold, and the key facts become a horizontal strip. It measures itself, not the
 * viewport, so it works the same beside an App shell sidebar or in a split view.
 *
 * ```tsx
 * <RecordLayout>
 *   <RecordHeader media={<Avatar name="Jane Doe" size="xl" />} title="Jane Doe" subtitle="Head of Ops · Northpoint"
 *     status={<Badge tone="success">Customer</Badge>} facts={[{ label: "Owner", value: "Meltem Aydın" }]}
 *     pager={<RecordPager index={3} total={128} prevHref="/contacts/41" nextHref="/contacts/43" />} />
 *   <RecordMain>{tabs}</RecordMain>
 *   <RecordAside><RecordAsideSection title="Details"><DescriptionList … /></RecordAsideSection></RecordAside>
 * </RecordLayout>
 * ```
 */
export const RecordLayout = React.forwardRef<HTMLDivElement, RecordLayoutProps>(function RecordLayout(
  {
    asidePosition = "end",
    asideWidth: asideWidthProp,
    defaultAsideWidth = 320,
    onAsideWidthChange,
    resizable = false,
    minAsideWidth = 260,
    maxAsideWidth = 520,
    state = "ready",
    notFound,
    forbidden,
    readOnly = false,
    labels,
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const t = useLabels("record", recordLabels, labels);
  const { ref: measureRef, width } = useContainerWidth<HTMLDivElement>();
  const composed = useComposedRefs(ref, measureRef);
  const [asideWidth, setAsideWidth] = useControllableState({ value: asideWidthProp, defaultValue: defaultAsideWidth, onChange: onAsideWidthChange, name: "RecordLayout" });
  const narrow = width !== undefined && width < NARROW;
  const ctx = React.useMemo<RecordLayoutContextValue>(
    () => ({ narrow, readOnly, asidePosition, resizable, asideWidth, minAsideWidth, maxAsideWidth, defaultAsideWidth, setAsideWidth, labels }),
    [narrow, readOnly, asidePosition, resizable, asideWidth, minAsideWidth, maxAsideWidth, defaultAsideWidth, setAsideWidth, labels],
  );

  let content: React.ReactNode = children;
  if (state === "loading") content = <RecordLayoutSkeleton label={t("loading")} />;
  else if (state === "not-found")
    content = notFound ?? <RecordStatePage kind="not-found" title={t("notFound")} description={t("notFoundDescription")} />;
  else if (state === "forbidden")
    content = forbidden ?? <RecordStatePage kind="forbidden" title={t("forbidden")} description={t("forbiddenDescription")} />;

  return (
    <RecordLayoutContext.Provider value={ctx}>
      <div
        ref={composed}
        data-slot="record-layout"
        data-state={state}
        data-narrow={narrow ? "" : undefined}
        className={cn("@container/record w-full min-w-0", className)}
        style={{ "--record-aside-w": `${asideWidth}px`, ...style } as React.CSSProperties}
        {...props}
      >
        <div className="vui-record-grid" data-aside={asidePosition}>
          {content}
        </div>
      </div>
    </RecordLayoutContext.Provider>
  );
});

/** Full-page state with the page's one h1 (EmptyState titles stop at h2). */
function RecordStatePage({ kind, title, description }: { kind: "not-found" | "forbidden"; title: string; description: string }) {
  const Icon = kind === "forbidden" ? LockKeyhole : SearchX;
  return (
    <div data-slot="record-state" data-kind={kind} className={cn(emptyStateVariants({ size: "lg" }), "[grid-column:1/-1]")}>
      <EmptyStateIcon className="surface-2 mb-2 text-fg-muted">
        <Icon aria-hidden />
      </EmptyStateIcon>
      <h1 className="font-display max-w-[36ch] text-balance text-[1.75rem] leading-tight text-fg">{title}</h1>
      <EmptyStateDescription size="lg">{description}</EmptyStateDescription>
    </div>
  );
}

function RecordLayoutSkeleton({ label }: { label: string }) {
  return (
    <>
      <div role="status" aria-label={label} aria-busy="true" className="flex items-center gap-4 [grid-area:header]">
        <SkeletonAvatar size="xl" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-6 w-56 rounded-ui-sm" />
          <Skeleton className="h-4 w-40 rounded-ui-sm" />
        </div>
      </div>
      <div className="grid gap-(--gap) [grid-area:main]">
        <div className="surface rounded-ui-lg p-(--gap)">
          <SkeletonText lines={4} />
        </div>
        <div className="surface rounded-ui-lg p-(--gap)">
          <SkeletonText lines={3} />
        </div>
      </div>
      <div className="grid gap-3 [grid-area:aside]">
        <div className="surface-2 rounded-ui-lg p-4">
          <SkeletonText lines={5} />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* RecordHeader                                                        */
/* ------------------------------------------------------------------ */

export interface RecordFact {
  label: React.ReactNode;
  value: React.ReactNode;
}

export interface RecordHeaderProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Avatar, logo or icon well. */
  media?: React.ReactNode;
  /** The page's `<h1>`. */
  title: React.ReactNode;
  /** "Head of Operations · Northpoint Ltd". */
  subtitle?: React.ReactNode;
  /** Status badge next to the title. */
  status?: React.ReactNode;
  /** Key facts under the title: owner, stage, value, last contact. */
  facts?: RecordFact[];
  /** Header actions. Hidden when the layout is `readOnly`. */
  actions?: React.ReactNode;
  /** "← Contacts" link up a level. */
  back?: { href: string; label: string };
  /** `RecordPager` (top end). */
  pager?: React.ReactNode;
  /** Shows "Saving…" next to the title while inline edits save. */
  saving?: boolean;
  /** `sm` for nested or compact records. Default `md`. */
  size?: "sm" | "md";
  /** Skeleton for the title and subtitle. */
  loading?: boolean;
  labels?: RecordLayoutLabels;
}

/** The record's header: back link + pager, media, h1, status, subtitle, actions and key facts. */
export const RecordHeader = React.forwardRef<HTMLElement, RecordHeaderProps>(function RecordHeader(
  { media, title, subtitle, status, facts, actions, back, pager, saving, size = "md", loading, labels, className, children, ...props },
  ref,
) {
  const ctx = React.useContext(RecordLayoutContext);
  const t = useLabels("record", recordLabels, labels ?? ctx.labels);
  const showActions = actions && !ctx.readOnly;
  const factsRef = React.useRef<HTMLDivElement>(null);
  useEdgeFade(factsRef, "x", Boolean(facts?.length));
  return (
    <header ref={ref} data-slot="record-header" data-size={size} className={cn("flex min-w-0 flex-col gap-4 [grid-area:header]", className)} {...props}>
      {back || pager ? (
        <div className="flex min-h-8 items-center justify-between gap-3">
          {back ? (
            <SmartLink href={back.href} className="-ms-0.5 inline-flex w-fit items-center gap-1.5 rounded-ui-sm text-[13px] text-fg-muted transition-colors hover:text-fg focus-ring">
              <ArrowLeft aria-hidden className="size-3.5 rtl:-scale-x-100" />
              {back.label}
            </SmartLink>
          ) : (
            <span />
          )}
          {pager}
        </div>
      ) : null}
      <div className="flex flex-wrap items-start gap-x-5 gap-y-4">
        {media ? <div data-slot="record-header-media" className="shrink-0">{media}</div> : null}
        <div className="min-w-0 flex-[1_1_16rem] self-center">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1
              aria-busy={loading || undefined}
              className={cn(
                "font-display min-w-0 text-fg [text-wrap:balance]",
                size === "md" ? "text-[length:calc(28px*var(--display-scale))] leading-[1.1]" : "text-[length:calc(20px*var(--display-scale))] leading-[1.15]",
              )}
            >
              {loading ? <Skeleton className="inline-block h-[0.8em] w-[min(16rem,55vw)] rounded-ui-sm align-middle" /> : title}
            </h1>
            {status && !loading ? <span className="inline-flex items-center gap-2">{status}</span> : null}
            {saving ? (
              <span role="status" className="inline-flex items-center gap-1.5 text-[13px] text-fg-subtle">
                <Spinner size="xs" /> {t("saving")}
              </span>
            ) : null}
          </div>
          {loading ? (
            <Skeleton className="mt-2 h-4 w-48 rounded-ui-sm" />
          ) : subtitle ? (
            <p className="mt-1 text-[14px] text-fg-muted">{subtitle}</p>
          ) : null}
        </div>
        {showActions ? <div data-slot="record-header-actions" className="flex flex-wrap items-center gap-2 self-center">{actions}</div> : null}
      </div>
      {facts?.length ? (
        <div
          ref={factsRef}
          role="group"
          aria-label={t("facts")}
          tabIndex={0}
          data-slot="record-facts"
          data-edge-fade="x"
          className="-mx-1 overflow-x-auto scrollbar-none rounded-ui-sm px-1 focus-ring @2xl/record:overflow-visible"
        >
          <dl className="flex w-max min-w-full items-stretch @2xl/record:w-auto @2xl/record:flex-wrap @2xl/record:gap-y-3">
            {facts.map((f, i) => (
              <div key={i} className="flex min-w-0 shrink-0 flex-col gap-1 border-s border-line px-5 first:border-s-0 first:ps-0">
                <dt className="text-[12px] text-fg-subtle">{f.label}</dt>
                <dd className="tabular text-[14px] font-medium text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
      {children}
    </header>
  );
});

/* ------------------------------------------------------------------ */
/* RecordPager                                                         */
/* ------------------------------------------------------------------ */

export interface RecordPagerProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** 1-based position of this record in the list it came from. */
  index: number;
  total: number;
  prevHref?: string;
  nextHref?: string;
  /** Called instead of (or as well as) navigating. */
  onPrevious?: () => void;
  onNext?: () => void;
  /** Register `k` (previous) and `j` (next). Ignored while typing in a field. Default `true`. */
  shortcuts?: boolean;
  labels?: RecordLayoutLabels;
}

/** "3 of 128" with previous/next buttons and `j` / `k` shortcuts. */
export const RecordPager = React.forwardRef<HTMLElement, RecordPagerProps>(function RecordPager(
  { index, total, prevHref, nextHref, onPrevious, onNext, shortcuts = true, labels, className, ...props },
  ref,
) {
  const ctx = React.useContext(RecordLayoutContext);
  const t = useLabels("record", recordLabels, labels ?? ctx.labels);
  const f = useFormat();
  const { navigate } = useNavigation();
  const hasPrev = index > 1 && Boolean(prevHref || onPrevious);
  const hasNext = index < total && Boolean(nextHref || onNext);

  const go = (which: "prev" | "next") => {
    const href = which === "prev" ? prevHref : nextHref;
    const cb = which === "prev" ? onPrevious : onNext;
    if (cb) cb();
    if (href) navigate(href);
  };
  useHotkeys("k", () => go("prev"), { enabled: shortcuts && hasPrev });
  useHotkeys("j", () => go("next"), { enabled: shortcuts && hasNext });

  const step = (which: "prev" | "next") => {
    const enabled = which === "prev" ? hasPrev : hasNext;
    const href = which === "prev" ? prevHref : nextHref;
    const cb = which === "prev" ? onPrevious : onNext;
    const label = which === "prev" ? t("previous") : t("next");
    const Icon = which === "prev" ? ChevronLeft : ChevronRight;
    const common = {
      "aria-label": label,
      title: shortcuts ? `${label} (${which === "prev" ? "K" : "J"})` : label,
      "aria-keyshortcuts": shortcuts ? (which === "prev" ? "k" : "j") : undefined,
      variant: "ghost" as const,
      size: "icon-sm" as const,
    };
    if (href && enabled && !cb) {
      return (
        <Button asChild {...common}>
          <SmartLink href={href}>
            <Icon aria-hidden className="rtl:-scale-x-100" />
          </SmartLink>
        </Button>
      );
    }
    return (
      <Button {...common} disabled={!enabled} onClick={() => go(which)}>
        <Icon aria-hidden className="rtl:-scale-x-100" />
      </Button>
    );
  };

  return (
    <nav ref={ref} aria-label={t("pagerLabel")} data-slot="record-pager" className={cn("inline-flex items-center gap-1", className)} {...props}>
      <span className="tabular me-1 text-[13px] text-fg-muted">{t("pager", { index: f.number(index), total: f.number(total) })}</span>
      <span className="inline-flex items-center rounded-ui-sm border border-line">
        {step("prev")}
        <span aria-hidden className="h-4 w-px bg-line" />
        {step("next")}
      </span>
    </nav>
  );
});

/* ------------------------------------------------------------------ */
/* RecordMain & RecordSection                                          */
/* ------------------------------------------------------------------ */

export interface RecordMainProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Route tabs (`TabsLinkList`) above the content. For in-page tabs, put `<Tabs>` in `children`. */
  tabs?: React.ReactNode;
}

/** The main column: tabs, overview, activity, related lists. */
export const RecordMain = React.forwardRef<HTMLDivElement, RecordMainProps>(function RecordMain({ tabs, className, children, ...props }, ref) {
  return (
    <div ref={ref} data-slot="record-main" className={cn("flex min-w-0 flex-col gap-(--gap) [grid-area:main]", className)} {...props}>
      {tabs ? <div data-slot="record-main-tabs" className="-mb-1">{tabs}</div> : null}
      {children}
    </div>
  );
});

export interface RecordSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Trailing control in the section header ("View all", "Log call"). */
  action?: React.ReactNode;
  /** Body padding. `none` for edge-to-edge tables and timelines. Default `md`. */
  padding?: "none" | "md";
}

/** A titled card in the main column: overview, activity, related deals. `<section aria-labelledby>`. */
export const RecordSection = React.forwardRef<HTMLElement, RecordSectionProps>(function RecordSection(
  { title, description, action, padding = "md", className, children, id, ...props },
  ref,
) {
  const autoId = React.useId();
  const titleId = `${id ?? `record-section${autoId.replace(/:/g, "")}`}-title`;
  return (
    <section ref={ref} id={id} aria-labelledby={titleId} data-slot="record-section" className={cn("surface overflow-hidden rounded-ui-lg", className)} {...props}>
      <div className="flex items-start justify-between gap-3 px-(--gap) pt-[calc(var(--gap)*0.8)]">
        <div className="min-w-0">
          <h2 id={titleId} className="text-[15px] font-semibold text-fg">
            {title}
          </h2>
          {description ? <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p> : null}
        </div>
        {action ? <div className="-me-1 -mt-1 flex shrink-0 items-center gap-1.5">{action}</div> : null}
      </div>
      <div className={cn(padding === "md" ? "p-(--gap) pt-3" : "pt-3")}>{children}</div>
    </section>
  );
});

/* ------------------------------------------------------------------ */
/* RecordAside & RecordAsideSection                                    */
/* ------------------------------------------------------------------ */

export interface RecordAsideProps extends React.HTMLAttributes<HTMLElement> {
  /** Accessible name of the complementary landmark. Default "Details". */
  "aria-label"?: string;
  labels?: RecordLayoutLabels;
}

/** The side column (`<aside>`): description lists, owners, tags, related records. */
export const RecordAside = React.forwardRef<HTMLElement, RecordAsideProps>(function RecordAside({ className, children, labels, ...props }, ref) {
  const ctx = React.useContext(RecordLayoutContext);
  const t = useLabels("record", recordLabels, labels ?? ctx.labels);
  return (
    <aside
      ref={ref}
      aria-label={props["aria-label"] ?? t("details")}
      data-slot="record-aside"
      className={cn("relative flex min-w-0 flex-col gap-3 [grid-area:aside]", className)}
      {...props}
    >
      {ctx.resizable && !ctx.narrow ? (
        <SidePaneHandle
          aria-label={t("resizeAside")}
          edge={ctx.asidePosition === "end" ? "start" : "end"}
          value={ctx.asideWidth}
          min={ctx.minAsideWidth}
          max={ctx.maxAsideWidth}
          defaultValue={ctx.defaultAsideWidth}
          onValueChange={ctx.setAsideWidth}
        />
      ) : null}
      {children}
    </aside>
  );
});

export interface RecordAsideSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title: React.ReactNode;
  /** Trailing control ("Edit", "+"). */
  action?: React.ReactNode;
  /** Let the user fold the section on wide screens too. On narrow layouts every section folds. */
  collapsible?: boolean;
  /** Default `true` on wide layouts; narrow layouts start folded unless `open` is controlled. */
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Heading level to fit the page outline. Default 2. */
  headingLevel?: 2 | 3;
}

/** A titled block in the side column; folds like an accordion item when space is short. */
export const RecordAsideSection = React.forwardRef<HTMLElement, RecordAsideSectionProps>(function RecordAsideSection(
  { title, action, collapsible = false, defaultOpen = true, open: openProp, onOpenChange, headingLevel = 2, className, children, ...props },
  ref,
) {
  const { narrow } = React.useContext(RecordLayoutContext);
  const foldable = collapsible || narrow;
  const touched = React.useRef(false);
  const [open, setOpen] = useControllableState({ value: openProp, defaultValue: defaultOpen, onChange: onOpenChange, name: "RecordAsideSection" });
  // Fold when the layout turns narrow, unfold when it widens again — until the user decides.
  React.useEffect(() => {
    if (touched.current || openProp !== undefined) return;
    setOpen(narrow ? false : defaultOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrow]);
  const autoId = React.useId();
  const titleId = `record-aside${autoId.replace(/:/g, "")}`;
  const H = `h${headingLevel}` as "h2" | "h3";
  const isOpen = foldable ? open : true;

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={(v) => {
        touched.current = true;
        setOpen(v);
      }}
      asChild
    >
      <section ref={ref} aria-labelledby={titleId} data-slot="record-aside-section" data-state={isOpen ? "open" : "closed"} className={cn("surface-2 rounded-ui-lg", className)} {...props}>
        <div className="flex min-h-11 items-center gap-2 ps-4 pe-2">
          <H id={titleId} className="min-w-0 flex-1 text-[13px] font-semibold text-fg">
            {foldable ? (
              <Collapsible.Trigger className="group/aside -ms-1.5 flex w-[calc(100%+0.375rem)] items-center gap-1.5 rounded-ui-sm px-1.5 py-1 text-start outline-none focus-ring">
                <ChevronDown aria-hidden className="size-3.5 shrink-0 text-fg-subtle transition-transform duration-200 group-data-[state=closed]/aside:-rotate-90 motion-reduce:transition-none rtl:group-data-[state=closed]/aside:rotate-90" />
                <span className="truncate">{title}</span>
              </Collapsible.Trigger>
            ) : (
              <span className="block truncate py-1">{title}</span>
            )}
          </H>
          {action ? <div className="flex shrink-0 items-center gap-1">{action}</div> : null}
        </div>
        <Collapsible.Content className="ui-collapse">
          <div className="px-4 pb-4">{children}</div>
        </Collapsible.Content>
      </section>
    </Collapsible.Root>
  );
});

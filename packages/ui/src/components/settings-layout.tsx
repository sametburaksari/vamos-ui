"use client";

import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useCan, useNavigation, SmartLink } from "../lib/provider";
import { useHotkeys } from "../lib/use-hotkeys";
import { useReducedMotion } from "../lib/use-reduced-motion";
import { useControllableState } from "../lib/use-controllable-state";
import { useEdgeFade } from "../lib/use-edge-fade";
import { FieldContext, type FieldContextValue } from "../lib/field-context";
import { Button } from "./button";
import { SkeletonText } from "./skeleton";

/* ------------------------------------------------------------------ */
/* Labels & context                                                    */
/* ------------------------------------------------------------------ */

const settingsLabels = {
  nav: "Settings sections",
  saveBar: "Unsaved changes",
  unsaved: "You have unsaved changes",
  save: "Save changes",
  saving: "Saving…",
  reset: "Discard",
  error: "Couldn't save your changes",
  loading: "Loading settings",
};

export type SettingsLayoutLabels = Partial<typeof settingsLabels>;

interface SettingsLayoutContextValue {
  readOnly: boolean;
  labels?: SettingsLayoutLabels;
}

const SettingsLayoutContext = /*#__PURE__*/ React.createContext<SettingsLayoutContextValue>({ readOnly: false });

/* ------------------------------------------------------------------ */
/* SettingsLayout                                                      */
/* ------------------------------------------------------------------ */

export interface SettingsLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `SettingsNav` — a column at the inline start; a scrolling strip on top below 42rem (672px). */
  nav?: React.ReactNode;
  /** `md` 64rem (default) · `lg` 80rem overall. */
  width?: "md" | "lg";
  /** Disables every control in the sections (pair with an Alert in `notice`). */
  readOnly?: boolean;
  /** Banner above the first section (read-only notice, plan limits). */
  notice?: React.ReactNode;
  /** Where the nav sticks. Default `"var(--topbar-h)"`. Use `0` in your own scroll box. */
  stickyTop?: number | string;
  labels?: SettingsLayoutLabels;
}

/**
 * A shared skeleton for settings pages: section nav, titled sections of label | control rows,
 * a sticky save bar that rises when there are unsaved changes, and a danger zone. Not bound to
 * a form library — pass `dirty` from react-hook-form's `formState.isDirty` or your own state.
 *
 * ```tsx
 * <SettingsLayout nav={<SettingsNav items={[{ id: "general", label: "General" }, { id: "danger", label: "Danger zone" }]} />}>
 *   <SettingsSection id="general" title="General" description="Basic information about the site.">
 *     <SettingsRow label="Site name" description="Shown in the title bar."><Input defaultValue="Northwind Journal" /></SettingsRow>
 *     <SettingsRow label="Maintenance mode" layout="inline"><Switch /></SettingsRow>
 *   </SettingsSection>
 *   <SettingsSaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
 * </SettingsLayout>
 * ```
 */
export const SettingsLayout = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SettingsLayoutProps>(function SettingsLayout(
  { nav, width = "md", readOnly = false, notice, stickyTop, labels, className, style, children, ...props },
  ref,
) {
  const ctx = React.useMemo(() => ({ readOnly, labels }), [readOnly, labels]);
  const top = stickyTop === undefined ? undefined : typeof stickyTop === "number" ? `${stickyTop}px` : stickyTop;
  return (
    <SettingsLayoutContext.Provider value={ctx}>
      <div
        ref={ref}
        data-slot="settings-layout"
        data-read-only={readOnly ? "" : undefined}
        className={cn("@container/settings mx-auto w-full min-w-0", width === "md" ? "max-w-[64rem]" : "max-w-[80rem]", className)}
        style={top !== undefined ? ({ "--settings-sticky-top": top, ...style } as React.CSSProperties) : style}
        {...props}
      >
        <div className={cn("grid min-w-0 gap-x-10 gap-y-5", nav && "@2xl/settings:grid-cols-[11.5rem_minmax(0,1fr)]")}>
          {nav ? (
            <div data-slot="settings-layout-nav" className="min-w-0 @2xl/settings:sticky @2xl/settings:top-[calc(var(--settings-sticky-top,var(--topbar-h))+1.5rem)] @2xl/settings:self-start">
              {nav}
            </div>
          ) : null}
          <div data-slot="settings-layout-content" className="flex min-w-0 flex-col gap-[calc(var(--gap)*1.6)]">
            {notice}
            {children}
          </div>
        </div>
      </div>
    </SettingsLayoutContext.Provider>
  );
});

/* ------------------------------------------------------------------ */
/* SettingsNav                                                         */
/* ------------------------------------------------------------------ */

export interface SettingsNavItem {
  /** Section id (`#general`) — or a key when `href` is set. */
  id: string;
  label: string;
  /** Route link (a separate settings page). Without it the item jumps to `#id` with scroll-spy. */
  href?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  /** Hidden when `can(permission)` from `VamosProvider` is false. */
  permission?: string;
  /** Danger tone (the "Danger zone" item). */
  tone?: "default" | "danger";
}

export interface SettingsNavProps extends Omit<React.HTMLAttributes<HTMLElement>, "defaultValue"> {
  items: SettingsNavItem[];
  /** Active item id (controlled). Default: derived from scroll position (anchors) or `currentPath` (links). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Track the section in view. Default `true` for anchor items. */
  scrollSpy?: boolean;
  "aria-label"?: string;
  labels?: SettingsLayoutLabels;
}

/**
 * Section navigation: a `nav` with `aria-current`. Anchor items scroll to their section, move focus
 * to its heading, and follow the scroll (scroll-spy). Link items use the app's router.
 */
export const SettingsNav = /*#__PURE__*/ React.forwardRef<HTMLElement, SettingsNavProps>(function SettingsNav(
  { items: itemsProp, value: valueProp, defaultValue, onValueChange, scrollSpy = true, labels, className, ...props },
  ref,
) {
  const ctx = React.useContext(SettingsLayoutContext);
  const t = useLabels("settings", settingsLabels, labels ?? ctx.labels);
  const can = useCan();
  const { isActive } = useNavigation();
  const reduced = useReducedMotion();
  const items = React.useMemo(() => itemsProp.filter((i) => !i.permission || can(i.permission)), [itemsProp, can]);
  const [value, setValue] = useControllableState({ value: valueProp, defaultValue: defaultValue ?? items[0]?.id ?? "", onChange: onValueChange, name: "SettingsNav" });
  const listRef = React.useRef<HTMLUListElement>(null);
  useEdgeFade(listRef, "x", true);
  const lockUntil = React.useRef(0);

  // Scroll-spy over anchor items.
  const anchorIds = items.filter((i) => !i.href).map((i) => i.id).join("|");
  React.useEffect(() => {
    if (!scrollSpy || !anchorIds || typeof IntersectionObserver === "undefined") return;
    const ids = anchorIds.split("|");
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        if (Date.now() < lockUntil.current) return; // a click-scroll is in flight
        const first = ids.find((id) => visible.has(id));
        if (first) setValue(first);
      },
      { rootMargin: "-10% 0px -55% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollSpy, anchorIds]);

  // Keep the active item visible in the horizontal strip.
  React.useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>("[aria-current]");
    el?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [value]);

  const jump = (id: string) => {
    const target = document.getElementById(id);
    setValue(id);
    if (!target) return;
    lockUntil.current = Date.now() + 800;
    target.scrollIntoView?.({ behavior: reduced ? "auto" : "smooth", block: "start" });
    const heading = target.querySelector<HTMLElement>("[data-settings-heading]") ?? target;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  };

  const itemClass = (active: boolean, danger: boolean) =>
    cn(
      "group/settings-nav relative flex h-9 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-ui-sm px-3 text-[13.5px] transition-colors focus-ring",
      "@2xl/settings:h-8.5 @2xl/settings:w-full",
      active ? "bg-selected font-medium text-fg" : "text-fg-muted hover:bg-hover hover:text-fg",
      danger && !active && "text-danger hover:text-danger",
      // accent tick on the start edge of the active item (wide layout)
      "before:absolute before:inset-y-2 before:-start-px before:w-0.5 before:rounded-full before:bg-accent-ink before:opacity-0 before:transition-opacity @2xl/settings:before:opacity-0",
      active && "@2xl/settings:before:opacity-100",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    );

  return (
    <nav ref={ref} aria-label={props["aria-label"] ?? t("nav")} data-slot="settings-nav" className={cn("min-w-0", className)} {...props}>
      <ul
        ref={listRef}
        data-edge-fade="x"
        className="-mx-1 flex min-w-0 gap-0.5 overflow-x-auto scrollbar-none px-1 pb-1 @2xl/settings:mx-0 @2xl/settings:flex-col @2xl/settings:overflow-visible @2xl/settings:px-0 @2xl/settings:pb-0 @2xl/settings:[mask-image:none]"
      >
        {items.map((item) => {
          const active = item.href ? (valueProp !== undefined ? valueProp === item.id : isActive(item.href)) : value === item.id;
          const inner = (
            <>
              {item.icon ? <span aria-hidden className={cn("inline-flex", active ? "text-fg" : "text-fg-subtle")}>{item.icon}</span> : null}
              <span className="truncate">{item.label}</span>
              {item.badge ? <span className="ms-auto">{item.badge}</span> : null}
            </>
          );
          return (
            <li key={item.id} className="shrink-0">
              {item.href ? (
                <SmartLink href={item.href} aria-current={active ? "page" : undefined} className={itemClass(active, item.tone === "danger")} onClick={() => setValue(item.id)}>
                  {inner}
                </SmartLink>
              ) : (
                <a
                  href={`#${item.id}`}
                  aria-current={active ? "true" : undefined}
                  className={itemClass(active, item.tone === "danger")}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                    e.preventDefault();
                    jump(item.id);
                  }}
                >
                  {inner}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

/* ------------------------------------------------------------------ */
/* SettingsSection                                                     */
/* ------------------------------------------------------------------ */

export interface SettingsSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Anchor for `SettingsNav` (`#general`). */
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** `stacked` (default): title above the card. `split`: title in a start column, card beside it (stacks when narrow). */
  layout?: "stacked" | "split";
  /** `danger` for irreversible actions: red hairline and title. */
  tone?: "default" | "danger";
  /** Card footer: a section-level button, a hint ("Changes apply to new invoices only"). */
  footer?: React.ReactNode;
  /** Skeleton rows instead of the content. */
  loading?: boolean | number;
  /** Heading level. Default 2. */
  headingLevel?: 2 | 3;
  labels?: SettingsLayoutLabels;
}

/** A titled group of setting rows. `<section aria-labelledby>`. */
export const SettingsSection = /*#__PURE__*/ React.forwardRef<HTMLElement, SettingsSectionProps>(function SettingsSection(
  { id, title, description, layout = "stacked", tone = "default", footer, loading, headingLevel = 2, labels, className, children, ...props },
  ref,
) {
  const ctx = React.useContext(SettingsLayoutContext);
  const t = useLabels("settings", settingsLabels, labels ?? ctx.labels);
  const autoId = React.useId();
  const titleId = `${id ?? `settings${autoId.replace(/:/g, "")}`}-title`;
  const H = `h${headingLevel}` as "h2" | "h3";
  const danger = tone === "danger";
  const rows = loading ? Math.max(1, typeof loading === "number" ? loading : 3) : 0;

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={titleId}
      data-slot="settings-section"
      data-layout={layout}
      data-tone={tone}
      className={cn("scroll-mt-[calc(var(--settings-sticky-top,var(--topbar-h))+1.5rem)] min-w-0", layout === "split" && "grid gap-x-8 gap-y-3 @4xl/settings:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]", className)}
      {...props}
    >
      <div className={cn("min-w-0", layout === "stacked" ? "mb-3 px-0.5" : "px-0.5 @4xl/settings:pt-3")}>
        <H id={titleId} data-settings-heading className={cn("rounded-ui-sm text-[15px] font-semibold tracking-[-0.005em] outline-none focus-visible:outline-2 focus-visible:outline-ring", danger ? "text-danger" : "text-fg")}>
          {danger ? <TriangleAlert aria-hidden className="-mt-0.5 me-1.5 inline size-4" /> : null}
          {title}
        </H>
        {description ? <p className="mt-1 max-w-[60ch] text-[13.5px] leading-relaxed text-fg-muted">{description}</p> : null}
      </div>
      <div
        data-slot="settings-section-card"
        aria-busy={loading ? true : undefined}
        className={cn("@container/setting-rows surface min-w-0 overflow-hidden rounded-ui-lg", danger && "border-[color-mix(in_srgb,var(--danger)_40%,transparent)]!")}
      >
        {loading ? (
          <div role="status" aria-label={t("loading")} className="divide-y divide-line">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="grid gap-4 px-(--gap) py-4 @lg/setting-rows:grid-cols-2">
                <SkeletonText lines={2} lastLineWidth="70%" />
                <SkeletonText lines={1} lineClassName="h-(--control-h)" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-line">{children}</div>
        )}
        {footer ? <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2 px-(--gap) py-3 text-[13px] text-fg-muted">{footer}</div> : null}
      </div>
    </section>
  );
});

/* ------------------------------------------------------------------ */
/* SettingsRow                                                         */
/* ------------------------------------------------------------------ */

export interface SettingsRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Id of the control. Default: generated and passed to kit controls through the field context. */
  htmlFor?: string;
  /**
   * `split` (default): label | control side by side, stacked when narrow. `inline`: control at the
   * end on every width (switches). `stacked`: label, description, full-width control.
   */
  layout?: "stacked" | "inline" | "split";
  /** "Beta", "Pro" — next to the label. */
  badge?: React.ReactNode;
  /** Error text under the control (marks kit controls invalid). */
  error?: React.ReactNode;
  disabled?: boolean;
}

/**
 * One setting: label + description | control. Acts like a `Field` for kit controls (Input,
 * Switch, Select…): the id, `aria-describedby` and disabled/invalid state are wired for you.
 */
export const SettingsRow = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SettingsRowProps>(function SettingsRow(
  { label, description, htmlFor, layout = "split", badge, error, disabled, className, children, ...props },
  ref,
) {
  const { readOnly } = React.useContext(SettingsLayoutContext);
  const autoId = React.useId().replace(/:/g, "");
  const controlId = htmlFor ?? `setting-${autoId}`;
  const labelId = `${controlId}-label`;
  const descId = description ? `${controlId}-desc` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const field = React.useMemo<FieldContextValue>(
    () => ({
      id: controlId,
      labelId,
      describedBy: [descId, errorId].filter(Boolean).join(" ") || undefined,
      errorId,
      invalid: Boolean(error),
      required: false,
      disabled: Boolean(disabled || readOnly),
      readOnly: false,
    }),
    [controlId, labelId, descId, errorId, error, disabled, readOnly],
  );

  const text = (
    <div className="min-w-0">
      <label id={labelId} htmlFor={controlId} className={cn("inline-flex items-center gap-2 text-[14px] font-medium text-fg", (disabled || readOnly) && "text-fg-muted")}>
        {label}
        {badge}
      </label>
      {description ? (
        <p id={descId} className="mt-0.5 max-w-[56ch] text-[13px] leading-relaxed text-fg-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
  const control = (
    <div data-slot="settings-row-control" className={cn("min-w-0", layout === "inline" && "shrink-0")}>
      <FieldContext.Provider value={field}>{children}</FieldContext.Provider>
      {error ? (
        <p id={errorId} className="mt-1.5 text-[12.5px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );

  return (
    <div
      ref={ref}
      data-slot="settings-row"
      data-layout={layout}
      className={cn(
        "px-(--gap) py-[calc(var(--gap)*0.8)]",
        layout === "split" && "grid items-start gap-x-8 gap-y-2.5 @lg/setting-rows:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
        layout === "inline" && "flex items-center justify-between gap-6",
        layout === "stacked" && "grid gap-2.5",
        className,
      )}
      {...props}
    >
      {text}
      {control}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* SettingsSaveBar                                                     */
/* ------------------------------------------------------------------ */

export interface SettingsSaveBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onReset"> {
  /** The form differs from what's saved. The bar shows while `dirty`, `saving` or `error`. */
  dirty: boolean;
  saving?: boolean;
  onSave: () => void;
  onReset: () => void;
  /** Replace "You have unsaved changes" ("3 changes to notification rules"). */
  message?: React.ReactNode;
  /** Save failed: danger tone and this text (or the default). `true` for the default text. */
  error?: React.ReactNode;
  /** Warn before leaving the page while dirty (`beforeunload`). Default `true`. */
  blockNavigation?: boolean;
  /** `mod+s` saves while dirty. Default `true`. */
  shortcuts?: boolean;
  /** Label of the save button. Default "Save changes". */
  saveLabel?: string;
  labels?: SettingsLayoutLabels;
}

/**
 * The sticky "Unsaved changes · Discard · Save" bar. It rises from the bottom of the content when
 * the form is dirty, announces itself politely, and `mod+s` saves.
 */
export const SettingsSaveBar = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SettingsSaveBarProps>(function SettingsSaveBar(
  { dirty, saving = false, onSave, onReset, message, error, blockNavigation = true, shortcuts = true, saveLabel, labels, className, ...props },
  ref,
) {
  const ctx = React.useContext(SettingsLayoutContext);
  const t = useLabels("settings", settingsLabels, labels ?? ctx.labels);
  const visible = dirty || saving || Boolean(error);

  useHotkeys("mod+s", () => onSave(), { enabled: shortcuts && dirty && !saving && !ctx.readOnly });

  React.useEffect(() => {
    if (!blockNavigation || !(dirty || saving)) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [blockNavigation, dirty, saving]);

  const errorText = error === true ? t("error") : error;
  return (
    <>
      <div aria-live="polite" className="sr-only">
        {visible && !error ? t("unsaved") : ""}
      </div>
      {visible ? (
        <div
          ref={ref}
          role="region"
          aria-label={t("saveBar")}
          data-slot="settings-save-bar"
          data-state={error ? "error" : saving ? "saving" : "dirty"}
          className={cn(
            "ui-rise surface-popover sticky bottom-4 z-(--z-sticky) flex flex-wrap items-center gap-x-4 gap-y-2 rounded-ui-lg py-2 ps-4 pe-2",
            error && "border-[color-mix(in_srgb,var(--danger)_45%,transparent)]!",
            className,
          )}
          {...props}
        >
          {error ? (
            <p role="alert" className="flex min-w-0 flex-1 items-center gap-2 text-[13.5px] font-medium text-danger">
              <TriangleAlert aria-hidden className="size-4 shrink-0" />
              {errorText}
            </p>
          ) : (
            <p className="flex min-w-0 flex-1 items-center gap-2.5 text-[13.5px] text-fg">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-warning" />
              <span className="truncate">{message ?? t("unsaved")}</span>
            </p>
          )}
          <div className="ms-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={onReset} disabled={saving}>
              {t("reset")}
            </Button>
            <Button variant="primary" size="sm" onClick={onSave} loading={saving} loadingText={t("saving")} disabled={ctx.readOnly} aria-keyshortcuts="Control+S Meta+S">
              {saveLabel ?? t("save")}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
});

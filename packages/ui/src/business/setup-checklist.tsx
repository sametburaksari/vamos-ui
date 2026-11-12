"use client";

import * as React from "react";
import { Check, ChevronDown, Lock, X, ArrowRight, Undo2, Rocket } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { SmartLink } from "../lib/provider";
import { Button, IconButton } from "../components/button";
import { ProgressCircle } from "../components/progress";
import { Skeleton } from "../components/skeleton";

export const setupChecklistLabels = {
  title: "Get started",
  progress: "{done} of {total} complete",
  progressShort: "{done}/{total}",
  dismiss: "Hide setup guide",
  reopen: "Setup guide · {done} of {total}",
  skip: "Skip for now",
  undoSkip: "Undo skip",
  optional: "Optional",
  todo: "not started",
  in_progress: "in progress",
  done: "done",
  skipped: "skipped",
  locked: "locked",
  itemName: "{title}, {status}",
  allDone: "You're all set",
  allDoneBody: "Everything is in place. You can hide this guide; it stays in Help.",
  hide: "Hide guide",
  details: "{title} details",
};
export type SetupChecklistLabels = typeof setupChecklistLabels;

export type SetupItemStatus = "todo" | "in_progress" | "done" | "skipped";

export interface SetupItem {
  id: string;
  title: string;
  description?: string;
  status: SetupItemStatus;
  /** The deep link or action that completes this step. */
  action?: { label: string; href?: string; onSelect?: () => void };
  optional?: boolean;
  /** Depends on another step. */
  locked?: { reason: string };
  /** "2 min". */
  estimate?: string;
}

export interface SetupChecklistProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: string;
  description?: string;
  items: SetupItem[];
  onSkip?: (id: string) => void;
  onUndoSkip?: (id: string) => void;
  /** Controlled dismissal. Show `<SetupChecklistLauncher>` while dismissed. */
  dismissed?: boolean;
  onDismissedChange?: (dismissed: boolean) => void;
  /** `card` (dashboard), `sidebar` (app shell), `popover` (opened from the launcher). Default `"card"`. */
  variant?: "card" | "sidebar" | "popover";
  /** Open the first unfinished step's details. Default `true`. */
  expandFirstIncomplete?: boolean;
  /** Called once when the last required step becomes done. */
  onAllDone?: () => void;
  loading?: boolean;
  labels?: Partial<SetupChecklistLabels>;
}

function counts(items: SetupItem[]) {
  const required = items.filter((i) => !i.optional);
  const done = items.filter((i) => i.status === "done" || i.status === "skipped").length;
  const allDone = required.every((i) => i.status === "done" || i.status === "skipped");
  return { done, total: items.length, allDone };
}

/**
 * A "Get started" panel: ordered setup steps with progress, deep-link actions, skip, lock and
 * dismiss. Completion comes from the app (pass the new `status`); focus never jumps when a
 * step completes on its own.
 *
 * ```tsx
 * <SetupChecklist items={steps} onSkip={skip} dismissed={hidden} onDismissedChange={setHidden} />
 * {hidden ? <SetupChecklistLauncher items={steps} onOpen={() => setHidden(false)} /> : null}
 * ```
 */
export const SetupChecklist = /*#__PURE__*/ React.forwardRef<HTMLElement, SetupChecklistProps>(function SetupChecklist(
  { title, description, items, onSkip, onUndoSkip, dismissed, onDismissedChange, variant = "card", expandFirstIncomplete = true, onAllDone, loading, labels, className, ...props },
  ref,
) {
  const t = useLabels("setupChecklist", setupChecklistLabels, labels);
  const { done, total, allDone } = counts(items);
  const firstOpen = items.find((i) => (i.status === "todo" || i.status === "in_progress") && !i.locked)?.id;
  const [open, setOpen] = React.useState<string | null>(expandFirstIncomplete ? (firstOpen ?? null) : null);
  const headingId = React.useId();
  const wasDone = React.useRef(allDone);
  const [live, setLive] = React.useState("");
  const prevDone = React.useRef(done);

  React.useEffect(() => {
    if (allDone && !wasDone.current) onAllDone?.();
    wasDone.current = allDone;
  }, [allDone, onAllDone]);
  React.useEffect(() => {
    if (prevDone.current !== done) setLive(t("progress", { done, total }));
    prevDone.current = done;
  }, [done, total, t]);
  // When the open step completes, move the disclosure (not focus) to the next unfinished step.
  React.useEffect(() => {
    const cur = items.find((i) => i.id === open);
    if (cur && (cur.status === "done" || cur.status === "skipped") && expandFirstIncomplete) setOpen(firstOpen ?? null);
  }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

  if (dismissed) return null;

  return (
    <section
      ref={ref}
      aria-labelledby={headingId}
      data-slot="setup-checklist"
      data-variant={variant}
      data-complete={allDone ? "" : undefined}
      className={cn(
        "vui-setup flex min-w-0 flex-col",
        variant === "card" && "rounded-ui-lg surface",
        variant === "popover" && "w-[22rem] max-w-full rounded-ui-lg surface-popover",
        variant === "sidebar" && "text-[13px]",
        className,
      )}
      {...props}
    >
      <header className={cn("flex items-start gap-3", variant === "sidebar" ? "px-1 pb-3" : "border-b border-line px-4 py-3.5")}>
        <ProgressCircle value={total ? (done / total) * 100 : 0} size={variant === "sidebar" ? "sm" : "md"} aria-label={t("progress", { done, total })} className="shrink-0">
          {variant === "sidebar" || (loading && !total) ? undefined : <span className="font-mono text-[11px] font-medium text-fg tabular">{t("progressShort", { done, total })}</span>}
        </ProgressCircle>
        <div className="min-w-0 flex-1">
          <h2 id={headingId} className={cn("font-semibold tracking-[-0.01em] text-fg", variant === "sidebar" ? "text-[13px]" : "text-[15px]")}>
            {title ?? t("title")}
          </h2>
          {loading && !total && description == null ? (
            <Skeleton className="mt-1.5 h-3 w-24" />
          ) : (
            <p className="mt-0.5 text-xs text-fg-muted tabular">{description ?? t("progress", { done, total })}</p>
          )}
        </div>
        {onDismissedChange ? (
          <IconButton label={t("dismiss")} size="sm" variant="ghost" onClick={() => onDismissedChange(true)} className="-me-1.5 -mt-0.5">
            <X />
          </IconButton>
        ) : null}
      </header>
      <span className="sr-only" aria-live="polite" aria-atomic>
        {live}
      </span>

      {loading ? (
        <div className="flex flex-col gap-3 p-4" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton shape="circle" className="size-5" />
              <Skeleton className="h-3.5 flex-1" />
            </div>
          ))}
        </div>
      ) : allDone ? (
        <div className="flex flex-col items-start gap-2 px-4 py-5" data-slot="setup-checklist-complete">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent-ink" aria-hidden>
            <Rocket className="size-4" />
          </span>
          <p className="text-sm font-semibold text-fg">{t("allDone")}</p>
          <p className="text-[13px] text-fg-muted">{t("allDoneBody")}</p>
          {onDismissedChange ? (
            <Button size="sm" variant="secondary" className="mt-1" onClick={() => onDismissedChange(true)}>
              {t("hide")}
            </Button>
          ) : null}
        </div>
      ) : (
        <ol className={cn("m-0 flex list-none flex-col p-0", variant === "sidebar" ? "gap-0.5" : "p-1.5")} data-slot="setup-checklist-items">
          {items.map((item, i) => (
            <SetupChecklistItem
              key={item.id}
              item={item}
              index={i}
              open={open === item.id}
              current={item.id === firstOpen}
              onToggle={() => setOpen((o) => (o === item.id ? null : item.id))}
              onSkip={onSkip}
              onUndoSkip={onUndoSkip}
              compact={variant === "sidebar"}
              t={t}
            />
          ))}
        </ol>
      )}
    </section>
  );
});

interface SetupChecklistItemProps {
  item: SetupItem;
  index: number;
  open: boolean;
  current: boolean;
  onToggle: () => void;
  onSkip?: (id: string) => void;
  onUndoSkip?: (id: string) => void;
  compact?: boolean;
  t: LabelFn<SetupChecklistLabels>;
}

function StatusMark({ status, locked, index }: { status: SetupItemStatus; locked: boolean; index: number }) {
  return (
    <span
      aria-hidden
      data-status={status}
      className={cn(
        "vui-setup-mark inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold tabular transition-[background-color,box-shadow] duration-200 [&_svg]:size-3",
        status === "done" && "tone-success bg-(--tone) text-scene",
        status === "in_progress" && "bg-surface text-accent-ink shadow-[inset_0_0_0_1.5px_var(--accent-ink)]",
        status === "todo" && !locked && "text-fg-subtle shadow-[inset_0_0_0_1.5px_var(--track)]",
        status === "skipped" && "border-[1.5px] border-dashed border-field-border text-fg-subtle",
        locked && "bg-selected text-fg-subtle",
      )}
    >
      {status === "done" ? <Check strokeWidth={3} /> : locked ? <Lock /> : status === "skipped" ? null : index + 1}
    </span>
  );
}

function SetupChecklistItem({ item, index, open, current, onToggle, onSkip, onUndoSkip, compact, t }: SetupChecklistItemProps) {
  const locked = !!item.locked && item.status !== "done";
  const statusText = locked ? t("locked") : t(item.status);
  const panelId = React.useId();
  const finished = item.status === "done" || item.status === "skipped";
  const hasDetails = !!(item.description || item.action || item.locked || (!finished && onSkip && item.optional) || (item.status === "skipped" && onUndoSkip) || (!finished && onSkip));
  return (
    <li
      data-slot="setup-checklist-item"
      data-status={item.status}
      data-current={current && !finished ? "" : undefined}
      className={cn("vui-setup-item rounded-ui transition-colors", current && !finished && !compact && "bg-accent-soft/50")}
    >
      <h3 className="m-0 text-inherit font-normal">
        <button
          type="button"
          aria-expanded={hasDetails ? open : undefined}
          aria-controls={hasDetails ? panelId : undefined}
          onClick={hasDetails ? onToggle : undefined}
          className={cn("focus-ring flex w-full items-center gap-3 rounded-ui text-start", compact ? "px-1 py-1.5" : "px-2.5 py-2.5", hasDetails && "hover:bg-hover")}
        >
          <StatusMark status={item.status} locked={locked} index={index} />
          <span className={cn("min-w-0 flex-1 text-sm", finished ? "text-fg-muted" : "text-fg", item.status === "done" && "line-through decoration-fg-subtle/60", item.status === "skipped" && "italic")}>
            {item.title}
            <span className="sr-only">, {statusText}</span>
          </span>
          {item.optional && !finished ? <span className="text-[11px] text-fg-subtle">{t("optional")}</span> : null}
          {item.estimate && !finished && !compact ? <span className="font-mono text-[11px] text-fg-subtle tabular">{item.estimate}</span> : null}
          {hasDetails ? <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-fg-subtle transition-transform duration-200", open && "rotate-180")} /> : null}
        </button>
      </h3>
      {hasDetails ? (
        <div id={panelId} hidden={!open} className={cn("vui-setup-panel", compact ? "ps-8 pb-2" : "ps-[2.875rem] pe-3 pb-3")}>
          {item.description ? <p className="text-[13px] text-fg-muted">{item.description}</p> : null}
          {locked ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-fg-subtle">
              <Lock aria-hidden className="size-3" /> {item.locked!.reason}
            </p>
          ) : null}
          <div className="mt-2.5 flex flex-wrap items-center gap-2 empty:hidden">
            {item.action && !finished ? (
              item.action.href ? (
                <Button asChild size="sm" variant={current ? "primary" : "secondary"} disabled={locked}>
                  <SmartLink href={item.action.href}>
                    {item.action.label} <ArrowRight className="rtl:rotate-180" />
                  </SmartLink>
                </Button>
              ) : (
                <Button size="sm" variant={current ? "primary" : "secondary"} disabled={locked} onClick={item.action.onSelect}>
                  {item.action.label} <ArrowRight className="rtl:rotate-180" />
                </Button>
              )
            ) : null}
            {!finished && onSkip ? (
              <Button size="sm" variant="ghost" onClick={() => onSkip(item.id)}>
                {t("skip")}
              </Button>
            ) : null}
            {item.status === "skipped" && onUndoSkip ? (
              <Button size="sm" variant="ghost" onClick={() => onUndoSkip(item.id)}>
                <Undo2 /> {t("undoSkip")}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Launcher                                                            */
/* ------------------------------------------------------------------ */

export interface SetupChecklistLauncherProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  items: SetupItem[];
  onOpen: () => void;
  /** Fixed to the bottom end of the viewport. Default `false` (in flow). */
  floating?: boolean;
  labels?: Partial<SetupChecklistLabels>;
}

/** A pill that reopens a dismissed checklist: "Setup guide · 3 of 6". */
export const SetupChecklistLauncher = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, SetupChecklistLauncherProps>(function SetupChecklistLauncher(
  { items, onOpen, floating, labels, className, ...props },
  ref,
) {
  const t = useLabels("setupChecklist", setupChecklistLabels, labels);
  const { done, total } = counts(items);
  return (
    <button
      ref={ref}
      type="button"
      data-slot="setup-checklist-launcher"
      onClick={onOpen}
      className={cn(
        "focus-ring inline-flex h-9 items-center gap-2 rounded-full surface-popover ps-1.5 pe-3.5 text-[13px] font-medium text-fg transition-[transform,box-shadow] duration-150 motion-safe:hover:-translate-y-px",
        floating && "fixed end-5 bottom-5 z-40",
        className,
      )}
      {...props}
    >
      <ProgressCircle value={total ? (done / total) * 100 : 0} size="sm" aria-hidden className="size-6" />
      {t("reopen", { done, total })}
    </button>
  );
});

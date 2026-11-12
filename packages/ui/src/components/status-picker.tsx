"use client";

import * as React from "react";
import * as SelectPrimitive from "radix-ui/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";
import { useFieldControl } from "../lib/field-context";
import { useLabels } from "../lib/labels";
import { Layer } from "../lib/layer";
import { usePortalContainer } from "../lib/theme-scope";
import { useControllableState, useLatest } from "../lib/use-controllable-state";
import { controlVariants, itemSlots, itemVariants } from "../lib/variants";
import { badgeVariants } from "./badge";
import { Spinner } from "./spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogBody } from "./alert-dialog";
import { Textarea } from "./input";

export type StatusCategory = "todo" | "active" | "done" | "cancelled";
export type StatusTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

/** One status of a workflow. Labels are your data (localise them in the app). */
export interface StatusDef {
  value: string;
  label: string;
  /** Drives the default icon, tone and grouping. */
  category: StatusCategory;
  /** Semantic colour. Default from the category (todo neutral, active info, done success, cancelled neutral). */
  tone?: StatusTone;
  /** Any CSS colour (user-defined pipeline stages). Overrides `tone`. */
  color?: string;
  /** Replace the category icon. */
  icon?: React.ReactNode;
  description?: string;
}

/** What `confirm` returns to ask before a transition. */
export interface StatusConfirm {
  title: string;
  description?: string;
  /** Ask for a note (a rejection reason). Passed to `onValueChange` as `meta.note`. */
  requireNote?: boolean;
  /** Note field label. Default "Note". */
  noteLabel?: string;
  confirmLabel?: string;
  /** `"danger"` for destructive transitions (reject, cancel). */
  tone?: "default" | "danger";
}

const statusPickerLabels = {
  change: "{label}: {status}. Change",
  status: "Status",
  notAllowed: "Not allowed from {status}",
  note: "Note",
  notePlaceholder: "Add a short reason the requester will see",
  saving: "Saving…",
  saved: "Status changed to {status}",
  failed: "Couldn't change the status. It's back to {status}.",
  placeholder: "Set status",
  todo: "To do",
  active: "In progress",
  done: "Done",
  cancelled: "Cancelled",
  confirm: "Confirm",
};
export type StatusPickerLabels = typeof statusPickerLabels;

export interface StatusPickerProps {
  statuses: StatusDef[];
  value?: string | null;
  defaultValue?: string | null;
  /** Return a promise for an optimistic save: the badge switches at once, shows a spinner and reverts if it rejects. */
  onValueChange?: (value: string, previous: string | null, meta: { note?: string }) => void | Promise<unknown>;
  /** Allowed next statuses per status. Others stay visible but disabled with the reason. */
  transitions?: Record<string, string[]>;
  /** Ask before moving to `next` (return `false` to skip). */
  confirm?: (next: StatusDef, current: StatusDef | null) => false | StatusConfirm;
  /** Called after an async save failed and the value reverted (show a toast). */
  onError?: (error: unknown, attempted: StatusDef) => void;
  /** `"badge"` (inline in tables, record headers) or `"field"` (forms). Default `"badge"`. */
  trigger?: "badge" | "field";
  /** Group options under category headings. Default `true` when there are more than 5 statuses. */
  groupByCategory?: boolean;
  /** Hidden native select for form posts. */
  name?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  /** Shows the badge, can't be changed. */
  readOnly?: boolean;
  /** External busy state (a save you run yourself). */
  loading?: boolean;
  /** What is being set, for the accessible name ("Stage: Proposal. Change"). Default "Status". */
  fieldLabel?: string;
  labels?: Partial<StatusPickerLabels>;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
}

const CATEGORY_TONE: Record<StatusCategory, StatusTone> = { todo: "neutral", active: "info", done: "success", cancelled: "neutral" };
const CATEGORY_ORDER: StatusCategory[] = ["todo", "active", "done", "cancelled"];

/** Default category icons — shape, not only colour, carries the meaning. */
export function StatusIcon({ category, className }: { category: StatusCategory; className?: string }) {
  const cls = cn("size-3.5 shrink-0", className);
  switch (category) {
    case "todo":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false" className={cls} data-category="todo">
          <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.6 2.1" />
        </svg>
      );
    case "active":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false" className={cls} data-category="active">
          <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 4.25a3.75 3.75 0 0 1 0 7.5z" fill="currentColor" />
        </svg>
      );
    case "done":
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false" className={cls} data-category="done">
          <circle cx="8" cy="8" r="6.5" fill="currentColor" />
          <path d="M5.2 8.2 7.1 10l3.7-4" stroke="var(--surface-solid, #fff)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" fill="none" aria-hidden focusable="false" className={cls} data-category="cancelled">
          <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.6" />
          <path d="m5.6 10.4 4.8-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
  }
}

type BadgeTone = StatusTone | "outline" | "custom";
/** Badge tone of a status. Passed into the single `badgeVariants` call so the neutral default never overrides it. */
function toneStyle(s: StatusDef | undefined): { tone: BadgeTone; style?: React.CSSProperties } {
  if (!s) return { tone: "outline" };
  if (s.color) return { tone: "custom", style: { ["--tone" as string]: s.color } };
  return { tone: s.tone ?? CATEGORY_TONE[s.category] };
}

const TONE_COLOR: Record<StatusTone, string> = {
  neutral: "var(--fg-muted)",
  accent: "var(--accent-ink)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  info: "var(--info)",
};
/** The ink colour of a status (icon in field triggers and menus). */
function toneColor(s: StatusDef): string {
  return s.color ?? TONE_COLOR[s.tone ?? CATEGORY_TONE[s.category]];
}

/** A status rendered as a badge (no picker) — table cells, read-only views, activity entries. */
export function StatusBadge({ status, size = "md", className }: { status: StatusDef; size?: "sm" | "md"; className?: string }) {
  const tone = toneStyle(status);
  return (
    <span
      data-slot="status-badge"
      data-category={status.category}
      className={cn(badgeVariants({ size: size === "sm" ? "sm" : "md", tone: tone.tone }), "gap-1.5", status.category === "cancelled" && "text-fg-muted", className)}
      style={tone.style}
    >
      {status.icon ?? <StatusIcon category={status.category} />}
      {status.label}
    </span>
  );
}

/**
 * Change a record's status inside a workflow: task To do → In progress → Done, deal stages,
 * content Draft → Review → Published, leave Pending → Approved / Rejected. The trigger is the
 * status badge itself; transitions not allowed from the current status stay visible with the
 * reason; a transition can ask for confirmation (and a note); async saves are optimistic and revert.
 *
 * ```tsx
 * <StatusPicker statuses={taskStatuses} value={task.status} onValueChange={(v) => save({ status: v })} />
 * <StatusPicker statuses={leave} transitions={{ pending: ["approved", "rejected"] }}
 *   confirm={(s) => s.value === "rejected" && { title: "Reject request?", requireNote: true, tone: "danger" }} />
 * ```
 */
export const StatusPicker = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, StatusPickerProps>(function StatusPicker(
  {
    statuses,
    value: valueProp,
    defaultValue,
    onValueChange,
    transitions,
    confirm,
    onError,
    trigger = "badge",
    groupByCategory,
    name,
    size = "md",
    disabled: disabledProp,
    readOnly: readOnlyProp,
    loading,
    fieldLabel,
    labels,
    className,
    ...rest
  },
  ref,
) {
  const t = useLabels("statusPicker", statusPickerLabels, labels);
  const control = useFieldControl({
    id: rest.id,
    name,
    disabled: disabledProp,
    readOnly: readOnlyProp,
    "aria-describedby": rest["aria-describedby"],
    "aria-labelledby": rest["aria-labelledby"],
    "aria-invalid": rest["aria-invalid"],
  });
  const container = usePortalContainer();
  const [committed, setCommitted] = useControllableState<string | null>({ value: valueProp, defaultValue: defaultValue ?? null, name: "StatusPicker" });
  const [optimistic, setOptimistic] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");
  const [pendingConfirm, setPendingConfirm] = React.useState<{ next: StatusDef; config: StatusConfirm } | null>(null);
  const [note, setNote] = React.useState("");
  const onChangeRef = useLatest(onValueChange);
  const noteId = React.useId();

  const shown = optimistic ?? committed;
  const byValue = React.useMemo(() => new Map(statuses.map((s) => [s.value, s])), [statuses]);
  const current = shown ? byValue.get(shown) : undefined;
  const committedDef = committed ? byValue.get(committed) : undefined;
  const allowed = committed && transitions ? new Set([committed, ...(transitions[committed] ?? [])]) : null;
  const disabled = Boolean(control.disabled);
  const readOnly = Boolean(control.readOnly);
  const busy = saving || Boolean(loading);
  const grouped = groupByCategory ?? statuses.length > 5;

  const commit = async (next: StatusDef, meta: { note?: string }) => {
    const prev = committed;
    const result = onChangeRef.current?.(next.value, prev, meta);
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setOptimistic(next.value);
      setSaving(true);
      try {
        await result;
        setCommitted(next.value);
        setAnnounce(t("saved", { status: next.label }));
      } catch (err) {
        setAnnounce(t("failed", { status: committedDef?.label ?? t("placeholder") }));
        onError?.(err, next);
      } finally {
        setOptimistic(null);
        setSaving(false);
      }
    } else {
      setCommitted(next.value);
      setAnnounce(t("saved", { status: next.label }));
    }
  };

  const handleChange = (v: string) => {
    const next = byValue.get(v);
    if (!next || v === committed) return;
    const config = confirm?.(next, committedDef ?? null);
    if (config) {
      setNote("");
      setPendingConfirm({ next, config });
      return;
    }
    void commit(next, {});
  };

  const label = fieldLabel ?? t("status");
  const accessibleName =
    rest["aria-label"] ?? (control["aria-labelledby"] ? undefined : t("change", { label, status: current?.label ?? t("placeholder") }));
  const tone = toneStyle(current);

  const triggerClass =
    trigger === "field"
      ? cn(controlVariants({ size: size === "sm" ? "sm" : "md" }), "justify-start text-start", className)
      : cn(
          badgeVariants({ size: size === "sm" ? "sm" : "md", tone: tone.tone }),
          "gap-1.5 pe-1.5 outline-none transition-[filter,box-shadow] focus-ring",
          !readOnly && !disabled && "cursor-pointer hover:brightness-95",
          current?.category === "cancelled" && "text-fg-muted",
          disabled && "opacity-50",
          className,
        );

  const triggerInner = (
    <>
      {busy ? (
        <Spinner size="xs" className={trigger === "field" ? "text-fg-muted" : undefined} />
      ) : current ? (
        <span className="inline-flex" style={trigger === "field" ? { color: toneColor(current) } : undefined}>
          {current.icon ?? <StatusIcon category={current.category} />}
        </span>
      ) : null}
      <span className={cn("truncate", trigger === "field" && "flex-1", !current && "text-fg-subtle")}>{current?.label ?? t("placeholder")}</span>
      {busy ? <span className="sr-only">{t("saving")}</span> : null}
      {!readOnly ? <ChevronDown aria-hidden className={cn("shrink-0 opacity-60", trigger === "field" ? "ms-auto size-4" : "size-3")} /> : null}
    </>
  );

  if (readOnly) {
    return current ? (
      <StatusBadge status={current} size={size} className={className} />
    ) : (
      <span className={cn(badgeVariants({ tone: "outline", size: size === "sm" ? "sm" : "md" }), className)}>{t("placeholder")}</span>
    );
  }

  const groups = grouped
    ? CATEGORY_ORDER.map((c) => ({ category: c, items: statuses.filter((s) => s.category === c) })).filter((g) => g.items.length)
    : [{ category: null as StatusCategory | null, items: statuses }];

  const renderItem = (s: StatusDef) => {
    const notAllowed = allowed ? !allowed.has(s.value) : false;
    const reasonId = `${noteId}-${s.value}`;
    return (
      <SelectPrimitive.Item
        key={s.value}
        value={s.value}
        disabled={notAllowed}
        aria-describedby={notAllowed ? reasonId : undefined}
        className={cn(itemVariants({ size: "md", inset: true }), "items-start py-2")}
      >
        <span className={cn(itemSlots.indicator, "top-2.5")}>
          <SelectPrimitive.ItemIndicator>
            <Check className="size-3.5" strokeWidth={2.5} />
          </SelectPrimitive.ItemIndicator>
        </span>
        <span aria-hidden className="mt-0.5 inline-flex [&_svg]:size-4" style={{ color: toneColor(s) }}>
          {s.icon ?? <StatusIcon category={s.category} className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <SelectPrimitive.ItemText>{s.label}</SelectPrimitive.ItemText>
          {notAllowed ? (
            <span id={reasonId} className={itemSlots.description}>
              {t("notAllowed", { status: committedDef?.label ?? "" })}
            </span>
          ) : s.description ? (
            <span className={itemSlots.description}>{s.description}</span>
          ) : null}
        </span>
      </SelectPrimitive.Item>
    );
  };

  return (
    <>
      <SelectPrimitive.Root value={shown ?? ""} onValueChange={handleChange} disabled={disabled || busy} name={control.name}>
        <SelectPrimitive.Trigger
          ref={ref}
          id={control.id}
          data-slot="status-picker"
          data-trigger={trigger}
          data-category={current?.category}
          aria-label={accessibleName}
          aria-labelledby={control["aria-labelledby"]}
          aria-describedby={control["aria-describedby"]}
          aria-invalid={control["aria-invalid"]}
          aria-busy={busy || undefined}
          className={triggerClass}
          style={trigger === "badge" ? tone.style : undefined}
        >
          {triggerInner}
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal container={container}>
          <Layer asChild>
            <SelectPrimitive.Content
              position="popper"
              sideOffset={6}
              collisionPadding={12}
              align="start"
              data-slot="status-picker-content"
              className="surface-popover ui-pop z-(--z-popover) max-h-(--radix-select-content-available-height) min-w-56 overflow-hidden rounded-ui-lg"
            >
              <SelectPrimitive.Viewport className="p-1">
                {groups.map((g, i) =>
                  g.category ? (
                    <SelectPrimitive.Group key={g.category}>
                      {i > 0 ? <SelectPrimitive.Separator className={itemSlots.separator} /> : null}
                      <SelectPrimitive.Label className={itemSlots.groupLabel}>{t(g.category)}</SelectPrimitive.Label>
                      {g.items.map(renderItem)}
                    </SelectPrimitive.Group>
                  ) : (
                    <React.Fragment key="all">{g.items.map(renderItem)}</React.Fragment>
                  ),
                )}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </Layer>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      <span role="status" aria-live="polite" className="sr-only">
        {announce}
      </span>
      <AlertDialog open={pendingConfirm !== null} onOpenChange={(o) => !o && setPendingConfirm(null)}>
        {pendingConfirm ? (
          <AlertDialogContent tone={pendingConfirm.config.tone ?? "default"}>
            <AlertDialogHeader title={pendingConfirm.config.title} description={pendingConfirm.config.description} />
            {pendingConfirm.config.requireNote ? (
              <AlertDialogBody className="grid gap-1.5">
                <label htmlFor={`${noteId}-note`} className="text-[13px] font-medium text-fg">
                  {pendingConfirm.config.noteLabel ?? t("note")}
                </label>
                <Textarea id={`${noteId}-note`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notePlaceholder")} required aria-required />
              </AlertDialogBody>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel />
              <AlertDialogAction
                disabled={Boolean(pendingConfirm.config.requireNote) && note.trim() === ""}
                onClick={() => {
                  const p = pendingConfirm;
                  setPendingConfirm(null);
                  void commit(p.next, { note: p.config.requireNote ? note.trim() : undefined });
                }}
              >
                {pendingConfirm.config.confirmLabel ?? t("confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </>
  );
});

"use client";

import * as React from "react";
import { Check, X, RotateCcw, Minus, Clock, Forward, CornerDownRight, GitBranch } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useLocale } from "../lib/locale";
import { Avatar } from "../components/avatar";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { Textarea, Field } from "../components/input";
import { Select } from "../components/select";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "../components/dialog";

export const approvalFlowLabels = {
  label: "Approval flow",
  waiting: "Waiting",
  active: "In review",
  approved: "Approved",
  rejected: "Rejected",
  changes_requested: "Changes requested",
  skipped: "Skipped",
  withdrawn: "Withdrawn",
  modeAll: "{count, plural, one {# approver} other {All of # approvers}}",
  modeAny: "{count, plural, one {# approver} other {Any one of # approvers}}",
  parallel: "In parallel",
  condition: "Only when {condition}",
  due: "Due {relative}",
  overdue: "Overdue · due {relative}",
  pending: "Pending",
  decidedApproved: "approved",
  decidedRejected: "rejected",
  decidedChanges: "requested changes",
  decisionAt: "{name} {decision} on {date}",
  delegatedFrom: "on behalf of {name}",
  delegated: "Delegated",
  submittedBy: "Submitted by {name}",
  summary: "{done} of {total} approved",
  summaryCurrent: "Now: {stage}",
  // actions
  approve: "Approve",
  reject: "Reject",
  requestChanges: "Request changes",
  delegate: "Delegate",
  note: "Note",
  noteOptional: "Add a note for the requester (optional).",
  noteRequired: "Tell the requester why.",
  noteMissing: "A note is required.",
  delegateTo: "Delegate to",
  delegateHint: "They decide for you on this request.",
  confirmApprove: "Approve request",
  confirmReject: "Reject request",
  confirmChanges: "Send back for changes",
  confirmDelegate: "Delegate request",
  cancel: "Cancel",
  doneApprove: "Approved",
  doneReject: "Rejected",
  doneChanges: "Sent back for changes",
  doneDelegate: "Delegated to {name}",
  failed: "That didn't go through",
  cantAct: "You can't act on this request.",
};
export type ApprovalFlowLabels = typeof approvalFlowLabels;

export type ApprovalDecisionValue = "approved" | "rejected" | "changes_requested";
export type ApprovalStageStatus = "waiting" | "active" | "approved" | "rejected" | "changes_requested" | "skipped" | "withdrawn";

export interface ApprovalDecision {
  value: ApprovalDecisionValue;
  /** UTC ISO instant. */
  at: string;
  /** The approver's comment. */
  note?: string;
  delegatedFrom?: { id: string; name: string };
}

export interface ApprovalApprover {
  id: string;
  name: string;
  avatarUrl?: string;
  /** "Finance", "Line manager". */
  role?: string;
  decision?: ApprovalDecision;
}

export interface ApprovalStageData {
  id: string;
  title: string;
  /** `"all"`: every approver must approve. `"any"`: one approval is enough. */
  mode: "all" | "any";
  /** Display text of the rule that added this stage ("Amount > $10,000"). */
  condition?: string;
  approvers: ApprovalApprover[];
  status: ApprovalStageStatus;
  /** SLA deadline (UTC ISO instant). */
  dueAt?: string;
  /** Consecutive stages with the same group run in parallel. */
  parallelGroup?: string;
}

const tone: Record<ApprovalStageStatus, "success" | "danger" | "warning" | "accent" | "neutral" | "outline"> = {
  waiting: "outline",
  active: "accent",
  approved: "success",
  rejected: "danger",
  changes_requested: "warning",
  skipped: "neutral",
  withdrawn: "neutral",
};

function StageIndicator({ status, size = "md" }: { status: ApprovalStageStatus; size?: "sm" | "md" }) {
  const icon =
    status === "approved" ? <Check strokeWidth={3} /> : status === "rejected" ? <X strokeWidth={3} /> : status === "changes_requested" ? <RotateCcw strokeWidth={2.5} /> : status === "skipped" || status === "withdrawn" ? <Minus strokeWidth={2.5} /> : null;
  return (
    <span
      aria-hidden
      data-slot="approval-indicator"
      data-status={status}
      className={cn(
        "vui-approval-dot relative inline-flex shrink-0 items-center justify-center rounded-full",
        size === "sm" ? "size-2.5" : "size-7 [&_svg]:size-3.5",
        status === "approved" && "tone-success bg-(--tone) text-scene",
        status === "rejected" && "tone-danger bg-(--tone) text-scene",
        status === "changes_requested" && "tone-warning bg-(--tone) text-scene",
        status === "active" && "bg-surface shadow-[0_0_0_1.5px_var(--accent-ink),0_0_0_5px_var(--accent-soft)]",
        status === "waiting" && "bg-surface shadow-[inset_0_0_0_1.5px_var(--track)]",
        (status === "skipped" || status === "withdrawn") && "border-[1.5px] border-dashed border-field-border bg-surface text-fg-subtle",
        size === "sm" && status === "waiting" && "bg-track shadow-none",
        size === "sm" && status === "active" && "bg-accent-ink shadow-none",
      )}
    >
      {size === "md" ? icon : null}
      {size === "md" && status === "active" ? <span className="size-2 rounded-full bg-accent-ink" /> : null}
    </span>
  );
}

function decisionWord(t: LabelFn<ApprovalFlowLabels>, v: ApprovalDecisionValue) {
  return v === "approved" ? t("decidedApproved") : v === "rejected" ? t("decidedRejected") : t("decidedChanges");
}

/* ------------------------------------------------------------------ */
/* Flow                                                                */
/* ------------------------------------------------------------------ */

export interface ApprovalFlowProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "children"> {
  stages: ApprovalStageData[];
  /** First node: who submitted and when. */
  requester?: { name: string; avatarUrl?: string; at: string; note?: string };
  orientation?: "vertical" | "horizontal";
  /** `"compact"` = dots + "2 of 3 approved" (list rows). Same as `<ApprovalSummary>`. */
  variant?: "full" | "compact";
  /** Reference time for SLA. Default: now. */
  now?: string | number;
  labels?: Partial<ApprovalFlowLabels>;
}

type Group = { key: string; parallel: boolean; stages: ApprovalStageData[] };

function groupStages(stages: ApprovalStageData[]): Group[] {
  const out: Group[] = [];
  for (const s of stages) {
    const last = out[out.length - 1];
    if (s.parallelGroup && last?.parallel && last.key === s.parallelGroup) last.stages.push(s);
    else out.push({ key: s.parallelGroup ?? s.id, parallel: !!s.parallelGroup, stages: [s] });
  }
  return out;
}

function groupStatus(g: Group): ApprovalStageStatus {
  const st = g.stages.map((s) => s.status);
  if (st.includes("rejected")) return "rejected";
  if (st.includes("changes_requested")) return "changes_requested";
  if (st.includes("active")) return "active";
  if (st.every((s) => s === "approved" || s === "skipped")) return st.every((s) => s === "skipped") ? "skipped" : "approved";
  if (st.every((s) => s === "withdrawn")) return "withdrawn";
  return "waiting";
}

/**
 * A multi-stage approval: sequential and parallel stages ("all of" / "any of"), approvers with
 * decisions, timestamps and notes, conditions, SLA and delegation. Renders a flow the server
 * defines; acting on it is `<ApprovalActions>`.
 *
 * ```tsx
 * <ApprovalFlow requester={{ name: "Deniz Aydın", at: "2026-11-03T09:12:00Z" }} stages={stages} />
 * ```
 */
export const ApprovalFlow = React.forwardRef<HTMLOListElement, ApprovalFlowProps>(function ApprovalFlow(
  { stages, requester, orientation = "vertical", variant = "full", now, labels, className, ...props },
  ref,
) {
  const t = useLabels("approvalFlow", approvalFlowLabels, labels);
  if (variant === "compact") return <ApprovalSummary stages={stages} labels={labels} className={className} />;
  const groups = groupStages(stages);
  const horizontal = orientation === "horizontal";
  return (
    <ol
      ref={ref}
      aria-label={props["aria-label"] ?? t("label")}
      data-slot="approval-flow"
      data-orientation={orientation}
      className={cn("vui-approval m-0 list-none p-0", horizontal ? "flex gap-0 overflow-x-auto pb-1" : "flex flex-col", className)}
      {...props}
    >
      {requester ? <RequesterNode requester={requester} t={t} horizontal={horizontal} /> : null}
      {groups.map((g, gi) => {
        const last = gi === groups.length - 1;
        const status = groupStatus(g);
        if (!g.parallel) {
          return (
            <ApprovalStage key={g.key} stage={g.stages[0]!} last={last} horizontal={horizontal} now={now} t={t} />
          );
        }
        return (
          <li
            key={g.key}
            data-slot="approval-parallel"
            data-status={status}
            className={cn("vui-approval-node relative", horizontal ? "min-w-[22rem] flex-1 pe-6" : "grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 pb-7 last:pb-0")}
          >
            <Rail status={status} last={last} horizontal={horizontal} icon={<GitBranch className="size-3.5" />} />
            <div className="min-w-0">
              <p className="mb-2.5 flex items-center gap-2 pt-1 font-mono text-[11px] tracking-[0.06em] text-fg-subtle uppercase">{t("parallel")}</p>
              <ol className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2" aria-label={t("parallel")}>
                {g.stages.map((s) => (
                  <li key={s.id} className="min-w-0 rounded-ui-lg border border-line bg-surface-2/60 p-3.5" data-status={s.status}>
                    <StageBody stage={s} now={now} t={t} nested />
                  </li>
                ))}
              </ol>
            </div>
          </li>
        );
      })}
    </ol>
  );
});

function Rail({ status, last, horizontal, icon }: { status: ApprovalStageStatus; last: boolean; horizontal: boolean; icon?: React.ReactNode }) {
  const done = status === "approved" || status === "skipped";
  return (
    <div aria-hidden className={cn("relative flex", horizontal ? "mb-3 items-center" : "flex-col items-center")}>
      {icon && status !== "approved" && status !== "rejected" && status !== "changes_requested" ? (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-surface text-fg-muted shadow-[inset_0_0_0_1.5px_var(--track)]">{icon}</span>
      ) : (
        <StageIndicator status={status} />
      )}
      {!last ? (
        <span
          className={cn(
            "vui-approval-line",
            horizontal ? "mx-2 h-px flex-1" : "mt-1.5 w-px flex-1",
            done ? "bg-[color-mix(in_srgb,var(--success)_55%,var(--line))]" : "bg-line",
          )}
        />
      ) : null}
    </div>
  );
}

function RequesterNode({ requester, t, horizontal }: { requester: NonNullable<ApprovalFlowProps["requester"]>; t: LabelFn<ApprovalFlowLabels>; horizontal: boolean }) {
  const { format } = useLocale();
  return (
    <li className={cn("vui-approval-node relative", horizontal ? "min-w-[14rem] flex-1 pe-6" : "grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 pb-7")}>
      <div aria-hidden className={cn("relative flex", horizontal ? "mb-3 items-center" : "flex-col items-center")}>
        <Avatar name={requester.name} src={requester.avatarUrl} size="sm" className="size-7" />
        <span className={cn(horizontal ? "mx-2 h-px flex-1" : "mt-1.5 w-px flex-1", "bg-[color-mix(in_srgb,var(--success)_55%,var(--line))]")} />
      </div>
      <div className="min-w-0 pt-1">
        <p className="text-sm font-medium text-fg">{t("submittedBy", { name: requester.name })}</p>
        <p className="mt-0.5 text-xs text-fg-subtle tabular">
          <time dateTime={requester.at}>{format.dateTime(requester.at, { dateStyle: "medium", timeStyle: "short" })}</time>
        </p>
        {requester.note ? <blockquote className="mt-2 border-s-2 border-line ps-3 text-sm text-fg-muted">{requester.note}</blockquote> : null}
      </div>
    </li>
  );
}

export interface ApprovalStageProps {
  stage: ApprovalStageData;
  last?: boolean;
  horizontal?: boolean;
  now?: string | number;
  t: LabelFn<ApprovalFlowLabels>;
}

/** One stage node (rail + body). Rendered by `ApprovalFlow`; exported for custom layouts. */
export function ApprovalStage({ stage, last = false, horizontal = false, now, t }: ApprovalStageProps) {
  return (
    <li
      data-slot="approval-stage"
      data-status={stage.status}
      className={cn("vui-approval-node relative", horizontal ? "min-w-[16rem] flex-1 pe-6" : "grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 pb-7 last:pb-0")}
    >
      <Rail status={stage.status} last={last} horizontal={horizontal} />
      <div className="min-w-0 pt-0.5">
        <StageBody stage={stage} now={now} t={t} />
      </div>
    </li>
  );
}

function StageBody({ stage, now, t, nested }: { stage: ApprovalStageData; now?: string | number; t: LabelFn<ApprovalFlowLabels>; nested?: boolean }) {
  const { format } = useLocale();
  const ref = now ?? Date.now();
  const count = stage.approvers.length;
  const due = stage.dueAt ? new Date(stage.dueAt).getTime() : null;
  const overdue = due !== null && stage.status === "active" && due < new Date(ref).getTime();
  const muted = stage.status === "skipped" || stage.status === "withdrawn" || stage.status === "waiting";
  return (
    <div className={cn(muted && "text-fg-muted")}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {nested ? <StageIndicator status={stage.status} size="sm" /> : null}
        <h3 className={cn("text-sm font-semibold", muted ? "text-fg-muted" : "text-fg")}>{stage.title}</h3>
        <Badge tone={tone[stage.status]} size="sm">
          {t(stage.status)}
        </Badge>
      </div>
      <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-fg-muted">
        <span>{t(stage.mode === "all" ? "modeAll" : "modeAny", { count })}</span>
        {stage.condition ? (
          <span className="inline-flex items-center gap-1 rounded-ui-sm bg-selected px-1.5 py-0.5 font-mono text-[11px] text-fg-muted">
            <CornerDownRight aria-hidden className="size-3" />
            {t("condition", { condition: stage.condition })}
          </span>
        ) : null}
        {due !== null && (stage.status === "active" || stage.status === "waiting") ? (
          <span className={cn("inline-flex items-center gap-1 tabular", overdue && "tone-warning rounded-ui-sm px-1.5 py-0.5 tone-soft font-medium")}>
            <Clock aria-hidden className="size-3" />
            {t(overdue ? "overdue" : "due", { relative: format.relative(stage.dueAt!, { now: ref }) })}
          </span>
        ) : null}
      </p>
      {count ? (
        <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0" data-slot="approval-approvers">
          {stage.approvers.map((a) => (
            <ApproverRow key={a.id} approver={a} t={t} stageActive={stage.status === "active"} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ApproverRow({ approver: a, t, stageActive }: { approver: ApprovalApprover; t: LabelFn<ApprovalFlowLabels>; stageActive: boolean }) {
  const { format } = useLocale();
  const d = a.decision;
  const decisionTone = d ? (d.value === "approved" ? "text-success" : d.value === "rejected" ? "text-danger" : "text-warning") : "text-fg-subtle";
  return (
    <li className="flex min-w-0 gap-2.5" data-slot="approval-approver" data-decision={d?.value}>
      <Avatar name={a.name} src={a.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1 text-[13px] leading-snug">
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <span className="font-medium text-fg">{a.name}</span>
          {a.role ? <span className="text-xs text-fg-subtle">{a.role}</span> : null}
          {d?.delegatedFrom ? (
            <Badge tone="info" size="sm">
              <Forward /> {t("delegated")}
            </Badge>
          ) : null}
        </p>
        {d ? (
          <p className="mt-0.5 text-xs text-fg-muted">
            <span className={cn("font-medium", decisionTone)}>{decisionWord(t, d.value)}</span>{" "}
            <time dateTime={d.at} className="tabular">
              {format.dateTime(d.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </time>
            {d.delegatedFrom ? <> · {t("delegatedFrom", { name: d.delegatedFrom.name })}</> : null}
          </p>
        ) : (
          <p className="mt-0.5 text-xs text-fg-subtle">{stageActive ? t("pending") : "—"}</p>
        )}
        {d?.note ? (
          <blockquote className="mt-1.5 rounded-ui-sm border-s-2 border-(--q) bg-surface-2 px-2.5 py-1.5 text-[13px] text-fg [--q:var(--line)] data-[v=rejected]:[--q:var(--danger)] data-[v=changes_requested]:[--q:var(--warning)]" data-v={d.value}>
            {d.note}
          </blockquote>
        ) : null}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Summary (compact)                                                   */
/* ------------------------------------------------------------------ */

export interface ApprovalSummaryProps extends React.HTMLAttributes<HTMLSpanElement> {
  stages: ApprovalStageData[];
  /** Show "Now: {stage}". Default `true`. */
  showCurrent?: boolean;
  labels?: Partial<ApprovalFlowLabels>;
}

/** Inline status for table rows: one dot per stage + "2 of 3 approved". */
export const ApprovalSummary = React.forwardRef<HTMLSpanElement, ApprovalSummaryProps>(function ApprovalSummary(
  { stages, showCurrent = true, labels, className, ...props },
  ref,
) {
  const t = useLabels("approvalFlow", approvalFlowLabels, labels);
  const counted = stages.filter((s) => s.status !== "skipped");
  const done = counted.filter((s) => s.status === "approved").length;
  const final = stages.find((s) => s.status === "rejected" || s.status === "changes_requested");
  const current = stages.find((s) => s.status === "active");
  return (
    <span ref={ref} data-slot="approval-summary" className={cn("inline-flex min-w-0 items-center gap-2 text-xs", className)} {...props}>
      <span aria-hidden className="inline-flex items-center gap-1">
        {stages.map((s) => (
          <StageIndicator key={s.id} status={s.status} size="sm" />
        ))}
      </span>
      <span className="truncate text-fg-muted tabular">
        {final ? <span className={final.status === "rejected" ? "text-danger" : "text-warning"}>{t(final.status)}</span> : t("summary", { done, total: counted.length })}
        {showCurrent && current && !final ? <span className="text-fg-subtle"> · {t("summaryCurrent", { stage: current.title })}</span> : null}
      </span>
    </span>
  );
});

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

type ActionKind = "approve" | "reject" | "changes" | "delegate";

export interface ApprovalActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The viewer is a current approver. When `false` the bar explains that instead. */
  canAct: boolean;
  onApprove: (note?: string) => Promise<void> | void;
  onReject: (note: string) => Promise<void> | void;
  onRequestChanges?: (note: string) => Promise<void> | void;
  onDelegate?: (to: { id: string; name: string }, note?: string) => Promise<void> | void;
  /** People the decision can be delegated to. */
  delegates?: { id: string; name: string }[];
  /** Actions that need a note. Default `["reject", "changes"]`. */
  requireNoteOn?: ("approve" | "reject" | "changes")[];
  /** Text shown when `canAct` is false. */
  cantActReason?: string;
  size?: "sm" | "md";
  labels?: Partial<ApprovalFlowLabels>;
}

/** Approve · Request changes · Reject · Delegate, each confirmed in a dialog with a note. Results are announced. */
export function ApprovalActions({
  canAct,
  onApprove,
  onReject,
  onRequestChanges,
  onDelegate,
  delegates,
  requireNoteOn = ["reject", "changes"],
  cantActReason,
  size = "md",
  labels,
  className,
  ...props
}: ApprovalActionsProps) {
  const t = useLabels("approvalFlow", approvalFlowLabels, labels);
  const [open, setOpen] = React.useState<ActionKind | null>(null);
  const [note, setNote] = React.useState("");
  const [to, setTo] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [touched, setTouched] = React.useState(false);
  const [announce, setAnnounce] = React.useState("");

  if (!canAct) {
    return (
      <p data-slot="approval-actions" data-readonly="" className={cn("text-sm text-fg-subtle", className)}>
        {cantActReason ?? t("cantAct")}
      </p>
    );
  }

  const needsNote = open === "approve" ? requireNoteOn.includes("approve") : open === "reject" ? requireNoteOn.includes("reject") : open === "changes" ? requireNoteOn.includes("changes") : false;
  const start = (k: ActionKind) => {
    setOpen(k);
    setNote("");
    setTo(null);
    setError(null);
    setTouched(false);
  };
  const confirm = async () => {
    setTouched(true);
    if (needsNote && !note.trim()) return;
    if (open === "delegate" && !to) return;
    setBusy(true);
    setError(null);
    try {
      const n = note.trim() || undefined;
      if (open === "approve") await onApprove(n);
      else if (open === "reject") await onReject(n ?? "");
      else if (open === "changes") await onRequestChanges?.(n ?? "");
      else if (open === "delegate") {
        const d = delegates?.find((x) => x.id === to);
        if (d) await onDelegate?.(d, n);
      }
      const d = delegates?.find((x) => x.id === to);
      setAnnounce(open === "approve" ? t("doneApprove") : open === "reject" ? t("doneReject") : open === "changes" ? t("doneChanges") : t("doneDelegate", { name: d?.name ?? "" }));
      setOpen(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  const title = open === "approve" ? t("confirmApprove") : open === "reject" ? t("confirmReject") : open === "changes" ? t("confirmChanges") : t("confirmDelegate");
  const btn = size === "sm" ? "sm" : "md";
  const noteError = touched && needsNote && !note.trim() ? t("noteMissing") : undefined;

  return (
    <div data-slot="approval-actions" className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      <Button variant="primary" size={btn} onClick={() => start("approve")}>
        <Check /> {t("approve")}
      </Button>
      {onRequestChanges ? (
        <Button variant="secondary" size={btn} onClick={() => start("changes")}>
          <RotateCcw /> {t("requestChanges")}
        </Button>
      ) : null}
      <Button variant="danger-ghost" size={btn} onClick={() => start("reject")}>
        <X /> {t("reject")}
      </Button>
      {onDelegate && delegates?.length ? (
        <Button variant="ghost" size={btn} onClick={() => start("delegate")}>
          <Forward /> {t("delegate")}
        </Button>
      ) : null}
      <span className="sr-only" aria-live="polite" aria-atomic>
        {announce}
      </span>

      <Dialog open={open !== null} onOpenChange={(o) => !o && !busy && setOpen(null)}>
        <DialogContent size="sm" dismissible={!busy}>
          <DialogHeader title={title} />
          <DialogBody className="flex flex-col gap-4">
            {error ? (
              <Alert tone="danger" title={t("failed")} live="assertive">
                {error}
              </Alert>
            ) : null}
            {open === "delegate" ? (
              <Field label={t("delegateTo")} hint={t("delegateHint")} required error={touched && !to ? t("delegateTo") : undefined}>
                <Select value={to} onValueChange={setTo} items={(delegates ?? []).map((d) => ({ value: d.id, label: d.name }))} />
              </Field>
            ) : null}
            <Field label={t("note")} hint={needsNote ? t("noteRequired") : t("noteOptional")} required={needsNote} error={noteError}>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} data-autofocus={open !== "delegate" ? "" : undefined} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(null)} disabled={busy}>
              {t("cancel")}
            </Button>
            <Button variant={open === "reject" ? "danger" : "primary"} onClick={() => void confirm()} loading={busy}>
              {title}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

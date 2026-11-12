"use client";

import * as React from "react";
import { BellRing, Check, Clock3, Eye, Send, X } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Avatar } from "../components/avatar";
import { Button } from "../components/button";

export type SignerState = "waiting" | "sent" | "viewed" | "signed" | "declined";

export interface Signer {
  id: string;
  name: string;
  email?: string;
  /** "Client", "Account manager", "Witness". */
  role?: string;
  status: SignerState;
  /** When the current status happened (ISO date-time). */
  at?: string;
  /** Decline reason or a note. */
  note?: React.ReactNode;
  /** Avatar image. */
  avatarSrc?: string;
}

export const signerStatusLabels = {
  title: "Signatures",
  summary: "{signed} of {total} signed",
  declinedSummary: "Declined by {name}",
  complete: "Fully signed",
  waiting: "Waiting",
  sent: "Sent",
  viewed: "Viewed",
  signed: "Signed",
  declined: "Declined",
  remind: "Remind",
  remindName: "Send a reminder to {name}",
  reminded: "Reminder sent",
  order: "Signs {position}",
};
export type SignerStatusLabels = typeof signerStatusLabels;

export interface SignerStatusProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  signers: Signer[];
  /** Signers sign in list order — numbers the rows and draws the chain. */
  sequential?: boolean;
  /** Heading. Default "Signatures"; `null` hides the header row. */
  title?: React.ReactNode;
  /** Shows "Remind" on sent / viewed rows. Resolve to show "Reminder sent". */
  onRemind?: (signer: Signer) => void | Promise<void>;
  /** Fixed reference time for relative dates (epoch ms) — tests, screenshots. */
  now?: number;
  labels?: Partial<SignerStatusLabels>;
}

const stateIcon: Record<SignerState, React.ComponentType<{ className?: string }>> = {
  waiting: Clock3,
  sent: Send,
  viewed: Eye,
  signed: Check,
  declined: X,
};

const stateTone: Record<SignerState, string> = {
  waiting: "text-fg-subtle",
  sent: "tone-info tone-soft",
  viewed: "tone-warning tone-soft",
  signed: "tone-success tone-soft",
  declined: "tone-danger tone-soft",
};

/**
 * E-signature progress for a quote, contract or offer letter: who signs, in which order,
 * where each person is (sent, viewed, signed, declined) and when — with a reminder action.
 *
 * ```tsx
 * <SignerStatus sequential signers={contract.signers} onRemind={(s) => api.remind(s.id)} />
 * ```
 */
export const SignerStatus = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SignerStatusProps>(function SignerStatus(
  { signers, sequential, title, onRemind, now, labels, className, ...props },
  ref,
) {
  const t = useLabels("signerStatus", signerStatusLabels, labels);
  const f = useFormat();
  const titleId = React.useId();
  const [reminded, setReminded] = React.useState<Record<string, "busy" | "done">>({});
  const signed = signers.filter((s) => s.status === "signed").length;
  const declined = signers.find((s) => s.status === "declined");
  const total = signers.length;
  const heading = title === undefined ? t("title") : title;
  const summary = declined ? t("declinedSummary", { name: declined.name }) : signed === total && total > 0 ? t("complete") : t("summary", { signed: f.number(signed), total: f.number(total) });

  const remind = async (s: Signer) => {
    if (!onRemind) return;
    setReminded((r) => ({ ...r, [s.id]: "busy" }));
    try {
      await onRemind(s);
      setReminded((r) => ({ ...r, [s.id]: "done" }));
    } catch {
      setReminded(({ [s.id]: _drop, ...rest }) => rest);
    }
  };

  return (
    <section ref={ref} data-slot="signer-status" aria-labelledby={heading ? titleId : undefined} className={cn("grid gap-3", className)} {...props}>
      {heading ? (
        <header className="grid gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 id={titleId} className="text-sm font-medium text-fg">
              {heading}
            </h3>
            <span className={cn("text-xs tabular", declined ? "text-danger" : signed === total ? "text-success" : "text-fg-muted")}>{summary}</span>
          </div>
          <div aria-hidden="true" className="flex gap-1">
            {signers.map((s) => (
              <span
                key={s.id}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  s.status === "signed" ? "bg-success" : s.status === "declined" ? "bg-danger" : s.status === "viewed" ? "bg-warning" : s.status === "sent" ? "bg-info" : "bg-track",
                )}
              />
            ))}
          </div>
        </header>
      ) : null}
      <ol className="grid">
        {signers.map((s, i) => {
          const Icon = stateIcon[s.status];
          const canRemind = onRemind && (s.status === "sent" || s.status === "viewed");
          const r = reminded[s.id];
          const when = s.at ? f.relative(s.at, now != null ? { now } : undefined) : null;
          return (
            <li key={s.id} data-state={s.status} className="relative flex items-start gap-3 py-2.5 not-last:border-b not-last:border-line">
              <span className="relative shrink-0">
                <Avatar name={s.name} src={s.avatarSrc} size="sm" />
                {sequential ? (
                  <span aria-hidden="true" className="absolute -end-1 -bottom-1 grid size-4 place-items-center rounded-full bg-surface text-[10px] font-semibold text-fg-muted ring-1 ring-line tabular">
                    {i + 1}
                  </span>
                ) : null}
              </span>
              <div className="grid min-w-0 flex-1 gap-0.5">
                <p className="flex min-w-0 items-baseline gap-2 text-[13px]">
                  <span className="truncate font-medium text-fg">{s.name}</span>
                  {s.role ? <span className="truncate text-xs text-fg-subtle">{s.role}</span> : null}
                  {sequential ? <span className="sr-only">{t("order", { position: i + 1 })}</span> : null}
                </p>
                {s.email ? <p className="truncate text-xs text-fg-muted">{s.email}</p> : null}
                {s.note ? <div className="mt-1 text-xs text-fg-muted">{s.note}</div> : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={cn("inline-flex h-5 items-center gap-1 rounded-full px-1.5 text-[11px] font-medium [&_svg]:size-3", stateTone[s.status])}>
                  <Icon aria-hidden="true" />
                  {t(s.status)}
                </span>
                {when ? (
                  <time dateTime={s.at} title={f.dateTime(s.at!)} className="text-[11px] text-fg-subtle tabular" suppressHydrationWarning>
                    {when}
                  </time>
                ) : null}
                {canRemind ? (
                  r === "done" ? (
                    <span role="status" className="inline-flex items-center gap-1 text-[11px] text-fg-muted">
                      <Check aria-hidden="true" className="size-3" />
                      {t("reminded")}
                    </span>
                  ) : (
                    <Button size="xs" variant="ghost" className="-me-1.5" loading={r === "busy"} aria-label={t("remindName", { name: s.name })} onClick={() => remind(s)}>
                      <BellRing aria-hidden="true" />
                      {t("remind")}
                    </Button>
                  )
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
});

"use client";

import * as React from "react";
import { Check, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { Button } from "./button";
import { Field, Textarea } from "./input";
import { ToggleGroup, ToggleGroupItem } from "./toggle";

export const feedbackPromptLabels = {
  question: "Was this helpful?",
  yes: "Yes",
  no: "No",
  followUpYes: "What helped?",
  followUpNo: "What could be better?",
  comment: "Anything else? (optional)",
  submit: "Send feedback",
  skip: "Skip",
  thanks: "Thanks for your feedback.",
  error: "Couldn’t send your feedback. Try again.",
};
export type FeedbackPromptLabels = typeof feedbackPromptLabels;

export interface FeedbackPromptValue {
  helpful: boolean;
  /** Values of the chosen reasons. */
  reasons: string[];
  /** Trimmed free text; empty when skipped. */
  comment: string;
}

export interface FeedbackReason {
  value: string;
  label: string;
}

export interface FeedbackPromptProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSubmit" | "children"> {
  /** Called once with the answer. Return a promise for the busy state; a rejection shows the error and allows a retry. */
  onSubmit?: (value: FeedbackPromptValue) => void | Promise<void>;
  /** When to ask a follow-up (reasons + comment): after `"no"` (default), after `"both"` answers, or `"never"`. */
  followUp?: "no" | "both" | "never";
  /** Reason chips for a "no" answer. */
  reasons?: FeedbackReason[];
  /** Reason chips for a "yes" answer (with `followUp="both"`). */
  yesReasons?: FeedbackReason[];
  /** Show the free-text comment in the follow-up. Default `true`. */
  comment?: boolean;
  /** Hint under the comment field ("Don’t include personal data."). */
  commentHint?: React.ReactNode;
  /** Max characters of the comment. Default `1000`. */
  maxLength?: number;
  /** Shown in the thank-you state under the thanks line. */
  thanksDetail?: React.ReactNode;
  /** Heading level of the question. Default `2`. */
  headingLevel?: 2 | 3 | 4;
  /** `"card"` (default) bordered panel; `"inline"` a single row for page footers. */
  variant?: "card" | "inline";
  labels?: Partial<FeedbackPromptLabels>;
}

type Phase = "ask" | "follow-up" | "sending" | "done";

/**
 * "Was this helpful?" — a yes / no vote with an optional follow-up (reason chips and a
 * comment) and a thank-you state. The question and the result are announced politely.
 *
 * ```tsx
 * <FeedbackPrompt
 *   reasons={[{ value: "unclear", label: "Hard to follow" }, { value: "outdated", label: "Out of date" }]}
 *   onSubmit={(v) => api.feedback({ page: slug, ...v })}
 * />
 * ```
 */
export const FeedbackPrompt = /*#__PURE__*/ React.forwardRef<HTMLElement, FeedbackPromptProps>(function FeedbackPrompt(
  { onSubmit, followUp = "no", reasons = [], yesReasons = [], comment = true, commentHint, maxLength = 1000, thanksDetail, headingLevel = 2, variant = "card", labels, className, ...props },
  ref,
) {
  const t = useLabels("feedbackPrompt", feedbackPromptLabels, labels);
  const uid = React.useId();
  const [vote, setVote] = React.useState<boolean | null>(null);
  const [phase, setPhase] = React.useState<Phase>("ask");
  const [why, setWhy] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");
  const [failed, setFailed] = React.useState(false);
  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const send = async (value: FeedbackPromptValue) => {
    setPhase("sending");
    setFailed(false);
    try {
      await onSubmit?.(value);
      if (mounted.current) setPhase("done");
    } catch {
      if (!mounted.current) return;
      setFailed(true);
      setPhase(hasFollowUp(value.helpful) ? "follow-up" : "ask");
    }
  };

  const chips = vote ? yesReasons : reasons;
  const hasFollowUp = (helpful: boolean) => (followUp === "both" || (followUp === "no" && !helpful)) && (comment || (helpful ? yesReasons : reasons).length > 0);

  const choose = (helpful: boolean) => {
    setVote(helpful);
    setWhy([]);
    setFailed(false);
    if (hasFollowUp(helpful)) setPhase("follow-up");
    else void send({ helpful, reasons: [], comment: "" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void send({ helpful: vote!, reasons: why, comment: note.trim() });
  };

  const H = `h${headingLevel}` as "h2";
  const done = phase === "done";
  const busy = phase === "sending";

  return (
    <section
      ref={ref}
      aria-labelledby={`${uid}-q`}
      data-slot="feedback-prompt"
      data-state={phase}
      data-vote={vote === null ? undefined : vote ? "yes" : "no"}
      className={cn(variant === "card" ? "rounded-ui-lg border border-line bg-surface p-5" : "border-t border-line pt-4", className)}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <H id={`${uid}-q`} className="m-0 text-sm font-semibold text-fg">
          {t("question")}
        </H>
        {done ? null : (
          <div className="flex gap-2" role="group" aria-labelledby={`${uid}-q`}>
            <Button size="sm" variant={vote === true ? "primary" : "secondary"} aria-pressed={vote === true} disabled={busy} onClick={() => choose(true)}>
              <ThumbsUp aria-hidden />
              {t("yes")}
            </Button>
            <Button size="sm" variant={vote === false ? "primary" : "secondary"} aria-pressed={vote === false} disabled={busy} onClick={() => choose(false)}>
              <ThumbsDown aria-hidden />
              {t("no")}
            </Button>
          </div>
        )}
      </div>

      <div aria-live="polite" role="status">
        {done ? (
          <div className="mt-3 motion-safe:ui-fade">
            <p className="m-0 flex items-center gap-2 text-sm text-fg">
              <Check aria-hidden className="size-4 shrink-0 text-accent-ink" />
              {t("thanks")}
            </p>
            {thanksDetail ? <p className="m-0 mt-1 ps-6 text-sm text-fg-muted">{thanksDetail}</p> : null}
          </div>
        ) : null}
        {failed ? <p className="m-0 mt-3 text-sm text-danger">{t("error")}</p> : null}
      </div>

      {vote !== null && hasFollowUp(vote) && (phase === "follow-up" || busy) ? (
        <form onSubmit={submit} aria-labelledby={`${uid}-f`} className="mt-4 flex flex-col gap-4 border-t border-line pt-4 motion-safe:ui-fade">
          <p id={`${uid}-f`} className="m-0 text-sm font-medium text-fg">
            {vote ? t("followUpYes") : t("followUpNo")}
          </p>
          {chips.length ? (
            <ToggleGroup type="multiple" variant="outline" size="sm" value={why} onValueChange={setWhy} aria-labelledby={`${uid}-f`} disabled={busy} className="flex-wrap">
              {chips.map((r) => (
                <ToggleGroupItem key={r.value} value={r.value}>
                  {r.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ) : null}
          {comment ? (
            <Field label={t("comment")} hint={commentHint} disabled={busy}>
              <Textarea rows={3} value={note} maxLength={maxLength} onChange={(e) => setNote(e.target.value)} />
            </Field>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" variant="primary" loading={busy} disabled={!why.length && !note.trim()}>
              {t("submit")}
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void send({ helpful: vote, reasons: [], comment: "" })}>
              {t("skip")}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
});

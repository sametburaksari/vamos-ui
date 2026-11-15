"use client";

import * as React from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Button } from "./button";
import { Field, Input } from "./input";
import { Progress } from "./progress";
import { copyText } from "./_clipboard";

export const referralPanelLabels = {
  /** Default heading. */
  title: "Invite friends",
  /** Caption above the queue number. */
  position: "Your place in line",
  /** Visible "of 1,240" after the number. */
  positionOf: "of {total}",
  /** Spoken sentence for the queue position (live region). */
  positionSentence: "You are number {position} in line.",
  positionOfSentence: "You are number {position} of {total} in line.",
  /** Label of the read-only link field. */
  link: "Your invite link",
  copy: "Copy link",
  copied: "Copied",
  copiedAnnouncement: "Invite link copied",
  copyFailed: "Couldn't copy. Select the link and copy it yourself.",
  share: "Share",
  /** Referral count without a goal. */
  referrals: "{count, plural, =0 {Nobody has joined with your link yet} one {# friend joined with your link} other {# friends joined with your link}}",
  /** Progress label toward the reward. */
  progress: "Invites toward {reward}",
  toGo: "{count, plural, one {# more friend to unlock {reward}} other {# more friends to unlock {reward}}}",
  unlocked: "{reward} unlocked",
  /** Reward name when `reward` is not given. */
  reward: "your reward",
};
export type ReferralPanelLabels = typeof referralPanelLabels;

export interface ReferralPanelProps extends Omit<React.HTMLAttributes<HTMLElement>, "title" | "onCopy"> {
  /** The person's personal link. Shown in a read-only field, copied and shared as is. */
  shareUrl: string;
  /** Text that goes with the link in the native share sheet ("Join me on the list"). */
  shareText?: string;
  /** Title for the native share sheet. */
  shareTitle?: string;
  /** Place in the queue (1 = first). Leave out when there is no queue. */
  position?: number;
  /** People in the queue, for "of 1,240". Only pass real numbers. */
  total?: number;
  /** Friends who joined with the link. Default `0`. */
  referrals?: number;
  /** Referrals needed for the reward; shows a progress bar. */
  goal?: number;
  /** What the goal unlocks, in a phrase that fits "{n} more friends to unlock …" ("early access"). */
  reward?: string;
  /** Heading. Default "Invite friends"; `null` hides it (label the region yourself). */
  title?: React.ReactNode;
  /** One or two sentences under the heading: how the referral rules work. */
  description?: React.ReactNode;
  /** Heading level. Default `2`. */
  headingLevel?: 2 | 3 | 4;
  /** Called after the link was copied. */
  onCopy?: (url: string) => void;
  /** Called after the native share sheet closed with a share. */
  onShare?: (url: string) => void;
  labels?: Partial<ReferralPanelLabels>;
}

/**
 * The "you're on the list" panel of a waitlist or referral programme: the person's place in line,
 * a personal link to copy or share (the native share sheet where the device has one) and how many
 * friends joined with it, with progress toward a reward. Position changes are announced politely;
 * the big number itself is hidden from screen readers.
 *
 * ```tsx
 * <ReferralPanel position={412} total={2380} shareUrl="https://example.com/r/k7q2" referrals={2} goal={3} reward="early access"
 *   description="Every friend who joins with your link moves you up the line." />
 * ```
 */
export const ReferralPanel = /*#__PURE__*/ React.forwardRef<HTMLElement, ReferralPanelProps>(function ReferralPanel(
  { shareUrl, shareText, shareTitle, position, total, referrals = 0, goal, reward, title, description, headingLevel = 2, onCopy, onShare, labels, className, ...props },
  ref,
) {
  const t = useLabels("referralPanel", referralPanelLabels, labels);
  const f = useFormat();
  const uid = React.useId();
  const [copied, setCopied] = React.useState<"ok" | "failed" | null>(null);
  // Native share only exists on some devices: detect after mount so server and client agree.
  const [canShare, setCanShare] = React.useState(false);
  React.useEffect(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), []);
  React.useEffect(() => {
    if (copied !== "ok") return;
    const id = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    const ok = await copyText(shareUrl);
    setCopied(ok ? "ok" : "failed");
    if (ok) onCopy?.(shareUrl);
  };
  const share = async () => {
    try {
      await navigator.share({ url: shareUrl, text: shareText, title: shareTitle });
      onShare?.(shareUrl);
    } catch {
      /* dismissed or blocked: nothing to do, the link is still there to copy */
    }
  };

  const heading = title === undefined ? t("title") : title;
  const H = `h${headingLevel}` as "h2";
  const rewardName = reward ?? t("reward");
  const hasGoal = goal != null && goal > 0;
  const left = hasGoal ? Math.max(0, goal - referrals) : 0;

  return (
    <section
      ref={ref}
      aria-labelledby={heading ? `${uid}-title` : undefined}
      data-slot="referral-panel"
      data-state={hasGoal && left === 0 ? "unlocked" : undefined}
      className={cn("@container overflow-hidden rounded-ui-lg border border-line bg-surface", className)}
      {...props}
    >
      <div className={cn("grid", position != null && "@2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]")}>
        {position != null ? (
          <div data-slot="referral-position" className="flex flex-col justify-center gap-2 border-b border-line bg-surface-2 p-5 @2xl:border-e @2xl:border-b-0 sm:p-6">
            <p className="m-0 text-xs font-medium text-fg-muted">{t("position")}</p>
            <p aria-hidden="true" className="m-0 flex flex-wrap items-baseline gap-x-2 text-fg">
              <span className="text-[2.5rem] leading-none font-semibold tracking-tight tabular sm:text-[3.25rem]">
                <span className="text-accent-ink">#</span>
                {f.number(position)}
              </span>
              {total != null ? <span className="text-sm text-fg-muted tabular">{t("positionOf", { total: f.number(total) })}</span> : null}
            </p>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {total != null ? t("positionOfSentence", { position: f.number(position), total: f.number(total) }) : t("positionSentence", { position: f.number(position) })}
            </p>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
          {heading || description ? (
            <div className="flex flex-col gap-1.5">
              {heading ? (
                <H id={`${uid}-title`} className="m-0 text-base font-semibold text-fg">
                  {heading}
                </H>
              ) : null}
              {description ? <p className="m-0 text-sm text-pretty text-fg-muted">{description}</p> : null}
            </div>
          ) : null}

          <Field label={t("link")} error={copied === "failed" ? t("copyFailed") : undefined}>
            <Input id={`${uid}-link`} readOnly value={shareUrl} dir="ltr" onFocus={(e) => e.currentTarget.select()} inputClassName="font-mono text-sm" />
          </Field>
          <div className="-mt-2 flex flex-wrap gap-2">
            <Button variant="primary" onClick={copy} data-copied={copied === "ok" ? "" : undefined}>
              {copied === "ok" ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied === "ok" ? t("copied") : t("copy")}
            </Button>
            {canShare ? (
              <Button variant="secondary" onClick={share}>
                <Share2 aria-hidden />
                {t("share")}
              </Button>
            ) : null}
          </div>
          <p role="status" className="sr-only">
            {copied === "ok" ? t("copiedAnnouncement") : ""}
          </p>

          {hasGoal ? (
            <Progress
              label={t("progress", { reward: rewardName })}
              value={Math.min(referrals, goal)}
              max={goal}
              display="fraction"
              showValue
              tone={left === 0 ? "success" : "accent"}
              hint={left === 0 ? t("unlocked", { reward: rewardName }) : t("toGo", { count: left, reward: rewardName })}
            />
          ) : (
            <p data-slot="referral-count" className="m-0 text-sm text-fg-muted">
              {t("referrals", { count: referrals })}
            </p>
          )}
        </div>
      </div>
    </section>
  );
});

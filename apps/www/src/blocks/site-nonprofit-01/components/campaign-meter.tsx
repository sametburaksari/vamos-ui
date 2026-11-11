import { Progress } from "@vamos-ui/react";
import { campaign, type Copy } from "./content";

/** Campaign meter: raised against the goal, donors, end date. */
export function CampaignMeter({ c, compact = false }: { c: Copy; compact?: boolean }) {
  const { t, f, lira } = c;
  const share = campaign.raised / campaign.goal;
  return (
    <div className={compact ? "" : "border border-fg bg-surface p-5 sm:p-6"}>
      <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-fg-muted uppercase">{t(campaign.name)}</p>
      <p className="m-0 mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="font-display text-display-m leading-none tabular-nums">{lira(campaign.raised)}</span>
        <span className="text-small text-fg-muted">{t({ en: `of ${lira(campaign.goal)}`, tr: `/ ${lira(campaign.goal)}` })}</span>
      </p>
      <Progress
        className="mt-4"
        size="md"
        value={campaign.raised}
        max={campaign.goal}
        aria-label={t({ en: "Raised towards the goal", tr: "Hedefe ulaşılan tutar" })}
        valueText={t({ en: `${f.percent(share, { maximumFractionDigits: 0 })} of ${lira(campaign.goal)} raised`, tr: `${lira(campaign.goal)} hedefin ${f.percent(share, { maximumFractionDigits: 0 })} kadarı toplandı` })}
      />
      <p className="m-0 mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono text-xs text-fg-muted tabular-nums">
        <span>{t({ en: `${f.number(campaign.donors)} donors · ${f.percent(share, { maximumFractionDigits: 0 })}`, tr: `${f.number(campaign.donors)} bağışçı · ${f.percent(share, { maximumFractionDigits: 0 })}` })}</span>
        <span>{t({ en: `Ends ${f.date(campaign.ends, { day: "numeric", month: "long" })}`, tr: `Bitiş ${f.date(campaign.ends, { day: "numeric", month: "long" })}` })}</span>
      </p>
      {compact ? null : <p className="m-0 mt-4 border-t border-line pt-4 text-small text-fg-muted">{t(campaign.promise)}</p>}
    </div>
  );
}

"use client";

import { Card, CardHeader, Field, Select, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { campaignChannelLabels, channelColor, channels, credit, models, totals, windowOf, type Model, type Range } from "./data";

/**
 * Conversion credit per channel under the chosen attribution model, with last click as the
 * reference tick, and the CPA each channel gets once credit moves.
 */
export function AttributionCard({ model, onModel, range }: { model: Model; onModel: (m: Model) => void; range: Range }) {
  const { f, t, c } = useBlockFormat();
  const rows = windowOf(range).now;
  const all = totals(rows);
  const m = models.find((x) => x.key === model)!;
  const max = Math.max(...channels.flatMap((ch) => [credit[model][ch], credit.last[ch]]));

  const data = channels
    .map((ch) => {
      const share = credit[model][ch];
      const base = credit.last[ch];
      const spend = totals(rows, [ch]).spend;
      const conv = all.conv * share;
      return { ch, share, base, shift: share - base, cpa: conv ? spend / conv : 0 };
    })
    .sort((a, b) => b.share - a.share);
  const winner = [...data].sort((a, b) => b.shift - a.shift)[0]!;

  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "160ms" }}>
      <CardHeader titleAs="h2" title={c("Attribution", "Atıf")} description={t(m.hint)} />
      <div className="px-(--card-p) pb-3">
        <Field label={c("Attribution model", "Atıf modeli")}>
          <Select value={model} onValueChange={(v) => v && onModel(v as Model)} items={models.map((x) => ({ value: x.key, label: t(x.label) }))} size="sm" />
        </Field>
      </div>
      <table className="w-full text-[13px]">
        <caption className="sr-only">{c(`Conversion credit by channel, ${t(m.label)} model compared with last click`, `Kanal bazında dönüşüm payı, ${t(m.label)} modeli ve son tıklama karşılaştırması`)}</caption>
        <thead className="border-y border-line text-xs text-fg-subtle">
          <tr>
            <th scope="col" className="py-2 ps-(--card-p) text-start font-normal">{c("Channel", "Kanal")}</th>
            <th scope="col" className="w-[42%] py-2 text-start font-normal">{c("Share of conversions", "Dönüşüm payı")}</th>
            <th scope="col" className="py-2 pe-(--card-p) text-end font-normal">CPA</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.ch} className="border-b border-line last:border-b-0">
              <th scope="row" className="py-2.5 ps-(--card-p) text-start font-normal">
                <span className="flex items-center gap-2 text-fg">
                  <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: `var(--${channelColor[r.ch]})` }} />
                  <span className="truncate">{t(campaignChannelLabels[r.ch])}</span>
                </span>
              </th>
              <td className="py-2.5 pe-3">
                <div className="flex items-center gap-2">
                  <div className="relative h-3 flex-1">
                    <span className="absolute inset-y-0 start-0 rounded-e-sm transition-[width] duration-500 ease-out" style={{ width: `${(r.share / max) * 100}%`, background: `var(--${channelColor[r.ch]})` }} />
                    {model !== "last" ? <span aria-hidden className="absolute -inset-y-1 w-0.5 rounded-full bg-fg transition-[inset-inline-start] duration-500" style={{ insetInlineStart: `calc(${(r.base / max) * 100}% - 1px)` }} /> : null}
                  </div>
                  <span className="w-10 shrink-0 text-end font-mono text-xs text-fg tabular">{f.percent(r.share, { maximumFractionDigits: 0 })}</span>
                </div>
                {model !== "last" ? (
                  <span className={cn("font-mono text-[11px] tabular", Math.abs(r.shift) < 0.005 ? "text-fg-subtle" : r.shift > 0 ? "text-success" : "text-danger")}>
                    {r.shift >= 0 ? "+" : "−"}
                    {f.number(Math.abs(r.shift * 100), { maximumFractionDigits: 0 })} {c("pts", "puan")}<span className="max-sm:sr-only"> {c("vs last click", "son tıklamaya göre")}</span>
                  </span>
                ) : null}
              </td>
              <td className="py-2.5 pe-(--card-p) text-end font-mono text-xs text-fg-muted tabular">{f.currency(Math.round(r.cpa), { currency: "TRY", currencyDisplay: "narrowSymbol" }, { maximumFractionDigits: 0 })}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mx-(--card-p) mt-auto mb-(--card-p) rounded-ui-sm bg-surface-2 px-3 py-2 text-xs text-fg-muted">
        {model === "last"
          ? c("Last click favours search and email, the channels people use right before buying. Switch models to see who opened the door.", "Son tıklama, satın almadan hemen önce kullanılan arama ve e-postayı öne çıkarır. Kapıyı kimin açtığını görmek için modeli değiştirin.")
          : c(
              `${t(campaignChannelLabels[winner.ch])} gains the most credit here: ${f.number(winner.shift * 100, { maximumFractionDigits: 0 })} pts more than last click gives it. Cutting it on last-click numbers would undercount it.`,
              `Bu modelde en çok pay kazanan ${t(campaignChannelLabels[winner.ch])}: son tıklamadan ${f.number(winner.shift * 100, { maximumFractionDigits: 0 })} puan fazla. Son tıklama rakamlarıyla kısılırsa katkısı eksik sayılır.`,
            )}
      </p>
    </Card>
  );
}

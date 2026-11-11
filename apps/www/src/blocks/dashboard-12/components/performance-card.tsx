"use client";

import { Card, CardBody, CardHeader, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { ComboChart, type ChartConfig } from "@vamos-ui/react/charts";
import { useBlockFormat } from "../../_shared/format";
import { campaignChannelLabels, channelColor, channels, windowOf, type ChannelKey, type DailyRow, type Range } from "./data";

const tryAxis = (v: unknown, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", notation: "compact", maximumFractionDigits: 1 }).format(Number(v));
const tryExact = (v: unknown, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(Number(v));

/** Spend per channel as stacked bars with the blended CPA as a line; 90 days are shown by week. */
export function PerformanceCard({ range, picked, onPicked }: { range: Range; picked: ChannelKey[]; onPicked: (v: ChannelKey[]) => void }) {
  const { t, c } = useBlockFormat();
  const only = picked.length ? picked : channels;
  const rows = windowOf(range).now;

  const bucket = (list: DailyRow[]) => {
    const row: Record<string, number | string> = { date: list[0]!.date };
    let spend = 0;
    let conv = 0;
    for (const ch of only) {
      const s = list.reduce((a, r) => a + r[`${ch}Spend`], 0);
      row[ch] = Math.round(s);
      spend += s;
      conv += list.reduce((a, r) => a + r[`${ch}Conv`], 0);
    }
    row.cpa = conv ? Math.round(spend / conv) : 0;
    return row;
  };
  const data = range === "90" ? Array.from({ length: Math.ceil(rows.length / 7) }, (_, i) => bucket(rows.slice(i * 7, i * 7 + 7))) : rows.map((r) => bucket([r]));

  const config: ChartConfig = Object.fromEntries([
    ...only.map((ch) => [ch, { label: t(campaignChannelLabels[ch]), color: channelColor[ch], format: tryExact, axis: "start", pattern: "solid" }]),
    // Bars are told apart by colour and stack order; only the CPA line needs a stroke pattern.
    ["cpa", { label: c("Blended CPA", "Karma edinme maliyeti"), color: "fg-muted", format: tryExact, axis: "end", pattern: "dotted" }],
  ]);

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "100ms" }}>
      <CardHeader
        titleAs="h2"
        title={c("Spend and cost per acquisition", "Harcama ve edinme maliyeti")}
        description={range === "90" ? c("Weekly, last 13 weeks", "Haftalık, son 13 hafta") : c(`Daily, last ${range} days`, `Günlük, son ${range} gün`)}
      />
      <div className="-mt-1 overflow-x-auto px-(--card-p) pb-1">
        <ToggleGroup
          type="multiple"
          size="xs"
          aria-label={c("Channels", "Kanallar")}
          value={picked}
          onValueChange={(v) => onPicked((v.length ? v : channels) as ChannelKey[])}
        >
          {channels.map((ch) => (
            <ToggleGroupItem key={ch} value={ch}>
              <span aria-hidden className="size-2 rounded-full" style={{ background: `var(--${channelColor[ch]})` }} />
              {t(campaignChannelLabels[ch])}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <CardBody className="pt-2">
        <ComboChart
          title={c("Spend per channel and blended cost per acquisition", "Kanal başına harcama ve karma edinme maliyeti")}
          data={data}
          x="date"
          xFormat={{ date: { month: "short", day: "numeric" } }}
          yFormat={tryAxis}
          endAxisFormat={tryAxis}
          config={config}
          bars={only}
          lines={["cpa"]}
          stackBars
          height="md"
          legend="bottom"
          startAxisLabel={c("Spend", "Harcama")}
          endAxisLabel="CPA"
          tableToggle
        />
      </CardBody>
    </Card>
  );
}

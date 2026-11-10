import { LocaleProvider } from "@vamos-ui/react";
import { BarChart, type ChartConfig } from "@vamos-ui/react/charts";

const revenue = [
  { month: "2026-06-01", revenue: 1_184_000, margin: 0.31 },
  { month: "2026-07-01", revenue: 1_326_500, margin: 0.29 },
  { month: "2026-08-01", revenue: 1_092_300, margin: 0.33 },
  { month: "2026-09-01", revenue: 1_548_900, margin: 0.35 },
  { month: "2026-10-01", revenue: 1_712_400, margin: 0.34 },
];

const config = { revenue: { label: "Revenue", format: "currency" } } satisfies ChartConfig;

export default function ChartFormatters() {
  // Axis ticks are compact ("$1.2M" / "₺1,2 Mn"); tooltip and table show the full value.
  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      {[
        { locale: "en-US", currency: "USD", timeZone: "UTC" },
        { locale: "tr-TR", currency: "TRY", timeZone: "Europe/Istanbul" },
      ].map((l) => (
        <LocaleProvider key={l.locale} locale={l.locale} currency={l.currency} timeZone={l.timeZone}>
          <div>
            <p className="mb-2 font-mono text-[11px] text-fg-subtle">{l.locale}</p>
            <BarChart title="Monthly revenue" data={revenue} x="month" xFormat={{ date: "month" }} config={config} height="sm" valueLabels tableToggle />
          </div>
        </LocaleProvider>
      ))}
    </div>
  );
}

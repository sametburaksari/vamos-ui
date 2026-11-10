import { BarChart, BarList, type ChartConfig } from "@vamos-cms/ui/charts";

const stages = [
  { stage: "Lead", deals: 412_000 },
  { stage: "Qualified", deals: 286_500 },
  { stage: "Proposal", deals: 198_200 },
  { stage: "Negotiation", deals: 121_800 },
  { stage: "Won", deals: 96_400 },
];

const pages = [
  { key: "pricing", label: "/pricing", value: 8_420, delta: 0.18 },
  { key: "home", label: "/", value: 7_960, delta: 0.04 },
  { key: "blog-ai", label: "/blog/ai-in-crm", value: 3_210, delta: 0.62 },
  { key: "docs", label: "/docs/getting-started", value: 2_480, delta: -0.07 },
  { key: "careers", label: "/careers", value: 940 },
];

const config = { deals: { label: "Pipeline value", format: "currency" } } satisfies ChartConfig;

export default function BarChartDemo() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-[1.4fr_1fr]">
      <BarChart title="Pipeline value by stage" data={stages} x="stage" config={config} valueLabels height="md" />
      <div>
        <p className="mb-2 text-[13px] font-medium">Top pages</p>
        <BarList aria-label="Top pages" data={pages} showShare />
      </div>
    </div>
  );
}

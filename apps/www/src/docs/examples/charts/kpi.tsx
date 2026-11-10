import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@vamos-cms/ui";

function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 96, h = 32, min = Math.min(...values), max = Math.max(...values);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={className} aria-hidden>
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const kpis = [
  { label: "Open deals", value: "148", delta: "+9.2%", up: true, spark: [4, 6, 5, 8, 7, 9, 12, 11, 14] },
  { label: "Avg. response", value: "1h 12m", delta: "−18%", up: true, spark: [9, 8, 9, 7, 6, 6, 5, 4, 4] },
  { label: "Churn", value: "2.4%", delta: "+0.3pt", up: false, spark: [2, 2, 3, 2, 3, 3, 4, 3, 4] },
];

export default function KpiRow() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {kpis.map((k) => (
        <Card key={k.label} className="p-5">
          <div className="flex items-start justify-between">
            <span className="text-[13px] text-fg-muted">{k.label}</span>
            <span className={`inline-flex items-center gap-0.5 text-xs font-medium tabular ${k.up ? "text-success" : "text-danger"}`}>
              {k.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{k.delta}
            </span>
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <span className="font-mono text-[26px] font-medium leading-none tracking-[-0.03em] tabular">{k.value}</span>
            <Sparkline values={k.spark} className={k.up ? "text-accent-ink" : "text-fg-subtle"} />
          </div>
        </Card>
      ))}
    </div>
  );
}

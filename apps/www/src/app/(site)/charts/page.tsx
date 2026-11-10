import AreaChartDemo from "@/docs/examples/charts/area";
import BarChartDemo from "@/docs/examples/charts/bar";
import KpiRow from "@/docs/examples/charts/kpi";
import { ComponentPreview } from "@/components/docs/component-preview";

export const metadata = { title: "Charts" };

const charts = [
  { id: "area", title: "Area — traffic", description: "Two series, accent fill, dashed comparison line.", file: "charts/area.tsx", Component: AreaChartDemo },
  { id: "bar", title: "Bar — pipeline stages", description: "Single series on --chart-1; rounded tops.", file: "charts/bar.tsx", Component: BarChartDemo },
  { id: "kpi", title: "KPI row with sparklines", description: "Mono tabular numbers, semantic delta colour, SVG sparkline — no chart library.", file: "charts/kpi.tsx", Component: KpiRow },
];

export default function ChartsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12">
      <div className="max-w-2xl">
        <div className="mb-2 text-[11.5px] font-medium uppercase tracking-[0.14em] text-fg-subtle">Charts</div>
        <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">Charts that read your theme.</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
          Colours come from tokens (<code className="font-mono text-[13px]">--chart-1…6</code>, <code className="font-mono text-[13px]">--chart-grid</code>), so every chart follows
          light/dark, accent and glass without a single extra prop. Built on Recharts; the Chart frame with built-in formatting,
          legends, empty states and a “view as table” option is coming in M2.
        </p>
      </div>
      <div className="mt-12 grid gap-14">
        {charts.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-20">
            <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.01em]">{c.title}</h2>
            <p className="mb-3 text-[13.5px] text-fg-muted">{c.description}</p>
            <ComponentPreview example={{ id: c.id, title: c.title, file: c.file, Component: c.Component }} />
          </section>
        ))}
      </div>
    </div>
  );
}

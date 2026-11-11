import AreaChartDemo from "@/docs/examples/charts/area";
import BarChartDemo from "@/docs/examples/charts/bar";
import KpiRow from "@/docs/examples/charts/kpi";
import LineChartEndLabels from "@/docs/examples/line-chart/end-labels";
import DonutChartDemo from "@/docs/examples/donut-chart/demo";
import ComboChartDemo from "@/docs/examples/combo-chart/demo";
import FunnelDemo from "@/docs/examples/funnel/demo";
import GaugeDemo from "@/docs/examples/gauge/demo";
import GaugeRing from "@/docs/examples/gauge/ring";
import HeatmapCalendar from "@/docs/examples/heatmap/calendar";
import HeatmapMatrixHours from "@/docs/examples/heatmap/matrix-hours";
import ChartStates from "@/docs/examples/chart/states";
import { ComponentPreview } from "@/components/docs/component-preview";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Charts", description: "Area, bar, line, pie, radar, funnel, sparkline and KPI charts for dashboards — themeable, accessible and ready to copy.", path: "/charts/" });

const charts = [
  { id: "area", slug: "area-chart", title: "Area — traffic", description: "Two series, gradient fill, a dashed comparison line and a “View as table” switch.", file: "charts/area.tsx", Component: AreaChartDemo },
  { id: "bar", slug: "bar-chart", title: "Bar & Bar list — pipeline and top pages", description: "Compact value labels on the bars; a plain-DOM ranked list with share and change.", file: "charts/bar.tsx", Component: BarChartDemo },
  { id: "line", slug: "line-chart", title: "Line — win rate by rep", description: "Direct end labels instead of a legend; dash patterns kick in from four series.", file: "line-chart/end-labels.tsx", Component: LineChartEndLabels },
  { id: "combo", slug: "combo-chart", title: "Combo — quotes and win rate", description: "Bars and a rate on two axes that share the zero line and the grid.", file: "combo-chart/demo.tsx", Component: ComboChartDemo },
  { id: "donut", slug: "donut-chart", title: "Donut — leads by source", description: "The legend is a real list with value and share; focus a row to read its slice in the centre.", file: "donut-chart/demo.tsx", Component: DonutChartDemo },
  { id: "funnel", slug: "funnel", title: "Funnel — sales pipeline", description: "Conversion from the previous stage, drop-off and overall rate. Columns when wide, rows when narrow.", file: "funnel/demo.tsx", Component: FunnelDemo },
  { id: "gauge", slug: "gauge", title: "Gauge — score with bands", description: "A 270° and a 180° arc; the band colour and label follow the value.", file: "gauge/demo.tsx", Component: GaugeDemo },
  { id: "ring", slug: "gauge", title: "Progress ring — from table cell to dashboard", description: "20 px inline up to 160 px, with role=\"progressbar\" and a full value text.", file: "gauge/ring.tsx", Component: GaugeRing },
  { id: "heatmap", slug: "heatmap", title: "Heatmap — a year of publishing", description: "Calendar mode; the week starts where your locale starts it. Arrow keys walk the days.", file: "heatmap/calendar.tsx", Component: HeatmapCalendar },
  { id: "matrix", slug: "heatmap", title: "Heatmap — best hours to call", description: "Matrix mode, weekday × hour, seven steps from chart-2.", file: "heatmap/matrix-hours.tsx", Component: HeatmapMatrixHours },
  { id: "states", slug: "chart", title: "States — loading, refreshing, empty, error", description: "Chart-shaped skeletons and an empty state that keeps the height. No spinners.", file: "chart/states.tsx", Component: ChartStates },
  { id: "kpi", slug: "sparkline", title: "KPI row with sparklines", description: "Mono tabular numbers, semantic delta colour, SVG sparkline — no chart library.", file: "charts/kpi.tsx", Component: KpiRow },
];

export default function ChartsPage() {
  return (
    <main id="main" className="w-full px-5 md:px-8 xl:px-12 py-12">
      <div className="max-w-2xl">
        <div className="mb-2 text-[11.5px] font-medium tracking-[0.14em] text-fg-subtle uppercase">Charts</div>
        <h1 className="font-display text-[length:calc(48px*var(--display-scale))] leading-[1.03]">Charts that read your theme.</h1>
        <p className="mt-3 text-[15.5px] leading-relaxed text-fg-muted">
          Series name a colour token (<code className="font-mono text-[13px]">chart-1…6</code>, <code className="font-mono text-[13px]">success</code>…), never a hex value, so every
          chart follows light/dark, accent and glass on its own. Numbers and dates are written by your locale, every chart carries a text summary and a
          data-table alternative, and the legend toggles series. Recharts loads only through <code className="font-mono text-[13px]">@vamos-ui/react/charts</code>; Funnel,
          Gauge, Bar list and Heatmap are plain SVG and DOM.
        </p>
      </div>
      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-1.5">
        {charts.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="rounded-full border border-line px-3 py-1 text-[12.5px] text-fg-muted transition-colors focus-ring hover:border-field-border-hover hover:text-fg">
            {c.title.split(" — ")[0]}
          </a>
        ))}
      </nav>
      <div className="mt-12 grid gap-14">
        {charts.map((c) => (
          <section key={c.id} id={c.id} className="scroll-mt-20">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <div>
                <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.01em]">{c.title}</h2>
                <p className="text-[13.5px] text-fg-muted">{c.description}</p>
              </div>
              <a href={`/docs/components/${c.slug}`} className="text-[12.5px] text-accent-ink underline-offset-4 focus-ring hover:underline">
                Docs and props
              </a>
            </div>
            <ComponentPreview example={{ id: c.id, title: c.title, file: c.file, Component: c.Component }} />
          </section>
        ))}
      </div>
    </main>
  );
}

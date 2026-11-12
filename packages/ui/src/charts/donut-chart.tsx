"use client";

import * as React from "react";
import { Cell, Pie, PieChart, Sector, type PieSectorShapeProps } from "recharts";
import { cn } from "../lib/cn";
import { useControllableState } from "../lib/use-controllable-state";
import { useLabels } from "../lib/labels";
import { Chart, ChartIndicator, chartLabels, useChart, type ChartProps } from "./chart-shell";
import { useFormat } from "../lib/locale";
import { formatValue, seriesColor, type ChartConfig, type FormatSpec } from "./utils";

const SIZES = { sm: 120, md: 180, lg: 240 } as const;
const OTHER_KEY = "__other";

export interface DonutChartProps<T extends object> extends Omit<ChartProps<T>, "children" | "x" | "legend" | "height" | "aspect" | "aside" | "table"> {
  /** Row key holding the slice id (matches config keys). */
  nameKey: keyof T & string;
  /** Row key holding the slice value. */
  valueKey: keyof T & string;
  /** Centre content: the visible total (default), your own node, or nothing. Hovering a slice shows that slice. */
  center?: React.ReactNode | "total" | "none";
  /** Label under the centre total. Default "Total". */
  centerLabel?: string;
  /** Slices beyond this count merge into "Other" (`fg-subtle`). Default 5. */
  maxSlices?: number;
  variant?: "donut" | "pie" | "half";
  /** Legend list with value + share: beside the ring (default), under it, or none. */
  legend?: "side" | "bottom" | "none";
  size?: "sm" | "md" | "lg" | number;
  /** Format of the values. Default: the first config entry's format, else `"number"`. */
  format?: FormatSpec;
  /** Controlled active slice (hover / legend focus). */
  activeKey?: string | null;
  onActiveChange?: (key: string | null) => void;
}

interface Slice {
  key: string;
  label: string;
  value: number;
  share: number;
}

/**
 * Parts of a whole (≤ 6 slices). The legend is a real list with value and share, so the chart never
 * relies on colour alone; focusing an item highlights its slice and the centre shows its numbers.
 *
 * ```tsx
 * <DonutChart title="Leads by source" data={rows} nameKey="source" valueKey="leads" config={{ organic: { label: "Organic search" } }} />
 * ```
 */
export function DonutChart<T extends object>({
  data,
  nameKey,
  valueKey,
  config,
  center = "total",
  centerLabel,
  maxSlices = 5,
  variant = "donut",
  legend = "side",
  size = "md",
  format,
  activeKey,
  onActiveChange,
  summary,
  ...props
}: DonutChartProps<T>) {
  const rows = data as unknown as Record<string, unknown>[];
  const f = useFormat();
  const t = useLabels("chart", chartLabels, props.labels);
  const valueFormat = format ?? Object.values(config)[0]?.format;
  const [active, setActive] = useControllableState<string | null>({ value: activeKey, defaultValue: null, onChange: onActiveChange, name: "DonutChart" });
  const px = typeof size === "number" ? size : SIZES[size];
  const height = variant === "half" ? Math.round(px / 2) + 10 : px;

  const { slices, effectiveConfig } = React.useMemo(() => {
    const raw = rows.map((r) => ({ key: String(r[nameKey]), value: Math.max(0, Number(r[valueKey]) || 0) }));
    let list = raw;
    if (raw.length > maxSlices) {
      const sorted = [...raw].sort((a, b) => b.value - a.value);
      const keep = new Set(sorted.slice(0, maxSlices - 1).map((s) => s.key));
      const rest = raw.filter((s) => !keep.has(s.key));
      list = [...raw.filter((s) => keep.has(s.key)), { key: OTHER_KEY, value: rest.reduce((s, r) => s + r.value, 0) }];
    }
    const cfg: ChartConfig = {};
    for (const s of list) cfg[s.key] = s.key === OTHER_KEY ? { label: config[OTHER_KEY]?.label ?? "", color: "fg-subtle", format } : { ...config[s.key], label: config[s.key]?.label ?? s.key, format: valueFormat };
    return { slices: list, effectiveConfig: cfg };
  }, [rows, nameKey, valueKey, maxSlices, config, valueFormat]);

  const total = slices.reduce((s, r) => s + r.value, 0);
  const otherLabel = t("other");
  const labelOf = (k: string) => (k === OTHER_KEY ? effectiveConfig[k]?.label || otherLabel : (effectiveConfig[k]?.label ?? k));
  const table = {
    columns: [
      { key: "label", label: t("category"), header: true },
      { key: "value", label: t("value"), format: valueFormat },
      { key: "share", label: t("share"), format: "percent" as const },
    ],
    rows: slices.map((s) => ({ label: labelOf(s.key), value: s.value, share: total ? s.value / total : 0 })),
  };
  const summaryText =
    summary ?? (total ? slices.map((s) => `${labelOf(s.key)} ${f.percent(s.value / total)} (${formatValue(f, valueFormat, s.value)})`).join(", ") + "." : "");
  const ctx = React.useMemo(() => ({ active, setActive, raw: slices }), [active, setActive, slices]);

  return (
    <DonutContext.Provider value={ctx}>
    <Chart
      {...props}
      data={slices as unknown as T[]}
      config={effectiveConfig}
      height={height}
      legend="none"
      skeleton="donut"
      summary={summaryText as ChartProps<T>["summary"]}
      table={table}
      state={props.state ?? (rows.length === 0 ? { status: "empty" } : undefined)}
      aside={legend === "none" ? undefined : <DonutLegend />}
      asidePosition={legend === "bottom" ? "bottom" : "side"}
    >
      <DonutPlot px={px} height={height} variant={variant} center={center} centerLabel={centerLabel} />
    </Chart>
    </DonutContext.Provider>
  );
}

interface DonutContextValue {
  active: string | null;
  setActive: (k: string | null) => void;
  raw: { key: string; value: number }[];
}
const DonutContext = /*#__PURE__*/ React.createContext<DonutContextValue | null>(null);
const useDonut = () => React.useContext(DonutContext)!;

function useSlices(slices: { key: string; value: number }[]): Slice[] {
  const chart = useChart();
  return React.useMemo(() => {
    const visible = slices.filter((s) => !chart.isHidden(s.key));
    const total = visible.reduce((s, r) => s + r.value, 0);
    return slices.map((s) => ({
      key: s.key,
      label: s.key === OTHER_KEY ? chart.config[s.key]?.label || chart.t("other") : (chart.config[s.key]?.label ?? s.key),
      value: s.value,
      share: total && !chart.isHidden(s.key) ? s.value / total : 0,
    }));
  }, [slices, chart]);
}

function DonutPlot({
  px,
  height,
  variant,
  center,
  centerLabel,
}: {
  px: number;
  height: number;
  variant: "donut" | "pie" | "half";
  center: DonutChartProps<object>["center"];
  centerLabel?: string;
}) {
  const chart = useChart();
  const { active, setActive, raw } = useDonut();
  const slices = useSlices(raw);

  const visible = slices.filter((s) => !chart.isHidden(s.key) && s.value > 0);
  const total = visible.reduce((s, r) => s + r.value, 0);
  const half = variant === "half";
  const outer = half ? px / 2 - 4 : px / 2 - 4;
  const inner = variant === "pie" ? 0 : outer * (px < 140 ? 0.66 : 0.72);
  const activeSlice = active ? slices.find((s) => s.key === active && !chart.isHidden(s.key)) : undefined;
  const fmt = (v: number) => chart.formatSeries(raw[0]?.key ?? "", v);

  let centerNode: React.ReactNode = null;
  if (variant !== "pie" && center !== "none") {
    if (activeSlice)
      centerNode = (
        <>
          <span className="max-w-[80%] truncate text-[11.5px] text-fg-muted">{activeSlice.label}</span>
          <span className={cn("font-mono leading-none font-medium tracking-[-0.02em] text-fg tabular", px >= 180 ? "text-[22px]" : "text-[17px]")}>{fmt(activeSlice.value)}</span>
          <span className="font-mono text-[11.5px] text-fg-subtle tabular">{chart.f.percent(activeSlice.share)}</span>
        </>
      );
    else if (center === "total" || center === undefined)
      centerNode = (
        <>
          <span className={cn("font-mono leading-none font-medium tracking-[-0.02em] text-fg tabular", px >= 180 ? "text-[24px]" : "text-[17px]")}>{fmt(total)}</span>
          <span className="text-[11.5px] text-fg-muted">{centerLabel ?? chart.t("total")}</span>
        </>
      );
    else centerNode = center;
  }

  const shape = (p: PieSectorShapeProps) => {
    const key = String((p.payload as { key?: string } | undefined)?.key ?? "");
    const isActive = key === active;
    const dim = active && !isActive;
    const { key: _key, ...sector } = p as PieSectorShapeProps & { key?: React.Key };
    void _key;
    return <Sector {...sector} outerRadius={(p.outerRadius ?? outer) + (isActive ? 4 : 0)} fillOpacity={dim ? 0.45 : 1} style={{ transition: "fill-opacity 160ms" }} />;
  };

  return (
    <div className="flex size-full items-center justify-center" onMouseLeave={() => setActive(null)}>
      <div className="relative" style={{ width: px, height }}>
        <PieChart width={px} height={height} accessibilityLayer={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          {total === 0 ? (
            <Pie data={[{ key: "empty", value: 1 }]} dataKey="value" cx="50%" cy={half ? height - 6 : "50%"} innerRadius={inner} outerRadius={outer} startAngle={half ? 180 : 90} endAngle={half ? 0 : -270} stroke="none" isAnimationActive={false} rootTabIndex={-1}>
              <Cell fill="var(--track)" />
            </Pie>
          ) : (
            <Pie
              data={visible}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy={half ? height - 6 : "50%"}
              innerRadius={inner}
              outerRadius={outer}
              startAngle={half ? 180 : 90}
              endAngle={half ? 0 : -270}
              paddingAngle={visible.length > 1 ? (variant === "pie" ? 0.8 : 1.6) : 0}
              cornerRadius={variant === "pie" ? 0 : 3}
              stroke={variant === "pie" ? "var(--chart-tooltip)" : "none"}
              strokeWidth={variant === "pie" ? 1.5 : 0}
              shape={shape}
              isAnimationActive={chart.animate}
              animationDuration={600}
              rootTabIndex={-1}
              onMouseEnter={(d: { payload?: { key?: string } }) => setActive(d.payload?.key ?? null)}
            >
              {visible.map((s) => (
                <Cell key={s.key} fill={seriesColor(s.key)} />
              ))}
            </Pie>
          )}
        </PieChart>
        {centerNode ? (
          <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 flex flex-col items-center gap-1 text-center", half ? "bottom-1.5" : "inset-y-0 justify-center")}>
            {total === 0 && !activeSlice ? <span className="text-[12px] text-fg-muted">{chart.t("empty")}</span> : centerNode}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Legend list for a donut: a `<ul>` with swatch, label, value and share. Click hides a slice; focus highlights it. */
function DonutLegend() {
  const chart = useChart();
  const { active, setActive, raw } = useDonut();
  const slices = useSlices(raw);
  return (
    <ul data-slot="donut-legend" aria-label={chart.t("legend")} className="grid gap-0.5">
      {slices.map((s) => {
        const hidden = chart.isHidden(s.key);
        const locked = !hidden && chart.visibleSeries.length <= 1;
        return (
          <li key={s.key}>
            <button
              type="button"
              aria-pressed={!hidden}
              aria-disabled={locked || undefined}
              onClick={() => chart.toggleSeries(s.key)}
              onFocus={() => setActive(hidden ? null : s.key)}
              onBlur={() => setActive(null)}
              onMouseEnter={() => setActive(hidden ? null : s.key)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "flex h-8 w-full items-center gap-2.5 rounded-ui-sm px-2 text-start text-[13px] transition-[background-color,opacity] focus-ring hover:bg-hover",
                active === s.key && "bg-hover",
                hidden && "opacity-50",
              )}
            >
              <ChartIndicator color={seriesColor(s.key)} />
              <span className={cn("me-auto truncate text-fg", hidden && "line-through decoration-fg-subtle")}>{s.label}</span>
              <span className="font-mono text-[12.5px] text-fg tabular">{chart.formatSeries(s.key, s.value)}</span>
              <span className="w-11 text-end font-mono text-[12px] text-fg-subtle tabular">{hidden ? "—" : chart.f.percent(s.share)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}


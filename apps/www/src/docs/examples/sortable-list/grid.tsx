"use client";

import * as React from "react";
import { useFormat } from "@vamos-cms/ui";
import { SortableGrid } from "@vamos-cms/ui/sortable";

interface Tile {
  id: string;
  label: string;
  value: number;
  kind: "currency" | "number" | "percent";
  delta: number;
}

const initial: Tile[] = [
  { id: "mrr", label: "Monthly recurring revenue", value: 128400, kind: "currency", delta: 0.062 },
  { id: "pipeline", label: "Open pipeline", value: 1240000, kind: "currency", delta: 0.11 },
  { id: "win", label: "Win rate", value: 0.284, kind: "percent", delta: -0.013 },
  { id: "deals", label: "Deals closing this month", value: 23, kind: "number", delta: 0.21 },
  { id: "cycle", label: "Avg. sales cycle (days)", value: 41, kind: "number", delta: -0.08 },
  { id: "nps", label: "Customer NPS", value: 52, kind: "number", delta: 0.04 },
];

export default function SortableGridExample() {
  const [tiles, setTiles] = React.useState(initial);
  const format = useFormat();
  const show = (t: Tile) =>
    t.kind === "currency" ? format.currency(t.value, "USD", { notation: "compact" }) : t.kind === "percent" ? format.percent(t.value) : format.number(t.value);
  return (
    <SortableGrid
      aria-label="Dashboard widgets"
      className="w-full"
      minItemWidth="11rem"
      items={tiles}
      getLabel={(t) => t.label}
      onReorder={setTiles}
      renderItem={(t) => (
        <div className="flex h-full flex-col gap-2 p-3.5">
          <span className="text-xs text-fg-muted">{t.label}</span>
          <span className="tabular text-xl font-semibold tracking-tight">{show(t)}</span>
          <span className={t.delta >= 0 ? "tabular text-xs text-success" : "tabular text-xs text-danger"}>
            {t.delta >= 0 ? "▲" : "▼"} {format.percent(Math.abs(t.delta))} vs last month
          </span>
        </div>
      )}
    />
  );
}

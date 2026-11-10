"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = Array.from({ length: 30 }, (_, i) => {
  const base = 820 + Math.sin(i / 3.2) * 180 + i * 14;
  return { day: `Nov ${i + 1}`, visits: Math.round(base + ((i * 37) % 90)), reads: Math.round(base * 0.58 + ((i * 53) % 70)) };
});

const tooltip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--popover-border)", borderRadius: 10, boxShadow: "var(--popover-shadow)", fontSize: 12 },
  labelStyle: { color: "var(--fg-muted)" },
  itemStyle: { color: "var(--fg)" },
};

export default function AreaChartDemo() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--fg-subtle)", fontSize: 11 }} interval={4} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--fg-subtle)", fontSize: 11 }} width={56} tickFormatter={(v: number) => v.toLocaleString("en-US")} />
          <Tooltip cursor={{ stroke: "var(--field-border-hover)" }} {...tooltip} />
          <Area type="monotone" dataKey="visits" name="Visits" stroke="var(--accent-ink)" strokeWidth={2} fill="url(#area-fill)" />
          <Area type="monotone" dataKey="reads" name="Full reads" stroke="var(--chart-2)" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

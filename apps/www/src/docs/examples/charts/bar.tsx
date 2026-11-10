"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { stage: "Lead", deals: 64 }, { stage: "Qualified", deals: 41 }, { stage: "Proposal", deals: 23 },
  { stage: "Negotiation", deals: 12 }, { stage: "Won", deals: 8 },
];

export default function BarChartDemo() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis dataKey="stage" tickLine={false} axisLine={false} tick={{ fill: "var(--fg-subtle)", fontSize: 11 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--fg-subtle)", fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: "var(--hover)" }}
            contentStyle={{ background: "var(--popover)", border: "1px solid var(--popover-border)", borderRadius: 10, fontSize: 12 }}
            itemStyle={{ color: "var(--fg)" }}
          />
          <Bar dataKey="deals" name="Deals" fill="var(--chart-1)" radius={[6, 6, 2, 2]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

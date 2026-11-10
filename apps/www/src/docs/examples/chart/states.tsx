"use client";

import { Button } from "@vamos-ui/react";
import { BarChart, DonutChart, LineChart, type ChartConfig } from "@vamos-ui/react/charts";

const weeks = [
  { week: "W41", tickets: 142 },
  { week: "W42", tickets: 128 },
  { week: "W43", tickets: 167 },
  { week: "W44", tickets: 151 },
];
const config = { tickets: { label: "Tickets" } } satisfies ChartConfig;

export default function ChartStates() {
  return (
    <div className="grid w-full gap-6 sm:grid-cols-2">
      <Labelled label="loading — chart-shaped, no spinner">
        <BarChart title="Tickets" data={weeks} x="week" config={config} height="sm" state={{ status: "loading" }} />
      </Labelled>
      <Labelled label="refreshing — old data dimmed, thin bar">
        <LineChart title="Tickets" data={weeks} x="week" config={config} height="sm" state={{ status: "refreshing" }} />
      </Labelled>
      <Labelled label="empty — keeps its height">
        <BarChart
          title="Tickets"
          data={[]}
          x="week"
          config={config}
          height="sm"
          state={{ status: "empty", message: "No tickets in the last 7 days", action: <Button size="sm" variant="ghost">Widen range</Button> }}
        />
      </Labelled>
      <Labelled label="error — retry">
        <DonutChart title="Tickets by channel" data={[]} nameKey="channel" valueKey="tickets" config={{}} size="sm" state={{ status: "error", message: "The reporting service timed out.", onRetry: () => {} }} />
      </Labelled>
    </div>
  );
}

function Labelled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 font-mono text-[11px] text-fg-subtle">{label}</p>
      {children}
    </div>
  );
}

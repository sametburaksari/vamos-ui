"use client";

import * as React from "react";
import { Skeleton, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { PageTransition, SkeletonSwap, startPageTransition } from "@vamos-ui/react/motion";

type View = "overview" | "invoices" | "team";

const invoices = [
  { no: "INV-2026-0412", client: "Kestrel Bakery", due: "Nov 14", amount: "€1,240.00" },
  { no: "INV-2026-0413", client: "Harbor & Pine Hotels", due: "Nov 18", amount: "€6,875.50" },
  { no: "INV-2026-0414", client: "Sable Dental Clinic", due: "Nov 21", amount: "€980.00" },
];

// startPageTransition runs the switch as a View Transition where the browser has one (only the
// panel cross-fades); elsewhere PageTransition fades the new panel in. SkeletonSwap then
// cross-fades the loaded rows over their placeholder instead of popping them in.
export default function MotionTransitions() {
  const [view, setView] = React.useState<View>("overview");
  const [loading, setLoading] = React.useState(true);
  const panel = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (view !== "invoices") return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, [view]);

  return (
    <div className="flex w-full flex-col gap-5">
      <ToggleGroup aria-label="Section" value={view} onValueChange={(v) => v && startPageTransition(() => setView(v as View), { scope: panel.current })}>
        <ToggleGroupItem value="overview">Overview</ToggleGroupItem>
        <ToggleGroupItem value="invoices">Invoices</ToggleGroupItem>
        <ToggleGroupItem value="team">Team</ToggleGroupItem>
      </ToggleGroup>
      <div ref={panel} className="min-h-56 rounded-ui border border-line bg-surface p-6">
        <PageTransition pageKey={view}>
          {view === "overview" ? (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">November</p>
              <p className="font-display text-display-m tabular text-fg">€9,095.50</p>
              <p className="text-small text-fg-muted">invoiced across 3 clients · 2 paid, 1 due this week</p>
            </div>
          ) : view === "invoices" ? (
            <SkeletonSwap
              loading={loading}
              skeleton={
                <div className="flex flex-col">
                  {invoices.map((i) => (
                    <div key={i.no} className="flex items-center justify-between gap-4 border-b border-line py-3.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              }
            >
              <ul className="flex flex-col" aria-label="Open invoices">
                {invoices.map((i) => (
                  <li key={i.no} className="flex items-center justify-between gap-4 border-b border-line py-3">
                    <span className="min-w-0">
                      <span className="block text-small text-fg">{i.client}</span>
                      <span className="block font-mono text-[0.6875rem] text-fg-subtle">
                        {i.no} · due {i.due}
                      </span>
                    </span>
                    <span className="font-mono text-small tabular text-fg">{i.amount}</span>
                  </li>
                ))}
              </ul>
            </SkeletonSwap>
          ) : (
            <ul className="flex flex-col gap-3 text-small" aria-label="Team">
              <li className="flex justify-between"><span className="text-fg">Defne Arslan</span><span className="text-fg-muted">Accounts</span></li>
              <li className="flex justify-between"><span className="text-fg">Tomas Brandt</span><span className="text-fg-muted">Projects</span></li>
              <li className="flex justify-between"><span className="text-fg">Yuki Morita</span><span className="text-fg-muted">Design</span></li>
            </ul>
          )}
        </PageTransition>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Building2, CalendarClock } from "lucide-react";
import { Avatar, Badge, Toaster, useFormat } from "@vamos-cms/ui";
import { Kanban, KanbanCardFooter, KanbanCardMeta, KanbanCardTitle, applyKanbanMove, sumBy, weightedSum, type Stage } from "@vamos-cms/ui/sortable";

interface Deal {
  id: string;
  title: string;
  company: string;
  stage: string;
  value: string;
  owner: string;
  closeDate: string;
  hot?: boolean;
}

const stages: Stage[] = [
  { key: "qualified", label: "Qualified", tone: "chart-1", category: "open", probability: 0.1 },
  { key: "discovery", label: "Discovery", tone: "chart-2", category: "open", probability: 0.25 },
  { key: "proposal", label: "Proposal", tone: "chart-3", category: "active", probability: 0.5, wipLimit: 4 },
  { key: "negotiation", label: "Negotiation", tone: "chart-4", category: "active", probability: 0.75 },
  { key: "won", label: "Closed won", tone: "success", category: "done", probability: 1 },
];

const initial: Deal[] = [
  { id: "d-101", title: "Website relaunch", company: "Northwind Traders", stage: "qualified", value: "18500.00", owner: "Selin Kaya", closeDate: "2026-12-12" },
  { id: "d-102", title: "Loyalty app, phase 1", company: "Blue Harbor Coffee", stage: "qualified", value: "42000.00", owner: "Marco Silva", closeDate: "2027-01-20" },
  { id: "d-103", title: "POS rollout, 14 stores", company: "Urban Bakehouse", stage: "discovery", value: "63750.00", owner: "Selin Kaya", closeDate: "2026-12-30", hot: true },
  { id: "d-104", title: "Booking engine", company: "Lena Spa & Wellness", stage: "discovery", value: "9800.00", owner: "Ada Okafor", closeDate: "2026-11-28" },
  { id: "d-105", title: "Annual SEO retainer", company: "Kite Outdoor", stage: "proposal", value: "24000.00", owner: "Marco Silva", closeDate: "2026-12-05" },
  { id: "d-106", title: "Partner portal", company: "Fjord Logistics", stage: "proposal", value: "88000.00", owner: "Ada Okafor", closeDate: "2027-02-14", hot: true },
  { id: "d-107", title: "Menu QR + ordering", company: "Olive & Thyme", stage: "proposal", value: "6400.00", owner: "Selin Kaya", closeDate: "2026-11-21" },
  { id: "d-108", title: "Data migration", company: "Meridian Clinics", stage: "negotiation", value: "31200.00", owner: "Ada Okafor", closeDate: "2026-11-30" },
  { id: "d-109", title: "Brand refresh", company: "Studio Parallel", stage: "won", value: "15000.00", owner: "Marco Silva", closeDate: "2026-11-02" },
];

export default function KanbanDemo() {
  const [deals, setDeals] = React.useState(initial);
  const format = useFormat();
  const money = (v: string) => format.currency(v, { currency: "USD" }, { maximumFractionDigits: 0 });
  return (
    <div className="w-full">
      <Toaster />
      <Kanban
        aria-label="Sales pipeline"
        stages={stages}
        items={deals}
        getStageKey={(d) => d.stage}
        getLabel={(d) => `${d.company} — ${d.title}`}
        summary={(items, stage) => (
          <>
            {money(sumBy(items, (d) => d.value))}
            {stage.category !== "done" ? <span className="text-fg-subtle"> · weighted {money(weightedSum(items, stage, (d) => d.value))}</span> : null}
          </>
        )}
        onMove={(e) =>
          setDeals((all) => applyKanbanMove(all, e, { getId: (d) => d.id, getStageKey: (d) => d.stage, update: (d, stage) => ({ ...d, stage }) }))
        }
        renderCard={(d) => (
          <>
            <KanbanCardTitle>
              <a href={`#deal-${d.id}`}>{d.title}</a>
            </KanbanCardTitle>
            <KanbanCardMeta>
              <span className="inline-flex min-w-0 items-center gap-1">
                <Building2 aria-hidden className="size-3.5 shrink-0" />
                <span className="truncate">{d.company}</span>
              </span>
            </KanbanCardMeta>
            <KanbanCardFooter>
              <span className="flex items-center gap-1.5">
                <span className="tabular text-[13px] font-semibold">{money(d.value)}</span>
                {d.hot ? <Badge tone="warning">Hot</Badge> : null}
              </span>
              <span className="flex items-center gap-2 text-xs text-fg-subtle">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock aria-hidden className="size-3.5" />
                  {format.date(d.closeDate, { month: "short", day: "numeric" })}
                </span>
                <Avatar name={d.owner} size="xs" />
              </span>
            </KanbanCardFooter>
          </>
        )}
      />
    </div>
  );
}

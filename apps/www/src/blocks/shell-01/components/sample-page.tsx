"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  PageHeader,
  Stat,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@vamos-ui/react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";
interface Kpi { label: string; value: number | string; format?: "number" | "integer" | "percent" | "compact" | { type: "compact-currency"; currency: string }; delta?: number; lowerIsBetter?: boolean }
interface Row { title: string; sub: string; person: string; status: string; tone: Tone; value: string }
interface Sample { title: string; description: string; action: string; kpis: Kpi[]; table: string; columns: [string, string, string, string]; rows: Row[] }

const TRY = { type: "compact-currency", currency: "TRY" } as const;

/** Demo content per app, so the shell opens on a real-looking screen instead of an empty slot. */
const samples: Record<string, Sample> = {
  site: {
    title: "Content",
    description: "Drafts, scheduled posts and what readers opened this week.",
    action: "New post",
    kpis: [
      { label: "Visitors · 7 days", value: 18420, format: "compact", delta: 0.12 },
      { label: "Published", value: 46, format: "integer", delta: 0.08 },
      { label: "Scheduled", value: 5, format: "integer" },
      { label: "Form replies", value: 12, format: "integer", delta: -0.14 },
    ],
    table: "Recent posts",
    columns: ["Post", "Author", "Status", "Views"],
    rows: [
      { title: "Winter opening hours", sub: "News · 2 min read", person: "Deniz Arslan", status: "Scheduled", tone: "info", value: "—" },
      { title: "How we pack fragile orders", sub: "Guides · 5 min read", person: "Mara Fischer", status: "Published", tone: "success", value: "2,184" },
      { title: "Ceramics care sheet", sub: "Guides · 3 min read", person: "Emre Kaya", status: "Draft", tone: "neutral", value: "—" },
      { title: "Autumn collection notes", sub: "Journal · 4 min read", person: "Selin Aydın", status: "Published", tone: "success", value: "1,302" },
      { title: "Shipping to the EU", sub: "Help · 2 min read", person: "Deniz Arslan", status: "Needs review", tone: "warning", value: "—" },
    ],
  },
  crm: {
    title: "Pipeline",
    description: "Open deals by stage. Seven need a next step this week.",
    action: "New deal",
    kpis: [
      { label: "Open pipeline", value: 4_860_000, format: TRY, delta: 0.09 },
      { label: "Weighted forecast", value: 1_942_500, format: TRY, delta: 0.04 },
      { label: "Win rate · 90 days", value: 0.31, format: "percent", delta: 0.02 },
      { label: "Avg. days to close", value: 38, format: "integer", delta: -0.06, lowerIsBetter: true },
    ],
    table: "Deals that need a next step",
    columns: ["Deal", "Owner", "Stage", "Value"],
    rows: [
      { title: "Northpoint · fleet renewal", sub: "Close Dec 12", person: "Selin Aydın", status: "Negotiation", tone: "warning", value: "₺1,240,000" },
      { title: "Halden Works · 40 seats", sub: "Close Dec 3", person: "Emre Kaya", status: "Proposal", tone: "info", value: "₺612,000" },
      { title: "Brightmoor Foods · pilot", sub: "Close Jan 15", person: "Deniz Arslan", status: "Qualified", tone: "neutral", value: "₺184,500" },
      { title: "Corvane Health · rollout", sub: "Close Nov 28", person: "Selin Aydın", status: "Verbal yes", tone: "success", value: "₺930,000" },
      { title: "Ridgeway Logistics · API", sub: "No activity 9 days", person: "Mara Fischer", status: "Stalled", tone: "danger", value: "₺356,000" },
    ],
  },
  people: {
    title: "Team",
    description: "Who is in today, open leave requests and upcoming starts.",
    action: "Add employee",
    kpis: [
      { label: "Headcount", value: 84, format: "integer", delta: 0.05 },
      { label: "In office today", value: 61, format: "integer" },
      { label: "Leave requests", value: 3, format: "integer" },
      { label: "Attrition · 12 mo", value: 0.07, format: "percent", delta: -0.01, lowerIsBetter: true },
    ],
    table: "Leave requests",
    columns: ["Employee", "Manager", "Status", "Days"],
    rows: [
      { title: "Emre Kaya", sub: "Annual leave · Dec 22 – Jan 2", person: "Selin Aydın", status: "Pending", tone: "warning", value: "8" },
      { title: "Mara Fischer", sub: "Training · Dec 4 – 5", person: "Deniz Arslan", status: "Approved", tone: "success", value: "2" },
      { title: "Okan Demir", sub: "Sick leave · Nov 10", person: "Selin Aydın", status: "Recorded", tone: "info", value: "1" },
      { title: "Ece Yıldız", sub: "Annual leave · Feb 9 – 13", person: "Emre Kaya", status: "Pending", tone: "warning", value: "5" },
    ],
  },
  work: {
    title: "Projects",
    description: "Active projects, budget used and what is due next.",
    action: "New project",
    kpis: [
      { label: "Active projects", value: 14, format: "integer" },
      { label: "Hours this week", value: 412, format: "integer", delta: 0.03 },
      { label: "Budget used", value: 0.62, format: "percent" },
      { label: "Unbilled", value: 286_400, format: TRY, delta: 0.11, lowerIsBetter: true },
    ],
    table: "Due next",
    columns: ["Project", "Lead", "Health", "Due"],
    rows: [
      { title: "Northpoint web relaunch", sub: "Milestone · Design sign-off", person: "Deniz Arslan", status: "On track", tone: "success", value: "Nov 21" },
      { title: "Halden Works portal", sub: "Milestone · Beta", person: "Emre Kaya", status: "At risk", tone: "warning", value: "Nov 28" },
      { title: "Corvane intranet", sub: "Milestone · Content import", person: "Mara Fischer", status: "On track", tone: "success", value: "Dec 5" },
      { title: "Brightmoor app", sub: "Milestone · Store review", person: "Selin Aydın", status: "Blocked", tone: "danger", value: "Dec 9" },
    ],
  },
};

export function SamplePage({ appId }: { appId: string | undefined }) {
  const s = samples[appId ?? "crm"] ?? samples.crm!;
  return (
    <div className="grid gap-6">
      <PageHeader
        title={s.title}
        description={s.description}
        actions={<Button size="sm"><Plus aria-hidden /> {s.action}</Button>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {s.kpis.map((k) => (
          <Stat
              key={k.label}
              label={k.label}
              value={k.value}
              format={k.format}
              delta={k.delta}
              deltaKind={k.delta === undefined ? undefined : "percent"}
              intent={k.lowerIsBetter ? "lower-is-better" : "higher-is-better"}
            />
        ))}
      </div>
      <Card className="overflow-hidden p-0">
        <h2 id={`${appId ?? "crm"}-table`} className="px-4 pb-1 pt-4 text-[14px] font-medium text-fg">{s.table}</h2>
        <Table aria-labelledby={`${appId ?? "crm"}-table`}>
          <TableHeader>
            <TableRow>
              <TableHead>{s.columns[0]}</TableHead>
              <TableHead className="max-sm:hidden">{s.columns[1]}</TableHead>
              <TableHead>{s.columns[2]}</TableHead>
              <TableHead className="text-end">{s.columns[3]}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {s.rows.map((r) => (
              <TableRow key={r.title}>
                <TableCell>
                  <div className="font-medium text-fg">{r.title}</div>
                  <div className="text-[12.5px] text-fg-subtle">{r.sub}</div>
                </TableCell>
                <TableCell className="max-sm:hidden">
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={r.person} size="sm" />
                    <span className="text-fg-muted">{r.person}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <Badge tone={r.tone === "neutral" ? undefined : r.tone}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-end tabular">{r.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

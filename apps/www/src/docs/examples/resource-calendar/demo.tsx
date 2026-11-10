"use client";

import * as React from "react";
import { Toaster } from "@vamos-cms/ui";
import { ResourceCalendar, type ResourceBlock, type ResourceBlocksChange, type ResourceTemplate } from "@vamos-cms/ui/scheduler";

const staff = [
  { id: "ayse", title: "Ayşe Demir", meta: "Head chef", group: "Kitchen" },
  { id: "liam", title: "Liam Carter", meta: "Sous chef", group: "Kitchen" },
  { id: "can", title: "Can Öztürk", meta: "Line cook", group: "Kitchen" },
  { id: "noor", title: "Noor Haddad", meta: "Host", group: "Front of house" },
  { id: "marta", title: "Marta Silva", meta: "Server", group: "Front of house" },
  { id: "emre", title: "Emre Yıldız", meta: "Bartender", group: "Front of house" },
];

const templates: ResourceTemplate[] = [
  { id: "morning", label: "Morning", start: "07:00", end: "15:00", tone: "chart-2", code: "M" },
  { id: "evening", label: "Evening", start: "15:00", end: "23:00", tone: "chart-4", code: "E" },
  { id: "double", label: "Split", start: "11:00", end: "19:00", tone: "chart-3", code: "S" },
];

const at = (day: string, time: string) => new Date(`${day}T${time}:00+03:00`).toISOString();
const shift = (id: string, resourceId: string, day: string, t: ResourceTemplate): ResourceBlock => ({
  id, resourceId, label: t.label, tone: t.tone, kind: t.id, start: at(day, t.start!), end: at(day, t.end!),
});
const [M, E, S] = templates as [ResourceTemplate, ResourceTemplate, ResourceTemplate];

const initial: ResourceBlock[] = [
  shift("1", "ayse", "2026-11-09", M), shift("2", "ayse", "2026-11-10", M), shift("3", "ayse", "2026-11-11", S),
  shift("4", "liam", "2026-11-09", E), shift("5", "liam", "2026-11-10", E), shift("6", "liam", "2026-11-12", M),
  shift("7", "can", "2026-11-11", E), shift("8", "can", "2026-11-12", E), shift("9", "can", "2026-11-13", E),
  shift("10", "noor", "2026-11-13", E), shift("11", "noor", "2026-11-14", E), shift("12", "marta", "2026-11-14", S),
  shift("13", "emre", "2026-11-13", E), shift("14", "emre", "2026-11-14", E),
  { id: "15", resourceId: "marta", start: "2026-11-10", end: "2026-11-11", label: "Annual leave", kind: "leave", tone: "neutral" },
];

function applyChange(list: ResourceBlock[], c: ResourceBlocksChange) {
  const del = new Set(c.deleted ?? []);
  const upd = new Map((c.updated ?? []).map((b) => [b.id, b]));
  return [...list.filter((b) => !del.has(b.id)).map((b) => upd.get(b.id) ?? b), ...(c.created ?? [])];
}

export default function ResourceCalendarDemo() {
  const [blocks, setBlocks] = React.useState(initial);
  const [range, setRange] = React.useState({ start: "2026-11-09", end: "2026-11-15" });
  const hours = (list: ResourceBlock[]) => list.filter((b) => !/^\d{4}-\d{2}-\d{2}$/.test(b.start)).reduce((s, b) => s + (Date.parse(b.end) - Date.parse(b.start)) / 3_600_000, 0);
  return (
    <>
      <ResourceCalendar
        className="w-full"
        resources={staff}
        blocks={blocks}
        range={range}
        onRangeChange={setRange}
        templates={templates}
        groupBy="group"
        timeZone="Europe/Istanbul"
        height="28rem"
        rowSummary={(_, own) => `${hours(own)} h`}
        onBlocksChange={(c) => setBlocks((l) => applyChange(l, c))}
      />
      <Toaster />
    </>
  );
}

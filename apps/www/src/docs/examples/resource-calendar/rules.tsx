"use client";

import * as React from "react";
import { ResourceCalendar, maxConcurrentRule, maxHoursRule, minRestRule, type ResourceBlock } from "@vamos-ui/react/scheduler";

// Example dataset: Turkish labour-law values (11 h rest between shifts, 45 h week).
// The kit ships the rule mechanism; the values are yours.
const rules = [minRestRule(11 * 60), maxHoursRule(45 * 60), maxConcurrentRule(1, ["leave"])];

const at = (day: string, time: string) => new Date(`${day}T${time}:00+03:00`).toISOString();
const s = (id: string, resourceId: string, day: string, from: string, to: string, label: string, tone: ResourceBlock["tone"]): ResourceBlock => ({ id, resourceId, start: at(day, from), end: to < from ? at(nextDay(day), to) : at(day, to), label, tone });
const nextDay = (d: string) => new Date(Date.parse(`${d}T12:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

const people = [
  { id: "k", title: "Kerem Polat", meta: "Warehouse" },
  { id: "l", title: "Mara Fischer", meta: "Warehouse" },
  { id: "m", title: "Murat Çelik", meta: "Dispatch" },
];

const blocks: ResourceBlock[] = [
  s("1", "k", "2026-11-09", "14:00", "22:00", "Late", "chart-4"),
  s("2", "k", "2026-11-10", "06:00", "14:00", "Early", "chart-2"), // only 8 h rest
  ...["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-14"].map((d, i) => s(`l${i}`, "l", d, "08:00", "17:00", "Day", "chart-1")), // 54 h
  { id: "o1", resourceId: "m", start: "2026-11-12", end: "2026-11-12", label: "Annual leave", kind: "leave", tone: "neutral" },
  { id: "o2", resourceId: "k", start: "2026-11-12", end: "2026-11-12", label: "Sick", kind: "leave", tone: "danger" },
];

export default function ResourceCalendarRules() {
  return <ResourceCalendar className="w-full" resources={people} blocks={blocks} range={{ start: "2026-11-09", end: "2026-11-15" }} rules={rules} timeZone="Europe/Istanbul" />;
}

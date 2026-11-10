"use client";

import * as React from "react";
import { ResourceCalendar, type ResourceBlock, type ResourceBlocksChange } from "@vamos-ui/react/scheduler";

const rooms = [
  { id: "r1", title: "Treatment room 1", meta: "Massage" },
  { id: "r2", title: "Treatment room 2", meta: "Facial" },
  { id: "r3", title: "Hammam", meta: "Up to 4 guests" },
  { id: "r4", title: "Couples suite", meta: "Massage · 2 beds" },
];

const at = (time: string) => new Date(`2026-11-10T${time}:00+03:00`).toISOString();
const initial: ResourceBlock[] = [
  { id: "1", resourceId: "r1", start: at("09:00"), end: at("10:30"), label: "Deep tissue · Elif K.", tone: "chart-2" },
  { id: "2", resourceId: "r1", start: at("13:00"), end: at("14:00"), label: "Swedish · Jonas W.", tone: "chart-2" },
  { id: "3", resourceId: "r2", start: at("10:00"), end: at("11:00"), label: "Hydrafacial · Aylin", tone: "chart-3" },
  { id: "4", resourceId: "r3", start: at("11:00"), end: at("13:00"), label: "Group ritual", tone: "chart-4", status: "pending" },
  { id: "5", resourceId: "r4", start: at("16:00"), end: at("18:00"), label: "Anniversary package", tone: "chart-5" },
];

export default function ResourceCalendarHours() {
  const [blocks, setBlocks] = React.useState(initial);
  const apply = (c: ResourceBlocksChange) =>
    setBlocks((l) => [...l.filter((b) => !c.deleted?.includes(b.id)).map((b) => c.updated?.find((u) => u.id === b.id) ?? b), ...(c.created ?? [])]);
  return (
    <ResourceCalendar
      className="w-full"
      unit="hour"
      hours={{ start: "09:00", end: "20:00" }}
      resources={rooms}
      blocks={blocks}
      range={{ start: "2026-11-10", end: "2026-11-10" }}
      templates={[{ id: "book", label: "1 h booking", tone: "accent" }]}
      timeZone="Europe/Istanbul"
      summary={false}
      onBlocksChange={apply}
    />
  );
}

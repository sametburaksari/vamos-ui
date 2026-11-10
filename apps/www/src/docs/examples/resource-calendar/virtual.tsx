"use client";

import * as React from "react";
import { ResourceCalendar, type ResourceBlock } from "@vamos-cms/ui/scheduler";

const first = ["Ada", "Burak", "Chloe", "Derya", "Ethan", "Fatma", "Gabriel", "Hira", "Ivan", "Julia", "Kaan", "Lucía"];
const last = ["Yılmaz", "Morgan", "Şahin", "Novak", "Kaya", "Bauer", "Doğan", "Rossi", "Aksoy", "Lindgren"];
const people = Array.from({ length: 300 }, (_, i) => ({ id: `u${i}`, title: `${first[i % first.length]} ${last[(i * 7) % last.length]}`, meta: `Store ${100 + (i % 24)}` }));

const blocks: ResourceBlock[] = people.flatMap((p, i) =>
  [0, 1, 2, 3, 4].filter((d) => (i + d) % 3 !== 0).map((d) => ({
    id: `${p.id}-${d}`,
    resourceId: p.id,
    start: `2026-11-${String(9 + d).padStart(2, "0")}`,
    end: `2026-11-${String(9 + d).padStart(2, "0")}`,
    label: (i + d) % 2 ? "Opening" : "Closing",
    tone: (i + d) % 2 ? "chart-2" : "chart-4",
  })),
);

/** 300 people: rows are virtualized (only what's on screen renders). */
export default function ResourceCalendarVirtual() {
  return <ResourceCalendar className="w-full" resources={people} blocks={blocks} range={{ start: "2026-11-09", end: "2026-11-15" }} height="26rem" />;
}

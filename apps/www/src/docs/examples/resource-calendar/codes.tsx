"use client";

import * as React from "react";
import { ResourceCalendar, type ResourceBlock, type ResourceTemplate } from "@vamos-ui/react/scheduler";

const codes: ResourceTemplate[] = [
  { id: "w", label: "Worked", code: "W", tone: "chart-2" },
  { id: "r", label: "Remote", code: "R", tone: "chart-1" },
  { id: "l", label: "Leave", code: "L", tone: "chart-3" },
  { id: "s", label: "Sick", code: "S", tone: "danger" },
];

const people = ["Olivia Brooks", "Deniz Koç", "Rafael Costa", "Ines Moreau"].map((title, i) => ({ id: `p${i}`, title }));
const days = Array.from({ length: 14 }, (_, i) => `2026-11-${String(i + 2).padStart(2, "0")}`);
const pattern = ["W", "W", "R", "W", "W", "", "", "W", "L", "L", "W", "R", "", ""];

const initial: ResourceBlock[] = people.flatMap((p, pi) =>
  days.flatMap((d, di) => {
    const code = pi === 2 && di === 3 ? "S" : pattern[(di + pi) % pattern.length]!;
    const tpl = codes.find((c) => c.code === code);
    return tpl ? [{ id: `${p.id}-${d}`, resourceId: p.id, start: d, end: d, code, label: tpl.label, tone: tpl.tone }] : [];
  }),
);

export default function ResourceCalendarCodes() {
  const [blocks, setBlocks] = React.useState(initial);
  return (
    <div className="grid w-full gap-2">
      <p className="text-[13px] text-fg-muted">Focus a cell and type W, R, L or S to set it. Shift + arrows select a range, Delete clears it.</p>
      <ResourceCalendar
        variant="codes"
        resources={people}
        blocks={blocks}
        range={{ start: days[0]!, end: days.at(-1)! }}
        templates={codes}
        summary={(_, list) => list.filter((b) => b.code === "W" || b.code === "R").length || ""}
        onBlocksChange={(c) => setBlocks((l) => [...l.filter((b) => !c.deleted?.includes(b.id)).map((b) => c.updated?.find((u) => u.id === b.id) ?? b), ...(c.created ?? [])])}
      />
    </div>
  );
}

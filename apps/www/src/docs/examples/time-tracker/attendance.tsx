"use client";

import * as React from "react";
import { LocaleProvider } from "@vamos-ui/react";
import { ResourceCalendar, type ResourceBlock, type ResourceTemplate } from "@vamos-ui/react/scheduler";

// tr attendance dataset (puantaj): Ç çalıştı, İ izin, R rapor, HT hafta tatili, RT resmî tatil, Ü ücretsiz izin.
const codes: ResourceTemplate[] = [
  { id: "c", label: "Çalıştı", code: "Ç", tone: "chart-2" },
  { id: "i", label: "Yıllık izin", code: "İ", tone: "chart-3" },
  { id: "r", label: "Rapor", code: "R", tone: "danger" },
  { id: "ht", label: "Hafta tatili", code: "HT", shortcut: "h", tone: "neutral" },
  { id: "rt", label: "Resmî tatil", code: "RT", shortcut: "t", tone: "warning" },
  { id: "u", label: "Ücretsiz izin", code: "Ü", tone: "chart-5" },
];

const staff = ["Zeynep Acar", "Hakan Er", "Gül Şimşek", "Oğuz Tan", "Pınar Uysal"].map((title, i) => ({ id: `s${i}`, title }));
const days = Array.from({ length: 31 }, (_, i) => `2026-10-${String(i + 1).padStart(2, "0")}`);
const weekday = (d: string) => new Date(`${d}T12:00:00Z`).getUTCDay();

const initial: ResourceBlock[] = staff.flatMap((s, si) =>
  days.map((d, di) => {
    const code = d === "2026-10-29" ? "RT" : weekday(d) === 0 || weekday(d) === 6 ? "HT" : si === 1 && di >= 12 && di <= 16 ? "İ" : si === 3 && di === 7 ? "R" : "Ç";
    const t = codes.find((c) => c.code === code)!;
    return { id: `${s.id}-${d}`, resourceId: s.id, start: d, end: d, code, label: t.label, tone: t.tone };
  }),
);

export default function TimeTrackerAttendance() {
  const [blocks, setBlocks] = React.useState(initial);
  return (
    <LocaleProvider locale="tr-TR">
      <ResourceCalendar
        className="w-full"
        variant="codes"
        resources={staff}
        blocks={blocks}
        range={{ start: days[0]!, end: days.at(-1)! }}
        templates={codes}
        rowSummary={(_, own) => own.filter((b) => b.code === "Ç").length}
        summary={(_, list) => list.filter((b) => b.code === "Ç").length || ""}
        onBlocksChange={(c) => setBlocks((l) => [...l.filter((b) => !c.deleted?.includes(b.id)), ...(c.created ?? [])])}
      />
    </LocaleProvider>
  );
}

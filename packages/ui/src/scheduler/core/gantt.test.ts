import { describe, expect, it } from "vitest";
import { createsCycle, detectCycles, flattenTasks, linkViolations, rollupSummaries, scheduleForward, taskDuration, visibleTasks } from "./gantt";
import { trWorkCalendar } from "../../locale-data/tr";

const tasks = [
  { id: "p", title: "Website", start: "2026-11-02", end: "2026-11-02" },
  { id: "a", parentId: "p", title: "Discovery", start: "2026-11-02", end: "2026-11-06", progress: 1 },
  { id: "b", parentId: "p", title: "Design", start: "2026-11-04", end: "2026-11-13", progress: 0.5 },
  { id: "m", title: "Launch", start: "2026-11-20", end: "2026-11-20", type: "milestone" as const },
];

describe("gantt core", () => {
  it("flattens a tree with WBS numbers and hides collapsed children", () => {
    const flat = flattenTasks(tasks);
    expect(flat.map((r) => `${r.wbs}:${r.task.id}`)).toEqual(["1:p", "1.1:a", "1.2:b", "2:m"]);
    expect(visibleTasks(flat, new Set(["p"])).map((r) => r.task.id)).toEqual(["p", "m"]);
  });

  it("rolls summaries up from children", () => {
    const p = rollupSummaries(tasks).find((t) => t.id === "p")!;
    expect(p).toMatchObject({ start: "2026-11-02", end: "2026-11-13", type: "summary" });
    expect(p.progress).toBeCloseTo((5 * 1 + 10 * 0.5) / 15);
  });

  it("detects cycles", () => {
    expect(detectCycles([{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "a" }])).toEqual([["a", "b", "c"]]);
    expect(createsCycle([{ from: "a", to: "b" }], "b", "a")).toBe(true);
    expect(createsCycle([{ from: "a", to: "b" }], "a", "c")).toBe(false);
  });

  it("pushes FS successors past the predecessor, skipping weekends and Turkish holidays", () => {
    // Design (5 working days) after Discovery ending Wed 28 Oct (half day) → starts Fri 30 Oct (29 Oct is Republic Day).
    const plan = [
      { id: "a", start: "2026-10-26", end: "2026-10-28" },
      { id: "b", start: "2026-10-27", end: "2026-11-02" },
    ];
    const out = scheduleForward(plan, [{ id: "l", from: "a", to: "b" }], trWorkCalendar);
    expect(out[0]).toBe(plan[0]);
    expect(out[1]).toMatchObject({ start: "2026-10-30" });
    expect(taskDuration(out[1]!, trWorkCalendar)).toBe(taskDuration(plan[1]!, trWorkCalendar));
    expect(linkViolations(plan, [{ id: "l", from: "a", to: "b" }]).has("l")).toBe(true);
    expect(linkViolations(out, [{ id: "l", from: "a", to: "b" }]).size).toBe(0);
  });
});

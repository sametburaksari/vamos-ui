"use client";

import * as React from "react";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
  ToggleGroup,
  ToggleGroupItem,
  cn,
  useFormat,
} from "@vamos-ui/react";
import { TODAY, absences, leaveTypes, type Absence, type Department, type LeaveType } from "./data";

/** Two weeks starting on the Monday of the current week (YYYY-MM-DD, built in UTC to avoid DST drift). */
function fortnight(start: string): string[] {
  const [y, m, d] = start.split("-").map(Number) as [number, number, number];
  return Array.from({ length: 14 }, (_, i) => new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10));
}

const DAYS = fortnight("2026-11-09");
const isWeekend = (day: string) => {
  const w = new Date(`${day}T12:00:00Z`).getUTCDay();
  return w === 0 || w === 6;
};
const covers = (a: Absence, day: string) => a.from <= day && day <= a.to;

type Filter = "all" | Department;

/**
 * Who is out over the next two weeks. A real table: people are row headers, days are column
 * headers, and every booked cell names its leave type for screen readers.
 */
export function LeaveStrip() {
  const f = useFormat();
  const [dept, setDept] = React.useState<Filter>("all");
  const rows = absences.filter((a) => dept === "all" || a.department === dept);
  const outToday = absences.filter((a) => covers(a, TODAY)).length;
  const used = new Set<LeaveType>(rows.map((r) => r.type));

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "240ms" }}>
      <CardHeader
        titleAs="h2"
        title="Who's out"
        description={`${outToday} people away today · ${f.dateRange(DAYS[0]!, DAYS[13]!, { month: "short", day: "numeric" })}`}
        action={
          <ToggleGroup aria-label="Filter by department" size="sm" value={dept} onValueChange={(v) => setDept(v as Filter)}>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="Engineering">Eng</ToggleGroupItem>
            <ToggleGroupItem value="Sales">Sales</ToggleGroupItem>
            <ToggleGroupItem value="Operations">Ops</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <TableContainer className="border-y border-line">
        <Table density="compact" hover={false} bordered="none" stickyFirstColumn layout="fixed" className="min-w-[680px]">
          <TableCaption visuallyHidden>Leave calendar, November 9 to 22, 2026</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: 200 }}>Person</TableHead>
              {DAYS.map((day) => {
                const today = day === TODAY;
                return (
                  <TableHead key={day} align="center" className={cn("px-0", isWeekend(day) && "bg-surface-2")} aria-current={today ? "date" : undefined}>
                    <abbr title={f.date(day, { weekday: "long", month: "long", day: "numeric" })} className="grid justify-items-center gap-0.5 no-underline">
                      <span className="text-[10.5px] font-normal text-fg-subtle">{f.date(day, { weekday: "narrow" })}</span>
                      <span className={cn("grid size-6 place-items-center rounded-full font-mono text-xs tabular", today ? "bg-accent font-semibold text-accent-fg" : "text-fg-muted")}>
                        {f.date(day, { day: "numeric" })}
                      </span>
                    </abbr>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={15} title="Everyone's in" description="No leave booked in this department for the next two weeks." />
            ) : (
              rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell rowHeader>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={a.name} size="sm" aria-hidden />
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-fg">{a.name}</div>
                        <div className="truncate text-[11.5px] text-fg-subtle">{a.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  {DAYS.map((day, i) => {
                    const on = covers(a, day);
                    const startsHere = on && (i === 0 || !covers(a, DAYS[i - 1]!));
                    const endsHere = on && (i === DAYS.length - 1 || !covers(a, DAYS[i + 1]!));
                    return (
                      <TableCell key={day} className={cn("px-0", isWeekend(day) && "bg-surface-2")}>
                        {on ? (
                          <span
                            className={cn(
                              "block h-5",
                              leaveTypes[a.type].className,
                              isWeekend(day) && "opacity-40",
                              startsHere ? "ms-1 rounded-s-full" : "",
                              endsHere ? "me-1 rounded-e-full" : "",
                            )}
                          >
                            <span className="sr-only">{leaveTypes[a.type].label}</span>
                          </span>
                        ) : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex flex-wrap items-center justify-between gap-3 px-(--card-p) py-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-fg-muted" aria-label="Legend">
          {(Object.keys(leaveTypes) as LeaveType[]).map((t) => (
            <li key={t} className={cn("inline-flex items-center gap-1.5", !used.has(t) && "opacity-50")}>
              <span aria-hidden className={cn("size-2.5 rounded-full", leaveTypes[t].className)} />
              {leaveTypes[t].label}
            </li>
          ))}
        </ul>
        <Button variant="link" size="sm">Open leave calendar</Button>
      </div>
    </Card>
  );
}

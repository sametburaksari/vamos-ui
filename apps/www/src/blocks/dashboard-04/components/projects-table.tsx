"use client";

import * as React from "react";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  CardHeader,
  Progress,
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
  type BadgeProps,
} from "@vamos-ui/react";
import { projects, type ProjectStatus } from "./data";

const statusTone: Record<ProjectStatus, BadgeProps["tone"]> = {
  "On track": "success",
  "At risk": "warning",
  Blocked: "danger",
  Done: "neutral",
};

type View = "active" | "attention" | "all";

const views: Record<View, (s: ProjectStatus) => boolean> = {
  active: (s) => s !== "Done",
  attention: (s) => s === "At risk" || s === "Blocked",
  all: () => true,
};

/** Delivery status per project: completion against budget burn, so overruns stand out. */
export function ProjectsTable() {
  const f = useFormat();
  const [view, setView] = React.useState<View>("active");
  const rows = projects.filter((p) => views[view](p.status));
  const money = (v: string) => f.currency(v, { currency: "USD" }, { notation: "compact", minimumFractionDigits: 0, maximumFractionDigits: 1 });

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "300ms" }}>
      <CardHeader
        titleAs="h2"
        title="Projects"
        description="Completion vs budget burn"
        action={
          <ToggleGroup aria-label="Filter projects" size="sm" value={view} onValueChange={(v) => setView(v as View)}>
            <ToggleGroupItem value="active">Active</ToggleGroupItem>
            <ToggleGroupItem value="attention">Needs attention</ToggleGroupItem>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <TableContainer className="border-t border-line">
        <Table>
          <TableCaption visuallyHidden>Projects with status, completion, budget and due date</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="max-md:hidden" style={{ width: 150 }}>Progress</TableHead>
              <TableHead className="max-lg:hidden">Budget</TableHead>
              <TableHead className="max-sm:hidden">Due</TableHead>
              <TableHead className="max-md:hidden">Team</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={6} title="Nothing needs attention" description="Every active project is on track." />
            ) : (
              rows.map((p) => {
                const burn = Number(p.spent) / Number(p.budget);
                const over = p.status !== "Done" && burn * 100 > p.progress + 15;
                return (
                  <TableRow key={p.id}>
                    <TableCell rowHeader>
                      <a href={`#${p.id}`} className="block rounded-ui-sm font-medium text-fg hover:underline focus-ring">{p.name}</a>
                      <div className="text-xs text-fg-subtle">{p.client}</div>
                    </TableCell>
                    <TableCell><Badge tone={statusTone[p.status]} dot>{p.status}</Badge></TableCell>
                    <TableCell className="max-md:hidden">
                      <div className="flex w-full items-center gap-2.5">
                        <Progress value={p.progress} size="xs" aria-label={`${p.name} completion`} className="flex-1" />
                        <span aria-hidden className="w-9 text-end font-mono text-xs text-fg-muted tabular">{p.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap max-lg:hidden">
                      <span className={cn("font-mono text-[13px] tabular", over ? "text-warning" : "text-fg")}>{money(p.spent)}</span>
                      <span className="text-xs text-fg-subtle"> of {money(p.budget)}</span>
                      {over ? <span className="sr-only"> (spending ahead of progress)</span> : null}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-fg-muted tabular max-sm:hidden">{f.date(p.due, { month: "short", day: "numeric" })}</TableCell>
                    <TableCell className="max-md:hidden">
                      <AvatarGroup max={3} size="xs" aria-label={`Team: ${f.list(p.team)}`}>
                        {p.team.map((name) => <Avatar key={name} name={name} />)}
                      </AvatarGroup>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

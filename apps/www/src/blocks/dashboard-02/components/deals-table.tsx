"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
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
  Tooltip,
  useFormat,
  type BadgeProps,
} from "@vamos-ui/react";
import { deals, type Deal, type DealStage } from "./data";

type View = "all" | "mine" | "risk";

const stageTone: Record<DealStage, BadgeProps["tone"]> = {
  Qualified: "neutral",
  "Demo held": "info",
  Proposal: "warning",
  Negotiation: "accent",
  Won: "success",
};

const filters: Record<View, (d: Deal) => boolean> = {
  all: () => true,
  mine: (d) => !!d.mine,
  risk: (d) => !!d.risk,
};

/** Deals with a close date this month; a segmented filter narrows the rows. */
export function DealsTable() {
  const f = useFormat();
  const [view, setView] = React.useState<View>("all");
  const rows = deals.filter(filters[view]);
  const total = rows.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "300ms" }}>
      <CardHeader titleAs="h2"
        title="Closing this month"
        description={`${rows.length} deals · ${f.currency(total, { currency: "USD" }, { maximumFractionDigits: 0 })} in play`}
        action={
          <ToggleGroup aria-label="Filter deals" size="sm" value={view} onValueChange={(v) => setView(v as View)}>
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="mine">Mine</ToggleGroupItem>
            <ToggleGroupItem value="risk">At risk</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <TableContainer className="border-t border-line">
        <Table>
          <TableCaption visuallyHidden>Deals closing in November 2026</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="max-md:hidden">Owner</TableHead>
              <TableHead className="max-sm:hidden">Close</TableHead>
              <TableHead className="max-lg:hidden" style={{ width: 132 }}>Probability</TableHead>
              <TableHead numeric>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableEmpty colSpan={6} title="No deals here" description="Nothing matches this filter this month." />
            ) : (
              rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell rowHeader>
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={d.company} shape="square" size="sm" neutral className="max-sm:hidden" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <a href={`#deal-${d.id}`} className="truncate rounded-ui-sm font-medium text-fg hover:underline focus-ring">{d.name}</a>
                          {d.risk ? (
                            <Tooltip content={d.risk}>
                              <button type="button" className="shrink-0 rounded-full text-warning focus-ring" aria-label={`At risk: ${d.risk}`}>
                                <AlertTriangle className="size-3.5" aria-hidden />
                              </button>
                            </Tooltip>
                          ) : null}
                        </div>
                        <div className="truncate text-xs text-fg-subtle">{d.company}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge tone={stageTone[d.stage]} dot>{d.stage}</Badge></TableCell>
                  <TableCell className="max-md:hidden">
                    <span className="inline-flex items-center gap-2 whitespace-nowrap text-fg-muted">
                      <Avatar name={d.owner} size="xs" aria-hidden />
                      {d.owner}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-fg-muted tabular max-sm:hidden">{f.date(d.close, { month: "short", day: "numeric" })}</TableCell>
                  <TableCell className="max-lg:hidden">
                    <div className="flex w-full items-center gap-2.5">
                      <Progress value={d.probability} size="xs" aria-label={`Win probability for ${d.name}`} tone={d.probability === 100 ? "success" : "accent"} className="flex-1" />
                      <span aria-hidden className="w-8 text-end font-mono text-xs text-fg-muted tabular">{d.probability}%</span>
                    </div>
                  </TableCell>
                  <TableCell numeric className="font-medium text-fg">{f.currency(d.value, { currency: "USD" }, { maximumFractionDigits: 0 })}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end border-t border-line px-(--card-p) py-2.5">
        <Button variant="link" size="sm">Open pipeline board</Button>
      </div>
    </Card>
  );
}

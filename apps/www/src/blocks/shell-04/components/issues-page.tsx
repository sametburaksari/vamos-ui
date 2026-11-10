"use client";

import type * as React from "react";
import { CircleCheck, CircleDashed, CircleDot, Eye, Filter, Link2, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import {
  Avatar, AvatarGroup, Badge, Button, Card, EmptyState, IconButton, Item, ItemContent, ItemDescription, ItemLeading, ItemList,
  ItemMeta, ItemTitle, PageHeader, Progress, SmartLink, Tabs, TabsContent, TabsList, TabsTrigger, useAppShell,
} from "@vamos-ui/react";

type Status = "In progress" | "In review" | "Todo" | "Done";
type Priority = "High" | "Medium" | "Low";

interface Issue {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  labels: string[];
  assignee: string;
  due?: string;
}

const issues: Issue[] = [
  { id: "BRI-214", title: "Apple Pay sheet closes when the shipping address changes", status: "In progress", priority: "High", labels: ["Bug", "Payments"], assignee: "Mert Aydın", due: "Nov 12" },
  { id: "BRI-209", title: "Saved cards: show expiry and let people remove a card", status: "In progress", priority: "Medium", labels: ["Feature"], assignee: "Priya Raman", due: "Nov 14" },
  { id: "BRI-207", title: "Address autocomplete for Turkey and the UAE", status: "In review", priority: "Medium", labels: ["Feature", "i18n"], assignee: "Ece Demir" },
  { id: "BRI-198", title: "Guest checkout: keep the cart after email verification", status: "In review", priority: "High", labels: ["Bug"], assignee: "Jonas Weber", due: "Nov 11" },
  { id: "BRI-221", title: "Order summary collapses on phones under 360px", status: "Todo", priority: "Low", labels: ["Design"], assignee: "Ece Demir" },
  { id: "BRI-219", title: "Track checkout step drop-off in analytics", status: "Todo", priority: "Medium", labels: ["Analytics"], assignee: "Priya Raman", due: "Nov 20" },
  { id: "BRI-218", title: "Copy review for error messages with the legal team", status: "Todo", priority: "Low", labels: ["Content"], assignee: "Sofia Ricci" },
  { id: "BRI-190", title: "New payment step layout", status: "Done", priority: "High", labels: ["Design"], assignee: "Ece Demir" },
  { id: "BRI-186", title: "Remove the legacy coupon field", status: "Done", priority: "Low", labels: ["Cleanup"], assignee: "Mert Aydın" },
];

const statusIcon: Record<Status, React.ReactNode> = {
  "In progress": <CircleDot aria-hidden className="size-4 text-warning" />,
  "In review": <Eye aria-hidden className="size-4 text-info" />,
  Todo: <CircleDashed aria-hidden className="size-4 text-fg-subtle" />,
  Done: <CircleCheck aria-hidden className="size-4 text-success" />,
};

const priorityIcon: Record<Priority, React.ReactNode> = {
  High: <SignalHigh aria-hidden className="size-4" />,
  Medium: <SignalMedium aria-hidden className="size-4" />,
  Low: <SignalLow aria-hidden className="size-4" />,
};

function IssueGroup({ status, rows }: { status: Status; rows: Issue[] }) {
  if (!rows.length) return null;
  const headingId = `issues-${status.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <Card as="section" aria-labelledby={headingId} className="overflow-hidden">
      <h2 id={headingId} className="flex items-center gap-2 border-b border-line bg-surface-2 px-(--card-p) py-2 text-[13px] font-medium">
        {statusIcon[status]} {status} <span className="text-fg-subtle tabular">{rows.length}</span>
      </h2>
      <ItemList>
        {rows.map((it) => (
          <Item key={it.id} asChild size="sm">
            <SmartLink href={`/work/issues/${it.id.toLowerCase()}`}>
              <ItemLeading className="gap-2.5 text-fg-muted">
                <span title={`${it.priority} priority`}>{priorityIcon[it.priority]}<span className="sr-only">{it.priority} priority</span></span>
                <span className="w-16 font-mono text-[12px] text-fg-subtle max-sm:hidden">{it.id}</span>
              </ItemLeading>
              <ItemContent>
                <ItemTitle>{it.title}</ItemTitle>
                <ItemDescription className="sm:hidden">{it.id}{it.due ? ` · Due ${it.due}` : ""}</ItemDescription>
              </ItemContent>
              <ItemMeta className="flex items-center gap-1.5">
                {it.labels.map((l) => <Badge key={l} tone="outline" className="max-md:hidden">{l}</Badge>)}
                {it.due ? <span className="w-14 text-end text-[12px] text-fg-muted tabular max-sm:hidden">{it.due}</span> : <span className="w-14 max-sm:hidden" />}
                <Avatar name={it.assignee} size="xs" />
              </ItemMeta>
            </SmartLink>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}

export function IssuesPage({ path }: { path: string }) {
  const { activeApp } = useAppShell();
  if (path !== "/work/projects/checkout") return <PlaceholderPage path={path} app={activeApp?.name ?? "Work"} />;

  const open = issues.filter((i) => i.status !== "Done");
  const done = issues.filter((i) => i.status === "Done");
  const order: Status[] = ["In progress", "In review", "Todo"];

  return (
    <div className="grid gap-(--gap)">
      <PageHeader
        eyebrow="Projects"
        title="Checkout redesign"
        meta={<Badge tone="accent">Cycle 14 · ends Nov 18</Badge>}
        description="One-page checkout with saved cards and wallet payments for the Brightline storefront."
        actions={
          <>
            <AvatarGroup max={4} size="sm" aria-label="Project members">
              {["Mert Aydın", "Priya Raman", "Ece Demir", "Jonas Weber", "Sofia Ricci"].map((n) => <Avatar key={n} name={n} />)}
            </AvatarGroup>
            <IconButton label="Copy project link" variant="secondary" size="sm"><Link2 /></IconButton>
            <Button variant="secondary" size="sm"><Filter aria-hidden /> Filter</Button>
          </>
        }
      />
      <Progress label="Cycle progress" value={done.length + 2} max={issues.length} display="fraction" showValue hint="2 issues in review are due before the cycle ends." />
      <Tabs defaultValue="active">
        <TabsList aria-label="Issue views">
          <TabsTrigger value="active" count={open.length}>Active</TabsTrigger>
          <TabsTrigger value="done" count={done.length}>Done</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="grid gap-(--gap) pt-4">
          {order.map((s) => <IssueGroup key={s} status={s} rows={open.filter((i) => i.status === s)} />)}
        </TabsContent>
        <TabsContent value="done" className="grid gap-(--gap) pt-4">
          <IssueGroup status="Done" rows={done} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlaceholderPage({ path, app }: { path: string; app: string }) {
  return (
    <div className="grid gap-(--gap)">
      <PageHeader eyebrow={app} title={<span className="font-mono text-[0.7em]">{path}</span>} />
      <Card>
        <EmptyState
          title="Your page goes here"
          description="This block ships the two-level shell and one project page. Switch apps in the first column; each app brings its own menu."
          actions={<Button asChild variant="secondary" size="sm"><SmartLink href="/work/projects/checkout">Open Checkout redesign</SmartLink></Button>}
        />
      </Card>
    </div>
  );
}

"use client";

import { Play, ReceiptText } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Item,
  ItemContent,
  ItemDescription,
  ItemList,
  ItemMeta,
  ItemTitle,
  PageHeader,
  Stat,
  StatGroup,
  useFormat,
  type BadgeProps,
} from "@vamos-ui/react";
import { BarChart, BarList, ProgressRing } from "@vamos-ui/react/charts";
import { ProjectsTable } from "./projects-table";
import { aging, hours, hoursConfig, invoices, people, type InvoiceStatus } from "./data";

const invoiceTone: Record<InvoiceStatus, BadgeProps["tone"]> = {
  Paid: "success",
  Sent: "info",
  Overdue: "danger",
  Draft: "neutral",
};

const peopleRows = people.map((p) => ({ ...p, icon: <Avatar name={p.textLabel ?? p.key} size="xs" aria-hidden /> }));

function Invoices() {
  const f = useFormat();
  return (
    <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "360ms" }}>
      <CardHeader titleAs="h2" title="Invoices" description={`${f.currency("48250.00", { currency: "USD" })} outstanding`} action={<Button variant="link" size="sm">All invoices</Button>} />
      <CardBody className="pt-1">
        <BarList aria-label="Outstanding by age" data={aging} sort="none" format="currency" size="sm" variant="track" color="chart-3" />
      </CardBody>
      <ItemList className="flex-1 border-t border-line">
        {invoices.slice(0, 4).map((inv) => (
          <Item key={inv.number} asChild>
            <a href={`#${inv.number}`}>
              <ItemContent>
                <ItemTitle>{inv.client}</ItemTitle>
                <ItemDescription className="font-mono text-[11.5px]">{inv.number} · due {f.date(inv.due, { month: "short", day: "numeric" })}</ItemDescription>
              </ItemContent>
              <ItemMeta className="grid justify-items-end gap-1">
                <span className="font-mono text-[13px] text-fg tabular">{f.currency(inv.amount, { currency: "USD" })}</span>
                <Badge tone={invoiceTone[inv.status]} size="sm">{inv.status}</Badge>
              </ItemMeta>
            </a>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}

export function WorkDashboard() {
  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        size="lg"
        eyebrow="Week 46 · Nov 9 – 15"
        title={<>Delivery & <em>billing</em></>}
        description="Projects, logged hours and receivables for the studio, updated as timesheets come in."
        actions={
          <>
            <Button variant="secondary"><ReceiptText aria-hidden />New invoice</Button>
            <Button variant="primary"><Play aria-hidden />Start timer</Button>
          </>
        }
      />

      <StatGroup columns={4} variant="plain" className="ui-rise">
        <Stat variant="plain" label="Active projects" value={18} delta={2} deltaKind="number" comparison="vs last month" />
        <Stat variant="plain" label="Hours this week" value={312} delta={0.06} comparison="vs last week" target={{ value: 360, label: "Capacity" }} />
        <Stat variant="plain" label="Billable utilisation" value={0.78} format="percent" delta={0.04} comparison="vs last week" trend={[71, 74, 72, 76, 75, 78]} />
        <Stat variant="plain" label="Outstanding" value="48250.00" format={{ type: "currency", currency: "USD", options: { maximumFractionDigits: 0 } }} delta={-0.12} intent="lower-is-better" comparison="vs last month" />
      </StatGroup>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <Card className="ui-rise min-w-0 lg:col-span-2" style={{ animationDelay: "120ms" }}>
          <CardHeader titleAs="h2" title="Time tracked" description="Hours logged per working day, last two weeks" />
          <CardBody className="pt-1">
            <BarChart title="Billable and internal hours per day" data={hours} x="day" xFormat={{ date: { month: "short", day: "numeric" } }} config={hoursConfig} stack="stacked" height="md" reference={[{ y: 58, label: "Team capacity" }]} tableToggle />
          </CardBody>
        </Card>

        <Card className="ui-rise flex min-w-0 flex-col" style={{ animationDelay: "180ms" }}>
          <CardHeader titleAs="h2" title="This week" description="Hours per person, 40 h target" />
          <CardBody className="flex-1 pt-1">
            <BarList aria-label="Hours logged this week per person" data={peopleRows} format="integer" variant="track" />
          </CardBody>
          <CardFooter className="gap-3 border-t border-line">
            <ProgressRing value={312} max={360} size="sm" aria-label="Team capacity used" />
            <p className="text-[13px] text-fg-muted"><span className="font-medium text-fg">87% of capacity</span> · 48 hours free for new work</p>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <ProjectsTable />
        </div>
        <Invoices />
      </div>
    </div>
  );
}

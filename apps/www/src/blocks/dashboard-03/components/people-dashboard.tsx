"use client";

import { Cake, CalendarPlus, MapPin, PartyPopper, UserPlus } from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Item,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemMeta,
  ItemTitle,
  PageHeader,
  Stat,
  StatGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useFormat,
} from "@vamos-ui/react";
import { BarChart, DonutChart } from "@vamos-ui/react/charts";
import { LeaveStrip } from "./leave-strip";
import { TODAY, anniversaries, birthdays, employment, employmentConfig, headcount, headcountConfig, openings } from "./data";

function Celebrations() {
  const f = useFormat();
  const when = (date: string) => (date === TODAY ? "Today" : f.date(date, { weekday: "short", month: "short", day: "numeric" }));
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "300ms" }}>
      <Tabs defaultValue="birthdays">
        <CardHeader
          titleAs="h2"
          title="Celebrations"
          description="Next 10 days"
          action={
            <TabsList variant="segmented" size="sm" aria-label="Celebration type">
              <TabsTrigger value="birthdays">Birthdays</TabsTrigger>
              <TabsTrigger value="work">Anniversaries</TabsTrigger>
            </TabsList>
          }
        />
        <TabsContent value="birthdays">
          <ItemList className="border-t border-line">
            {birthdays.map((p) => (
              <Item key={p.name}>
                <ItemLeading><Avatar name={p.name} size="md" aria-hidden /></ItemLeading>
                <ItemContent>
                  <ItemTitle>{p.name}</ItemTitle>
                  <ItemDescription>{p.role}</ItemDescription>
                </ItemContent>
                <ItemMeta>
                  {p.date === TODAY ? <Badge tone="accent"><Cake aria-hidden />Today</Badge> : when(p.date)}
                </ItemMeta>
              </Item>
            ))}
          </ItemList>
        </TabsContent>
        <TabsContent value="work">
          <ItemList className="border-t border-line">
            {anniversaries.map((p) => (
              <Item key={p.name}>
                <ItemLeading><Avatar name={p.name} size="md" aria-hidden /></ItemLeading>
                <ItemContent>
                  <ItemTitle>{p.name}</ItemTitle>
                  <ItemDescription>{p.role}</ItemDescription>
                </ItemContent>
                <ItemMeta className="text-end">
                  <span className="inline-flex items-center gap-1 font-medium text-fg"><PartyPopper aria-hidden className="size-3.5 text-fg-subtle" />{p.years} {p.years === 1 ? "year" : "years"}</span>
                  <div className="text-[11.5px]">{when(p.date)}</div>
                </ItemMeta>
              </Item>
            ))}
          </ItemList>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function OpenPositions() {
  return (
    <Card className="ui-rise min-w-0" style={{ animationDelay: "360ms" }}>
      <CardHeader titleAs="h2" title="Open positions" description="12 roles · 4 shown by urgency" action={<Button variant="link" size="sm">Hiring board</Button>} />
      <ItemList className="border-t border-line">
        {openings.map((o) => (
          <Item key={o.id} asChild>
            <a href={`#position-${o.id}`}>
              <ItemContent>
                <ItemTitle className="flex items-center gap-2">
                  <span className="truncate">{o.title}</span>
                  {o.priority ? <Badge tone="warning" size="sm">Priority</Badge> : null}
                </ItemTitle>
                <ItemDescription className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
                  <span>{o.department}</span>
                  <span className="inline-flex items-center gap-1"><MapPin aria-hidden className="size-3" />{o.location}</span>
                </ItemDescription>
              </ItemContent>
              <ItemMeta className="hidden text-end sm:block">
                <div className="font-mono text-[13px] text-fg tabular">{o.applicants} <span className="font-sans text-fg-subtle">applied</span></div>
                <div className="text-[11.5px]">{o.finalists > 0 ? `${o.finalists} in final round` : "Screening"} · {o.openedDaysAgo}d open</div>
              </ItemMeta>
            </a>
          </Item>
        ))}
      </ItemList>
    </Card>
  );
}

export function PeopleDashboard() {
  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        size="lg"
        eyebrow="Tuesday, November 10"
        title={<>People, <em>today</em></>}
        description="Headcount, time off and hiring across 148 people in four offices."
        actions={
          <>
            <Button variant="secondary"><CalendarPlus aria-hidden />Book time off</Button>
            <Button variant="primary"><UserPlus aria-hidden />Add employee</Button>
          </>
        }
      />

      <StatGroup columns={4} variant="plain" className="ui-rise">
        <Stat variant="plain" label="Headcount" value={148} delta={4} deltaKind="number" comparison="vs October" trend={[131, 134, 139, 142, 146, 148]} />
        <Stat variant="plain" label="New hires, 30 days" value={6} delta={2} deltaKind="number" comparison="vs previous 30 days" />
        <Stat variant="plain" label="Attrition, 12 months" value={0.072} format="percent" delta={-0.14} intent="lower-is-better" comparison="vs last year" trend={[9.1, 8.8, 8.4, 8.1, 7.6, 7.2]} />
        <Stat variant="plain" label="Away today" value={3} comparison="of 148 people" />
      </StatGroup>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-3">
        <Card className="ui-rise min-w-0 lg:col-span-2" style={{ animationDelay: "120ms" }}>
          <CardHeader titleAs="h2" title="Headcount by department" description="Active employees at the start of each month" />
          <CardBody className="pt-1">
            <BarChart title="Headcount by department, June to November 2026" data={headcount} x="month" xFormat={{ date: "month" }} config={headcountConfig} stack="stacked" height="md" tableToggle />
          </CardBody>
        </Card>
        <Card className="ui-rise min-w-0" style={{ animationDelay: "180ms" }}>
          <CardHeader titleAs="h2" title="Employment type" description="All active contracts" />
          <CardBody className="pt-1">
            <DonutChart title="Employees by employment type" data={employment} nameKey="type" valueKey="people" config={employmentConfig} centerLabel="People" legend="bottom" size="sm" />
          </CardBody>
        </Card>
      </div>

      <div className="mt-(--gap)">
        <LeaveStrip />
      </div>

      <div className="mt-(--gap) grid gap-(--gap) lg:grid-cols-2">
        <Celebrations />
        <OpenPositions />
      </div>
    </div>
  );
}

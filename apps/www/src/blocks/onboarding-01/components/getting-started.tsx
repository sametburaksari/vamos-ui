"use client";

import * as React from "react";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import { Button, Card, CardBody, CardHeader, Item, ItemContent, ItemDescription, ItemList, ItemTitle, PageHeader, Progress, TaskList, toast } from "@vamos-ui/react";
import { SetupGuide } from "./setup-guide";
import { firstWeek, resources, stages as initialStages } from "./data";

export function GettingStarted() {
  const [stages, setStages] = React.useState(initialStages);
  const [tasks, setTasks] = React.useState(firstWeek);

  const complete = (id: string) => {
    setStages((list) => list.map((s) => ({ ...s, steps: s.steps.map((st) => (st.id === id ? { ...st, done: true } : st)) })));
    const step = stages.flatMap((s) => s.steps).find((s) => s.id === id);
    if (step) toast.success(`${step.title} — done`);
  };

  const toggle = (id: string, done: boolean) => {
    const walk = (list: typeof tasks): typeof tasks => list.map((t) => (t.id === id ? { ...t, done } : t.children ? { ...t, children: walk(t.children) } : t));
    setTasks(walk);
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        size="lg"
        eyebrow="Getting started"
        title={
          <>
            Welcome to Northwind, <em>Samet</em>.
          </>
        }
        description="A few steps and your site, CRM and team are ready for clients. Everything here can be changed later."
        actions={
          <>
            <Button variant="ghost">Hide guide</Button>
            <Button>
              <CalendarClock /> Book a walkthrough
            </Button>
          </>
        }
        className="mb-7"
      />

      <div className="grid items-start gap-(--gap) xl:grid-cols-[minmax(0,1fr)_22rem]">
        <SetupGuide stages={stages} onComplete={complete} />

        <div className="grid gap-(--gap) md:grid-cols-2 xl:grid-cols-1">
          <Card className="md:col-span-2 xl:col-span-1">
            <CardHeader title="Your first week" description="Shared with everyone you invited" />
            <CardBody>
              <TaskList items={tasks} onToggle={toggle} today="2026-11-10" aria-label="Your first week" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Team plan · trial" description="Ends on 24 November. No card needed until then." />
            <CardBody className="grid gap-4">
              <Progress label="Trial" value={8} max={22} display="fraction" showValue hint="14 days left" />
              <Button variant="soft" block>
                Choose a plan
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Help & resources" divider />
            <ItemList>
              {resources.map((r) => (
                <Item key={r.title} interactive asChild>
                  <a href={r.href}>
                    <ItemContent>
                      <ItemTitle>{r.title}</ItemTitle>
                      <ItemDescription>{r.description}</ItemDescription>
                    </ItemContent>
                    <ArrowUpRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                  </a>
                </Item>
              ))}
            </ItemList>
          </Card>
        </div>
      </div>
    </div>
  );
}

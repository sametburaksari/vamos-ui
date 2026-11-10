"use client";

import * as React from "react";
import { ArrowRight, Check, Download, FileText, PenLine } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemTitle,
  ListLayout,
  PageHeader,
  Progress,
  RadioGroup,
  RadioGroupItem,
  useFormat,
} from "@vamos-ui/react";
import { setupTasks, templates } from "./starter-data";

/** First-run Posts page: one clear next step, starter templates and a setup checklist. */
export function PostsFirstRun() {
  const f = useFormat();
  const [template, setTemplate] = React.useState<string>("blank");
  const [tasks, setTasks] = React.useState(setupTasks);
  const picked = templates.find((t) => t.id === template);
  const done = tasks.filter((t) => t.done).length;

  return (
    <ListLayout width="wide" stickyToolbar={false}>
      <PageHeader
        eyebrow="Content"
        title="Posts"
        meta={<Badge tone="outline" className="tabular">{f.number(0)}</Badge>}
        description="Articles, news and guides published on harborpine.com."
        actions={
          <Button>
            <Download /> Import
          </Button>
        }
      />

      <div className="grid gap-(--gap) xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="ui-rise overflow-hidden">
          <EmptyState
            size="lg"
            as="h2"
            icon={<PenLine />}
            title="Write your first post"
            description="Posts appear on your blog page and in search results. Start from a blank page or one of the outlines below — you can change everything later."
            actions={
              <>
                <Button variant="primary" size="lg">
                  {picked ? `Start with “${picked.name}”` : "Write a post"} <ArrowRight className="rtl:-scale-x-100" />
                </Button>
                <Button size="lg">
                  <Download /> Import from WordPress
                </Button>
              </>
            }
            className="pb-12"
          />

          <div className="border-t border-line px-(--card-p) py-6">
            <h3 id="starter-heading" className="mb-1 text-sm font-semibold text-fg">Start from an outline</h3>
            <p className="mb-4 text-[13px] text-fg-muted">Each outline comes with headings and short prompts, not filler text.</p>
            <RadioGroup aria-labelledby="starter-heading" variant="card" value={template} onValueChange={setTemplate} className="grid gap-2 sm:grid-cols-2">
              <RadioGroupItem value="blank" icon={<FileText />} label="Blank post" description="Title and body. Nothing else." />
              {templates.map((t) => (
                <RadioGroupItem key={t.id} value={t.id} icon={<t.icon />} label={t.name} description={t.description}>
                  <span className="mt-2 block font-mono text-[11px] tabular text-fg-subtle">
                    {t.sections} sections · ~{f.number(t.words)} words
                  </span>
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </div>
        </Card>

        <Card className="ui-rise self-start" style={{ animationDelay: "80ms" }}>
          <CardHeader titleAs="h2" title="Before you publish" description="Small things that make the first post look finished." />
          <CardBody className="pt-0">
            <Progress label="Setup" value={done} max={tasks.length} display="fraction" showValue size="xs" className="mb-3" />
            <ItemList inset>
              {tasks.map((task) => (
                <Item key={task.id} align="start" size="sm">
                  <ItemLeading variant="icon" className={task.done ? "tone-success tone-soft" : undefined}>
                    {task.done ? <Check aria-hidden /> : <span aria-hidden className="size-1.5 rounded-full bg-fg-subtle" />}
                  </ItemLeading>
                  <ItemContent>
                    <ItemTitle truncate={false} className={task.done ? "text-fg-muted line-through decoration-line" : undefined}>
                      {task.title}
                      <span className="sr-only">{task.done ? " (done)" : " (to do)"}</span>
                    </ItemTitle>
                    <ItemDescription className="whitespace-normal! text-fg-muted">{task.description}</ItemDescription>
                  </ItemContent>
                  {!task.done ? (
                    <ItemActions>
                      <Button size="xs" variant="ghost" aria-label={`${task.action}: ${task.title}`} onClick={() => setTasks((all) => all.map((x) => (x.id === task.id ? { ...x, done: true } : x)))}>
                        {task.action}
                      </Button>
                    </ItemActions>
                  ) : null}
                </Item>
              ))}
            </ItemList>
          </CardBody>
        </Card>
      </div>
    </ListLayout>
  );
}

"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge, Button, Card, CardHeader, ProgressCircle, StepIndicator } from "@vamos-ui/react";
import type { SetupStage } from "./data";

export interface SetupGuideProps {
  stages: SetupStage[];
  onComplete: (id: string) => void;
}

/**
 * The setup checklist: one accordion row per step, grouped by stage. Finishing a step opens the
 * next open one, so the guide always points at what to do now.
 */
export function SetupGuide({ stages, onComplete }: SetupGuideProps) {
  const all = stages.flatMap((s) => s.steps);
  const firstOpen = all.find((s) => !s.done)?.id ?? "";
  const [open, setOpen] = React.useState<string>(firstOpen);
  const done = all.filter((s) => s.done).length;
  const minutesLeft = all.filter((s) => !s.done).reduce((n, s) => n + s.minutes, 0);

  const complete = (id: string) => {
    onComplete(id);
    const next = all.find((s) => !s.done && s.id !== id);
    setOpen(next?.id ?? "");
  };

  let n = 0;
  return (
    <Card>
      <CardHeader
        divider
        title="Setup guide"
        description={done === all.length ? "All done. Your workspace is ready." : `${done} of ${all.length} done · about ${minutesLeft} minutes left`}
        action={<ProgressCircle value={done} max={all.length} size="md" showValue aria-label="Setup progress" display="fraction" />}
      />
      <div className="divide-y divide-line">
        {stages.map((stage) => (
          <section key={stage.id} aria-labelledby={`stage-${stage.id}`} className="px-(--card-p) py-4">
            <h3 id={`stage-${stage.id}`} className="mb-1 flex items-center gap-2 text-[11.5px] font-medium tracking-[0.12em] text-fg-subtle uppercase">
              {stage.title}
              <span className="font-mono tracking-normal tabular">
                {stage.steps.filter((s) => s.done).length}/{stage.steps.length}
              </span>
            </h3>
            <Accordion type="single" collapsible value={open} onValueChange={setOpen} headingLevel={4}>
              {stage.steps.map((step) => {
                n += 1;
                const current = step.id === firstOpen;
                return (
                  <AccordionItem key={step.id} value={step.id}>
                    <AccordionTrigger
                      icon={<StepIndicator status={step.done ? "complete" : current ? "current" : "upcoming"} number={n} size="sm" />}
                      meta={step.done ? <Badge tone="success">Done</Badge> : <span className="font-mono text-[12px] text-fg-subtle tabular">{step.minutes} min</span>}
                    >
                      <span className={step.done ? "text-fg-muted line-through decoration-line" : undefined}>{step.title}</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="max-w-prose text-fg-muted">{step.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {step.done ? (
                          <Button size="sm">{step.action}</Button>
                        ) : (
                          <Button size="sm" variant="primary" onClick={() => complete(step.id)}>
                            {step.action} <ArrowRight />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" asChild>
                          <a href={`#help-${step.id}`}>{step.help}</a>
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        ))}
      </div>
    </Card>
  );
}

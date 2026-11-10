"use client";

import * as React from "react";
import { Activity, BellRing, Check, Loader } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Item,
  ItemContent,
  ItemDescription,
  ItemLeading,
  ItemList,
  ItemMeta,
  ItemTitle,
  PageHeaderTitle,
  Progress,
  useFormat,
} from "@vamos-ui/react";

/** Example window and "now"; in your app pass the real values from your status provider. */
const START = "2026-11-10T00:30:00Z";
const END = "2026-11-10T02:30:00Z";
const NOW = "2026-11-10T01:35:00Z";

type StepState = "done" | "running" | "queued";
const steps: { title: string; description: string; state: StepState; at?: string }[] = [
  { title: "Back up all workspaces", description: "Full snapshot, verified against checksums.", state: "done", at: "2026-11-10T00:52:00Z" },
  { title: "Move to the new database cluster", description: "Faster search and reports on large pipelines.", state: "running" },
  { title: "Re-index search", description: "Contacts, deals, posts and files.", state: "queued" },
  { title: "Health checks and reopen", description: "We open sign-in once every check passes.", state: "queued" },
];

const stateBadge = {
  done: { tone: "success", label: "Done" },
  running: { tone: "accent", label: "In progress" },
  queued: { tone: "neutral", label: "Queued" },
} as const;

const minutes = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 60_000);

/** Maintenance mode page: when it ends (in the viewer's time zone), progress, steps and a notify form. */
export function Maintenance() {
  const f = useFormat();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">("idle");
  const total = minutes(START, END);
  const elapsed = minutes(START, NOW);
  const left = total - elapsed;
  const hm = { hour: "numeric", minute: "2-digit" } as const;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter an email address like name@company.com.");
      return;
    }
    setError(undefined);
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 900);
  };

  return (
    <div className="vb-state-backdrop relative z-10 min-h-dvh px-4 py-12 sm:px-6 lg:py-20">
      <main className="mx-auto grid max-w-[1040px] gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,1fr)_25rem]">
        <section aria-labelledby="mt-title" className="ui-rise">
          <div className="mb-10 flex items-center gap-2">
            <span aria-hidden className="grid size-7 place-items-center rounded-[9px] bg-fg font-display text-[18px] italic leading-none text-scene">a</span>
            <span className="text-[14px] font-semibold text-fg">Northpoint Workspace</span>
          </div>
          <p className="mb-4 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-fg-muted">
            <span className="text-fg">Maintenance</span>
            <span aria-hidden className="h-px w-8 bg-current opacity-40" />
            <span className="normal-case tracking-normal tabular">{f.dateRange(START, END, hm)}</span>
          </p>
          <PageHeaderTitle id="mt-title" size="lg" className="max-w-[17ch]">
            We’re moving to faster servers. Back by <em className="text-accent-ink">{f.time(END, hm)}</em>.
          </PageHeaderTitle>
          <p className="mt-4 max-w-[50ch] text-pretty text-[15px] leading-relaxed text-fg-muted">
            Sign-in, the API and scheduled posts are paused. Nothing is lost — posts scheduled during the window go out as soon as we’re back, in their original order.
          </p>

          <Progress
            className="mt-8 max-w-md"
            label="Maintenance window"
            value={elapsed}
            max={total}
            showValue
            hint={`About ${f.duration(left, { unit: "min", style: "long", smallest: "min" })} left · times shown in your time zone`}
          />

          <div className="mt-8 max-w-md">
            {status === "sent" ? (
              <Alert tone="success" title="We’ll email you" live="polite">
                A single message to {email} when everything is back. No newsletter.
              </Alert>
            ) : (
              <form onSubmit={submit} noValidate className="grid gap-2">
                <Field label="Tell me when it’s back" error={error}>
                  <Input type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Button type="submit" variant="primary" loading={status === "sending"} loadingText="Saving…" className="justify-self-start">
                  <BellRing /> Notify me
                </Button>
              </form>
            )}
          </div>
        </section>

        <Card className="ui-rise self-start" style={{ animationDelay: "80ms" }}>
          <CardHeader titleAs="h2" title="What we’re doing" description={`Started ${f.time(START, hm)} · ${steps.filter((s) => s.state === "done").length} of ${steps.length} steps done`} divider />
          <ItemList as="ol" aria-label="Maintenance steps">
            {steps.map((s) => (
              <Item key={s.title} align="start" aria-current={s.state === "running" ? "step" : undefined}>
                <ItemLeading variant="icon" className={s.state === "done" ? "tone-success tone-soft" : s.state === "running" ? "bg-accent-soft text-accent-ink" : undefined}>
                  {s.state === "done" ? <Check aria-hidden /> : s.state === "running" ? <Loader aria-hidden className="motion-safe:animate-spin [animation-duration:2.4s]" /> : <span aria-hidden className="size-1.5 rounded-full bg-fg-subtle" />}
                </ItemLeading>
                <ItemContent>
                  <ItemTitle truncate={false}>{s.title}</ItemTitle>
                  <ItemDescription className="whitespace-normal! text-fg-muted">{s.description}</ItemDescription>
                </ItemContent>
                <ItemMeta className="flex flex-col items-end gap-1">
                  <Badge tone={stateBadge[s.state].tone}>{stateBadge[s.state].label}</Badge>
                  {s.at ? <time dateTime={s.at} className="tabular text-[11.5px] text-fg-muted">{f.time(s.at, hm)}</time> : null}
                </ItemMeta>
              </Item>
            ))}
          </ItemList>
          <div className="border-t border-line px-(--card-p) py-3">
            <a href="#status" className="inline-flex items-center gap-1.5 rounded-ui-sm text-[13px] text-fg-muted transition-colors hover:text-fg focus-ring">
              <Activity aria-hidden className="size-3.5" /> Live updates on status.northpoint.app
            </a>
          </div>
        </Card>
      </main>
    </div>
  );
}

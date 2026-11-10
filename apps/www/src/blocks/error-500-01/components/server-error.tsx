"use client";

import * as React from "react";
import { Activity, ArrowRight, LifeBuoy, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  Button,
  DescriptionList,
  PageHeaderTitle,
  useFormat,
} from "@vamos-ui/react";

export interface ServerErrorProps {
  /** `error.tsx`'s `reset()`. Without it the block simulates a retry that fails again. */
  reset?: () => void | Promise<void>;
  /** Next.js `error.digest`, shown as the error ID. */
  digest?: string;
}

/** Example timestamps; in your app use the time the error happened. */
const OCCURRED = "2026-11-10T14:32:07Z";
const SAVED = "2026-11-10T14:31:52Z";

/** A calm, useful 500: what happened, that work is safe, retry, and details support can act on. */
export function ServerError({ reset, digest = "err_7Hq2kV9xLm" }: ServerErrorProps) {
  const f = useFormat();
  const [attempts, setAttempts] = React.useState(0);
  const [retrying, setRetrying] = React.useState(false);

  const retry = async () => {
    setRetrying(true);
    try {
      if (reset) await reset();
      else await new Promise((r) => setTimeout(r, 1100));
    } finally {
      setRetrying(false);
      setAttempts((n) => n + 1);
    }
  };

  return (
    <div className="vb-state-backdrop relative z-10 grid min-h-dvh place-items-center px-4 py-12 sm:px-6">
      <main className="ui-rise w-full max-w-[34rem]">
        <div className="mb-10 flex items-center gap-2">
          <span aria-hidden className="grid size-7 place-items-center rounded-[9px] bg-fg font-display text-[18px] italic leading-none text-scene">a</span>
          <span className="text-[14px] font-semibold text-fg">Northpoint Workspace</span>
        </div>

        <p className="mb-4 flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.08em] text-fg-muted">
          <span className="tabular text-danger">500</span>
          <span aria-hidden className="h-px w-8 bg-current opacity-40" />
          <span className="normal-case tracking-normal">Server error</span>
        </p>
        <PageHeaderTitle size="lg" className="max-w-[16ch]">
          Something went wrong on <em className="text-accent-ink">our</em> side.
        </PageHeaderTitle>
        <p className="mt-4 max-w-[48ch] text-pretty text-[15px] leading-relaxed text-fg-muted">
          The page couldn’t load because one of our services didn’t answer in time. It’s usually back within a minute — nothing you did caused this.
        </p>

        <Alert tone="success" title="Your work is safe" className="mt-6">
          Everything up to {f.time(SAVED, { hour: "numeric", minute: "2-digit" })} was saved. Edits made after that are kept in this browser and sync when the page loads again.
        </Alert>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button variant="primary" loading={retrying} loadingText="Retrying…" onClick={retry}>
            <RotateCcw /> Try again
          </Button>
          <Button asChild>
            <a href="#dashboard">
              Back to dashboard <ArrowRight className="rtl:-scale-x-100" />
            </a>
          </Button>
        </div>

        <div aria-live="polite" className="empty:hidden">
          {attempts > 0 && !retrying ? (
            <Alert tone="warning" title={`Still not loading after ${attempts} ${attempts === 1 ? "retry" : "retries"}`} className="mt-4">
              We’ve been notified. Check the status page, or wait a few minutes and try again.
            </Alert>
          ) : null}
        </div>

        <Accordion type="single" collapsible variant="card" headingLevel={2} className="mt-8">
            <AccordionItem value="details">
              <AccordionTrigger>Technical details</AccordionTrigger>
              <AccordionContent>
                <p className="mb-3 text-[13px] text-fg-muted">Share the error ID with support so they can find this exact request.</p>
                <DescriptionList
                  size="sm"
                  labelWidth="7.5rem"
                  items={[
                    { key: "id", label: "Error ID", value: <span className="font-mono">{digest}</span>, copyable: digest },
                    { key: "time", label: "Time", value: f.dateTime(OCCURRED, { dateStyle: "medium", timeStyle: "medium" }) },
                    { key: "request", label: "Request", value: <span className="font-mono">GET /api/crm/pipeline</span> },
                    { key: "status", label: "Response", value: "504 · upstream timeout after 15 s" },
                    { key: "region", label: "Region", value: "eu-central · fra1" },
                  ]}
                />
              </AccordionContent>
            </AccordionItem>
        </Accordion>

        <nav aria-label="Help" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
          <a href="#status" className="inline-flex items-center gap-1.5 rounded-ui-sm text-fg-muted transition-colors hover:text-fg focus-ring">
            <Activity aria-hidden className="size-3.5" /> status.northpoint.app
          </a>
          <a href={`mailto:support@northpoint.app?subject=${encodeURIComponent(`Error ${digest}`)}`} className="inline-flex items-center gap-1.5 rounded-ui-sm text-fg-muted transition-colors hover:text-fg focus-ring">
            <LifeBuoy aria-hidden className="size-3.5" /> Contact support
          </a>
        </nav>
      </main>
    </div>
  );
}

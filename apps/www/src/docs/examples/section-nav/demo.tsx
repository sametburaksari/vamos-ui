"use client";

import { SectionNav } from "@vamos-ui/react";

const sections = [
  { id: "sn-demo-overview", label: "Overview", meta: "01", body: "What the handbook covers and who it is for." },
  { id: "sn-demo-setup", label: "Setup", meta: "02", body: "Accounts, devices and the tools you need on day one." },
  { id: "sn-demo-workflow", label: "Workflow", meta: "03", body: "How work moves from a request to a finished task." },
  { id: "sn-demo-reviews", label: "Reviews", meta: "04", body: "When to ask for a review and what reviewers look for." },
];

// Scroll the page: the section crossing the upper third of the window becomes current.
export default function SectionNavDemo() {
  return (
    <div className="grid w-full max-w-2xl gap-8 sm:grid-cols-[10rem_1fr]">
      <SectionNav items={sections} title="On this page" top="5rem" />
      <div className="flex flex-col gap-6">
        {sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-20 rounded-ui-lg border border-line bg-surface p-5">
            <h3 id={`${s.id}-title`} className="m-0 text-base font-semibold text-fg">
              {s.label}
            </h3>
            <p className="mt-2 mb-0 min-h-40 text-sm text-fg-muted">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

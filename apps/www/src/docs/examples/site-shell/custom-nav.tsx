"use client";

import { SiteShell, SiteShellLink, SiteShellPage, useSiteShell } from "@vamos-ui/react/blocks";

const pages = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "tickets", label: "Tickets" },
];

function PageNav() {
  const { page } = useSiteShell();
  const index = pages.findIndex((p) => p.id === page);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line px-4">
      <nav aria-label="Event" className="flex gap-1">
        {pages.map((p) => (
          <SiteShellLink
            key={p.id}
            page={p.id}
            className="-mb-px border-b-2 border-transparent px-3 py-2.5 text-[13px] font-medium text-fg-muted focus-ring hover:text-fg aria-[current=page]:border-accent aria-[current=page]:text-fg"
          >
            {p.label}
          </SiteShellLink>
        ))}
      </nav>
      <span className="font-mono text-[11px] text-fg-subtle tabular">
        {index + 1} / {pages.length}
      </span>
    </div>
  );
}

// Client code can build its own page navigation with useSiteShell() and SiteShellLink
// (aria-current is set for you). Server components use plain hrefs: sitePageHref("tickets").
export default function SiteShellCustomNav() {
  return (
    <SiteShell accent="#F97316" font="grotesk" material="solid" density="compact" pages={pages.map((p) => p.id)} routing="memory" className="surface w-full overflow-hidden rounded-ui">
      <PageNav />
      <div className="p-5">
        <SiteShellPage id="overview">
          <h1 className="font-display text-2xl">Interface Days 2027</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">Two days of design and engineering talks, 14–15 May, Istanbul.</p>
        </SiteShellPage>
        <SiteShellPage id="schedule">
          <h1 className="font-display text-2xl">Schedule</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">Three tracks a day, doors open at 9 AM.</p>
        </SiteShellPage>
        <SiteShellPage id="tickets">
          <h1 className="font-display text-2xl">Tickets</h1>
          <p className="mt-1 text-[13.5px] text-fg-muted">Early bird until 31 January.</p>
        </SiteShellPage>
      </div>
    </SiteShell>
  );
}

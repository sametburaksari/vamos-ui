"use client";

import * as React from "react";
import { Button, Tour, type TourStep } from "@vamos-ui/react";

export default function TourWelcome() {
  const [open, setOpen] = React.useState(false);
  const board = React.useRef<HTMLDivElement>(null);
  const steps: TourStep[] = [
    {
      title: "Welcome to the dispatch board",
      description: "A 30-second tour of how jobs move from request to done. You can leave any time with Escape.",
      content: (
        <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] text-fg-muted">
          {["Unassigned", "En route", "On site"].map((c) => (
            <span key={c} className="rounded-ui-sm border border-line bg-surface-2 py-2">{c}</span>
          ))}
        </div>
      ),
    },
    { target: board, title: "Drag a job onto a technician", description: "Their route and ETA update for everyone at once.", side: "bottom" },
    { title: "That's it", description: "Reopen this tour from Help → Product tours." },
  ];
  return (
    <div className="grid w-full max-w-md gap-4">
      <div ref={board} className="grid grid-cols-3 gap-2 rounded-ui-lg border border-line bg-surface p-3 text-xs">
        {[["Unassigned", 2], ["En route", 1], ["On site", 1]].map(([label, n]) => (
          <div key={label} className="grid gap-1.5">
            <p className="font-medium text-fg-muted">{label}</p>
            {Array.from({ length: n as number }, (_, i) => (
              <div key={i} className="h-9 rounded-ui-sm border border-line bg-surface-2" />
            ))}
          </div>
        ))}
      </div>
      <Button className="justify-self-start" onClick={() => setOpen(true)}>
        Show welcome tour
      </Button>
      {/* Steps without a target show centred with the page dimmed. */}
      <Tour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  );
}

"use client";

import * as React from "react";
import { Bell, Plus, Search } from "lucide-react";
import { Button, IconButton, Kbd, Tour, type TourStep } from "@vamos-ui/react";

export default function TourDemo() {
  const [open, setOpen] = React.useState(false);
  const search = React.useRef<HTMLButtonElement>(null);
  const create = React.useRef<HTMLButtonElement>(null);
  const alerts = React.useRef<HTMLButtonElement>(null);
  const report = React.useRef<HTMLDivElement>(null);

  const steps: TourStep[] = [
    { target: search, title: "Find anything", description: "Orders, customers and products from one box.", content: <p className="text-xs text-fg-subtle">Shortcut <Kbd>Ctrl</Kbd> <Kbd>K</Kbd></p> },
    { target: create, title: "Create in one click", description: "New orders, products and discount codes start here.", side: "bottom", align: "end" },
    { target: report, title: "Today at a glance", description: "Revenue and orders refresh every minute. Click a number to open the report.", side: "top", padding: 8 },
    { target: alerts, title: "Stay ahead of problems", description: "Low stock, failed payments and SLA warnings land here.", side: "left" },
  ];

  return (
    <div className="grid w-full max-w-xl gap-4">
      <div className="flex items-center gap-2 rounded-ui-lg border border-line bg-surface px-3 py-2">
        <span className="me-auto text-sm font-semibold text-fg">Kiln &amp; Linen</span>
        <Button ref={search} size="sm" variant="secondary" className="w-44 justify-start text-fg-muted">
          <Search aria-hidden="true" /> Search…
        </Button>
        <IconButton ref={alerts} label="Notifications" size="sm">
          <Bell />
        </IconButton>
        <Button ref={create} size="sm" variant="primary">
          <Plus aria-hidden="true" /> New
        </Button>
      </div>
      <div ref={report} className="grid grid-cols-2 gap-px overflow-hidden rounded-ui-lg border border-line bg-line">
        <div className="bg-surface p-4">
          <p className="text-xs text-fg-muted">Revenue today</p>
          <p className="mt-1 text-xl font-semibold text-fg tabular">₺84,210</p>
        </div>
        <div className="bg-surface p-4">
          <p className="text-xs text-fg-muted">Orders</p>
          <p className="mt-1 text-xl font-semibold text-fg tabular">71</p>
        </div>
      </div>
      <Button className="justify-self-start" onClick={() => setOpen(true)}>
        Start the tour
      </Button>
      <Tour steps={steps} open={open} onOpenChange={setOpen} />
    </div>
  );
}

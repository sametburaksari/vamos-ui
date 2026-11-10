"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, controlVariants, itemSlots, itemVariants } from "@vamos-cms/ui";

const pipelines = [
  { id: "new-business", name: "New business", deals: 42 },
  { id: "renewals", name: "Renewals", deals: 17 },
  { id: "partners", name: "Partner referrals", deals: 9 },
];

export default function PopoverTriggerWidth() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("new-business");
  const current = pipelines.find((p) => p.id === value)!;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={controlVariants({ className: "w-64 justify-between" })} aria-label={`Pipeline: ${current.name}`}>
        <span className="truncate">{current.name}</span>
        <ChevronsUpDown className="text-fg-subtle" />
      </PopoverTrigger>
      {/* size="trigger" matches the trigger width; padded={false} for lists */}
      <PopoverContent size="trigger" padded={false} align="start" className="p-1" aria-label="Pipelines">
        {pipelines.map((p) => (
          <button
            key={p.id}
            type="button"
            className={itemVariants({ inset: true })}
            aria-pressed={p.id === value}
            onClick={() => {
              setValue(p.id);
              setOpen(false);
            }}
          >
            {p.id === value ? <Check className={itemSlots.indicator} /> : null}
            <span className={itemSlots.label}>{p.name}</span>
            <span className={itemSlots.shortcut}>{p.deals} deals</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

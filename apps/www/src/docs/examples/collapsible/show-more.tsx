"use client";

import * as React from "react";
import { Button, Collapsible, CollapsibleContent, CollapsibleTrigger } from "@vamos-ui/react";

const tags = ["Wholesale", "Net 30", "EU VAT", "Priority support", "Annual contract", "Referral", "Pilot 2025", "Key account"];

// asChild: any button becomes the trigger. The first items stay outside the region.
export default function CollapsibleShowMore() {
  const [open, setOpen] = React.useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm">
      <div className="flex flex-wrap gap-1.5">
        {tags.slice(0, 3).map((t) => (
          <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-fg-muted">{t}</span>
        ))}
      </div>
      <CollapsibleContent>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          {tags.slice(3).map((t) => (
            <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-fg-muted">{t}</span>
          ))}
        </div>
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="mt-2">
          {open ? "Show fewer" : `Show ${tags.length - 3} more`}
        </Button>
      </CollapsibleTrigger>
    </Collapsible>
  );
}

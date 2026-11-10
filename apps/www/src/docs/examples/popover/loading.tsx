"use client";

import * as React from "react";
import { History } from "lucide-react";
import { Button, Popover, PopoverContent, PopoverHeader, PopoverTrigger, SkeletonText } from "@vamos-ui/react";

const revisions = [
  { who: "Leyla Aksoy", when: "Today, 10:42", what: "Updated pricing table" },
  { who: "Daniel Okafor", when: "Yesterday, 17:05", what: "Fixed two typos in the intro" },
  { who: "Leyla Aksoy", when: "Nov 7, 09:18", what: "First draft" },
];

export default function PopoverLoading() {
  const [rows, setRows] = React.useState<typeof revisions | null>(null);
  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) return setRows(null);
        // fetch on open; show a skeleton meanwhile
        setTimeout(() => setRows(revisions), 900);
      }}
    >
      <PopoverTrigger asChild>
        <Button>
          <History /> Revisions
        </Button>
      </PopoverTrigger>
      <PopoverContent size="md">
        <PopoverHeader title="Recent revisions" />
        {rows ? (
          <ol className="grid gap-2.5">
            {rows.map((r) => (
              <li key={r.when} className="grid grid-cols-[1fr_auto] gap-x-3 text-sm">
                <span className="text-fg">{r.what}</span>
                <span className="text-xs tabular text-fg-subtle">{r.when}</span>
                <span className="text-xs text-fg-muted">{r.who}</span>
              </li>
            ))}
          </ol>
        ) : (
          <SkeletonText lines={3} />
        )}
      </PopoverContent>
    </Popover>
  );
}

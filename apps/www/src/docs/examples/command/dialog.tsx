"use client";

import * as React from "react";
import { CalendarDays, Contact, FileText, KanbanSquare } from "lucide-react";
import { Button, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, KbdGroup, useHotkeys } from "@vamos-cms/ui";

export default function CommandDialogExample() {
  const [open, setOpen] = React.useState(false);
  // In an app this is "mod+k"; this page already uses ⌘K for its own search.
  useHotkeys("mod+j", () => setOpen((o) => !o));

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Open palette <KbdGroup keys="mod+j" size="sm" />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a page…" />
        <CommandList>
          <CommandEmpty />
          <CommandGroup heading="Go to">
            {[
              { label: "Posts", icon: <FileText />, app: "Site" },
              { label: "Pipeline", icon: <KanbanSquare />, app: "CRM" },
              { label: "Contacts", icon: <Contact />, app: "CRM" },
              { label: "Leave calendar", icon: <CalendarDays />, app: "People" },
            ].map((p) => (
              <CommandItem key={p.label} icon={p.icon} description={p.app} onSelect={() => setOpen(false)}>
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

"use client";

import * as React from "react";
import { Mail, Phone } from "lucide-react";
import { Badge, Button, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@vamos-ui/react";

const contacts = [
  { name: "Elif Demir", company: "Moda Wellness", role: "Operations lead", email: "elif@modawellness.com", phone: "+90 532 418 22 10", stage: "Customer", value: "$4,500" },
  { name: "Can Yıldız", company: "Kadıköy Bistro", role: "Owner", email: "can@kadikoybistro.com", phone: "+90 541 220 71 05", stage: "Negotiation", value: "$1,280 / mo" },
  { name: "Ayşe Kaya", company: "Caddebostan Studio", role: "Marketing", email: "ayse@caddebostanstudio.com", phone: "+90 555 093 64 38", stage: "Proposal sent", value: "$2,900" },
];

export default function SheetRecordPreview() {
  const [selected, setSelected] = React.useState<(typeof contacts)[number] | null>(null);

  return (
    <div className="w-full max-w-lg">
      <ul className="divide-y divide-line overflow-hidden rounded-ui border border-line bg-surface">
        {contacts.map((c) => (
          <li key={c.email}>
            <button
              type="button"
              aria-pressed={selected?.email === c.email}
              onClick={() => setSelected(c)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start text-sm hover:bg-hover focus-ring aria-pressed:bg-selected"
            >
              <span>
                <span className="block font-medium">{c.name}</span>
                <span className="text-[13px] text-fg-muted">{c.company}</span>
              </span>
              <Badge tone={c.stage === "Customer" ? "success" : "info"}>{c.stage}</Badge>
            </button>
          </li>
        ))}
      </ul>

      {/* modal={false}: no overlay, the list stays clickable — pick another row to switch. */}
      <Sheet modal={false} open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="end" size="sm" inset>
          {selected ? (
            <>
              <SheetHeader title={selected.name} description={`${selected.role} · ${selected.company}`} />
              <SheetBody className="grid gap-3 text-[13px]">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-fg hover:underline">
                  <Mail className="size-4 text-fg-subtle" /> {selected.email}
                </a>
                <span className="flex items-center gap-2 tabular">
                  <Phone className="size-4 text-fg-subtle" /> {selected.phone}
                </span>
                <div className="surface-2 mt-2 grid gap-1 rounded-ui p-3">
                  <span className="text-fg-muted">Open deal value</span>
                  <span className="text-lg font-semibold tabular text-fg">{selected.value}</span>
                </div>
              </SheetBody>
              <SheetFooter>
                <Button variant="primary" size="sm">
                  Open contact
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

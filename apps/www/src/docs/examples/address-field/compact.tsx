"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import {
  AddressField,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  formatAddress,
  type Address,
} from "@vamos-ui/react";

export default function AddressCompact() {
  const [saved, setSaved] = React.useState<Address>({ country: "TR", region1: "İzmir", region2: "Konak", line1: "Alsancak Mah. 1482 Sk. No: 7 D: 3", postalCode: "35220" });
  const [draft, setDraft] = React.useState(saved);
  return (
    <div className="flex w-full max-w-md items-start gap-3 rounded-ui border border-line bg-surface p-4">
      <MapPin aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-fg">Ege Pilates Studio · branch address</p>
        <p className="mt-1 text-[13px] leading-relaxed text-fg-muted">{formatAddress(saved, { includeCountry: false }).join(", ")}</p>
      </div>
      <Dialog onOpenChange={(open) => open && setDraft(saved)}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent size="md">
          <DialogHeader title="Branch address" description="Shown on invoices and the website contact page." />
          <DialogBody>
            <AddressField value={draft} onValueChange={setDraft} countries={["TR"]} fields={["region1", "region2", "line1", "line2", "postalCode"]} />
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="primary" onClick={() => setSaved(draft)}>
                Save address
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

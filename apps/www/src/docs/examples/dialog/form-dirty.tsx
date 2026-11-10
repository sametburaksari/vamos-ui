"use client";

import * as React from "react";
import { Button, ConfirmProvider, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger, Field, Input, Textarea, useConfirm } from "@vamos-cms/ui";

function LeaveRequestDialog() {
  const confirm = useConfirm();
  const [dirty, setDirty] = React.useState(false);

  return (
    <Dialog onOpenChange={(open) => !open && setDirty(false)}>
      <DialogTrigger asChild>
        <Button variant="primary">Request leave</Button>
      </DialogTrigger>
      <DialogContent
        size="md"
        // Any close attempt (Esc, overlay, ×, Cancel) asks first while there are unsaved changes.
        onBeforeClose={() =>
          !dirty ||
          confirm({ title: "Discard this leave request?", description: "The dates and note you entered will be lost.", tone: "danger", confirmLabel: "Discard", cancelLabel: "Keep editing" })
        }
      >
        <DialogHeader title="Create leave request" description="Your manager, Mert Aksoy, approves requests within two working days." />
        <DialogBody className="grid gap-4" onChange={() => setDirty(true)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From">
              <Input type="date" defaultValue="2026-12-22" />
            </Field>
            <Field label="Until">
              <Input type="date" defaultValue="2026-12-31" />
            </Field>
          </div>
          <Field label="Note for your manager" optional>
            <Textarea placeholder="Family visit in Izmir — Zeynep covers the support queue." />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <Button variant="primary">Send request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DialogFormDirty() {
  return (
    <ConfirmProvider>
      <LeaveRequestDialog />
    </ConfirmProvider>
  );
}

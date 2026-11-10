"use client";

import * as React from "react";
import { Alert, Button, Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger, Field, Input } from "@vamos-cms/ui";

export default function DialogSubmitting() {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "saving" | "error">("idle");
  const attempts = React.useRef(0);

  const invite = () => {
    setState("saving");
    // The first attempt fails so you can see the error state; the second succeeds.
    window.setTimeout(() => {
      attempts.current += 1;
      if (attempts.current % 2 === 1) setState("error");
      else {
        setState("idle");
        setOpen(false);
      }
    }, 1400);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setState("idle");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="primary">Invite partner</Button>
      </DialogTrigger>
      {/* While saving, Esc and outside clicks are ignored and the buttons are locked. */}
      <DialogContent size="sm" dismissible={state !== "saving"} hideClose={state === "saving"}>
        <DialogHeader title="Invite partner" description="They get an email with a link to the partner portal." />
        <DialogBody className="grid gap-4">
          {state === "error" ? (
            <Alert tone="danger" size="sm" live="assertive" title="Invitation not sent">
              The mail server didn&apos;t respond. Try again in a moment.
            </Alert>
          ) : null}
          <Field label="Partner email">
            <Input type="email" defaultValue="ops@kadikoybistro.com" disabled={state === "saving"} />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={state === "saving"}>Cancel</Button>
          </DialogClose>
          <Button variant="primary" loading={state === "saving"} loadingText="Sending…" onClick={invite}>
            {state === "error" ? "Try again" : "Send invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

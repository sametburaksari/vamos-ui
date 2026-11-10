"use client";

import * as React from "react";
import { Button, Dialog, DialogBody, DialogContent, DialogHeader, DialogTrigger, Field, Input, Textarea } from "@vamos-ui/react";
import { MultiStepForm, MultiStepFormFooter, MultiStepFormStep, MultiStepFormStepper } from "@vamos-ui/react/business";

export default function MultiStepFormDialog() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary">New deal</Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader title="New deal" description="Three short steps. You can go back at any time." />
        <DialogBody>
          <MultiStepForm
            presentation="dialog"
            steps={[{ id: "company", title: "Company" }, { id: "deal", title: "Deal" }, { id: "notes", title: "Notes", optional: true }]}
            onComplete={async () => {
              await new Promise((r) => setTimeout(r, 500));
              setOpen(false);
            }}
          >
            <MultiStepFormStepper variant="compact" />
            <MultiStepFormStep id="company">
              <Field label="Company">
                <Input defaultValue="Fabrikam Logistics" />
              </Field>
            </MultiStepFormStep>
            <MultiStepFormStep id="deal">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Deal name">
                  <Input defaultValue="Fleet tracking — 140 vehicles" />
                </Field>
                <Field label="Expected close">
                  <Input type="date" defaultValue="2026-12-18" />
                </Field>
              </div>
            </MultiStepFormStep>
            <MultiStepFormStep id="notes">
              <Field label="Notes">
                <Textarea rows={3} defaultValue="Procurement wants a pilot in Ankara first." />
              </Field>
            </MultiStepFormStep>
            <MultiStepFormFooter submitLabel="Create deal" />
          </MultiStepForm>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

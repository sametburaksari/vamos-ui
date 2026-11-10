"use client";

import * as React from "react";
import { Button, Stepper } from "@vamos-ui/react";

const steps = [
  { id: "company", title: "Company" },
  { id: "contacts", title: "Contacts" },
  { id: "products", title: "Products", description: "3 line items" },
  { id: "terms", title: "Terms" },
  { id: "summary", title: "Summary" },
];

// CRM "New deal" wizard: completed steps are buttons; upcoming ones are text.
export default function StepperClickable() {
  const [step, setStep] = React.useState(3);
  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <Stepper value={step} onValueChange={setStep} steps={steps} size="sm" aria-label="New deal" />
      <div className="flex items-center justify-between rounded-ui border border-line px-4 py-3 text-sm">
        <span className="text-fg-muted">
          Editing <span className="font-medium text-fg">{steps[step]!.title}</span>
        </span>
        <Button size="sm" variant="primary" disabled={step === steps.length - 1} onClick={() => setStep((s) => s + 1)}>
          Next step
        </Button>
      </div>
    </div>
  );
}

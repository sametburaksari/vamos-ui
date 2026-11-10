"use client";

import * as React from "react";
import { Button, Input, Step, Stepper } from "@vamos-ui/react";

// HR onboarding: the current step shows its content inline.
export default function StepperVertical() {
  const [step, setStep] = React.useState(1);
  const nav = (
    <div className="mt-3 flex gap-2">
      <Button size="sm" variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>
        Back
      </Button>
      <Button size="sm" variant="primary" onClick={() => setStep((s) => Math.min(3, s + 1))}>
        Continue
      </Button>
    </div>
  );
  return (
    <Stepper value={step} onValueChange={setStep} orientation="vertical" aria-label="Onboarding" className="w-full max-w-md">
      <Step title="Personal details" description="Name, address, emergency contact">
        {nav}
      </Step>
      <Step title="Bank account" description="Where your salary is paid">
        <Input aria-label="IBAN" placeholder="TR33 0006 1005 1978 6457 8413 26" className="font-mono" />
        {nav}
      </Step>
      <Step title="Equipment" optional description="Laptop and accessories">
        {nav}
      </Step>
      <Step title="Sign contract" description="Electronic signature">
        {nav}
      </Step>
    </Stepper>
  );
}

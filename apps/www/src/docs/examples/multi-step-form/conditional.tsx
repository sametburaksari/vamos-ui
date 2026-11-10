"use client";

import * as React from "react";
import { Field, Input, RadioGroup } from "@vamos-ui/react";
import { MultiStepForm, MultiStepFormFooter, MultiStepFormStep, MultiStepFormStepper, type StepDef } from "@vamos-ui/react/business";

type Kind = "individual" | "company";

export default function MultiStepFormConditional() {
  const [kind, setKind] = React.useState<Kind>("company");
  // The "Tax details" step exists only for companies; the Stepper count updates live.
  const steps: StepDef<{ kind: Kind }>[] = [
    { id: "account", title: "Account type" },
    { id: "tax", title: "Tax details", when: (c) => c.kind === "company" },
    { id: "bank", title: "Payout account" },
  ];
  return (
    <div className="w-full max-w-xl">
      <MultiStepForm steps={steps} context={{ kind }} presentation="dialog" onComplete={() => new Promise((r) => setTimeout(r, 600))}>
        <MultiStepFormStepper />
        <MultiStepFormStep id="account">
          <RadioGroup<Kind>
            aria-label="Account type"
            variant="card"
            value={kind}
            onValueChange={setKind}
            items={[
              { value: "individual", label: "Individual", description: "Freelancers and sole traders" },
              { value: "company", label: "Company", description: "Limited or joint-stock companies" },
            ]}
          />
        </MultiStepFormStep>
        <MultiStepFormStep id="tax">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tax office">
              <Input defaultValue="Kozyatağı" />
            </Field>
            <Field label="Tax number (VKN)">
              <Input inputMode="numeric" defaultValue="1234567890" />
            </Field>
          </div>
        </MultiStepFormStep>
        <MultiStepFormStep id="bank">
          <Field label="IBAN">
            <Input defaultValue="TR33 0006 1005 1978 6457 8413 26" />
          </Field>
        </MultiStepFormStep>
        <MultiStepFormFooter submitLabel="Submit application" />
      </MultiStepForm>
    </div>
  );
}

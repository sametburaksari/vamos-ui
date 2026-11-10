"use client";

import { Field, Input, Switch } from "@vamos-ui/react";
import { MultiStepForm, MultiStepFormFooter, MultiStepFormStep, MultiStepFormStepper } from "@vamos-ui/react/business";

export default function MultiStepFormVertical() {
  // Vertical: the stepper becomes a sticky side rail with descriptions; linear={false} lets people jump around.
  return (
    <div className="w-full">
      <MultiStepForm
        orientation="vertical"
        presentation="dialog"
        linear={false}
        steps={[
          { id: "store", title: "Store", description: "Name and address" },
          { id: "shipping", title: "Shipping", description: "Zones and carriers" },
          { id: "payments", title: "Payments", description: "Cards and transfers" },
        ]}
        onComplete={() => new Promise((r) => setTimeout(r, 600))}
      >
        <MultiStepFormStepper />
        <MultiStepFormStep id="store">
          <Field label="Store name">
            <Input defaultValue="Moda Atölye" />
          </Field>
        </MultiStepFormStep>
        <MultiStepFormStep id="shipping">
          <Field label="Free shipping over" hint="Orders above this ship free in Türkiye.">
            <Input defaultValue="750" inputMode="decimal" />
          </Field>
        </MultiStepFormStep>
        <MultiStepFormStep id="payments">
          <Switch defaultChecked label="Accept bank transfers (EFT/Havale)" />
        </MultiStepFormStep>
        <MultiStepFormFooter submitLabel="Open store" />
      </MultiStepForm>
    </div>
  );
}

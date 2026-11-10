"use client";

import * as React from "react";
import { Field, Input, Textarea } from "@vamos-cms/ui";
import { MultiStepForm, MultiStepFormFooter, MultiStepFormStep, MultiStepFormStepper } from "@vamos-cms/ui/business";

export default function MultiStepFormDraft() {
  const [saves, setSaves] = React.useState(0);
  // Autosave every 15 s plus a manual "Save draft". syncUrl mirrors the step as ?application=…,
  // so a reload or a shared link resumes on the same step. confirmLeave warns before closing the tab.
  return (
    <div className="w-full max-w-2xl">
      <MultiStepForm
        syncUrl={{ key: "application" }}
        confirmLeave
        autosave={{ intervalMs: 15000 }}
        onSaveDraft={async () => {
          await new Promise((r) => setTimeout(r, 400));
          setSaves((n) => n + 1);
        }}
        steps={[
          { id: "company", title: "Company" },
          { id: "programme", title: "Partner programme" },
          { id: "agreement", title: "Agreement" },
        ]}
        onComplete={() => new Promise((r) => setTimeout(r, 700))}
      >
        <MultiStepFormStepper />
        <MultiStepFormStep id="company">
          <Field label="Registered name">
            <Input defaultValue="Kuzey Bilişim Ltd. Şti." />
          </Field>
        </MultiStepFormStep>
        <MultiStepFormStep id="programme">
          <Field label="Which products will you resell?" hint={`Draft saved ${saves} times in this session.`}>
            <Textarea rows={3} defaultValue="vTag NFC cards for hotel chains in the Aegean region." />
          </Field>
        </MultiStepFormStep>
        <MultiStepFormStep id="agreement">
          <p className="text-sm text-fg-muted">By submitting you accept the reseller agreement (v3.2, October 2026).</p>
        </MultiStepFormStep>
        <MultiStepFormFooter submitLabel="Apply" />
      </MultiStepForm>
    </div>
  );
}

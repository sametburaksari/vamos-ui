"use client";

import * as React from "react";
import { Field, IdInput, NationalIdInput, TaxIdInput } from "@vamos-cms/ui";

export default function NationalIdExample() {
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
  const [kind, setKind] = React.useState<string>();
  const track = (key: string) => (r: { message?: string }) => setErrors((e) => ({ ...e, [key]: r.message }));
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Field label="Turkish ID number (TCKN)" hint={kind === "tr-ykn" ? "Foreign resident number (YKN)" : "Try 38291746550 or 99238174676."} error={errors.tckn}>
        <NationalIdInput onValidate={track("tckn")} onValueChange={(_, meta) => setKind(meta.kind)} />
      </Field>
      <Field label="Tax number (VKN)" error={errors.vkn}>
        <IdInput kind="tr-vkn" onValidate={track("vkn")} />
      </Field>
      <Field label="Invoice party" hint="VKN, or a sole proprietor's TCKN." error={errors.party}>
        <TaxIdInput onValidate={track("party")} />
      </Field>
      <Field label="Employee ID on file" hint="Masked until focused (KVKK).">
        <NationalIdInput defaultValue="38291746550" masked />
      </Field>
    </div>
  );
}

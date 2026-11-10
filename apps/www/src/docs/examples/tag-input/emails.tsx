"use client";

import { Field, TagInput } from "@vamos-cms/ui";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Not a valid email address";

export default function TagInputEmails() {
  return (
    <Field label="Send invoice to" hint="Invalid addresses are marked red and block sending." className="w-full max-w-lg">
      <TagInput
        name="recipients"
        defaultValue={["accounts@northwind.com", "maria.santos@northwind", "finance@brightlabs.de"]}
        validate={isEmail}
        delimiters={["Enter", "Tab", ",", " ", ";"]}
        transform={(v) => v.trim().toLowerCase()}
        addOnBlur
        placeholder="name@company.com"
      />
    </Field>
  );
}

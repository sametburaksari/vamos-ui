"use client";

import { Avatar, Combobox, Field } from "@vamos-ui/react";

const contacts = [
  { value: "c1", label: "Maria Santos", email: "maria@northwind.com", company: "Northwind" },
  { value: "c2", label: "James Whitfield", email: "j.whitfield@northpoint.io", company: "Northpoint" },
  { value: "c3", label: "Aylin Korkmaz", email: "aylin@deniz.com.tr", company: "Deniz Lojistik" },
  { value: "c4", label: "Tom Becker", email: "tom@brightlabs.de", company: "Bright Labs" },
  { value: "c5", label: "Nadia Rahman", email: "nadia.rahman@helio.co", company: "Helio" },
  { value: "c6", label: "Ethan Clarke", email: "ethan@clarke-partners.com", company: "Clarke & Partners" },
].map((c) => ({ ...c, keywords: [c.email, c.company] }));

export default function ComboboxRichItems() {
  return (
    <Field label="Primary contact" hint="Search by name, email or company." className="w-full max-w-sm">
      <Combobox
        items={contacts}
        defaultValue="c3"
        searchPlaceholder="Search contacts…"
        renderItem={(c, { highlight }) => (
          <>
            <Avatar name={c.label} size="sm" />
            <span className="grid min-w-0 flex-1">
              <span className="truncate">{highlight}</span>
              <span className="truncate text-xs text-fg-subtle">
                {c.email} · {c.company}
              </span>
            </span>
          </>
        )}
      />
    </Field>
  );
}

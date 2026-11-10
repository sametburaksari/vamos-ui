"use client";

import * as React from "react";
import { Combobox, Field, type ComboboxOption } from "@vamos-cms/ui";

const initial: ComboboxOption[] = [
  { value: "product-updates", label: "Product updates" },
  { value: "case-studies", label: "Case studies" },
  { value: "engineering", label: "Engineering" },
  { value: "guides", label: "Guides" },
  { value: "company-news", label: "Company news" },
];

export default function ComboboxCreatable() {
  const [categories, setCategories] = React.useState(initial);
  const [value, setValue] = React.useState<string | null>("guides");
  return (
    <Field label="Category" hint="Type a new name to create a category." className="w-full max-w-xs">
      <Combobox
        items={categories}
        value={value}
        onValueChange={setValue}
        onCreate={async (label) => {
          // e.g. await api.categories.create({ label })
          await new Promise((r) => setTimeout(r, 400));
          const created = { value: label.toLowerCase().replace(/\s+/g, "-"), label };
          setCategories((list) => [...list, created]);
          return created;
        }}
      />
    </Field>
  );
}

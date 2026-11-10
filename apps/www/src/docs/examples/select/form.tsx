"use client";

import * as React from "react";
import { Button, Field, Select } from "@vamos-cms/ui";

export default function SelectForm() {
  const [submitted, setSubmitted] = React.useState<string | null>(null);
  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted(JSON.stringify(Object.fromEntries(data)));
      }}
    >
      <Field label="Leave type" required>
        <Select
          name="type"
          required
          placeholder="Choose a type"
          items={[
            { value: "annual", label: "Annual leave", description: "14 days left this year" },
            { value: "sick", label: "Sick leave" },
            { value: "parental", label: "Parental leave" },
            { value: "unpaid", label: "Unpaid leave" },
          ]}
        />
      </Field>
      <Field label="Approver">
        <Select
          name="approver"
          defaultValue="selin"
          items={[
            { value: "selin", label: "Selin Demir (manager)" },
            { value: "omar", label: "Omar Haddad (HR)" },
          ]}
        />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Request leave
        </Button>
        {submitted ? <code className="truncate font-mono text-xs text-fg-muted">{submitted}</code> : null}
      </div>
    </form>
  );
}

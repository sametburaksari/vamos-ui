"use client";

import * as React from "react";
import { ImportWizard, type ImportField, type MappingTemplate } from "@vamos-ui/react/business";

const fields: ImportField[] = [
  { id: "from", label: "From path", aliases: ["Source", "Old URL"], required: true, type: "text" },
  { id: "to", label: "To path", aliases: ["Target", "New URL", "Destination"], required: true, type: "text" },
  { id: "code", label: "Status code", aliases: ["Type"], type: "enum", options: [{ value: "301", label: "301 Permanent" , aliases: ["permanent"] }, { value: "302", label: "302 Temporary", aliases: ["temporary"] }] },
];

const sample = ["Old address,Where it goes now,Kind", "/blog/2019/launch,/news/launch,permanent", "/shop?cat=12,/collections/linen,temporary"].join("\n");

export default function ImportWizardTemplates() {
  // Headers that don't auto-map ("Where it goes now") are mapped once, saved, and reapplied next time.
  const store = React.useRef<MappingTemplate[]>([{ id: "wp", name: "WordPress Redirection plugin", mapping: { oldaddress: "from", whereitgoesnow: "to", kind: "code" } }]);
  const templates = React.useMemo(
    () => ({
      list: async () => store.current,
      save: async (t: MappingTemplate) => void store.current.push(t),
    }),
    [],
  );
  return (
    <div className="w-full max-w-3xl">
      <ImportWizard
        fields={fields}
        templates={templates}
        sampleFile={{ name: "redirects.csv", href: `data:text/csv;charset=utf-8,${encodeURIComponent(sample)}` }}
        onImport={async (rows) => ({ ok: rows.length, failed: [] })}
      />
    </div>
  );
}

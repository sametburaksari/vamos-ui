"use client";

import * as React from "react";
import { SchemaForm } from "@vamos-ui/react/editor";
import { pricingBlock } from "./_blocks";

export default function InspectorForm() {
  const [value, setValue] = React.useState<Record<string, unknown>>(pricingBlock.sample() as Record<string, unknown>);
  const result = pricingBlock.schema.safeParse(value);

  return (
    <div className="grid w-full gap-6 md:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="rounded-ui-lg border border-line bg-surface p-4">
        <SchemaForm schema={pricingBlock.schema} value={value} onChange={setValue} errors={result.success ? null : result.error.issues} locale="en" />
      </div>
      <pre tabIndex={0} role="region" aria-label="Block props (JSON)" className="focus-ring max-h-[32rem] min-w-0 overflow-auto rounded-ui-lg border border-line bg-surface-2 p-4 font-mono text-xs leading-relaxed text-fg-muted">
        {result.success ? "" : `// ${result.error.issues.length} issue(s)\n`}
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

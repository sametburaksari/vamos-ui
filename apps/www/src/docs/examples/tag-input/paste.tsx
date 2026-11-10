"use client";

import * as React from "react";
import { Button, Field, TagInput } from "@vamos-cms/ui";

const fromSpreadsheet = "Figma, React, TypeScript\nSQL; Data visualisation\nUser research";

export default function TagInputPaste() {
  const [skills, setSkills] = React.useState<string[]>(["Figma"]);
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Field label="Skills" hint="Paste a comma-, semicolon- or line-separated list. Duplicates are skipped.">
        <TagInput name="skills" value={skills} onValueChange={setSkills} />
      </Field>
      <div className="flex flex-wrap items-center gap-3 rounded-ui border border-dashed border-line p-3">
        <pre className="min-w-0 flex-1 font-mono text-xs leading-relaxed whitespace-pre-wrap text-fg-muted">{fromSpreadsheet}</pre>
        <Button
          size="sm"
          onClick={async () => {
            await navigator.clipboard?.writeText(fromSpreadsheet).catch(() => {});
            setCopied(true);
          }}
        >
          {copied ? "Copied — now paste" : "Copy sample"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { IconButton } from "@vamos-cms/ui";

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <IconButton
      size="xs"
      label={done ? "Copied" : "Copy code"}
      className={className}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? <Check className="text-success" /> : <Copy />}
    </IconButton>
  );
}

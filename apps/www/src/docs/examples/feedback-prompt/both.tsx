"use client";

import * as React from "react";
import { FeedbackPrompt, type FeedbackPromptValue } from "@vamos-ui/react";

export default function FeedbackPromptBoth() {
  const [last, setLast] = React.useState<FeedbackPromptValue | null>(null);
  return (
    <div className="grid w-full max-w-lg gap-3">
      <FeedbackPrompt
        followUp="both"
        yesReasons={[
          { value: "examples", label: "The examples" },
          { value: "short", label: "Short and clear" },
        ]}
        reasons={[
          { value: "outdated", label: "Out of date" },
          { value: "unclear", label: "Hard to follow" },
        ]}
        labels={{ question: "Was this guide useful?" }}
        onSubmit={setLast}
      />
      <pre className="m-0 overflow-x-auto rounded-ui bg-selected p-3 font-mono text-xs text-fg-muted">{last ? JSON.stringify(last, null, 2) : "onSubmit value appears here"}</pre>
    </div>
  );
}

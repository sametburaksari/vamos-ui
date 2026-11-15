"use client";

import { FeedbackPrompt } from "@vamos-ui/react";

export default function FeedbackPromptInline() {
  return (
    <div className="w-full max-w-2xl">
      <p className="m-0 mb-6 text-sm text-fg-muted">…end of the article.</p>
      <FeedbackPrompt variant="inline" followUp="never" labels={{ question: "Did this page answer your question?" }} />
    </div>
  );
}

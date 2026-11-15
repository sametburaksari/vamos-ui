"use client";

import { FeedbackPrompt } from "@vamos-ui/react";

export default function FeedbackPromptDemo() {
  return (
    <div className="w-full max-w-lg">
      <FeedbackPrompt
        reasons={[
          { value: "steps", label: "Steps don’t match what I see" },
          { value: "unclear", label: "Hard to follow" },
          { value: "missing", label: "My question isn’t covered" },
        ]}
        commentHint="Don’t include passwords or personal data."
        thanksDetail="We read every answer and update the page when it falls short."
        onSubmit={() => new Promise((resolve) => setTimeout(resolve, 600))}
      />
    </div>
  );
}

import { ex, type DocEntry } from "../types";
import FeedbackPromptDemo from "../examples/feedback-prompt/demo";
import FeedbackPromptInline from "../examples/feedback-prompt/inline";
import FeedbackPromptBoth from "../examples/feedback-prompt/both";

const entry: DocEntry = {
  slug: "feedback-prompt",
  title: "Feedback prompt",
  group: "Overlays & feedback",
  description:
    "\"Was this helpful?\" for help articles, docs and guides: a yes / no vote, an optional follow-up with reason chips and a comment, and a thank-you state. onSubmit gets one value; a promise shows the busy state and a rejection lets the reader retry. Results are announced in a polite live region.",
  source: ["components/feedback-prompt.tsx"],
  usage: `import { FeedbackPrompt } from "@vamos-ui/react";

<FeedbackPrompt
  reasons={[{ value: "unclear", label: "Hard to follow" }, { value: "outdated", label: "Out of date" }]}
  onSubmit={(value) => saveFeedback({ page: slug, ...value })}
/>`,
  demo: ex("demo", "Help article", "feedback-prompt/demo.tsx", FeedbackPromptDemo),
  examples: [
    ex("inline", "Inline, vote only", "feedback-prompt/inline.tsx", FeedbackPromptInline, "variant=\"inline\" for page footers; followUp=\"never\" submits the vote straight away."),
    ex("both", "Follow-up after both answers", "feedback-prompt/both.tsx", FeedbackPromptBoth, "followUp=\"both\" with yesReasons; the value passed to onSubmit is shown below."),
  ],
  api: [
    { name: "FeedbackPrompt", props: [
      { name: "onSubmit", type: "(value: { helpful; reasons; comment }) => void | Promise<void>", description: "Called once. A rejected promise shows the error and keeps the answer for a retry." },
      { name: "followUp", type: '"no" | "both" | "never"', default: '"no"', description: "When to ask what was missing / what helped." },
      { name: "reasons / yesReasons", type: "{ value; label }[]", description: "Reason chips for a no / yes answer." },
      { name: "comment", type: "boolean", default: "true", description: "Free-text field in the follow-up." },
      { name: "commentHint", type: "ReactNode", description: "Hint under the comment (\"Don't include personal data\")." },
      { name: "maxLength", type: "number", default: "1000", description: "Comment length cap." },
      { name: "thanksDetail", type: "ReactNode", description: "Line under the thank-you." },
      { name: "headingLevel", type: "2 | 3 | 4", default: "2", description: "Level of the question heading." },
      { name: "variant", type: '"card" | "inline"', default: '"card"', description: "Bordered panel or a top-ruled row." },
      { name: "labels", type: "Partial<FeedbackPromptLabels>", description: 'Dictionary namespace "feedbackPrompt": question, yes, no, followUpYes, followUpNo, comment, submit, skip, thanks, error.' },
    ] },
  ],
  notes: ["Skip still records the vote, without reasons or comment.", "The section is labelled by the question; the vote buttons use aria-pressed."],
  covers: [],
};

export default entry;

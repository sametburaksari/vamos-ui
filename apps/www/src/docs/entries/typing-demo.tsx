import { ex, type DocEntry } from "../types";
import TypingDemoDemo from "../examples/typing-demo/demo";
import TypingDemoLoop from "../examples/typing-demo/loop";
import TypingDemoManual from "../examples/typing-demo/manual";

const entry: DocEntry = {
  slug: "typing-demo",
  title: "Typing demo",
  group: "Media",
  description:
    "Plays a scripted typing sequence — type, pause, delete, rewrite — for product demos and heroes. Screen readers and the server get the final text only, the height is reserved so nothing jumps, a button plays, pauses and replays, and reduced motion shows the final text.",
  source: ["components/typing-demo.tsx"],
  usage: `import { TypingDemo } from "@vamos-ui/react";

<TypingDemo
  steps={[
    "Hi all, I was wondering if maybe we could",
    { type: "pause", duration: 800 },
    { type: "replace", text: "Can we move the review to Thursday?" },
  ]}
/>`,
  demo: ex("demo", "Demo", "typing-demo/demo.tsx", TypingDemoDemo),
  examples: [
    ex("loop", "Looping hero phrase", "typing-demo/loop.tsx", TypingDemoLoop, "loop with replace steps; the pause control stays (WCAG 2.2.2)."),
    ex("manual", "Play on demand", "typing-demo/manual.tsx", TypingDemoManual, "autoPlay={false} shows the final text until Replay; set swaps text instantly."),
  ],
  api: [
    { name: "TypingDemo", props: [
      { name: "steps", type: "TypingStep[]", description: 'Strings (typed), or { type: "type" | "delete" | "replace" | "pause" | "set", … }. replace erases everything, then types.' },
      { name: "speed", type: "number", default: "35", description: "Milliseconds per character (a beat longer after punctuation, quicker over spaces)." },
      { name: "autoPlay", type: 'boolean | "in-view"', default: '"in-view"', description: "Start when a third is visible, on mount, or only on Play (showing the final text until then)." },
      { name: "startDelay", type: "number", default: "400", description: "Delay before an automatic start." },
      { name: "loop / loopDelay", type: "boolean / number", default: "false / 2400", description: "Start over after a hold on the final text." },
      { name: "controls", type: "boolean", default: "true", description: "Play / pause / replay button." },
      { name: "cursor", type: "boolean", default: "true", description: "Caret while typing." },
      { name: "as", type: '"p" | "div" | "span" | "pre"', default: '"p"', description: "Element for the text." },
      { name: "textClassName", type: "string", description: "Classes for the text element (size, font, colour)." },
      { name: "onComplete", type: "() => void", description: "Each time the script reaches its end." },
      { name: "labels", type: "Partial<TypingDemoLabels>", description: 'Dictionary namespace "typingDemo": play, pause, replay.' },
    ] },
    { name: "typingFrames(steps, speed?) / typingFinalText(steps)", props: [
      { name: "returns", type: "{ text, delay }[] / string", description: "The keystroke frames, or the text the script ends on — for custom players and tests." },
    ] },
  ],
  notes: ["The text is static demo copy, not a live stream; for real model output render the text as it arrives.", "Fresh mounts above the fold start blank and type in; with autoPlay={false} the final text is there from the first paint."],
  covers: [],
};

export default entry;

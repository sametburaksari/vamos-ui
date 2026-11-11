import { ex, type DocEntry } from "../types";
import TourDemo from "../examples/tour/demo";
import TourWelcome from "../examples/tour/welcome";
import TourControlled from "../examples/tour/controlled";

const entry: DocEntry = {
  slug: "tour",
  title: "Tour",
  group: "Overlays & feedback",
  description:
    "A guided product tour: dims the page, cuts a spotlight around each target and anchors a step card to it. Back, Next and Done; arrow keys between steps; Escape or the close button skips. Steps without a target show centred — for a welcome or a closing note.",
  source: ["components/tour.tsx"],
  basedOn: "Radix Popover (modal) · virtual anchor",
  usage: `import { Tour } from "@vamos-ui/react";

<Tour open={open} onOpenChange={setOpen} onComplete={markSeen} steps={[
  { target: "[data-tour=search]", title: "Find anything", description: "Orders, customers and products." },
  { target: newButtonRef, title: "Create", description: "Start new records here.", side: "left" },
]} />`,
  demo: ex("demo", "Demo", "tour/demo.tsx", TourDemo),
  examples: [
    ex("welcome", "Welcome and closing steps (ops)", "tour/welcome.tsx", TourWelcome, "No target → centred card over the dimmed page; content holds a small illustration."),
    ex("controlled", "Controlled (product form)", "tour/controlled.tsx", TourControlled, "step / onStepChange to sync with the URL or analytics; onComplete and onSkip tell you how it ended."),
  ],
  api: [
    { name: "Tour", props: [
      { name: "steps", type: "TourStep[]", description: "{ id?, target?, title, description?, content?, side?, align?, padding?, radius? }." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Visibility (controlled or not)." },
      { name: "step / defaultStep / onStepChange", type: "number", description: "Current step index." },
      { name: "onComplete", type: "() => void", description: "Done on the last step. Persist it so the tour does not come back." },
      { name: "onSkip", type: "(index) => void", description: "Closed early with Escape or the close button." },
      { name: "dismissible", type: "boolean", default: "false", description: "Clicking the dimmed page closes the tour." },
      { name: "className", type: "string", description: "Step card class (width)." },
      { name: "labels", type: "Partial<TourLabels>", description: 'Dictionary namespace "tour": next, back, done, skip, progress ("Step {current} of {total}").' },
    ] },
    { name: "TourStep", props: [
      { name: "target", type: "string | RefObject<Element> | () => Element | null", description: "CSS selector, ref or function. Missing → centred card, no spotlight." },
      { name: "title / description / content", type: "ReactNode", description: "Card heading (accessible name), description (accessible description) and extra body." },
      { name: "side / align", type: '"top" | "right" | "bottom" | "left" / "start" | "center" | "end"', default: '"bottom" / "center"', description: "Card placement; flips when it does not fit." },
      { name: "padding / radius", type: "number", default: "6 / 10", description: "Spotlight padding and corner radius in px." },
    ] },
  ],
  notes: [
    "The highlighted element gets data-tour-active while its step is showing — style it if you want (raise it, pulse it).",
    "Off-screen targets scroll into view; the spotlight follows layout shifts and scrolling.",
    "Under reduced motion the spotlight jumps instead of gliding.",
  ],
  covers: [],
};

export default entry;

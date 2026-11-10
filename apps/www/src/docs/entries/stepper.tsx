import { ex, type DocEntry } from "../types";
import StepperDemo from "../examples/stepper/demo";
import StepperVertical from "../examples/stepper/vertical";
import StepperClickable from "../examples/stepper/clickable";
import StepperStates from "../examples/stepper/states";
import StepperVariants from "../examples/stepper/variants";

const entry: DocEntry = {
  slug: "stepper",
  title: "Stepper",
  group: "Navigation",
  description:
    "Shows position and status in an ordered process — import wizards, onboarding, approvals, checkout. Horizontal or vertical, four variants, error / skipped / loading states and clickable completed steps.",
  source: ["components/stepper.tsx"],
  usage: `import { Stepper } from "@vamos-cms/ui";

<Stepper value={1} steps={[
  { title: "Upload" }, { title: "Map columns" }, { title: "Review" }, { title: "Import" },
]} />`,
  demo: ex("demo", "Demo", "stepper/demo.tsx", StepperDemo),
  examples: [
    ex("vertical", "Vertical with content (HR onboarding)", "stepper/vertical.tsx", StepperVertical, "<Step> children render under the current step. Moving between steps doesn't move focus — focus your step's heading."),
    ex("clickable", "Clickable steps (CRM wizard)", "stepper/clickable.tsx", StepperClickable, "With onValueChange, completed steps become buttons (navigable=\"completed\"). Use \"all\" or a predicate for free navigation."),
    ex("states", "States (PRM approval)", "stepper/states.tsx", StepperStates, "Per-step status overrides the derived one: error, skipped (with optional). loading shows a spinner on the current step."),
    ex("variants", "Variants (checkout)", "stepper/variants.tsx", StepperVariants, "dots, bar and compact (\"Step 3 of 4 · Payment\" + bar). Horizontal steppers switch to compact below 640px unless responsive={false}."),
  ],
  api: [
    { name: "Stepper", props: [
      { name: "value", type: "number", description: "Required. Current step, 0-based." },
      { name: "onValueChange", type: "(index: number) => void", description: "Makes navigable steps clickable." },
      { name: "navigable", type: '"completed" | "all" | (index) => boolean', default: '"completed"', description: "Which steps may be clicked." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical shows step content under the current step." },
      { name: "variant", type: '"numbered" | "dots" | "bar" | "compact"', default: '"numbered"', description: "Indicator style (bar is horizontal only)." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Indicator and text size." },
      { name: "steps", type: "StepItem[]", description: "Data-driven steps. Or pass <Step> children." },
      { name: "loading", type: "boolean", default: "false", description: "Spinner in the current step's indicator." },
      { name: "responsive", type: "boolean", default: "true", description: "Horizontal steppers show as compact below 640px." },
      { name: "aria-label", type: "string", default: '"Progress"', description: "Name of the ordered list." },
      { name: "labels", type: "Partial<StepperLabels>", description: "Overrides: label, step (\"Step {current} of {total}\"), optional, complete, current, error, skipped." },
    ] },
    { name: "Step / StepItem", props: [
      { name: "title", type: "ReactNode", description: "Required. Step name." },
      { name: "description", type: "ReactNode", description: "Secondary line." },
      { name: "status", type: '"upcoming" | "current" | "complete" | "error" | "skipped"', description: "Overrides the status derived from value." },
      { name: "optional", type: "boolean", default: "false", description: "Shows \"Optional\" under the title." },
      { name: "icon", type: "ReactNode", description: "Replaces the number for upcoming / current steps." },
      { name: "disabled", type: "boolean", default: "false", description: "Never clickable." },
      { name: "children / content", type: "ReactNode", description: "Vertical only: content shown while the step is current." },
    ] },
    { name: "StepIndicator", props: [
      { name: "status", type: "StepStatus", description: "Required. Drives the look." },
      { name: "number · icon · loading · size", type: "—", description: "Content of the decorative circle (aria-hidden)." },
    ] },
  ],
  notes: ["Each step's name includes its position and status: \"Step 2 of 4, Map columns, Current\"; the current step has aria-current=\"step\"."],
  covers: ["Stepper"],
};

export default entry;

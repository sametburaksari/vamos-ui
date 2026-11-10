import { ex, type DocEntry } from "../types";
import MultiStepFormDemo from "../examples/multi-step-form/demo";
import MultiStepFormConditional from "../examples/multi-step-form/conditional";
import MultiStepFormDialog from "../examples/multi-step-form/dialog";
import MultiStepFormDraft from "../examples/multi-step-form/draft";
import MultiStepFormVertical from "../examples/multi-step-form/vertical";

const entry: DocEntry = {
  slug: "multi-step-form",
  title: "Multi-step form",
  group: "Flows & wizards",
  description:
    "A long form split into steps on top of the Stepper: per-step validation with an error summary, conditional steps, draft saving and autosave, URL resume, a review step with Edit links, and a leave-page warning. Form-library agnostic — each step exposes validate().",
  source: ["business/multi-step-form.tsx"],
  basedOn: "Stepper · native <form>",
  usage: `import { MultiStepForm, MultiStepFormStepper, MultiStepFormStep, MultiStepFormReview, MultiStepFormFooter } from "@vamos-cms/ui/business";

const steps = [
  { id: "identity", title: "Identity", validate: () => (name ? true : "Enter a name.") },
  { id: "tax", title: "Tax details", when: (ctx) => ctx.kind === "company" },
  { id: "review", title: "Review" },
];

<MultiStepForm steps={steps} context={{ kind }} onComplete={save}>
  <MultiStepFormStepper />
  <MultiStepFormStep id="identity">…</MultiStepFormStep>
  <MultiStepFormStep id="tax">…</MultiStepFormStep>
  <MultiStepFormStep id="review"><MultiStepFormReview sections={…} /></MultiStepFormStep>
  <MultiStepFormFooter submitLabel="Create employee" />
</MultiStepForm>`,
  demo: ex("demo", "Demo", "multi-step-form/demo.tsx", MultiStepFormDemo),
  examples: [
    ex("conditional", "Conditional step", "multi-step-form/conditional.tsx", MultiStepFormConditional, "when(context) hides the Tax step for individuals; the Stepper count and \"Step n of m\" update."),
    ex("dialog", "Inside a Dialog", "multi-step-form/dialog.tsx", MultiStepFormDialog, "presentation=\"dialog\" keeps the footer in flow; the compact Stepper fits narrow panels."),
    ex("draft", "Drafts, autosave and URL resume", "multi-step-form/draft.tsx", MultiStepFormDraft, "onSaveDraft + autosave show \"Draft saved 2 minutes ago\"; syncUrl mirrors the step in the query string; confirmLeave guards the tab."),
    ex("vertical", "Vertical with free navigation", "multi-step-form/vertical.tsx", MultiStepFormVertical, "Settings-style setup: the Stepper is a sticky side rail with descriptions and linear={false} allows jumping ahead."),
  ],
  api: [
    { name: "MultiStepForm", props: [
      { name: "steps", type: "StepDef[]", description: "{ id, title, description?, optional?, when?(ctx), validate?() → true | string | Promise }. A string blocks Next and is shown as the step's error summary." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Current step id (controlled or not)." },
      { name: "context", type: "C", description: "Passed to when() of conditional steps." },
      { name: "onComplete", type: "() => Promise<void> | void", description: "Runs on Submit. Throw to show the error and stay on the step." },
      { name: "linear", type: "boolean", default: "true", description: "Steps ahead are reachable only after the earlier ones pass." },
      { name: "onSaveDraft", type: "() => Promise<void> | void", description: "Shows \"Save draft\" and the saved time." },
      { name: "autosave", type: "{ intervalMs: number }", description: "Calls onSaveDraft on an interval (min 2 s)." },
      { name: "presentation", type: '"page" | "dialog"', default: '"page"', description: "page: sticky footer on an opaque surface. dialog: footer in flow." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical puts the Stepper in a sticky side rail." },
      { name: "syncUrl", type: "boolean | { key: string }", default: "false", description: "Mirror the step in ?step= (or your key) with history.replaceState." },
      { name: "confirmLeave", type: "boolean", default: "false", description: "beforeunload warning until the form completes." },
      { name: "labels", type: "Partial<MultiStepFormLabels>", description: "Back / Next / Submit / Save draft / \"Step {current} of {total}\"…" },
    ] },
    { name: "MultiStepFormStep", props: [
      { name: "id", type: "string", description: "Matches a StepDef id. Hidden (but mounted) while inactive, so uncontrolled values survive Back." },
      { name: "hideHeading", type: "boolean", default: "false", description: "Render your own heading; a visually hidden one keeps focus and the announcement." },
      { name: "keepMounted", type: "boolean", default: "true", description: "Unmount inactive steps instead." },
    ] },
    { name: "MultiStepFormStepper", props: [
      { name: "variant", type: '"numbered" | "compact" | "bar" | "dots"', default: '"numbered"', description: "Stepper look; completed steps are clickable." },
    ] },
    { name: "MultiStepFormReview", props: [
      { name: "sections", type: "{ step: string; title?: string; items: { label: string; value: ReactNode }[] }[]", description: "Summary per step with an Edit link that jumps back." },
    ] },
    { name: "MultiStepFormFooter", props: [
      { name: "submitLabel", type: "string", default: '"Submit"', description: "Label of the last step's primary button." },
      { name: "start", type: "ReactNode", description: "Content at the start (Cancel)." },
    ] },
    { name: "useMultiStepForm()", props: [
      { name: "returns", type: "{ current, index, total, steps, next(), back(), goTo(id), saveDraft(), isFirst, isLast, status, submitting }", description: "Drive the form from custom parts." },
    ] },
  ],
  notes: [
    "On a step change focus moves to the step heading, announced as \"Step 3 of 6: Contract\". On a validation error focus goes to the first invalid field (or the summary).",
    "Enter in a single-line field goes to the next step instead of submitting the whole form. Back never loses entered values.",
  ],
  covers: ["Multi-step form"],
};

export default entry;

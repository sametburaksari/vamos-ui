import { Stepper } from "@vamos-ui/react";

// PRM contract approval: an error on a past step, a skipped optional step, a loading current step.
export default function StepperStates() {
  return (
    <Stepper
      value={3}
      loading
      className="w-full max-w-3xl"
      aria-label="Contract approval"
      steps={[
        { title: "Submitted", description: "Nov 2 by Selin Arslan" },
        { title: "Legal review", status: "error", description: "Clause 7.2 needs changes" },
        { title: "Finance", status: "skipped", optional: true },
        { title: "Partner signature", description: "Waiting for DocuSign" },
        { title: "Active" },
      ]}
    />
  );
}

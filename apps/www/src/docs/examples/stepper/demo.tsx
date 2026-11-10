import { Stepper } from "@vamos-ui/react";

export default function StepperDemo() {
  return (
    <Stepper
      value={1}
      className="w-full max-w-3xl"
      aria-label="Import contacts"
      steps={[
        { title: "Upload", description: "contacts-nov.csv" },
        { title: "Map columns", description: "12 of 14 matched" },
        { title: "Review", description: "Duplicates and errors" },
        { title: "Import" },
      ]}
    />
  );
}

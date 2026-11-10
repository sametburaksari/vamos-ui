import { SetupChecklist } from "@vamos-ui/react/business";

export default function SetupChecklistLoading() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <SetupChecklist loading title="Get started" items={[]} />
      <SetupChecklist
        title="Get started"
        items={[
          { id: "a", title: "Verify your email", status: "done" },
          { id: "b", title: "Add a payment method", status: "done" },
          { id: "c", title: "Invite a teammate", status: "skipped", optional: true },
        ]}
      />
    </div>
  );
}

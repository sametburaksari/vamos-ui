import { SetupChecklist } from "@vamos-ui/react/business";

export default function SetupChecklistLocked() {
  // Partner portal first login: later steps unlock when the earlier ones are done.
  return (
    <div className="w-full max-w-md">
      <SetupChecklist
        title="Partner onboarding"
        description="Finish these to start reselling."
        items={[
          { id: "profile", title: "Complete your company profile", status: "done" },
          { id: "agreement", title: "Sign the reseller agreement", description: "Review and sign version 3.2 (October 2026).", status: "todo", estimate: "3 min", action: { label: "Review agreement", href: "#agreement" } },
          { id: "tax", title: "Upload your tax certificate", description: "PDF or photo of the current year's vergi levhası.", status: "todo", locked: { reason: "Sign the agreement first." } },
          { id: "payout", title: "Add a payout account", status: "todo", locked: { reason: "Available after the tax certificate is approved." } },
        ]}
      />
    </div>
  );
}

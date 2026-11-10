"use client";

import * as React from "react";
import { SetupChecklist, SetupChecklistLauncher, type SetupItem } from "@vamos-ui/react/business";

const items: SetupItem[] = [
  { id: "import", title: "Import contacts", status: "done" },
  { id: "pipeline", title: "Define pipeline stages", status: "done" },
  { id: "email", title: "Connect your mailbox", description: "Sync Gmail or Microsoft 365 so replies land on the right deal.", status: "todo", action: { label: "Connect mailbox", href: "#mail" } },
  { id: "team", title: "Invite your sales team", status: "todo", action: { label: "Invite", href: "#team" } },
];

export default function SetupChecklistDismiss() {
  // Dismissal is controlled: persist it per user. The launcher pill reopens the guide.
  const [hidden, setHidden] = React.useState(false);
  return (
    <div className="flex min-h-80 w-full max-w-md items-start">
      {hidden ? (
        <SetupChecklistLauncher items={items} onOpen={() => setHidden(false)} />
      ) : (
        <SetupChecklist title="CRM workspace setup" items={items} dismissed={hidden} onDismissedChange={setHidden} className="w-full" />
      )}
    </div>
  );
}

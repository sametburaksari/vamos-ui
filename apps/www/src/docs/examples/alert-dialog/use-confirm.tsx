"use client";

import * as React from "react";
import { Badge, Button, ConfirmProvider, useConfirm } from "@vamos-ui/react";

function TerminateButton() {
  const confirm = useConfirm();
  const [status, setStatus] = React.useState<"active" | "terminated">("active");

  const terminate = async () => {
    const ok = await confirm({
      title: "Terminate Mert Aksoy?",
      description: "Access to every app ends today. Payroll runs a final settlement on Nov 30.",
      tone: "danger",
      confirmLabel: "Terminate",
    });
    if (ok) setStatus("terminated");
  };

  return (
    <div className="flex items-center gap-3">
      <Badge tone={status === "active" ? "success" : "neutral"} dot>
        {status === "active" ? "Active" : "Terminated"}
      </Badge>
      <Button variant="danger-ghost" disabled={status === "terminated"} onClick={terminate}>
        Terminate employee
      </Button>
      {status === "terminated" ? (
        <Button variant="ghost" size="sm" onClick={() => setStatus("active")}>
          Reset
        </Button>
      ) : null}
    </div>
  );
}

export default function AlertDialogUseConfirm() {
  // App shell includes ConfirmProvider; mount it yourself elsewhere.
  return (
    <ConfirmProvider>
      <TerminateButton />
    </ConfirmProvider>
  );
}

"use client";

import * as React from "react";
import { Button, ConfirmProvider, useConfirm } from "@vamos-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function EndAgreement() {
  const confirm = useConfirm();
  const attempt = React.useRef(0);
  return (
    <Button
      onClick={() =>
        confirm({
          title: "End the agreement with Northwind Trading?",
          description: "Their portal access and commission tracking stop at the end of the month.",
          tone: "danger",
          confirmLabel: "End agreement",
          // The button shows loading; a thrown error keeps the dialog open and shows the message.
          onConfirm: async () => {
            await wait(1200);
            attempt.current += 1;
            if (attempt.current % 2 === 1) throw new Error("The partner portal didn't respond. Nothing was changed — try again.");
          },
        })
      }
    >
      End partner agreement
    </Button>
  );
}

export default function AlertDialogAsync() {
  return (
    <ConfirmProvider>
      <EndAgreement />
    </ConfirmProvider>
  );
}

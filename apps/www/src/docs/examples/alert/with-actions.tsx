"use client";

import * as React from "react";
import { Alert, Button } from "@vamos-ui/react";

export default function AlertWithActions() {
  const [visible, setVisible] = React.useState(true);
  if (!visible)
    return (
      <Button size="sm" variant="ghost" onClick={() => setVisible(true)}>
        Show alert again
      </Button>
    );
  return (
    <Alert
      className="w-full max-w-xl"
      title="A newer revision exists"
      onDismiss={() => setVisible(false)}
      actions={
        <>
          <Button size="xs" variant="solid">
            Restore revision
          </Button>
          <Button size="xs" variant="ghost">
            Compare
          </Button>
        </>
      }
    >
      Zeynep Arslan edited this post 12 minutes ago. Restoring replaces your current draft.
    </Alert>
  );
}

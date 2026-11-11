"use client";

import { Button, ConfirmProvider, useConfirm } from "@vamos-ui/react";

function DeleteSite() {
  const confirm = useConfirm();
  return (
    <Button
      variant="danger"
      onClick={() =>
        confirm({
          title: "Delete the northpoint-blog site?",
          description: "All 284 posts, media and redirects are deleted. Domains are released after 30 days.",
          tone: "danger",
          requireText: "northpoint-blog",
          confirmLabel: "Delete site",
        })
      }
    >
      Delete site
    </Button>
  );
}

export default function AlertDialogRequireText() {
  return (
    <ConfirmProvider>
      <DeleteSite />
    </ConfirmProvider>
  );
}

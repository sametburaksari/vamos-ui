"use client";

import { Button, ConfirmProvider, useConfirm } from "@vamos-cms/ui";

function DeleteSite() {
  const confirm = useConfirm();
  return (
    <Button
      variant="danger"
      onClick={() =>
        confirm({
          title: "Delete the acme-blog site?",
          description: "All 284 posts, media and redirects are deleted. Domains are released after 30 days.",
          tone: "danger",
          requireText: "acme-blog",
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

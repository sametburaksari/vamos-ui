"use client";

import { Alert, Button, ConfirmProvider, SettingsLayout, SettingsRow, SettingsSection, toast, useConfirm } from "@vamos-cms/ui";

function DangerZone() {
  const confirm = useConfirm();
  const remove = async () => {
    const ok = await confirm({
      tone: "danger",
      title: "Delete the Northwind workspace?",
      description: "All 1,284 contacts, 96 deals and their history will be deleted. This can't be undone.",
      confirmLabel: "Delete workspace",
      requireText: "Northwind",
    });
    if (ok) toast("Workspace scheduled for deletion");
  };
  return (
    <SettingsSection tone="danger" title="Danger zone" description="Irreversible and destructive actions.">
      <SettingsRow label="Transfer ownership" description="Make another admin the owner of this workspace." layout="inline">
        <Button>Transfer</Button>
      </SettingsRow>
      <SettingsRow label="Delete workspace" description="Type the workspace name to confirm." layout="inline">
        <Button variant="danger" onClick={remove}>
          Delete workspace
        </Button>
      </SettingsRow>
    </SettingsSection>
  );
}

// Danger zone with a typed confirmation (App shell ships the ConfirmProvider).
export default function SettingsLayoutDangerZone() {
  return (
    <ConfirmProvider>
      <SettingsLayout className="w-full max-w-2xl" notice={<Alert tone="warning" title="You're the only owner">Transfer ownership before you leave the workspace.</Alert>}>
        <DangerZone />
      </SettingsLayout>
    </ConfirmProvider>
  );
}

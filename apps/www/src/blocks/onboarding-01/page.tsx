"use client";

import { WorkspaceShell } from "../settings-01/components/workspace-shell";
import { GettingStarted } from "./components/getting-started";

/** A new workspace's home: setup guide with progress, first-week tasks, trial and help. */
export default function Onboarding01() {
  return (
    <WorkspaceShell path="/crm" app="crm">
      <GettingStarted />
    </WorkspaceShell>
  );
}

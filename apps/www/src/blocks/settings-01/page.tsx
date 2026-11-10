"use client";

import { WorkspaceShell } from "./components/workspace-shell";
import { WorkspaceSettings } from "./components/workspace-settings";

/** Workspace settings (Settings → General) inside the workspace App shell. */
export default function Settings01() {
  return (
    <WorkspaceShell path="/settings" app="crm">
      <WorkspaceSettings />
    </WorkspaceShell>
  );
}

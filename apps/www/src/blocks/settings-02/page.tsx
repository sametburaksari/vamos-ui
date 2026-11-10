"use client";

import { WorkspaceShell } from "../settings-01/components/workspace-shell";
import { PreferencesSettings } from "./components/preferences-settings";

/** Settings → Language & formats + Appearance, with live format and theme previews. */
export default function Settings02() {
  return (
    <WorkspaceShell path="/settings/appearance" app="crm">
      <PreferencesSettings />
    </WorkspaceShell>
  );
}

"use client";

import * as React from "react";
import { Alert, Input, SettingsLayout, SettingsRow, SettingsSection, Switch, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";

// Profile settings while loading, and read-only for members without the "settings.edit" permission.
export default function SettingsLayoutStates() {
  const [mode, setMode] = React.useState("loading");
  const readOnly = mode === "read-only";
  return (
    <div className="grid w-full max-w-2xl gap-4">
      <ToggleGroup aria-label="Settings state" value={mode} onValueChange={setMode} size="sm">
        <ToggleGroupItem value="ready">ready</ToggleGroupItem>
        <ToggleGroupItem value="loading">loading</ToggleGroupItem>
        <ToggleGroupItem value="read-only">read-only</ToggleGroupItem>
      </ToggleGroup>
      <SettingsLayout readOnly={readOnly} notice={readOnly ? <Alert tone="info" title="Only admins can change these settings">Ask Meltem Aydın for edit access.</Alert> : undefined}>
        <SettingsSection title="Profile" loading={mode === "loading" ? 3 : false}>
          <SettingsRow label="Display name">
            <Input defaultValue="Ece Yılmaz" />
          </SettingsRow>
          <SettingsRow label="Work email" description="Used for sign-in and notifications.">
            <Input type="email" defaultValue="ece.yilmaz@northwind.example" />
          </SettingsRow>
          <SettingsRow label="Show my local time" layout="inline">
            <Switch defaultChecked />
          </SettingsRow>
        </SettingsSection>
      </SettingsLayout>
    </div>
  );
}

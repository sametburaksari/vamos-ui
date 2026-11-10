"use client";

import * as React from "react";
import { Input, SettingsLayout, SettingsRow, SettingsSaveBar, SettingsSection, Switch } from "@vamos-cms/ui";

// CRM pipeline settings: edit a field and the bar rises. ⌘/Ctrl+S saves; every third save fails to show the error state.
export default function SettingsLayoutSaveBar() {
  const [probability, setProbability] = React.useState("40");
  const [savedValue, setSavedValue] = React.useState("40");
  const [rotting, setRotting] = React.useState(true);
  const [savedRotting, setSavedRotting] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(false);
  const attempts = React.useRef(0);
  const dirty = probability !== savedValue || rotting !== savedRotting;

  const save = () => {
    setSaving(true);
    setError(false);
    setTimeout(() => {
      setSaving(false);
      attempts.current += 1;
      if (attempts.current % 3 === 0) return setError(true);
      setSavedValue(probability);
      setSavedRotting(rotting);
    }, 800);
  };

  return (
    <div className="h-[420px] w-full max-w-2xl overflow-y-auto rounded-ui-lg border border-line bg-scene p-6">
      <SettingsLayout>
        <SettingsSection title="Stage: Proposal" description="Deals in this stage show in the forecast with this weight.">
          <SettingsRow label="Win probability" description="Used for the weighted pipeline value.">
            <Input value={probability} onChange={(e) => setProbability(e.target.value.replace(/\D/g, "").slice(0, 3))} addonEnd="%" inputMode="numeric" className="max-w-32" />
          </SettingsRow>
          <SettingsRow label="Flag rotting deals" description="Highlight deals with no activity for 14 days." layout="inline">
            <Switch checked={rotting} onCheckedChange={setRotting} />
          </SettingsRow>
        </SettingsSection>
        <SettingsSaveBar
          dirty={dirty}
          saving={saving}
          error={error ? "Couldn't save — the server didn't respond. Your changes are still here." : undefined}
          message="Changes to the Proposal stage"
          onSave={save}
          onReset={() => {
            setProbability(savedValue);
            setRotting(savedRotting);
            setError(false);
          }}
          blockNavigation={false}
        />
      </SettingsLayout>
    </div>
  );
}

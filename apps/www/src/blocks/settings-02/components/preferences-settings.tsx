"use client";

import * as React from "react";
import { Languages, Monitor, Moon, Palette, Sun, Type, CalendarClock } from "lucide-react";
import {
  Badge,
  Field,
  PageHeader,
  RadioGroup,
  RadioGroupItem,
  Select,
  SettingsLayout,
  SettingsNav,
  SettingsRow,
  SettingsSaveBar,
  SettingsSection,
  Switch,
  toast,
} from "@vamos-ui/react";
import { FontPairingPicker, FontPicker, createFontPairing, getFontPairing } from "@vamos-ui/react/fonts";
import { AppearancePreview } from "./appearance-preview";
import { FormatPreview } from "./format-preview";
import { accents, currencies, languages, savedPreferences, timeZones, type PreferencesForm } from "./data";

export function PreferencesSettings() {
  const [base, setBase] = React.useState<PreferencesForm>(savedPreferences);
  const [form, setForm] = React.useState<PreferencesForm>(savedPreferences);
  const [saving, setSaving] = React.useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(base);
  const set = <K extends keyof PreferencesForm>(key: K, value: PreferencesForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const custom = form.pairing === "custom";
  const pairing = React.useMemo(
    () => (custom ? createFontPairing({ heading: form.heading, body: form.body, mono: form.mono }) : (getFontPairing(form.pairing) ?? getFontPairing("editorial")!)),
    [custom, form.pairing, form.heading, form.body, form.mono],
  );

  const choosePreset = (id: string) => {
    const p = getFontPairing(id);
    // Seed the custom pickers with the preset, so "Customise" starts from what you see.
    setForm((f) => ({ ...f, pairing: id, ...(p ? { heading: p.heading, body: p.body, mono: p.mono } : {}) }));
  };

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      setBase(form);
      setSaving(false);
      toast.success("Preferences saved", { description: "Formats apply to new exports and emails right away." });
    }, 700);
  };

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        eyebrow="Settings"
        title="Language, formats & appearance"
        description="Workspace defaults. Each person can override them from their own profile menu."
        className="mb-8"
      />

      <SettingsLayout
        nav={
          <SettingsNav
            items={[
              { id: "pref-language", label: "Language", icon: <Languages /> },
              { id: "pref-formats", label: "Formats", icon: <CalendarClock /> },
              { id: "pref-theme", label: "Theme", icon: <Palette /> },
              { id: "pref-type", label: "Typography", icon: <Type />, badge: <Badge size="sm">16 pairings</Badge> },
            ]}
          />
        }
      >
        <SettingsSection id="pref-language" title="Language & region" description="Sets the interface language and the default way dates, numbers and money are written.">
          <SettingsRow label="Language and region">
            <Select value={form.locale} onValueChange={(v) => v && set("locale", v)} items={languages} />
          </SettingsRow>
          <SettingsRow label="Show translations in progress" description="Lets admins preview languages that are not complete yet." layout="inline" badge={<Badge size="sm" tone="outline">Beta</Badge>}>
            <Switch />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="pref-formats" title="Formats" description="Fine-tune what the region picked. Invoices always use the currency of the client.">
          <SettingsRow label="Default currency">
            <Select value={form.currency} onValueChange={(v) => v && set("currency", v)} items={currencies} />
          </SettingsRow>
          <SettingsRow label="Time zone" description="Schedules, reminders and the daily digest run in this zone.">
            <Select value={form.timeZone} onValueChange={(v) => v && set("timeZone", v)} items={timeZones} />
          </SettingsRow>
          <SettingsRow label="Clock" layout="stacked">
            <RadioGroup
              variant="segmented"
              aria-label="Clock"
              value={form.hourCycle}
              onValueChange={(v) => set("hourCycle", v)}
              items={[
                { value: "auto", label: "From region" },
                { value: "h23", label: "24-hour" },
                { value: "h12", label: "12-hour" },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="First day of the week" layout="stacked">
            <RadioGroup
              variant="segmented"
              aria-label="First day of the week"
              value={form.weekStart}
              onValueChange={(v) => set("weekStart", v)}
              items={[
                { value: "auto", label: "From region" },
                { value: "monday", label: "Monday" },
                { value: "sunday", label: "Sunday" },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="Preview" description="One moment (10 November 2026, 14:30 UTC) and a few amounts, written with your settings." layout="stacked">
            <FormatPreview form={form} />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="pref-theme" title="Theme" description="Colour mode, surface material, accent and spacing. The preview changes as you pick.">
          <SettingsRow label="Preview" layout="stacked">
            <AppearancePreview form={form} pairing={pairing} />
          </SettingsRow>
          <SettingsRow label="Colour mode" layout="stacked">
            <RadioGroup variant="card" orientation="horizontal" aria-label="Colour mode" value={form.theme} onValueChange={(v) => set("theme", v)} className="sm:grid-cols-3">
              <RadioGroupItem value="light" icon={<Sun />} label="Light" description="Warm paper, dark ink." />
              <RadioGroupItem value="dark" icon={<Moon />} label="Dark" description="Smoked glass at night." />
              <RadioGroupItem value="system" icon={<Monitor />} label="Match system" description="Follows the device setting." />
            </RadioGroup>
          </SettingsRow>
          <SettingsRow label="Material" description="Glass blurs what is behind the sidebar and panels. Solid is calmer and faster on older devices.">
            <RadioGroup
              variant="segmented"
              aria-label="Material"
              value={form.material}
              onValueChange={(v) => set("material", v)}
              items={[
                { value: "glass", label: "Glass" },
                { value: "solid", label: "Solid" },
              ]}
            />
          </SettingsRow>
          <SettingsRow label="Accent" description="Used for the primary action, the active item and highlighted data — nowhere else.">
            <RadioGroup
              variant="segmented"
              aria-label="Accent"
              value={form.accent}
              onValueChange={(v) => set("accent", v)}
              items={accents.map((a) => ({
                value: a.value,
                label: a.label,
                icon: <span data-accent={a.value} className="size-3 rounded-full bg-accent ring-1 ring-line" aria-hidden />,
              }))}
            />
          </SettingsRow>
          <SettingsRow label="Density" description="Row height, control height and spacing everywhere in the panel.">
            <RadioGroup
              variant="segmented"
              aria-label="Density"
              value={form.density}
              onValueChange={(v) => set("density", v)}
              items={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
                { value: "spacious", label: "Spacious" },
              ]}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="pref-type" title="Typography" description="Pick a tested pairing, or choose your own three families from 59 Google Fonts sorted by category.">
          <SettingsRow label="Pairing" layout="stacked">
            <FontPairingPicker value={custom ? null : form.pairing} onValueChange={(id) => choosePreset(id)} />
          </SettingsRow>
          <SettingsRow label="Customise families" description="Mix your own headings, text and figures. Fonts load from Google Fonts with latin-ext." layout="inline">
            <Switch checked={custom} onCheckedChange={(on) => set("pairing", on ? "custom" : "editorial")} />
          </SettingsRow>
          {custom ? (
            <SettingsRow label="Families" layout="stacked">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Headings">
                  <FontPicker value={form.heading} onValueChange={(v) => set("heading", v)} />
                </Field>
                <Field label="Body & navigation">
                  <FontPicker value={form.body} onValueChange={(v) => set("body", v)} categories={["sans", "serif", "rounded"]} />
                </Field>
                <Field label="Numbers & code">
                  <FontPicker value={form.mono} onValueChange={(v) => set("mono", v)} categories={["mono"]} />
                </Field>
              </div>
            </SettingsRow>
          ) : null}
        </SettingsSection>

        <SettingsSaveBar dirty={dirty} saving={saving} onSave={save} onReset={() => setForm(base)} message="Changes to workspace preferences" />
      </SettingsLayout>
    </div>
  );
}

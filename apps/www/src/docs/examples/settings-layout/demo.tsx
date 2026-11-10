"use client";

import * as React from "react";
import { Bell, Globe, Link2, Settings2, TriangleAlert } from "lucide-react";
import { Badge, Button, Input, Select, SettingsLayout, SettingsNav, SettingsRow, SettingsSaveBar, SettingsSection, Switch, Textarea, toast } from "@vamos-ui/react";

const saved = { name: "Northwind Journal", tagline: "Stories from the harbour kitchen", perPage: "10", maintenance: false };

// CMS site settings: section nav with scroll-spy, label | control rows, save bar, danger zone.
export default function SettingsLayoutDemo() {
  const [form, setForm] = React.useState(saved);
  const [base, setBase] = React.useState(saved);
  const [saving, setSaving] = React.useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(base);
  const set = <K extends keyof typeof saved>(k: K, v: (typeof saved)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setBase(form);
      setSaving(false);
      toast.success("Settings saved");
    }, 900);
  };

  return (
    <div className="h-[620px] w-full overflow-y-auto rounded-ui-lg border border-line bg-scene p-4">
      <SettingsLayout
        stickyTop={0}
        nav={
          <SettingsNav
            items={[
              { id: "demo-general", label: "General", icon: <Settings2 /> },
              { id: "demo-reading", label: "Reading", icon: <Globe /> },
              { id: "demo-permalinks", label: "Permalinks", icon: <Link2 /> },
              { id: "demo-notifications", label: "Notifications", icon: <Bell />, badge: <Badge size="sm" tone="accent">New</Badge> },
              { id: "demo-danger", label: "Danger zone", icon: <TriangleAlert />, tone: "danger" },
            ]}
          />
        }
      >
        <SettingsSection id="demo-general" title="General" description="Basic information about the site, shown to visitors and search engines.">
          <SettingsRow label="Site name" description="Shown in the browser tab and in search results.">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </SettingsRow>
          <SettingsRow label="Tagline" description="One line under the site name.">
            <Textarea rows={2} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </SettingsRow>
          <SettingsRow label="Maintenance mode" description="Visitors see a holding page; signed-in editors still see the site." layout="inline">
            <Switch checked={form.maintenance} onCheckedChange={(v) => set("maintenance", v)} />
          </SettingsRow>
        </SettingsSection>
        <SettingsSection id="demo-reading" title="Reading">
          <SettingsRow label="Posts per page">
            <Select value={form.perPage} onValueChange={(v) => v && set("perPage", v)} items={["5", "10", "20", "50"].map((v) => ({ value: v, label: v }))} />
          </SettingsRow>
          <SettingsRow label="Search engine visibility" description="Ask search engines not to index this site." layout="inline">
            <Switch />
          </SettingsRow>
        </SettingsSection>
        <SettingsSection id="demo-permalinks" title="Permalinks" footer="Changing the structure redirects old links automatically.">
          <SettingsRow label="Post URL" layout="stacked" description="Use {slug}, {year} and {category}.">
            <Input addonStart="northwind.example/" defaultValue="blog/{slug}" />
          </SettingsRow>
        </SettingsSection>
        <SettingsSection id="demo-notifications" title="Notifications">
          <SettingsRow label="New comments" description="Email the post's author." layout="inline">
            <Switch defaultChecked />
          </SettingsRow>
          <SettingsRow label="Form submissions" description="Send a daily digest to the site owner." layout="inline" badge={<Badge size="sm">Digest</Badge>}>
            <Switch defaultChecked />
          </SettingsRow>
        </SettingsSection>
        <SettingsSection id="demo-danger" tone="danger" title="Danger zone" description="These actions can't be undone.">
          <SettingsRow label="Delete this site" description="Removes 128 posts, 418 media files and all form submissions." layout="inline">
            <Button variant="danger">Delete site</Button>
          </SettingsRow>
        </SettingsSection>
        <SettingsSaveBar dirty={dirty} saving={saving} onSave={save} onReset={() => setForm(base)} blockNavigation={false} />
      </SettingsLayout>
    </div>
  );
}

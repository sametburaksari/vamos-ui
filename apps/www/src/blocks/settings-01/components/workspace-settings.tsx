"use client";

import * as React from "react";
import { Bell, Building2, KeyRound, MapPin, SlidersHorizontal, TriangleAlert } from "lucide-react";
import {
  Badge,
  Button,
  ImageUpload,
  Input,
  PageHeader,
  RadioGroup,
  Select,
  SettingsLayout,
  SettingsNav,
  SettingsRow,
  SettingsSaveBar,
  SettingsSection,
  Switch,
  TagInput,
  Textarea,
  toast,
  useConfirm,
} from "@vamos-ui/react";
import { industries, landingApps, months, savedWorkspace, sessionTimeouts, validateDomain, type WorkspaceForm } from "./data";

const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 32);

export function WorkspaceSettings() {
  const confirm = useConfirm();
  const [base, setBase] = React.useState<WorkspaceForm>(savedWorkspace);
  const [form, setForm] = React.useState<WorkspaceForm>(savedWorkspace);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();
  const dirty = JSON.stringify(form) !== JSON.stringify(base);
  const set = <K extends keyof WorkspaceForm>(key: K, value: WorkspaceForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const nameError = form.name.trim().length < 2 ? "The workspace needs a name." : undefined;
  const slugError = form.slug.length < 3 ? "Use at least 3 characters." : undefined;
  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.supportEmail) ? undefined : "Enter a valid email address.";
  const invalid = Boolean(nameError || slugError || emailError);

  const save = () => {
    if (invalid) {
      setError("Fix the highlighted fields before saving.");
      return;
    }
    setSaving(true);
    setError(undefined);
    window.setTimeout(() => {
      setBase(form);
      setSaving(false);
      toast.success("Workspace settings saved", { description: "Everyone sees the changes the next time they load a page." });
    }, 700);
  };

  const transfer = async () => {
    const ok = await confirm({
      title: "Transfer ownership to Meltem Aydın?",
      description: "You stay an admin. Only the new owner can delete the workspace or change the plan.",
      confirmLabel: "Transfer ownership",
    });
    if (ok) toast("Ownership transfer sent", { description: "Meltem has 72 hours to accept it." });
  };

  const remove = async () => {
    const ok = await confirm({
      tone: "danger",
      title: `Delete ${base.name}?`,
      description: "1,284 contacts, 96 deals, 144 posts and 38 employee records will be deleted after 30 days. Exports stay available until then.",
      confirmLabel: "Delete workspace",
      requireText: base.slug,
    });
    if (ok) toast("Workspace scheduled for deletion", { description: "We emailed every admin a link to cancel." });
  };

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        eyebrow="Settings"
        title="General"
        description="How your workspace introduces itself, where people land, and who can sign in."
        meta={<Badge tone="outline">Owner</Badge>}
        className="mb-8"
      />

      <SettingsLayout
        nav={
          <SettingsNav
            items={[
              { id: "ws-profile", label: "Profile", icon: <Building2 /> },
              { id: "ws-contact", label: "Contact & address", icon: <MapPin /> },
              { id: "ws-defaults", label: "Defaults", icon: <SlidersHorizontal /> },
              { id: "ws-security", label: "Sign-in & security", icon: <KeyRound /> },
              { id: "ws-notifications", label: "Notifications", icon: <Bell /> },
              { id: "ws-danger", label: "Danger zone", icon: <TriangleAlert />, tone: "danger" },
            ]}
          />
        }
      >
        <SettingsSection id="ws-profile" title="Workspace profile" description="Shown in the sidebar, on invoices and in every email we send for you.">
          <SettingsRow label="Logo" description="Square PNG or SVG, at least 256 × 256. Used in the sidebar and on documents.">
            <ImageUpload aspect="1/1" fit="contain" accept="image/png,image/svg+xml" maxSize={2_000_000} hint="PNG or SVG, up to 2 MB" className="w-32" />
          </SettingsRow>
          <SettingsRow label="Workspace name" error={nameError}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="organization" />
          </SettingsRow>
          <SettingsRow label="Workspace URL" description="Changing it breaks bookmarks; old links redirect for 90 days." error={slugError}>
            <Input addonStart="app.vamos.ist/" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} spellCheck={false} />
          </SettingsRow>
          <SettingsRow label="Industry" description="Tunes templates, sample data and the starter pipeline.">
            <Select value={form.industry} onValueChange={(v) => v && set("industry", v)} items={industries} />
          </SettingsRow>
          <SettingsRow label="About" description="One or two sentences for the client portal and proposals.">
            <Textarea rows={3} value={form.about} onChange={(e) => set("about", e.target.value)} maxLength={280} />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="ws-contact" title="Contact & address" description="Printed on quotes, invoices and the footer of client emails.">
          <SettingsRow label="Support email" error={emailError}>
            <Input type="email" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} autoComplete="email" />
          </SettingsRow>
          <SettingsRow label="Phone">
            <Input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          </SettingsRow>
          <SettingsRow label="Website">
            <Input type="url" value={form.website} onChange={(e) => set("website", e.target.value)} autoComplete="url" />
          </SettingsRow>
          <SettingsRow label="Registered address" description="Use the address on your tax registration.">
            <Textarea rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} autoComplete="street-address" />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="ws-defaults" title="Defaults" description="Starting points for everyone. People can change their own landing app in their profile.">
          <SettingsRow label="Landing app" description="The app people see right after they sign in.">
            <Select value={form.landingApp} onValueChange={(v) => v && set("landingApp", v)} items={landingApps} />
          </SettingsRow>
          <SettingsRow label="Fiscal year starts in" description="Used by reports, budgets and the revenue dashboard.">
            <Select value={form.fiscalStart} onValueChange={(v) => v && set("fiscalStart", v)} items={months} />
          </SettingsRow>
          <SettingsRow label="Week starts on" layout="stacked">
            <RadioGroup
              variant="segmented"
              aria-label="Week starts on"
              value={form.weekStart}
              onValueChange={(v) => set("weekStart", v)}
              items={[
                { value: "monday", label: "Monday" },
                { value: "sunday", label: "Sunday" },
                { value: "saturday", label: "Saturday" },
              ]}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="ws-security" title="Sign-in & security" footer="Security changes are written to the audit log with your name.">
          <SettingsRow label="Require two-step verification" description="Members without it are asked to set it up at their next sign-in." layout="inline" badge={<Badge size="sm" tone="success">Recommended</Badge>}>
            <Switch checked={form.require2fa} onCheckedChange={(v) => set("require2fa", v)} />
          </SettingsRow>
          <SettingsRow label="Sign out idle sessions after">
            <Select value={form.sessionTimeout} onValueChange={(v) => v && set("sessionTimeout", v)} items={sessionTimeouts} />
          </SettingsRow>
          <SettingsRow label="Allowed email domains" description="People with these addresses can join without an invite. Leave empty to require invites." layout="stacked">
            <TagInput
              value={form.allowedDomains}
              onValueChange={(v) => set("allowedDomains", v)}
              validate={validateDomain}
              transform={(v) => v.trim().toLowerCase().replace(/^@/, "")}
              delimiters={["Enter", ",", " "]}
              addOnBlur
              placeholder="company.com"
              aria-label="Allowed email domains"
            />
          </SettingsRow>
          <SettingsRow label="Single sign-on only" description="Turn off password sign-in once Google Workspace SSO is connected." layout="inline" disabled badge={<Badge size="sm" tone="outline">Business plan</Badge>}>
            <Switch checked={form.ssoOnly} onCheckedChange={(v) => set("ssoOnly", v)} />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="ws-notifications" title="Workspace notifications" description="Emails sent to admins. Members manage their own notifications.">
          <SettingsRow label="Weekly digest" description="Monday 09:00 — new leads, overdue invoices, leave requests waiting for approval." layout="inline">
            <Switch checked={form.digest} onCheckedChange={(v) => set("digest", v)} />
          </SettingsRow>
          <SettingsRow label="Mentions and assignments" description="When someone mentions an admin or assigns them a task." layout="inline">
            <Switch checked={form.mentions} onCheckedChange={(v) => set("mentions", v)} />
          </SettingsRow>
          <SettingsRow label="Billing alerts" description="Failed payments, seat limits and renewals." layout="inline">
            <Switch checked={form.billingAlerts} onCheckedChange={(v) => set("billingAlerts", v)} />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection id="ws-danger" tone="danger" title="Danger zone" description="These actions affect every member and can't be undone from here.">
          <SettingsRow label="Transfer ownership" description="Make another admin the owner of this workspace." layout="inline">
            <Button onClick={transfer}>Transfer</Button>
          </SettingsRow>
          <SettingsRow label="Delete workspace" description={<>Type <code className="font-mono text-fg">{base.slug}</code> to confirm. Data is kept for 30 days.</>} layout="inline">
            <Button variant="danger" onClick={remove}>
              Delete workspace
            </Button>
          </SettingsRow>
        </SettingsSection>

        <SettingsSaveBar
          dirty={dirty}
          saving={saving}
          error={error}
          onSave={save}
          onReset={() => {
            setForm(base);
            setError(undefined);
          }}
        />
      </SettingsLayout>
    </div>
  );
}

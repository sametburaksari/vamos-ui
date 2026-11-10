"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Briefcase, Globe, KanbanSquare, PartyPopper, Users } from "lucide-react";
import { Button, CheckboxGroup, Field, Input, RadioGroup, Select, SlugInput, Stepper, TagInput, ThemeScope } from "@vamos-ui/react";
import { FontPairingPicker, fontPairings } from "@vamos-ui/react/fonts";
import { WorkspacePreview } from "./workspace-preview";
import { accentChoices, appChoices, initialWelcome, inviteRoles, isEmail, starterPairings, teamSizes, type WelcomeForm } from "./data";

const appIcons: Record<string, React.ReactNode> = { site: <Globe />, crm: <KanbanSquare />, people: <Users />, work: <Briefcase /> };

const steps = [
  { id: "workspace", title: "Workspace", heading: "Name your workspace", lead: "This is what your team and clients see. You can change it later." },
  { id: "apps", title: "Apps", heading: "What will you use first?", lead: "Turn on what you need today. The rest stays one click away in Settings." },
  { id: "team", title: "Team", heading: "Invite your team", lead: "They get an email to join. Skip this if you’d like to look around first.", optional: true },
  { id: "look", title: "Look", heading: "Make it feel like yours", lead: "An accent colour and a type pairing. Sixteen more pairings wait in Appearance." },
];

type Errors = Partial<Record<"name" | "slug" | "apps" | "invites", string>>;

export function WelcomeWizard() {
  const [step, setStep] = React.useState(0);
  const [form, setForm] = React.useState<WelcomeForm>(initialWelcome);
  const [errors, setErrors] = React.useState<Errors>({});
  const [creating, setCreating] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const set = <K extends keyof WelcomeForm>(key: K, value: WelcomeForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (step === 0) {
      if (form.name.trim().length < 2) e.name = "Give the workspace a name.";
      if (form.slug.length < 3) e.slug = "The address needs at least 3 characters.";
      else if (["admin", "app", "vamos"].includes(form.slug)) e.slug = "That address is taken. Try another.";
    }
    if (step === 1 && form.apps.length === 0) e.apps = "Pick at least one app to start with.";
    if (step === 2 && form.invites.some((v) => isEmail(v) !== true)) e.invites = "Fix or remove the addresses marked red.";
    return e;
  };

  const go = (to: number) => {
    setStep(to);
    setErrors({});
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const next = () => {
    const e = validate();
    if (Object.values(e).some(Boolean)) return setErrors(e);
    if (step < steps.length - 1) return go(step + 1);
    setCreating(true);
    window.setTimeout(() => {
      setCreating(false);
      setDone(true);
      requestAnimationFrame(() => headingRef.current?.focus());
    }, 1100);
  };

  const s = steps[step]!;
  const pairings = fontPairings.filter((p) => starterPairings.includes(p.id));

  return (
    <ThemeScope accent={form.accent} portal className="relative z-10 grid min-h-dvh lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <aside className="surface-nav hidden p-10 lg:block" aria-label="Workspace preview">
        <WorkspacePreview form={form} step={done ? 3 : step} />
      </aside>

      <main className="flex min-w-0 flex-col px-4 py-8 sm:px-10 lg:px-16 lg:py-12">
        <div className="mb-10 flex items-center justify-between gap-4 lg:hidden">
          <span className="flex items-center gap-2 font-semibold">
            <span className="grid size-7 place-items-center rounded-[9px] bg-accent font-display text-[19px] italic leading-none text-accent-fg">v</span>
            Vamos
          </span>
        </div>

        {done ? (
          <div className="mx-auto my-auto grid w-full max-w-[34rem] gap-6 ui-rise">
            <PartyPopper className="size-8 text-accent-ink" strokeWidth={1.6} aria-hidden />
            <div>
              <h1 ref={headingRef} tabIndex={-1} className="font-display text-[length:calc(44px*var(--display-scale))] leading-[1.05] text-fg outline-none">
                <em>{form.name.trim()}</em> is ready.
              </h1>
              <p className="mt-3 text-[15px] text-fg-muted">
                {form.apps.length} {form.apps.length === 1 ? "app is" : "apps are"} on
                {form.invites.length ? `, and ${form.invites.length} ${form.invites.length === 1 ? "invitation is" : "invitations are"} on the way` : ""}. Your setup guide picks up from here.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 text-[13px]">
              <div>
                <dt className="text-fg-subtle">Address</dt>
                <dd className="font-mono text-fg">app.vamos.ist/{form.slug}</dd>
              </div>
              <div>
                <dt className="text-fg-subtle">Trial ends</dt>
                <dd className="text-fg">24 November 2026</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="lg">
                Open workspace <ArrowRight />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => setDone(false)}>
                Change something
              </Button>
            </div>
          </div>
        ) : (
          <form
            noValidate
            className="mx-auto flex w-full max-w-[34rem] flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              next();
            }}
          >
            <Stepper value={step} onValueChange={go} steps={steps.map(({ id, title, optional }) => ({ id, title, optional }))} variant="bar" aria-label="Workspace setup" />

            <div key={s.id} className="mt-10 grid gap-6 ui-rise">
              <div>
                <h1 ref={headingRef} tabIndex={-1} className="font-display text-[length:calc(40px*var(--display-scale))] leading-[1.05] text-fg outline-none">
                  {s.heading}
                </h1>
                <p className="mt-2 text-[14.5px] text-fg-muted">{s.lead}</p>
              </div>

              {step === 0 ? (
                <>
                  <Field label="Workspace name" error={errors.name} required>
                    <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Northwind Studio" autoComplete="organization" size="lg" data-autofocus />
                  </Field>
                  <Field label="Address" hint="Lowercase letters, numbers and dashes." error={errors.slug} required>
                    <SlugInput source={form.name} value={form.slug} onValueChange={(v) => set("slug", v)} prefix="app.vamos.ist/" />
                  </Field>
                  <Field label="Team size">
                    <RadioGroup variant="segmented" value={form.teamSize} onValueChange={(v) => set("teamSize", v)} items={teamSizes} />
                  </Field>
                </>
              ) : null}

              {step === 1 ? (
                <Field label="Apps" error={errors.apps}>
                  <CheckboxGroup
                    variant="card"
                    value={form.apps}
                    onValueChange={(v) => set("apps", v)}
                    className="sm:grid-cols-2"
                    items={appChoices.map((a) => ({ ...a, icon: appIcons[a.value] }))}
                  />
                </Field>
              ) : null}

              {step === 2 ? (
                <>
                  <Field label="Email addresses" hint="Paste several at once. Press Enter after each." error={errors.invites} optional>
                    <TagInput
                      value={form.invites}
                      onValueChange={(v) => set("invites", v)}
                      validate={isEmail}
                      delimiters={["Enter", "Tab", ",", " ", ";"]}
                      transform={(v) => v.trim().toLowerCase()}
                      addOnBlur
                      placeholder="ece@northwind.studio"
                    />
                  </Field>
                  <Field label="They join as">
                    <Select value={form.inviteRole} onValueChange={(v) => v && set("inviteRole", v)} items={inviteRoles} />
                  </Field>
                </>
              ) : null}

              {step === 3 ? (
                <>
                  <Field label="Accent">
                    <RadioGroup
                      variant="segmented"
                      value={form.accent}
                      onValueChange={(v) => set("accent", v)}
                      items={accentChoices.map((a) => ({
                        ...a,
                        icon: <span data-accent={a.value} className="size-3 rounded-full bg-accent ring-1 ring-line" aria-hidden />,
                      }))}
                    />
                  </Field>
                  <Field label="Type pairing">
                    <FontPairingPicker pairings={pairings} value={form.pairing} onValueChange={(id) => set("pairing", id)} layout="list" />
                  </Field>
                </>
              ) : null}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 pt-10">
              <Button type="button" variant="ghost" onClick={() => go(step - 1)} disabled={step === 0 || creating}>
                <ArrowLeft /> Back
              </Button>
              <div className="flex gap-2">
                {s.optional ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      set("invites", []);
                      go(step + 1);
                    }}
                  >
                    Skip
                  </Button>
                ) : null}
                <Button type="submit" variant="primary" loading={creating} loadingText="Creating workspace…">
                  {step === steps.length - 1 ? "Create workspace" : "Continue"}
                  {step < steps.length - 1 ? <ArrowRight /> : null}
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </ThemeScope>
  );
}

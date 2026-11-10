"use client";

import { Check } from "lucide-react";
import { Avatar, AvatarGroup } from "@vamos-ui/react";
import { FontProvider } from "@vamos-ui/react/fonts";
import { appChoices, type WelcomeForm } from "./data";

/** The side panel: the workspace taking shape as the wizard is filled in. */
export function WorkspacePreview({ form, step }: { form: WelcomeForm; step: number }) {
  const name = form.name.trim() || "Your workspace";
  return (
    <FontProvider pairing={form.pairing} className="flex h-full flex-col justify-between gap-10">
      <div className="flex items-center gap-2 text-nav-fg-strong">
        <span className="grid size-7 place-items-center rounded-[9px] bg-accent font-display text-[19px] italic leading-none text-accent-fg">v</span>
        <span className="font-semibold">Vamos</span>
      </div>

      <div className="grid gap-6">
        <p className="text-[12px] text-nav-fg/60">Preview</p>
        <div className="grid gap-2">
          <span className="grid size-12 place-items-center rounded-[14px] bg-accent font-display text-[26px] leading-none text-accent-fg" aria-hidden>
            {name[0]!.toUpperCase()}
          </span>
          <p className="font-display text-[length:calc(40px*var(--display-scale))] leading-[1.05] text-nav-fg-strong [text-wrap:balance]">{name}</p>
          <p className="font-mono text-[12.5px] text-nav-fg/70">app.vamos.ist/{form.slug || "…"}</p>
        </div>

        <ul className="grid gap-2 text-[13.5px]" aria-label="Apps">
          {appChoices.map((a) => {
            const on = form.apps.includes(a.value);
            return (
              <li key={a.value} className={on ? "flex items-center gap-2 text-nav-fg-strong" : "flex items-center gap-2 text-nav-fg/40"}>
                <span className={on ? "grid size-4 place-items-center rounded-full bg-accent text-accent-fg" : "size-4 rounded-full border border-nav-line"} aria-hidden>
                  {on ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                {a.label}
                <span className="sr-only">{on ? "(on)" : "(off)"}</span>
              </li>
            );
          })}
        </ul>

        {step >= 2 ? (
          <div className="flex items-center gap-3 text-[13px] text-nav-fg/70">
            <AvatarGroup max={4} size="sm" aria-label="Invited people">
              <Avatar name="Samet Burak Sarı" />
              {form.invites.map((e) => (
                <Avatar key={e} name={e.split("@")[0]!.replace(/[._-]/g, " ")} />
              ))}
            </AvatarGroup>
            {form.invites.length ? `You and ${form.invites.length} ${form.invites.length === 1 ? "other" : "others"}` : "Just you for now"}
          </div>
        ) : null}
      </div>

      <p className="text-[12px] text-nav-fg/50">Free for 14 days · no card needed</p>
    </FontProvider>
  );
}

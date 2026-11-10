"use client";

import * as React from "react";
import { cn2 as cn } from "./kit-2";
import { Button } from "../../../components/button";
import { Switch } from "../../../components/switch";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from "../../../components/dialog";
import { CONSENT_OPEN_EVENT, readConsent, writeConsent, openConsentPreferences, type ConsentCategory, type ConsentChoices, type ConsentRecord, type OptionalCategory } from "./consent";
import type { ConsentLabels } from "./island-keys";

export interface ConsentBannerIslandProps {
  variant: "bar" | "box";
  /** Server-rendered notice text. */
  text: React.ReactNode;
  policyLink?: { href: string; label: string };
  categories: ConsentCategory[];
  version: number;
  position: "bottom" | "bottom-start";
  regionMode: "opt-in" | "notice";
  labels: ConsentLabels;
  /** Render inside the parent (docs previews) instead of fixed to the viewport. */
  contained?: boolean;
  /** Show even when a choice is stored (previews). */
  forceShow?: boolean;
  /** Start with preferences open (previews). */
  defaultPreferencesOpen?: boolean;
  /** Called with every record — for a server-side proof log. Client prop only. */
  onRecord?: (record: ConsentRecord) => void | Promise<void>;
  className?: string;
}

const CAT_LABEL: Record<ConsentCategory, [keyof ConsentLabels, keyof ConsentLabels]> = {
  necessary: ["catNecessary", "catNecessaryHint"],
  functional: ["catFunctional", "catFunctionalHint"],
  analytics: ["catAnalytics", "catAnalyticsHint"],
  marketing: ["catMarketing", "catMarketingHint"],
};

/**
 * The interactive part of the Cookie / consent banner (~3 KB). Not modal: a labelled region that
 * never blocks the page or steals focus. "Reject all" and "Accept all" are equal secondary
 * buttons on the first layer; preferences open in a Dialog with one Switch per category, none
 * pre-checked. Renders nothing until mounted (no non-essential cookies without JS).
 */
export function ConsentBannerIsland({
  variant,
  text,
  policyLink,
  categories,
  version,
  position,
  regionMode,
  labels,
  contained,
  forceShow,
  defaultPreferencesOpen,
  onRecord,
  className,
}: ConsentBannerIslandProps) {
  const [visible, setVisible] = React.useState(false);
  const [prefsOpen, setPrefsOpen] = React.useState(!!defaultPreferencesOpen);
  const optional = categories.filter((c): c is OptionalCategory => c !== "necessary");
  const [choices, setChoices] = React.useState<ConsentChoices>({});
  const titleId = React.useId();

  React.useEffect(() => {
    const stored = readConsent(version);
    if (stored) setChoices({ functional: !!stored.c.functional, analytics: !!stored.c.analytics, marketing: !!stored.c.marketing });
    setVisible(forceShow || !stored);
    const open = () => {
      const r = readConsent(version);
      if (r) setChoices({ functional: !!r.c.functional, analytics: !!r.c.analytics, marketing: !!r.c.marketing });
      setPrefsOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, [version, forceShow]);

  const save = (c: ConsentChoices) => {
    const record = writeConsent(c, version);
    void onRecord?.(record);
    setChoices(c);
    setPrefsOpen(false);
    if (!forceShow) setVisible(false);
  };
  const all = (on: boolean) => Object.fromEntries(optional.map((k) => [k, on])) as ConsentChoices;

  const preferences = (
    <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
      <DialogContent size="md">
        <DialogHeader title={labels.cookiePreferences} description={labels.cookiePreferencesLead} />
        <DialogBody>
          <ul className="flex flex-col">
            {categories.map((cat) => {
              const [name, hint] = CAT_LABEL[cat];
              const locked = cat === "necessary";
              return (
                <li key={cat} className="border-b border-line py-4 last:border-b-0">
                  <Switch
                    label={labels[name]}
                    description={locked ? `${labels[hint]} ${labels.alwaysOn}.` : labels[hint]}
                    labelPosition="start"
                    checked={locked ? true : !!choices[cat as OptionalCategory]}
                    disabled={locked}
                    onCheckedChange={(v) => setChoices((p) => ({ ...p, [cat]: v }))}
                  />
                </li>
              );
            })}
          </ul>
          {policyLink ? (
            <p className="mt-4 text-small text-fg-muted">
              <a href={policyLink.href} className="font-medium text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]">
                {policyLink.label}
              </a>
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter align="between">
          <Button variant="secondary" onClick={() => save(all(false))}>
            {labels.rejectAll}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => save(all(true))}>
              {labels.acceptAll}
            </Button>
            <Button variant="solid" onClick={() => save(choices)}>
              {labels.savePreferences}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (!visible) return preferences;

  const box = variant === "box";
  return (
    <>
      <div
        role="region"
        aria-labelledby={titleId}
        data-consent-banner=""
        data-variant={variant}
        data-position={position}
        data-contained={contained ? "" : undefined}
        className={cn("vb-consent surface-popover text-small text-fg", box ? "vb-consent-box rounded-ui-lg p-5" : "vb-consent-bar", className)}
      >
        <div className="@container">
        <div className={cn(box ? "flex flex-col gap-4" : "vb-container flex flex-col gap-4 py-4 @3xl:flex-row @3xl:items-center @3xl:justify-between @3xl:gap-10")}>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p id={titleId} className={cn(box ? "text-body font-semibold text-fg" : "sr-only")}>
              {box ? labels.cookies : labels.cookieConsent}
            </p>
            <div className="max-w-[72ch] text-fg-muted text-pretty [&_a]:font-medium [&_a]:text-fg [&_a]:underline [&_a]:underline-offset-[0.25em]">
              {text}
              {policyLink ? (
                <>
                  {" "}
                  <a href={policyLink.href} className="focus-ring rounded-[2px]">
                    {policyLink.label}
                  </a>
                </>
              ) : null}
            </div>
          </div>
          <div className={cn("flex shrink-0 flex-wrap items-center gap-2", box && "flex-col items-stretch")}>
            {regionMode === "opt-in" ? (
              <>
                <Button variant="secondary" onClick={() => save(all(false))} className={cn(box && "w-full")}>
                  {labels.rejectAll}
                </Button>
                <Button variant="secondary" onClick={() => save(all(true))} className={cn(box && "w-full")}>
                  {labels.acceptAll}
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => save(all(true))} className={cn(box && "w-full")}>
                {labels.acceptAll}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setPrefsOpen(true)} className={cn("underline decoration-line underline-offset-[0.3em]", box && "w-full")}>
              {labels.preferences}
            </Button>
          </div>
        </div>
        </div>
      </div>
      {preferences}
    </>
  );
}

/** "Cookie settings" — a button (not a link) that reopens the preferences. For the footer. */
export function ConsentSettingsButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <button type="button" onClick={() => openConsentPreferences()} className={cn("rounded-[2px] underline-offset-[0.25em] hover:underline focus-ring", className)}>
      {children}
    </button>
  );
}

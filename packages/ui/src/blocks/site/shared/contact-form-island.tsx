"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn2 as cn } from "./kit-2";
import { formatMessage } from "../../../lib/message-format";
import { Button } from "../../../components/button";
import { Field, Input, Textarea } from "../../../components/input";
import { NativeSelect } from "../../../components/native-select";
import {
  HONEYPOT_FIELD,
  MARKETING_FIELD,
  PRIVACY_FIELD,
  TIMESTAMP_FIELD,
  fieldConstraints,
  validateContactForm,
  type ContactFieldConfig,
  type SiteFormAction,
  type SiteFormState,
} from "./site-form";

import type { ContactIslandLabels } from "./island-keys";

export interface ContactFormIslandProps {
  /** The app's server action, or a URL for a plain POST. Without it the form validates in the browser only (previews). */
  action?: SiteFormAction | string;
  /** Field config; `label` already resolved. */
  fields: (ContactFieldConfig & { label: string })[];
  labels: ContactIslandLabels;
  locale?: string;
  layout?: "split" | "stacked" | "minimal";
  submitLabel?: string;
  /** Rendered in place of the form after a successful submit. */
  successMessage?: React.ReactNode;
  /** Privacy notice link; with `privacyCheckbox` a required (never pre-checked) checkbox. */
  privacy?: { href: string; label?: string; checkbox?: boolean };
  /** Separate, optional marketing consent checkbox. */
  marketingConsent?: boolean;
  /** Shown with server errors: "call us on …". */
  fallbackPhone?: { href: string; label: string };
  /** Render a given state (docs, tests, server-rendered results). */
  initialState?: SiteFormState;
  /** Base for field ids. */
  idBase: string;
  className?: string;
}

const IDLE: SiteFormState = { status: "idle" };

/**
 * Client island of the Contact form: `useActionState` + the app's server action, honeypot and time
 * trap, an error summary that links to fields, focus management, and the same states without JS
 * (native constraints + full round trip). ~2 KB.
 */
export function ContactFormIsland({
  action,
  fields,
  labels,
  locale = "en-US",
  layout = "stacked",
  submitLabel,
  successMessage,
  privacy,
  marketingConsent,
  fallbackPhone,
  initialState,
  idBase,
  className,
}: ContactFormIslandProps) {
  const f = (k: keyof ContactIslandLabels, vars?: Record<string, unknown>) => formatMessage(labels[k], vars, locale);
  const run = React.useCallback(
    async (prev: SiteFormState, data: FormData): Promise<SiteFormState> => {
      // Same rules as the server, so most mistakes never need a round trip. Spam is the server's call.
      const check = validateContactForm(fields, data, { privacyCheckbox: privacy?.checkbox, labels, locale });
      if (!check.ok) return { status: "invalid", errors: check.errors, values: check.values, ts: Date.now() };
      if (typeof action === "function") {
        try {
          return await action(prev, data);
        } catch (e) {
          return { status: "error", message: e instanceof Error ? e.message : undefined, values: check.values, ts: Date.now() };
        }
      }
      return { status: "success", ts: Date.now() };
    },
    [action, fields, labels, locale, privacy?.checkbox],
  );
  const [state, formAction, pending] = React.useActionState(run, initialState ?? IDLE);
  const [hydrated, setHydrated] = React.useState(false);
  const [ts, setTs] = React.useState("");
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const successRef = React.useRef<HTMLDivElement>(null);
  const firstRender = React.useRef(true);

  React.useEffect(() => {
    setHydrated(true);
    setTs(String(Date.now()));
  }, []);
  React.useEffect(() => {
    // Never move focus on mount (a server-rendered result must not yank the page).
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (state.status === "success") successRef.current?.focus();
    else if (state.status === "invalid" || state.status === "error") summaryRef.current?.focus();
  }, [state]);

  if (state.status === "success") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" data-form-state="success" className={cn("vb-form-success flex flex-col gap-3 rounded-ui py-2 outline-none", className)}>
        <span aria-hidden className="h-px w-10 bg-accent" />
        <div className="text-lead text-fg text-pretty">{successMessage ?? f("sent")}</div>
      </div>
    );
  }

  const errors = state.status === "invalid" ? (state.errors ?? {}) : {};
  const errorEntries = Object.entries(errors).filter(([, v]) => v) as [string, string][];
  const values = state.values ?? {};
  const fid = (name: string) => `${idBase}-${name}`;
  const minimal = layout === "minimal";
  const half = (n: ContactFieldConfig["name"]) => !minimal && (n === "name" || n === "email" || n === "phone" || n === "company" || n === "budget" || n === "date");

  const urlAction = typeof action === "string" ? action : undefined;

  return (
    <form
      key={state.ts ?? 0}
      action={urlAction ?? formAction}
      method={urlAction ? "post" : undefined}
      noValidate={hydrated && !urlAction}
      data-form-state={pending ? "submitting" : state.status}
      aria-busy={pending || undefined}
      className={cn("vb-form flex flex-col gap-6", className)}
    >
      {errorEntries.length > 0 ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="vb-form-alert flex flex-col gap-2 rounded-ui border-s-2 border-danger bg-surface-2 px-4 py-3 text-small outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <p className="font-medium text-fg">{f("errorSummary", { count: errorEntries.length })}</p>
          <ul className="flex flex-col gap-1">
            {errorEntries.map(([name, msg]) => (
              <li key={name}>
                <a href={`#${fid(name)}`} className="text-danger underline decoration-current/40 underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]">
                  {msg}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {state.status === "error" ? (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="vb-form-alert flex flex-col gap-1 rounded-ui border-s-2 border-danger bg-surface-2 px-4 py-3 text-small outline-none">
          <p className="font-medium text-fg">{f("errorServer")}</p>
          {fallbackPhone ? (
            <p className="text-fg-muted">
              {f("errorServerCall", { phone: "\u0000" })
                .split("\u0000")
                .flatMap((part, i) =>
                  i === 0
                    ? [part]
                    : [
                        <a key="p" href={fallbackPhone.href} className="font-medium text-fg underline underline-offset-[0.25em] focus-ring rounded-[2px]">
                          {fallbackPhone.label}
                        </a>,
                        part,
                      ],
                )}
            </p>
          ) : state.message ? (
            <p className="text-fg-muted">{state.message}</p>
          ) : null}
        </div>
      ) : null}

      <div className={cn("grid gap-x-5 gap-y-5", minimal ? "@2xl:grid-cols-[1fr_1fr_auto] @2xl:items-end" : "@xl:grid-cols-2")}>
        {fields.map((field) => {
          const c = fieldConstraints(field);
          const id = fid(field.name);
          const err = errors[field.name];
          const common = { id, name: field.name, required: field.required, defaultValue: values[field.name] ?? "", placeholder: field.placeholder };
          let control: React.ReactNode;
          if (field.options?.length) {
            control = <NativeSelect {...common} placeholder={field.placeholder ?? f("choose")} items={field.options.map((o) => ({ value: o, label: o }))} />;
          } else if (field.name === "message") {
            control = <Textarea {...common} rows={minimal ? 2 : 5} maxLength={c.maxLength} />;
          } else {
            control = <Input {...common} type={c.type} autoComplete={c.autoComplete} inputMode={c.inputMode} maxLength={c.maxLength} />;
          }
          return (
            <div key={field.name} className={cn("min-w-0", !half(field.name) && !minimal && "@xl:col-span-2", minimal && field.name === "message" && "@2xl:col-span-2")}>
              <Field label={field.label} hint={field.hint} error={err} required={field.required} labels={{ optional: labels.optional }}>
                {control}
              </Field>
            </div>
          );
        })}
        {minimal ? (
          <SubmitButton pending={pending} label={submitLabel ?? f("send")} pendingLabel={f("sending")} className="@2xl:col-start-3 @2xl:row-start-1 @2xl:self-end" />
        ) : null}
      </div>

      {/* Bots fill every field; people never see this one. */}
      <div aria-hidden="true" className="vb-hp">
        <label>
          {labels.honeypot}
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
        <input type="hidden" name={TIMESTAMP_FIELD} value={ts} readOnly />
      </div>

      {privacy || marketingConsent ? (
        <div className="flex flex-col gap-3 text-small text-fg-muted">
          {privacy ? (
            privacy.checkbox ? (
              <ConsentCheck id={fid(PRIVACY_FIELD)} name={PRIVACY_FIELD} required error={errors[PRIVACY_FIELD]}>
                <PrivacySentence template={labels.privacyRead} href={privacy.href} linkLabel={privacy.label ?? labels.privacyLink} />
              </ConsentCheck>
            ) : (
              <p className="text-pretty">
                <PrivacySentence template={labels.privacyRead} href={privacy.href} linkLabel={privacy.label ?? labels.privacyLink} />
              </p>
            )
          ) : null}
          {marketingConsent ? (
            <ConsentCheck id={fid(MARKETING_FIELD)} name={MARKETING_FIELD}>
              {labels.marketingConsent}
            </ConsentCheck>
          ) : null}
        </div>
      ) : null}

      {!minimal ? <SubmitButton pending={pending} label={submitLabel ?? f("send")} pendingLabel={f("sending")} className="self-start" /> : null}
    </form>
  );
}

function SubmitButton({ pending, label, pendingLabel, className }: { pending: boolean; label: string; pendingLabel: string; className?: string }) {
  return (
    <Button type="submit" variant="primary" size="lg" loading={pending} loadingText={pendingLabel} className={cn("vb-action-primary", className)}>
      {label}
      {pending ? null : <ArrowRight aria-hidden strokeWidth={1.75} className="vb-arrow rtl:-scale-x-100" />}
    </Button>
  );
}

function PrivacySentence({ template, href, linkLabel }: { template: string; href: string; linkLabel: string }) {
  const [before, after] = template.split("{link}");
  return (
    <>
      {before}
      <a href={href} className="font-medium text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]">
        {linkLabel}
      </a>
      {after}
    </>
  );
}

function ConsentCheck({ id, name, required, error, children }: { id: string; name: string; required?: boolean; error?: string; children: React.ReactNode }) {
  const errId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-pretty">
        <input
          id={id}
          type="checkbox"
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errId : undefined}
          className="vb-check mt-0.5 size-4 shrink-0"
        />
        <span>{children}</span>
      </label>
      {error ? (
        <p id={errId} className="ps-7 text-small text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

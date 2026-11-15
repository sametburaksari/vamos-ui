"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { Button } from "./button";
import { Field, Input } from "./input";
import {
  FORM_FIELD,
  HONEYPOT_FIELD,
  NOTICE_FIELD,
  PRIVACY_FIELD,
  SENT_PARAM,
  TIMESTAMP_FIELD,
  type SiteFormAction,
  type SiteFormState,
} from "../blocks/site/shared/site-form";

export const emailCaptureLabels = {
  label: "Email address",
  placeholder: "name@example.com",
  submit: "Subscribe",
  submitting: "Subscribing…",
  success: "Thanks — check your inbox to confirm.",
  required: "Enter your email address.",
  invalid: "Enter an email address like name@example.com.",
  error: "Couldn't sign you up. Try again in a moment.",
  /** Privacy sentence; `{link}` becomes the notice link. Same wording as ContactForm. */
  privacyRead: "I have read the {link}.",
  privacyLink: "privacy notice",
  privacyRequired: "Please confirm you have read the privacy notice.",
  honeypot: "Leave this field empty",
};
export type EmailCaptureLabels = typeof emailCaptureLabels;

export interface EmailCaptureProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "action" | "onSubmit" | "children"> {
  /** `"inline"` (default): field and button in one row once there is room · `"stacked"`: button under the field. */
  layout?: "inline" | "stacked";
  /** Visible label. Default "Email address". */
  label?: React.ReactNode;
  /** Keep the label for screen readers only (a heading above already says what this is). */
  hideLabel?: boolean;
  placeholder?: string;
  /** Small print under the field ("One email a month. Unsubscribe any time."). */
  hint?: React.ReactNode;
  submitLabel?: string;
  /**
   * The app's server action (`useActionState` signature, as ContactForm), or a URL. A URL gets a plain
   * POST without JS and a fetch with `Accept: application/json` once hydrated; it answers
   * `{ "status": "success" }`, `{ "status": "invalid", "errors": { "email": "…" } }` or `{ "status": "error" }`.
   */
  action?: SiteFormAction | string;
  /** Client-side handler instead of `action`. A rejection shows the error state. */
  onSubmit?: (email: string, data: FormData) => void | Promise<void>;
  /** Replaces the form after success; focus moves to it. */
  successMessage?: React.ReactNode;
  /** Privacy notice link (KVKK requires one). `version` is posted as `_notice`. */
  privacyLink?: { href: string; label?: string; version?: string };
  /** A required, never pre-checked "I have read the notice" checkbox (posted as `privacy`). */
  privacyCheckbox?: boolean;
  /** Input name. Default `"email"`. */
  name?: string;
  /** Control height. Default `"md"`. */
  size?: "md" | "lg";
  /** Render a given state (docs, tests, a server-rendered result). */
  initialState?: SiteFormState;
  labels?: Partial<EmailCaptureLabels>;
}

const IDLE: SiteFormState = { status: "idle" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * A compact email signup — a newsletter in a sidebar, a waitlist in a hero, the end of an article.
 * Field and button in one row (or stacked), validation tied to the input, the success and error
 * states, and the same contract as ContactForm: honeypot + time trap, `privacy` / `_notice` / `_form`
 * fields, so the app's action can call `validateContactForm([{ name: "email", required: true }], data)`.
 * Works without JS when `action` is a URL or a server action.
 *
 * ```tsx
 * <EmailCapture action="/api/subscribe" hint="One email a month." privacyLink={{ href: "/privacy" }} />
 * <EmailCapture layout="stacked" privacyCheckbox privacyLink={{ href: "/kvkk", version: "2026-01" }} onSubmit={(email) => api.subscribe(email)} />
 * ```
 */
export const EmailCapture = /*#__PURE__*/ React.forwardRef<HTMLFormElement, EmailCaptureProps>(function EmailCapture(
  {
    layout = "inline",
    label,
    hideLabel,
    placeholder,
    hint,
    submitLabel,
    action,
    onSubmit,
    successMessage,
    privacyLink,
    privacyCheckbox,
    name = "email",
    size = "md",
    initialState,
    labels,
    id,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("emailCapture", emailCaptureLabels, labels);
  const uid = React.useId();
  const base = id ?? `email-capture${uid.replace(/:/g, "")}`;

  const run = React.useCallback(
    async (prev: SiteFormState, data: FormData): Promise<SiteFormState> => {
      const email = String(data.get(name) ?? "").trim();
      const values = { [name]: email };
      const errors: Record<string, string> = {};
      if (!email) errors[name] = t("required");
      else if (email.length > 160 || !EMAIL_RE.test(email)) errors[name] = t("invalid");
      const agreed = data.get(PRIVACY_FIELD) === "on" || data.get(PRIVACY_FIELD) === "true";
      if (privacyLink && privacyCheckbox && !agreed) errors[PRIVACY_FIELD] = t("privacyRequired");
      if (Object.keys(errors).length) return { status: "invalid", errors, values, ts: Date.now() };
      try {
        if (onSubmit) {
          await onSubmit(email, data);
          return { status: "success", ts: Date.now() };
        }
        if (typeof action === "function") return await action(prev, data);
        if (typeof action === "string") return await postJson(action, data, values);
      } catch (e) {
        return { status: "error", message: e instanceof Error ? e.message : undefined, values, ts: Date.now() };
      }
      return { status: "success", ts: Date.now() };
    },
    [action, onSubmit, name, privacyLink, privacyCheckbox, t],
  );
  const [state, formAction, pending] = React.useActionState(run, initialState ?? IDLE);
  const [hydrated, setHydrated] = React.useState(false);
  const [ts, setTs] = React.useState("");
  const [sentByRedirect, setSentByRedirect] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const successRef = React.useRef<HTMLDivElement>(null);
  const alertRef = React.useRef<HTMLParagraphElement>(null);
  const first = React.useRef(true);

  React.useEffect(() => {
    setHydrated(true);
    setTs(String(Date.now()));
    // A no-JS POST to a URL action comes back as a redirect with ?vb_sent=<form id>.
    if (typeof location !== "undefined" && new URLSearchParams(location.search).get(SENT_PARAM) === base) setSentByRedirect(true);
  }, [base]);
  React.useEffect(() => {
    // Never move focus on mount: a server-rendered result must not yank the page.
    if (first.current) {
      first.current = false;
      return;
    }
    if (state.status === "success") successRef.current?.focus();
    else if (state.status === "invalid") {
      if (state.errors?.[name]) inputRef.current?.focus();
      else document.getElementById(`${base}-privacy`)?.focus();
    } else if (state.status === "error") alertRef.current?.focus();
  }, [state, name, base]);

  if (state.status === "success" || sentByRedirect) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        data-slot="email-capture"
        data-state="success"
        className={cn("flex items-start gap-2.5 rounded-ui border border-line bg-surface-2 px-4 py-3 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      >
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
        <div className="min-w-0 text-pretty">{successMessage ?? t("success")}</div>
      </div>
    );
  }

  const errors = state.status === "invalid" ? (state.errors ?? {}) : {};
  const value = state.values?.[name] ?? "";
  const urlAction = typeof action === "string" ? action : undefined;
  const inline = layout === "inline";
  const linkLabel = privacyLink?.label ?? t("privacyLink");
  const [before, after] = t.labels.privacyRead.split("{link}");
  const privacySentence = privacyLink ? (
    <>
      {before}
      <a href={privacyLink.href} className="font-medium text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]">
        {linkLabel}
      </a>
      {after}
    </>
  ) : null;
  const privacyError = errors[PRIVACY_FIELD];

  return (
    <form
      ref={ref}
      key={state.ts ?? 0}
      id={base}
      action={urlAction && !hydrated ? urlAction : formAction}
      method={urlAction && !hydrated ? "post" : undefined}
      noValidate={hydrated}
      aria-busy={pending || undefined}
      data-slot="email-capture"
      data-layout={layout}
      data-state={pending ? "submitting" : state.status}
      className={cn("@container flex w-full flex-col gap-3", className)}
      {...props}
    >
      <Field
        id={`${base}-${name}`}
        label={<span className={hideLabel ? "sr-only" : undefined}>{label ?? t("label")}</span>}
        hint={hint}
        error={errors[name]}
      >
        <div className={cn("flex flex-col gap-2", inline && "@md:flex-row")}>
          <Input
            ref={inputRef}
            id={`${base}-${name}`}
            name={name}
            type="email"
            autoComplete="email"
            inputMode="email"
            dir="ltr"
            maxLength={160}
            required
            size={size}
            defaultValue={value}
            placeholder={placeholder ?? t("placeholder")}
            className="min-w-0 flex-1"
          />
          <Button type="submit" variant="primary" size={size} loading={pending} loadingText={t("submitting")} className={cn(inline ? "@md:shrink-0" : "self-start")}>
            {submitLabel ?? t("submit")}
          </Button>
        </div>
      </Field>

      {state.status === "error" ? (
        <p ref={alertRef} tabIndex={-1} role="alert" className="m-0 rounded-ui border-s-2 border-danger bg-surface-2 px-3 py-2 text-sm text-fg outline-none">
          {t("error")}
          {state.message ? <span className="block text-fg-muted">{state.message}</span> : null}
        </p>
      ) : null}

      {privacyLink ? (
        privacyCheckbox ? (
          <div className="flex flex-col gap-1 text-xs text-fg-muted">
            <label htmlFor={`${base}-privacy`} className="flex cursor-pointer items-start gap-2.5 text-pretty">
              <input
                id={`${base}-privacy`}
                type="checkbox"
                name={PRIVACY_FIELD}
                required
                aria-invalid={privacyError ? true : undefined}
                aria-describedby={privacyError ? `${base}-privacy-error` : undefined}
                className="mt-0.5 size-4 shrink-0 accent-accent"
              />
              <span>{privacySentence}</span>
            </label>
            {privacyError ? (
              <p id={`${base}-privacy-error`} className="m-0 ps-6.5 text-danger">
                {privacyError}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="m-0 text-xs text-pretty text-fg-muted">{privacySentence}</p>
        )
      ) : null}

      {/* Bots fill every field; people never see this one. */}
      <div aria-hidden="true" className="absolute -start-[10000px] size-px overflow-hidden">
        <label>
          {t("honeypot")}
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
        <input type="hidden" name={TIMESTAMP_FIELD} value={ts} readOnly />
        <input type="hidden" name={FORM_FIELD} value={base} readOnly />
        {privacyLink?.version ? <input type="hidden" name={NOTICE_FIELD} value={privacyLink.version} readOnly /> : null}
      </div>
    </form>
  );
});

/** POSTs to a URL action and reads its JSON answer; anything unexpected is an error. */
async function postJson(url: string, data: FormData, values: Record<string, string>): Promise<SiteFormState> {
  const res = await fetch(url, { method: "POST", body: data, headers: { Accept: "application/json" }, credentials: "same-origin" });
  const body = (await res.json().catch(() => null)) as Partial<SiteFormState> | null;
  if (body?.status === "success") return { status: "success", ts: Date.now() };
  if (body?.status === "invalid" && body.errors) return { status: "invalid", errors: body.errors, values, ts: Date.now() };
  return { status: "error", message: typeof body?.message === "string" ? body.message : undefined, values, ts: Date.now() };
}

"use client";

import * as React from "react";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTrigger } from "../../components/dialog";
import { Field, Input } from "../../components/input";
import { Button } from "../../components/button";
import { Checkbox } from "../../components/checkbox";
import { newsText, type NewsBlockLabels } from "./shared/labels-news";

export type AuthView = "signIn" | "recover";

export interface AuthSignInData {
  email: string;
  password: string;
  remember: boolean;
}

/** Return a message to show it as the form error; resolve nothing for success. */
type AuthResult = void | string | undefined;

export interface AuthDialogProps {
  /** The button that opens the dialog. A ReactElement is used `asChild`. */
  trigger?: React.ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** View shown when the dialog opens. Default `"signIn"`. */
  defaultView?: AuthView;
  /** Sign in. Resolve to close the dialog; return a string to show it as the error. */
  onSignIn?: (data: AuthSignInData) => Promise<AuthResult> | AuthResult;
  /** Send the reset link. Resolve to show the "check your inbox" note. */
  onRecover?: (email: string) => Promise<AuthResult> | AuthResult;
  /** Without JavaScript handlers: plain form posts (`method="post"`) to these URLs. */
  signInAction?: string;
  recoverAction?: string;
  /** "Create a free account" link (the registration page). */
  joinHref?: string;
  /** Publication name shown above the title. */
  brand?: React.ReactNode;
  locale?: string;
  labels?: NewsBlockLabels;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sign-in for readers in a dialog, with a password-recovery view in the same dialog (no page
 * change). Fields have autocomplete hints for password managers; errors sit on the fields and
 * focus moves to the first invalid one; switching view moves focus to its first field. Works
 * with callbacks (`onSignIn`, `onRecover`) or plain form posts.
 *
 * ```tsx
 * <AuthDialog trigger={<button>Sign in / Join</button>} onSignIn={signIn} onRecover={sendReset} joinHref="/join" />
 * ```
 */
export function AuthDialog({ trigger, open: openProp, defaultOpen, onOpenChange, defaultView = "signIn", onSignIn, onRecover, signInAction, recoverAction, joinHref, brand, locale = "en-US", labels }: AuthDialogProps) {
  const t = newsText(labels, locale);
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false);
  const open = openProp ?? innerOpen;
  const [view, setView] = React.useState<AuthView>(defaultView);
  const [busy, setBusy] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; form?: string }>({});
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const uid = React.useId();

  const setOpen = (v: boolean) => {
    if (openProp === undefined) setInnerOpen(v);
    onOpenChange?.(v);
    if (!v) {
      setView(defaultView);
      setErrors({});
      setSentTo(null);
    }
  };
  const go = (v: AuthView) => {
    setView(v);
    setErrors({});
    setSentTo(null);
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("input")?.focus());
  };

  const validate = (data: FormData) => {
    const next: typeof errors = {};
    const email = String(data.get("email") ?? "").trim();
    if (!email) next.email = t("errorRequired");
    else if (!EMAIL.test(email)) next.email = t("errorEmail");
    if (view === "signIn" && !String(data.get("password") ?? "")) next.password = t("errorRequired");
    return next;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    if (found.email || found.password) {
      e.preventDefault();
      setErrors(found);
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("[aria-invalid=true]")?.focus());
      return;
    }
    const handler = view === "signIn" ? onSignIn : onRecover;
    if (!handler) return; // native post to the action URL
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const email = String(data.get("email")).trim();
    try {
      const result = view === "signIn" ? await onSignIn!({ email, password: String(data.get("password")), remember: data.get("remember") === "on" }) : await onRecover!(email);
      if (typeof result === "string") setErrors({ form: result });
      else if (view === "signIn") setOpen(false);
      else setSentTo(email);
    } catch {
      setErrors({ form: t("errorGeneric") });
    } finally {
      setBusy(false);
    }
  };

  const link = "rounded-[2px] text-[0.875rem] font-medium text-accent-ink underline decoration-transparent underline-offset-[0.2em] hover:decoration-current focus-ring";
  const signIn = view === "signIn";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent size="sm" mobile="sheet" data-slot="auth-dialog" data-view={view}>
        <DialogHeader
          // The title size is set on the header's own title element: a size on an inner span lost to
          // the header's title style (its 1.3rem line box and weight).
          className="[&_[data-slot=layer-title]]:text-[1.5rem] [&_[data-slot=layer-title]]:font-normal [&_[data-slot=layer-title]]:leading-tight"
          title={
            <span className="flex flex-col gap-1">
              {brand ? <span className="font-mono text-[0.6875rem] font-medium uppercase leading-normal tracking-[0.12em] text-fg-muted">{brand}</span> : null}
              <span>{signIn ? t("signInTitle") : t("recoverTitle")}</span>
            </span>
          }
          description={signIn ? t("signInLead") : t("recoverLead")}
        />
        <DialogBody>
          {sentTo ? (
            <div className="flex flex-col gap-4">
              <p role="status" className="rounded-ui-sm border border-line bg-surface-2 p-3 text-[0.9375rem] text-fg">
                {t("recoverSent", { email: sentTo })}
              </p>
              <button type="button" className={`${link} self-start`} onClick={() => go("signIn")}>
                {t("backToSignIn")}
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              key={view}
              noValidate
              method="post"
              action={signIn ? signInAction : recoverAction}
              onSubmit={submit}
              className="flex flex-col gap-4"
              aria-describedby={errors.form ? `${uid}-err` : undefined}
            >
              {errors.form ? (
                <p id={`${uid}-err`} role="alert" className="rounded-ui-sm border border-danger/40 bg-danger/10 p-3 text-[0.875rem] text-danger-ink">
                  {errors.form}
                </p>
              ) : null}
              <Field label={t("email")} error={errors.email} required>
                <Input name="email" type="email" autoComplete={signIn ? "username" : "email"} inputMode="email" spellCheck={false} />
              </Field>
              {signIn ? (
                <>
                  <Field
                    label={t("password")}
                    error={errors.password}
                    required
                    labelAction={
                      <button type="button" className={link} onClick={() => go("recover")}>
                        {t("forgotPassword")}
                      </button>
                    }
                  >
                    <Input name="password" type="password" autoComplete="current-password" />
                  </Field>
                  <Checkbox name="remember" label={t("rememberMe")} defaultChecked />
                </>
              ) : null}
              <Button type="submit" variant="primary" block loading={busy} loadingText={signIn ? t("signingIn") : t("sending")}>
                {signIn ? t("signIn") : t("sendResetLink")}
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[0.875rem] text-fg-muted">
                {signIn ? (
                  joinHref ? (
                    <span>
                      {t("noAccount")}{" "}
                      <a href={joinHref} className={link}>
                        {t("createAccount")}
                      </a>
                    </span>
                  ) : null
                ) : (
                  <button type="button" className={link} onClick={() => go("signIn")}>
                    {t("backToSignIn")}
                  </button>
                )}
              </div>
            </form>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

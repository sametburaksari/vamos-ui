"use client";

import * as React from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Alert, Button, Checkbox, Field, Input, Separator } from "@vamos-ui/react";
import { PasswordInput } from "./password-input";
import { GitHubMark, GoogleMark, MicrosoftMark } from "./sso-icons";

type Provider = "google" | "microsoft" | "github" | "saml";
type Status = { kind: "idle" } | { kind: "submitting" } | { kind: "error"; attemptsLeft: number } | { kind: "success"; email: string };

const providers: { id: Provider; label: string; icon: React.ReactNode }[] = [
  { id: "google", label: "Google", icon: <GoogleMark /> },
  { id: "microsoft", label: "Microsoft", icon: <MicrosoftMark /> },
  { id: "github", label: "GitHub", icon: <GitHubMark /> },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Email + password sign-in with SSO providers above an "or" divider. */
export function SignInForm() {
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const [pending, setPending] = React.useState<Provider | null>(null);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const attempts = React.useRef(5);

  const startSso = (id: Provider) => {
    setPending(id);
    window.setTimeout(() => setPending(null), 1600);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const next: typeof errors = {};
    if (!email) next.email = "Enter your work email.";
    else if (!EMAIL.test(email)) next.email = "That doesn’t look like an email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (next.email || next.password) {
      const first = next.email ? "signin-email" : "signin-password";
      document.getElementById(first)?.focus();
      return;
    }
    setStatus({ kind: "submitting" });
    window.setTimeout(() => {
      // Demo rule: anything shorter than 8 characters is "wrong".
      if (password.length < 8) {
        attempts.current -= 1;
        setStatus({ kind: "error", attemptsLeft: attempts.current });
      } else {
        setStatus({ kind: "success", email });
      }
    }, 900);
  };

  const busy = status.kind === "submitting" || pending !== null;

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-3 gap-2">
        {providers.map((p) => (
          <Button
            key={p.id}
            variant="secondary"
            loading={pending === p.id}
            loadingMode="replace"
            disabled={busy && pending !== p.id}
            onClick={() => startSso(p.id)}
            aria-label={`Continue with ${p.label}`}
            className="px-2"
          >
            {p.icon}
            <span className="hidden sm:inline">{p.label}</span>
          </Button>
        ))}
      </div>
      <Button variant="ghost" block loading={pending === "saml"} disabled={busy && pending !== "saml"} onClick={() => startSso("saml")} className="-mt-2 text-fg-muted">
        <KeyRound /> Sign in with SAML SSO
      </Button>

      <Separator label="or with email" className="text-[12px]" />

      {status.kind === "error" ? (
        <Alert tone="danger" size="sm" live="assertive" title="Email or password is incorrect">
          {status.attemptsLeft > 0
            ? `${status.attemptsLeft} ${status.attemptsLeft === 1 ? "attempt" : "attempts"} left before we lock sign-in for 15 minutes.`
            : "Sign-in is locked for 15 minutes. Reset your password to get back in now."}
        </Alert>
      ) : null}
      {status.kind === "success" ? (
        <Alert tone="success" size="sm" live="polite" title="Signed in">
          Taking you to your workspace as {status.email}…
        </Alert>
      ) : null}

      <form noValidate onSubmit={onSubmit} className="grid gap-4" aria-label="Sign in with email">
        <Field label="Work email" id="signin-email" error={errors.email}>
          <Input name="email" type="email" autoComplete="username" placeholder="maya.chen@northwind.io" defaultValue="maya.chen@northwind.io" />
        </Field>
        <Field
          label="Password"
          id="signin-password"
          error={errors.password}
          labelAction={
            <a href="#" className="rounded-ui-sm font-medium text-accent-ink hover:underline focus-ring">
              Forgot password?
            </a>
          }
        >
          <PasswordInput name="password" autoComplete="current-password" />
        </Field>
        <Checkbox name="remember" label="Keep me signed in for 30 days" defaultChecked size="sm" />
        <Button type="submit" variant="primary" block loading={status.kind === "submitting"} loadingText="Signing in…" disabled={pending !== null}>
          Sign in <ArrowRight />
        </Button>
      </form>
    </div>
  );
}

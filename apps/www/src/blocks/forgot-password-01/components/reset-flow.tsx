"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CircleCheck, MailCheck } from "lucide-react";
import { Alert, Button, Card, Field, Input } from "@vamos-ui/react";
import { AuthHeading } from "../../login-02/components/auth-frame";
import { PasswordInput } from "../../login-02/components/password-input";
import { PasswordStrength, scorePassword } from "../../signup-01/components/password-strength";

type Step = "request" | "sent" | "reset" | "done";
const order: Step[] = ["request", "sent", "reset", "done"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function StepCount({ step }: { step: Step }) {
  const n = Math.min(order.indexOf(step) + 1, 3);
  return (
    <p className="font-mono text-[11.5px] tabular text-fg-subtle">
      <span className="sr-only">Step </span>
      {String(n).padStart(2, "0")} <span aria-hidden>/</span>
      <span className="sr-only"> of </span> 03
    </p>
  );
}

/** Forgot → email sent → choose a new password → done, in one column. */
export function ResetFlow() {
  const [step, setStep] = React.useState<Step>("request");
  const [email, setEmail] = React.useState("maya.chen@northwind.io");
  const [emailError, setEmailError] = React.useState<string>();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [resetErrors, setResetErrors] = React.useState<{ password?: string; confirm?: string }>({});
  const [busy, setBusy] = React.useState(false);
  const headingRef = React.useRef<HTMLDivElement>(null);

  // Move focus to the new screen's heading so keyboard and screen-reader users follow along.
  const go = (next: Step) => {
    setStep(next);
    window.requestAnimationFrame(() => headingRef.current?.querySelector("h1")?.focus());
  };

  const wait = (fn: () => void) => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      fn();
    }, 800);
  };

  const request = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setEmailError("Enter the email you sign in with.");
      document.getElementById("reset-email")?.focus();
      return;
    }
    setEmailError(undefined);
    wait(() => go("sent"));
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof resetErrors = {};
    if (scorePassword(password, { name: "Maya Chen", email }).score < 3) next.password = "Meet at least three of the rules below.";
    if (confirm !== password) next.confirm = "The passwords don’t match.";
    setResetErrors(next);
    if (next.password || next.confirm) {
      document.getElementById(next.password ? "reset-password" : "reset-confirm")?.focus();
      return;
    }
    wait(() => go("done"));
  };

  return (
    <div key={step} className="ui-rise grid gap-6">
      <div ref={headingRef} className="grid gap-3 [&_h1]:outline-none">
        {step !== "done" ? <StepCount step={step} /> : null}
        {step === "request" ? (
          <AuthHeading title={<>Forgot your <em>password?</em></>}>Enter your email and we’ll send a link to choose a new one. The link works for 30 minutes.</AuthHeading>
        ) : step === "sent" ? (
          <AuthHeading title="Check your inbox">
            If <strong className="font-medium text-fg">{email}</strong> has an Northpoint account, a reset link is on its way.
          </AuthHeading>
        ) : step === "reset" ? (
          <AuthHeading title="Choose a new password">You’ll be signed out of every other device once it’s saved.</AuthHeading>
        ) : (
          <AuthHeading title={<>You’re all <em>set</em></>}>Your password was changed. We emailed {email} a copy of this notice.</AuthHeading>
        )}
      </div>

      {step === "request" ? (
        <form noValidate onSubmit={request} className="grid gap-4" aria-label="Request a reset link">
          <Field label="Email" id="reset-email" error={emailError}>
            <Input name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" block loading={busy} loadingText="Sending link…">
            Send reset link
          </Button>
          <a href="#" className="inline-flex items-center justify-center gap-1.5 rounded-ui-sm text-[13px] text-fg-muted hover:text-fg focus-ring">
            <ArrowLeft className="size-3.5" aria-hidden /> Back to sign in
          </a>
        </form>
      ) : null}

      {step === "sent" ? (
        <div className="grid gap-4">
          <Card variant="inset" className="grid gap-3 p-4" aria-label="Email preview">
            <div className="flex items-center gap-3 text-[12.5px]">
              <span aria-hidden className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent-ink">
                <MailCheck className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-fg">Reset your Northpoint password</p>
                <p className="truncate text-fg-subtle">security@northpoint.app · just now</p>
              </div>
            </div>
            <p className="text-[13px] text-fg-muted">Someone asked to reset the password for this account. If it was you, use the button below.</p>
            <Button size="sm" variant="solid" className="justify-self-start" onClick={() => go("reset")}>
              Reset password <ArrowRight />
            </Button>
          </Card>
          <p className="text-[13px] text-fg-muted">
            Nothing after a few minutes? Check spam, or{" "}
            <Button variant="link" className="text-[13px]" onClick={() => go("request")}>
              try a different email
            </Button>
            .
          </p>
        </div>
      ) : null}

      {step === "reset" ? (
        <form noValidate onSubmit={save} className="grid gap-4" aria-label="Set a new password">
          {/* Lets password managers save the new password against the right account. */}
          <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
          <Field label="New password" id="reset-password" error={resetErrors.password}>
            <PasswordInput name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="reset-strength" />
          </Field>
          <PasswordStrength id="reset-strength" password={password} name="Maya Chen" email={email} className="-mt-1" />
          <Field label="Confirm new password" id="reset-confirm" error={resetErrors.confirm}>
            <PasswordInput name="confirm" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" block loading={busy} loadingText="Saving…">
            Save password
          </Button>
        </form>
      ) : null}

      {step === "done" ? (
        <div className="grid gap-4">
          <Alert tone="success" icon={<CircleCheck aria-hidden />} title="Password updated" live="polite">
            3 other sessions were signed out: MacBook Pro · Chrome, iPhone 15 · Safari, Windows · Edge.
          </Alert>
          <Button variant="primary" block>
            Continue to sign in <ArrowRight />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

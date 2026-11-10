"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Alert, Button, Checkbox, Field, Input, Separator } from "@vamos-ui/react";
import { PasswordInput } from "../../login-02/components/password-input";
import { GoogleMark, MicrosoftMark } from "../../login-02/components/sso-icons";
import { PasswordStrength, scorePassword } from "./password-strength";

type Errors = Partial<Record<"name" | "email" | "password" | "terms", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FREE_MAIL = /@(gmail|yahoo|hotmail|outlook|icloud)\./i;

/** Name, work email, new password with live strength, terms consent. */
export function SignUpForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [terms, setTerms] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Tell us what to call you.";
    if (!email.trim()) next.email = "Enter your work email.";
    else if (!EMAIL.test(email.trim())) next.email = "That doesn’t look like an email address.";
    if (scorePassword(password, { name, email }).score < 3) next.password = "Pick a stronger password — meet at least three of the rules below.";
    if (!terms) next.terms = "Accept the terms to create your account.";
    setErrors(next);
    const first = (["name", "email", "password", "terms"] as const).find((k) => next[k]);
    if (first) {
      document.getElementById(`signup-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(email.trim());
    }, 1000);
  };

  if (done) {
    return (
      <Alert tone="success" live="polite" title="Check your inbox" actions={<Button size="sm" variant="secondary">Resend email</Button>}>
        We sent a confirmation link to <strong className="font-semibold">{done}</strong>. It expires in 24 hours.
      </Alert>
    );
  }

  const workEmailHint = email && FREE_MAIL.test(email) ? "Personal addresses work, but a work email lets teammates find you." : "Use the address your team knows you by.";

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary">
          <GoogleMark /> Google
        </Button>
        <Button variant="secondary">
          <MicrosoftMark /> Microsoft
        </Button>
      </div>
      <Separator label="or sign up with email" className="text-[12px]" />
      <form noValidate onSubmit={onSubmit} className="grid gap-4" aria-label="Create your account">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" id="signup-name" error={errors.name}>
            <Input name="name" autoComplete="name" placeholder="Maya Chen" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Company" id="signup-company" optional>
            <Input name="company" autoComplete="organization" placeholder="Northwind Labs" />
          </Field>
        </div>
        <Field label="Work email" id="signup-email" error={errors.email} hint={workEmailHint}>
          <Input name="email" type="email" autoComplete="email" placeholder="maya@northwind.io" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" id="signup-password" error={errors.password}>
          <PasswordInput name="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby="signup-password-strength" />
        </Field>
        <PasswordStrength id="signup-password-strength" password={password} name={name} email={email} className="-mt-1" />
        <Field orientation="horizontal" id="signup-terms" error={errors.terms}
          label={
            <>
              I agree to the{" "}
              <a href="#" className="rounded-ui-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="rounded-ui-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
                Privacy Policy
              </a>
            </>
          }
        >
          <Checkbox name="terms" size="sm" checked={terms} onCheckedChange={(v) => setTerms(v === true)} />
        </Field>
        <Button type="submit" variant="primary" block loading={submitting} loadingText="Creating account…">
          Create account <ArrowRight />
        </Button>
      </form>
    </div>
  );
}

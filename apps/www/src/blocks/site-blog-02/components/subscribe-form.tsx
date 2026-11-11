"use client";

import * as React from "react";
import { Button, Field, Input } from "@vamos-ui/react";

export interface SubscribeLabels {
  email: string;
  placeholder: string;
  submit: string;
  invalid: string;
  /** "Check {email} for a confirmation link." */
  done: string;
  hint: string;
}

/** Email signup: validates in place and confirms without leaving the page (demo, nothing is sent). */
export function SubscribeForm({ labels }: { labels: SubscribeLabels }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [sent, setSent] = React.useState<string | null>(null);

  if (sent)
    return (
      <p role="status" className="rounded-ui border border-line bg-surface-2 px-4 py-3 font-mono text-small text-fg">
        <span className="text-accent-ink">✓</span> {labels.done.replace("{email}", sent)}
      </p>
    );

  return (
    <form
      noValidate
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError(labels.invalid);
        setSent(email.trim());
      }}
    >
      <div className="flex flex-col gap-2 @md:flex-row @md:items-start">
        <Field label={labels.email} error={error} hint={labels.hint} className="flex-1 [&_label]:sr-only">
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(undefined);
            }}
            placeholder={labels.placeholder}
            className="font-mono"
          />
        </Field>
        <Button type="submit" variant="primary">
          {labels.submit}
        </Button>
      </div>
    </form>
  );
}

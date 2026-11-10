"use client";

import * as React from "react";
import { ArrowLeft, ExternalLink, Mail, RotateCw } from "lucide-react";
import { Alert, Button, Card, Field, Input, Spinner } from "@vamos-ui/react";
import { AuthHeading } from "../../login-02/components/auth-frame";

const COOLDOWN = 45;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const mailApps = [
  { name: "Gmail", href: "https://mail.google.com/mail/u/0/#search/from%3Anorthpoint.app+in%3Aanywhere+newer_than%3A1h" },
  { name: "Outlook", href: "https://outlook.office.com/mail/" },
];

function formatClock(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Passwordless sign-in: the "link sent" state first, with a way back to change the address. */
export function MagicLink() {
  const [view, setView] = React.useState<"sent" | "request">("sent");
  const [email, setEmail] = React.useState("maya.chen@northwind.io");
  const [draft, setDraft] = React.useState(email);
  const [error, setError] = React.useState<string>();
  const [cooldown, setCooldown] = React.useState(COOLDOWN);
  const [sending, setSending] = React.useState(false);
  const [resent, setResent] = React.useState(0);

  React.useEffect(() => {
    if (view !== "sent" || cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [view, cooldown]);

  const send = (address: string, again: boolean) => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setEmail(address);
      setCooldown(COOLDOWN);
      setView("sent");
      if (again) setResent((n) => n + 1);
    }, 800);
  };

  if (view === "request") {
    return (
      <div key="request" className="ui-rise grid gap-6">
        <AuthHeading title={<>Sign in with a <em>link</em></>}>No password to remember. We’ll email you a link that signs you in on this device.</AuthHeading>
        <form
          noValidate
          className="grid gap-4"
          aria-label="Email me a sign-in link"
          onSubmit={(e) => {
            e.preventDefault();
            if (!EMAIL.test(draft.trim())) {
              setError("Enter a valid email address.");
              document.getElementById("magic-email")?.focus();
              return;
            }
            setError(undefined);
            setResent(0);
            send(draft.trim(), false);
          }}
        >
          <Field label="Email" id="magic-email" error={error}>
            <Input name="email" type="email" autoComplete="email" leading={<Mail />} value={draft} onChange={(e) => setDraft(e.target.value)} />
          </Field>
          <Button type="submit" variant="primary" block loading={sending} loadingText="Sending…">
            Email me a sign-in link
          </Button>
          <a href="#" className="justify-self-center rounded-ui-sm text-[13px] text-fg-muted hover:text-fg focus-ring">
            Sign in with a password instead
          </a>
        </form>
      </div>
    );
  }

  return (
    <div key="sent" className="ui-rise grid gap-7">
      <div aria-hidden className="vb-auth-envelope">
        <Mail strokeWidth={1.5} />
      </div>
      <AuthHeading title={<>Check your <em>email</em></>}>
        We sent a sign-in link to <strong className="font-medium text-fg">{email}</strong>. It works once and expires in 15 minutes.
      </AuthHeading>

      {resent > 0 ? (
        <Alert tone="info" size="sm" live="polite">
          A new link is on its way. Earlier links no longer work.
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {mailApps.map((app) => (
          <Button key={app.name} asChild variant="secondary">
            <a href={app.href} target="_blank" rel="noreferrer">
              Open {app.name} <ExternalLink className="text-fg-subtle" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </Button>
        ))}
      </div>

      <Card variant="inset" className="flex items-start gap-3 p-4 text-[13px]">
        <Spinner size="sm" tone="muted" className="mt-0.5" label="Waiting for you to open the link" />
        <p className="text-fg-muted">
          <span className="font-medium text-fg">Opening it on your phone?</span> That works too — this tab signs in by itself as soon as you tap the link.
        </p>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-4 text-[13px]">
        <Button variant="ghost" size="sm" className="-ms-3 text-fg-muted" onClick={() => setView("request")}>
          <ArrowLeft /> Use a different email
        </Button>
        <Button variant="ghost" size="sm" className="-me-3" disabled={cooldown > 0} loading={sending} onClick={() => send(email, true)}>
          <RotateCw />
          {cooldown > 0 ? (
            <span>
              Resend in <span className="font-mono tabular">{formatClock(cooldown)}</span>
            </span>
          ) : (
            "Resend link"
          )}
        </Button>
      </div>
    </div>
  );
}

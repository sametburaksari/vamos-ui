"use client";

import * as React from "react";
import { Check, Copy, Rss } from "lucide-react";
import { Button, Input } from "@vamos-ui/react";
import { copyFor, RSS, type SiteLocale } from "./content";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Email subscription (validated, with a confirmation state) and the RSS feed with a copy button. */
export function Subscribe({ locale, idPrefix = "cl" }: { locale: SiteLocale; idPrefix?: string }) {
  const { t } = copyFor(locale);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const inputId = `${idPrefix}-email`;

  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError(t({ en: "Enter an email address like you@company.example.com.", tr: "you@company.example.com gibi bir e-posta adresi girin." }));
      return;
    }
    setError(null);
    setDone(email.trim());
  };

  return (
    <div className="grid gap-4">
      {done ? (
        <p role="status" className="m-0 flex items-start gap-2 rounded-ui border border-line bg-surface px-4 py-3 text-sm text-fg">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
          <span>
            {t({ en: "Almost there — confirm the link we sent to ", tr: "Neredeyse tamam — şu adrese gönderdiğimiz bağlantıyı onaylayın: " })}
            <strong className="font-medium">{done}</strong>.{" "}
            {t({ en: "One email per release, never more.", tr: "Sürüm başına bir e-posta, asla fazlası değil." })}
          </span>
        </p>
      ) : (
        <form noValidate onSubmit={submit} className="grid gap-1.5">
          <label htmlFor={inputId} className="text-sm font-medium text-fg">
            {t({ en: "Get each release by email", tr: "Her sürümü e-postayla alın" })}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id={inputId}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.example.com"
              invalid={Boolean(error)}
              aria-describedby={error ? `${inputId}-err` : `${inputId}-hint`}
              className="sm:flex-1"
            />
            <Button type="submit" variant="primary">
              {t({ en: "Subscribe", tr: "Abone ol" })}
            </Button>
          </div>
          {error ? (
            <p id={`${inputId}-err`} className="m-0 text-xs text-danger">
              {error}
            </p>
          ) : (
            <p id={`${inputId}-hint`} className="m-0 text-xs text-fg-muted">
              {t({ en: "Every other Tuesday. Unsubscribe from any email.", tr: "İki salıda bir. Her e-postadan aboneliği bırakabilirsiniz." })}
            </p>
          )}
        </form>
      )}
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <Rss aria-hidden className="size-4 shrink-0 text-accent-ink" />
        <a href={RSS} className="min-w-0 truncate font-mono text-[13px] text-fg-muted underline decoration-line underline-offset-4 focus-ring hover:text-fg">
          {RSS.replace("https://", "")}
        </a>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          aria-label={copied ? t({ en: "Feed URL copied", tr: "Akış adresi kopyalandı" }) : t({ en: "Copy feed URL", tr: "Akış adresini kopyala" })}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(RSS);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
        <span role="status" className="sr-only">
          {copied ? t({ en: "Feed URL copied", tr: "Akış adresi kopyalandı" }) : ""}
        </span>
      </div>
    </div>
  );
}

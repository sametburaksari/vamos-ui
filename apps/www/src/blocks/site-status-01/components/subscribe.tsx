"use client";

import * as React from "react";
import { Check, Mail, Rss, Webhook } from "lucide-react";
import { Button, Input, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { copyFor, type SiteLocale } from "./content";

type Channel = "email" | "webhook" | "rss";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Subscribe by email, by webhook (Relay delivering its own status, naturally) or RSS. */
export function StatusSubscribe({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [channel, setChannel] = React.useState<Channel>("email");
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    const ok = channel === "email" ? EMAIL_RE.test(v) : /^https:\/\/[^\s]+\.[^\s]+/.test(v);
    if (!ok) {
      setError(channel === "email" ? t({ en: "Enter an email address, e.g. oncall@company.example.com.", tr: "Bir e-posta adresi girin, örn. oncall@company.example.com." }) : t({ en: "Enter an https:// URL.", tr: "https:// ile başlayan bir adres girin." }));
      return;
    }
    setError(null);
    setDone(v);
  };

  return (
    <div className="grid gap-4">
      <ToggleGroup
        aria-label={t({ en: "How to get updates", tr: "Güncellemeleri nasıl alacağınız" })}
        value={channel}
        onValueChange={(v) => {
          setChannel(v as Channel);
          setError(null);
          setDone(null);
          setValue("");
        }}
        size="sm"
      >
        <ToggleGroupItem value="email" className="gap-1.5">
          <Mail aria-hidden /> {t({ en: "Email", tr: "E-posta" })}
        </ToggleGroupItem>
        <ToggleGroupItem value="webhook" className="gap-1.5">
          <Webhook aria-hidden /> Webhook
        </ToggleGroupItem>
        <ToggleGroupItem value="rss" className="gap-1.5">
          <Rss aria-hidden /> RSS
        </ToggleGroupItem>
      </ToggleGroup>

      {channel === "rss" ? (
        <p className="m-0 text-sm text-fg-muted">
          {t({ en: "Add this feed to your reader: ", tr: "Bu akışı okuyucunuza ekleyin: " })}
          <a href="https://status.relay.example.com/history.rss" className="font-mono text-[13px] text-fg underline underline-offset-4 focus-ring">
            status.relay.example.com/history.rss
          </a>
        </p>
      ) : done ? (
        <p role="status" className="m-0 flex items-start gap-2 text-sm text-fg">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
          {channel === "email"
            ? t({ en: `Confirmation sent to ${done}. You’ll hear about incidents and maintenance only.`, tr: `${done} adresine onay gönderildi. Yalnızca olay ve bakımlardan haberdar olacaksınız.` })
            : t({ en: `${done} will receive status.incident.* events, signed like every Relay delivery.`, tr: `${done} her Relay teslimi gibi imzalı status.incident.* olaylarını alacak.` })}
        </p>
      ) : (
        <form noValidate onSubmit={submit} className="grid gap-1.5">
          <label htmlFor="st-sub-input" className="text-sm font-medium text-fg">
            {channel === "email" ? t({ en: "Email address", tr: "E-posta adresi" }) : t({ en: "Endpoint URL", tr: "Uç nokta adresi" })}
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="st-sub-input"
              type={channel === "email" ? "email" : "url"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={channel === "email" ? "oncall@company.example.com" : "https://hooks.example.com/status"}
              invalid={Boolean(error)}
              aria-describedby={error ? "st-sub-err" : undefined}
              className="sm:flex-1"
            />
            <Button type="submit" variant="solid">
              {t({ en: "Subscribe", tr: "Abone ol" })}
            </Button>
          </div>
          {error ? (
            <p id="st-sub-err" className="m-0 text-xs text-danger">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}

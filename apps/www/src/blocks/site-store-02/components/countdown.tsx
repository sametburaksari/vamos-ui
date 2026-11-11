"use client";

import * as React from "react";
import { Button, cn, Input, Label } from "@vamos-ui/react";
import { CalendarPlus } from "lucide-react";
import { formatterOf, NEXT_DROP } from "./content";
import { useDrop, useDropClock } from "./drop-provider";

const pad = (n: number) => String(n).padStart(2, "0");

function split(ms: number) {
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), sec: s % 60 };
}

/**
 * The signature: a live countdown to the next drop. Ticks every second after hydration (the
 * server renders dashes, so there is no mismatch), announces itself as a `timer` whose
 * accessible name changes once a minute, and flips the site to "live" when it reaches zero.
 */
export function DropCountdown({ size = "lg", className }: { size?: "lg" | "sm"; className?: string }) {
  const { s } = useDrop();
  const { remaining, live } = useDropClock();
  const parts = remaining === null ? null : split(remaining);
  const cells: [string, string][] = [
    [s("days"), parts ? pad(parts.d) : "--"],
    [s("hours"), parts ? pad(parts.h) : "--"],
    [s("minutes"), parts ? pad(parts.m) : "--"],
    [s("seconds"), parts ? pad(parts.sec) : "--"],
  ];
  const label = live ? s("timerLive", { no: pad(NEXT_DROP.no) }) : parts ? s("timer", { no: pad(NEXT_DROP.no), d: parts.d, h: parts.h, m: parts.m }) : s("drop", { no: pad(NEXT_DROP.no) });

  if (live) {
    return (
      <p role="status" className={cn("inline-flex items-center gap-3 bg-accent px-4 py-3 font-display text-h3 uppercase text-accent-fg", className)}>
        <span aria-hidden className="size-2.5 animate-pulse rounded-full bg-accent-fg motion-reduce:animate-none" />
        {label}
      </p>
    );
  }

  return (
    <div role="timer" aria-label={label} data-countdown className={cn("grid grid-cols-4 border border-line", className)}>
      {cells.map(([unit, value], i) => (
        <div key={unit} aria-hidden className={cn("flex flex-col justify-between gap-2 p-2.5 @3xl:p-3.5", i > 0 && "border-s border-line", i === 3 && "bg-accent text-accent-fg")}>
          <span className={cn("font-mono text-[10px] uppercase tracking-[0.16em]", i === 3 ? "text-accent-fg" : "text-fg-muted")}>{unit}</span>
          <span
            data-unit={i === 3 ? "seconds" : undefined}
            className={cn("tabular font-mono font-medium leading-none tracking-[-0.04em]", size === "lg" ? "text-[clamp(2.2rem,1rem+5cqi,5.25rem)]" : "text-[1.75rem]")}
          >
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

/** "Sat 21 Nov, 20:00" in the page locale, Istanbul time. */
export function DropDate({ withTime = true }: { withTime?: boolean }) {
  const { locale } = useDrop();
  const f = formatterOf(locale);
  const date = f.date(NEXT_DROP.opens, { weekday: "short", day: "numeric", month: "short" });
  return <>{withTime ? `${date} · ${f.time(NEXT_DROP.opens, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}` : date}</>;
}

/** Downloads an .ics file for the drop (works offline, no calendar account needed). */
export function CalendarLink() {
  const { t } = useDrop();
  const href = React.useMemo(() => {
    const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = new Date(Date.parse(NEXT_DROP.opens) + 30 * 60 * 1000).toISOString();
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nobet//Drops//EN",
      "BEGIN:VEVENT",
      "UID:drop-07@nobet.example.com",
      `DTSTAMP:${stamp("2026-11-11T09:00:00.000Z")}`,
      `DTSTART:${stamp(NEXT_DROP.opens)}`,
      `DTEND:${stamp(end)}`,
      `SUMMARY:Nöbet Drop 07 — ${t(NEXT_DROP.name)}`,
      "URL:https://nobet.example.com/?page=archive",
      "BEGIN:VALARM",
      "TRIGGER:-PT10M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Drop 07 opens in 10 minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  }, [t]);
  return (
    <Button asChild variant="ghost" className="uppercase tracking-[0.08em]">
      <a href={href} download="nobet-drop-07.ics">
        <CalendarPlus aria-hidden />
        {t({ en: "Add to calendar", tr: "Takvime ekle" })}
      </a>
    </Button>
  );
}

/** SMS / e-mail sign-up for the drop. Validates locally; this demo sends nothing. */
export function NotifyForm() {
  const { t } = useDrop();
  const id = "nb-notify";
  const [value, setValue] = React.useState("");
  const [state, setState] = React.useState<"idle" | "error" | "done">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || /^\+?[0-9 ]{10,16}$/.test(v);
    setState(ok ? "done" : "error");
  };

  if (state === "done") {
    return (
      <p role="status" className="border border-line p-3 text-small text-fg">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink">{t({ en: "You’re on the list", tr: "Listedesiniz" })}</span>
        <br />
        {t({ en: `We’ll message ${value.trim()} at 19:50 on the day. One message, no newsletter.`, tr: `Drop günü 19:50’de ${value.trim()} adresine yazacağız. Tek mesaj, bülten yok.` })}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
      <Label htmlFor={id} className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted">
        {t({ en: "Text or e-mail me 10 minutes before", tr: "10 dakika önce SMS ya da e-posta at" })}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="+90 5xx xxx xx xx / you@example.com"
          autoComplete="email"
          aria-invalid={state === "error" || undefined}
          aria-describedby={state === "error" ? `${id}-err` : undefined}
          className="min-w-0 flex-1"
        />
        <Button type="submit" variant="primary" className="shrink-0 uppercase tracking-[0.08em]">
          {t({ en: "Notify me", tr: "Haber ver" })}
        </Button>
      </div>
      {state === "error" ? (
        <p id={`${id}-err`} className="text-small text-danger">
          {t({ en: "Enter a mobile number or an e-mail address.", tr: "Bir cep telefonu ya da e-posta adresi girin." })}
        </p>
      ) : null}
    </form>
  );
}

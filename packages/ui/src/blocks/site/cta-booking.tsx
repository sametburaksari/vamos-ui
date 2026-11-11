"use client";

import * as React from "react";
import { cn } from "../../lib/cn";
import { formatMessage } from "../../lib/message-format";
import { formatTime } from "./shared/opening-hours";

export type BookingField = "date" | "time" | "guests" | "service";
export type BookingWeekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface CtaBookingStrings {
  date: string;
  time: string;
  guests: string;
  service: string;
  guestsCount: string;
  submit: string;
  opensWhatsApp: string;
  closedOn: string;
  message: string;
  messageService: string;
}

export interface CtaBookingProps {
  provider: "whatsapp" | "url";
  /** whatsapp: digits only (`902160000000`). url: the booking page that receives the fields as query params. */
  target: string;
  fields: BookingField[];
  services?: string[];
  /** Selectable times ("18:00"…). Default every 30 min from 12:00 to 22:00. */
  times?: string[];
  /** Largest party size. Default 8. */
  maxGuests?: number;
  /** Weekdays the business is closed (date picks on these are refused). */
  closedDays?: BookingWeekday[];
  /** IANA zone of the business (for "today"). */
  timeZone?: string;
  locale: string;
  strings: CtaBookingStrings;
  /** No-JS fallback text sent to WhatsApp. */
  fallbackMessage: string;
  className?: string;
}

const DAYS: BookingWeekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const defaultTimes = () => Array.from({ length: 21 }, (_, i) => `${String(12 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);

/** Today as `YYYY-MM-DD` in the business's time zone (never toISOString). */
export function todayIn(timeZone?: string, now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

const weekdayOf = (ymd: string): BookingWeekday => {
  const [y, m, d] = ymd.split("-").map(Number);
  return DAYS[new Date(Date.UTC(y!, m! - 1, d!)).getUTCDay()]!;
};

/**
 * Booking bar island of the CTA `booking` variant (~2 KB). Native date/select fields; on submit
 * it builds a prefilled WhatsApp message (Intl-formatted date and time) or sends the fields to a
 * booking URL. Without JS the form still posts to the same target.
 */
export function CtaBooking({ provider, target, fields, services, times, maxGuests = 8, closedDays, timeZone, locale, strings, fallbackMessage, className }: CtaBookingProps) {
  const uid = React.useId();
  const [min, setMin] = React.useState<string | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => setMin(todayIn(timeZone)), [timeZone]);
  const timeList = times ?? defaultTimes();
  const waUrl = `https://wa.me/${target.replace(/\D/g, "")}`;

  const dayName = (wd: BookingWeekday) => {
    // 2026-11-01 is a Sunday: offset into the week for a localized plural weekday name.
    const d = new Date(Date.UTC(2026, 10, 1 + DAYS.indexOf(wd)));
    return new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" }).format(d);
  };

  const check = (ymd: string) => {
    if (ymd && closedDays?.includes(weekdayOf(ymd))) {
      setError(formatMessage(strings.closedOn, { day: dayName(weekdayOf(ymd)) }, locale));
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);
    const date = String(data.get("date") ?? "");
    if (!check(date)) {
      e.preventDefault();
      return;
    }
    if (provider !== "whatsapp") return; // native GET to the booking URL
    e.preventDefault();
    const [y, m, d] = date ? date.split("-").map(Number) : [];
    const dateText = date ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y!, m! - 1, d!))) : "—";
    const time = String(data.get("time") ?? "");
    // Same clock as the time list and the opening hours (12- or 24-hour by locale).
    const timeText = time ? formatTime(time, locale) : "—";
    const guests = Number(data.get("guests") ?? 2);
    const service = String(data.get("service") ?? "");
    const text = formatMessage(service ? strings.messageService : strings.message, { date: dateText, time: timeText, service, guests: formatMessage(strings.guestsCount, { count: guests }, locale) }, locale);
    window.open(`${waUrl}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const cell = "vb-booking-cell flex min-w-0 flex-col gap-1 bg-scene px-4 py-2.5";
  const label = "font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-fg-subtle";
  const control = "vb-booking-control w-full min-w-0 bg-transparent text-body text-fg outline-none";
  const errId = `${uid}-err`;

  return (
    <form action={provider === "whatsapp" ? waUrl : target} method="get" target={provider === "whatsapp" ? "_blank" : undefined} onSubmit={onSubmit} className={cn("vb-booking flex flex-col gap-2", className)}>
      {provider === "whatsapp" ? <input type="hidden" name="text" value={fallbackMessage} /> : null}
      <div className="vb-booking-bar grid grid-cols-2 gap-px overflow-hidden rounded-ui border border-field-border bg-field-border @2xl:flex @2xl:items-stretch">
        {fields.includes("date") ? (
          <div className={cn(cell, "@2xl:flex-1")}>
            <label htmlFor={`${uid}-date`} className={label}>
              {strings.date}
            </label>
            <input
              id={`${uid}-date`}
              name="date"
              type="date"
              required
              min={min}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errId : undefined}
              onChange={(e) => check(e.currentTarget.value)}
              className={cn(control, "tabular")}
            />
          </div>
        ) : null}
        {fields.includes("time") ? (
          <div className={cn(cell, "@2xl:w-36")}>
            <label htmlFor={`${uid}-time`} className={label}>
              {strings.time}
            </label>
            <select id={`${uid}-time`} name="time" required defaultValue={timeList.includes("19:30") ? "19:30" : timeList[0]} className={cn(control, "tabular")}>
              {timeList.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t, locale)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {fields.includes("guests") ? (
          <div className={cn(cell, "@2xl:w-36")}>
            <label htmlFor={`${uid}-guests`} className={label}>
              {strings.guests}
            </label>
            <select id={`${uid}-guests`} name="guests" defaultValue="2" className={cn(control, "tabular")}>
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {formatMessage(strings.guestsCount, { count: n }, locale)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {fields.includes("service") && services?.length ? (
          <div className={cn(cell, "@2xl:flex-1")}>
            <label htmlFor={`${uid}-service`} className={label}>
              {strings.service}
            </label>
            <select id={`${uid}-service`} name="service" className={control}>
              {services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className="col-span-2 flex bg-scene p-1.5 @2xl:col-span-1">
          <button type="submit" className="vb-action-primary inline-flex h-full min-h-11 w-full items-center justify-center gap-2 rounded-[calc(var(--radius)-4px)] bg-accent px-5 text-[15px] font-semibold text-accent-fg transition-[filter] hover:brightness-[1.04] focus-ring">
            {strings.submit}
            {provider === "whatsapp" ? <span className="sr-only"> {strings.opensWhatsApp}</span> : null}
          </button>
        </div>
      </div>
      <p id={errId} role="alert" className={cn("text-small text-danger", !error && "sr-only")}>
        {error ?? ""}
      </p>
    </form>
  );
}

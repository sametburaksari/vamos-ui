"use client";

import * as React from "react";
import { DoorOpen, Users, X } from "lucide-react";
import { AvatarGroup, Avatar, Badge, Button, IconButton, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { NOW, TODAY, day } from "../../_shared/time";
import { durationOf, extraLabels, roomsById, statusLabels, statusTone, type BookingStatus, type RoomBooking } from "./agenda-data";

interface AgendaDayProps {
  date: string;
  bookings: RoomBooking[];
  fresh: string | null;
  onOpen: (b: RoomBooking) => void;
  onStatus: (b: RoomBooking, s: BookingStatus) => void;
}

export function useDuration() {
  const { c } = useBlockFormat();
  return (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h && m ? c(`${h} h ${m} min`, `${h} sa ${m} dk`) : h ? c(`${h} h`, `${h} sa`) : c(`${m} min`, `${m} dk`);
  };
}

/** One day: a sticky heading (day name, count, hours booked), then the bookings in time order with a now line. */
export function AgendaDay({ date, bookings, fresh, onOpen, onStatus }: AgendaDayProps) {
  const { c, f } = useBlockFormat();
  const duration = useDuration();
  const isToday = date === TODAY;
  const active = bookings.filter((b) => b.status !== "cancelled");
  const minutes = active.reduce((s, b) => s + durationOf(b), 0);
  const rel = isToday ? c("Today", "Bugün") : date === day(1) ? c("Tomorrow", "Yarın") : date === day(-1) ? c("Yesterday", "Dün") : null;
  const label = f.date(date, { weekday: "long", day: "numeric", month: "long" });
  const nowIndex = isToday ? bookings.findIndex((b) => b.start > NOW) : -1;
  const headingId = `agenda-${date}-title`;

  return (
    <section id={`agenda-${date}`} aria-labelledby={headingId} className="scroll-mt-16">
      <div className="sticky top-14 z-10 -mx-2 flex items-baseline gap-x-3 gap-y-0.5 bg-[color-mix(in_srgb,var(--scene)_86%,transparent)] px-2 py-2.5 backdrop-blur-xl max-sm:flex-wrap">
        <h2 id={headingId} tabIndex={-1} className="flex items-baseline gap-2 font-display text-[18px] leading-tight text-fg outline-none">
          {rel ? <span className={cn(isToday && "text-accent-ink")}>{rel}</span> : null}
          <span className={cn(rel ? "text-[14px] font-sans text-fg-muted" : "")}>{label}</span>
        </h2>
        <span className="tabular ms-auto text-[12px] text-fg-subtle">
          {active.length
            ? c(`${active.length} ${active.length === 1 ? "booking" : "bookings"} · ${duration(minutes)}`, `${active.length} rezervasyon · ${duration(minutes)}`)
            : bookings.length
              ? c("Cancelled only", "Yalnızca iptaller")
              : c("Nothing booked", "Rezervasyon yok")}
        </span>
      </div>

      {bookings.length ? (
        <ol className="surface mt-1 divide-y divide-line rounded-ui-lg">
          {bookings.map((b, i) => (
            <React.Fragment key={b.id}>
              {i === nowIndex ? <NowLine /> : null}
              <BookingRow booking={b} fresh={fresh === b.id} onOpen={onOpen} onStatus={onStatus} />
            </React.Fragment>
          ))}
          {isToday && nowIndex === -1 ? <NowLine /> : null}
        </ol>
      ) : (
        <p className="mt-1 rounded-ui-lg border border-dashed border-line px-4 py-3 text-[12.5px] text-fg-subtle">{c("Every room is free. The front desk is open 08:00–20:00.", "Tüm odalar boş. Resepsiyon 08:00–20:00 arası açık.")}</p>
      )}
    </section>
  );
}

function NowLine() {
  const { c } = useBlockFormat();
  return (
    <li aria-label={c(`Now, ${NOW.slice(11, 16)}`, `Şimdi, ${NOW.slice(11, 16)}`)} className="relative flex h-0 items-center border-0!">
      <span aria-hidden className="absolute inset-x-0 h-px bg-danger" />
      <span aria-hidden className="relative z-[1] ms-3 rounded-full border border-danger bg-(--surface-solid) px-1.5 py-px font-mono text-[10.5px] leading-tight text-danger">
        {NOW.slice(11, 16)}
      </span>
    </li>
  );
}

function BookingRow({ booking: b, fresh, onOpen, onStatus }: { booking: RoomBooking; fresh: boolean; onOpen: (b: RoomBooking) => void; onStatus: (b: RoomBooking, s: BookingStatus) => void }) {
  const { c, t } = useBlockFormat();
  const duration = useDuration();
  const room = roomsById[b.roomId]!;
  const past = b.end <= NOW;
  const live = b.start <= NOW && b.end > NOW;
  const cancelled = b.status === "cancelled";
  const isToday = b.start.slice(0, 10) === TODAY;
  // Check-in opens three hours ahead, for today's bookings that have not ended.
  const canCheckIn = isToday && !past && (b.status === "confirmed" || b.status === "tentative") && Date.parse(b.start) - Date.parse(NOW) <= 3 * 3_600_000;
  const title = t(b.title);

  return (
    <li
      data-fresh={fresh ? "" : undefined}
      className={cn("group relative grid grid-cols-[4.25rem_minmax(0,1fr)] gap-x-3 gap-y-2 px-3 py-3 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:px-4", (past || cancelled) && "text-fg-muted", fresh && "ui-fade bg-accent-soft/40")}
    >
      <span aria-hidden className={cn("absolute inset-y-2 start-0 w-[3px] rounded-e-full", room.tone, (past || cancelled) && "opacity-40")} />
      <div className="row-span-2 grid content-start leading-tight sm:row-span-1">
        <time dateTime={b.start} className={cn("tabular text-[14px] font-medium", past || cancelled ? "text-fg-muted" : "text-fg")}>
          {b.start.slice(11, 16)}
        </time>
        <span className="tabular text-[12px] text-fg-subtle">{b.end.slice(11, 16)}</span>
        <span className="mt-0.5 text-[11px] text-fg-subtle">{duration(durationOf(b))}</span>
      </div>

      <div className="grid min-w-0 gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <button
            type="button"
            onClick={() => onOpen(b)}
            className={cn("focus-ring min-w-0 truncate rounded-ui-sm text-start font-medium hover:underline", cancelled ? "text-fg-muted line-through" : "text-fg")}
          >
            {title}
          </button>
          {live ? (
            <Badge size="sm" tone="success" dot>
              {c("In progress", "Devam ediyor")}
            </Badge>
          ) : (
            <Badge size="sm" tone={statusTone[b.status]} dot={b.status !== "cancelled"}>
              {t(statusLabels[b.status])}
            </Badge>
          )}
        </div>
        <p className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5 text-[12.5px] text-fg-muted">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Avatar name={b.host} size="xs" />
            <span className="truncate">
              {b.host} · {b.company}
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            <DoorOpen aria-hidden className="size-3.5 text-fg-subtle" />
            {room.name}
          </span>
          <span className="inline-flex items-center gap-1" title={c(`${b.guests} of ${room.seats} seats`, `${room.seats} kişilik odada ${b.guests} kişi`)}>
            <Users aria-hidden className="size-3.5 text-fg-subtle" />
            <span className="tabular">
              {b.guests}/{room.seats}
            </span>
          </span>
        </p>
        {b.extras.length || b.visitors?.length ? (
          <div className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-fg-subtle">
            {b.extras.map((x) => (
              <span key={x} className="rounded-full border border-line px-2 py-px">
                {t(extraLabels[x])}
              </span>
            ))}
            {b.visitors?.length ? (
              <span className="inline-flex items-center gap-1.5">
                <AvatarGroup size="xs" max={3} aria-hidden>
                  {b.visitors.map((v) => (
                    <Avatar key={v} name={v} size="xs" />
                  ))}
                </AvatarGroup>
                {c(`${b.visitors.length} ${b.visitors.length === 1 ? "visitor" : "visitors"} at the desk`, `resepsiyonda ${b.visitors.length} ziyaretçi`)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {!cancelled && !past ? (
        <div className="col-start-2 flex items-center gap-1 sm:col-start-3">
          {canCheckIn ? (
            <Button size="sm" variant={live ? "primary" : "secondary"} onClick={() => onStatus(b, "checked-in")} aria-label={c(`Check in ${title}`, `${title} için giriş yap`)}>
              {c("Check in", "Giriş yap")}
            </Button>
          ) : b.status === "tentative" ? (
            <Button size="sm" variant="ghost" onClick={() => onStatus(b, "confirmed")} aria-label={c(`Confirm ${title}`, `${title} rezervasyonunu onayla`)}>
              {c("Confirm", "Onayla")}
            </Button>
          ) : null}
          {b.status !== "checked-in" ? (
            <IconButton size="sm" variant="ghost" label={c(`Cancel ${title}`, `${title} rezervasyonunu iptal et`)} onClick={() => onStatus(b, "cancelled")}>
              <X />
            </IconButton>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

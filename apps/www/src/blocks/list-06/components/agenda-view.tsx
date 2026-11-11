"use client";

import * as React from "react";
import { CalendarPlus, Search } from "lucide-react";
import { Button, Calendar, Card, EmptyState, Input, PageHeader, Progress, Select, ToggleGroup, ToggleGroupItem, cn, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { NOW, TODAY } from "../../_shared/time";
import { AgendaDay } from "./agenda-day";
import { BookingSheet } from "./booking-sheet";
import { NewBookingDialog } from "./new-booking-dialog";
import { OPEN_MINUTES, agendaDays, dayKeyOf, durationOf, initialBookings, rooms, roomsById, type BookingStatus, type RoomBooking } from "./agenda-data";

type Show = "all" | "upcoming" | "tentative" | "cancelled";

const TODAY_DATE = new Date(2026, 10, 18);

/** Room bookings as an agenda: one section per day with a sticky header, a now line, check-in and cancel with undo. */
export function AgendaView() {
  const { c, f } = useBlockFormat();
  const [bookings, setBookings] = React.useState<RoomBooking[]>(initialBookings);
  const [room, setRoom] = React.useState<string>("all");
  const [show, setShow] = React.useState<Show>("upcoming");
  const [q, setQ] = React.useState("");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [fresh, setFresh] = React.useState<string | null>(null);
  const [announce, setAnnounce] = React.useState("");

  const setStatus = React.useCallback(
    (b: RoomBooking, status: BookingStatus) => {
      const prev = b.status;
      setBookings((all) => all.map((x) => (x.id === b.id ? { ...x, status } : x)));
      const title = c(b.title.en, b.title.tr);
      const msg =
        status === "checked-in"
          ? c(`${b.host} checked in to ${roomsById[b.roomId]!.name}`, `${b.host}, ${roomsById[b.roomId]!.name} odasına giriş yaptı`)
          : status === "cancelled"
            ? c(`“${title}” cancelled, the room is free again`, `“${title}” iptal edildi, oda yeniden boş`)
            : c(`“${title}” confirmed`, `“${title}” onaylandı`);
      setAnnounce(msg);
      toast.success(msg, {
        action: { label: c("Undo", "Geri al"), onClick: () => setBookings((all) => all.map((x) => (x.id === b.id ? { ...x, status: prev } : x))) },
      });
    },
    [c],
  );

  const needle = q.trim().toLocaleLowerCase();
  const visible = bookings.filter((b) => {
    if (room !== "all" && b.roomId !== room) return false;
    if (show === "upcoming" && (b.status === "cancelled" || dayKeyOf(b.start) < TODAY)) return false;
    if (show === "tentative" && b.status !== "tentative") return false;
    if (show === "cancelled" && b.status !== "cancelled") return false;
    if (needle && ![b.title.en, b.title.tr, b.host, b.company, roomsById[b.roomId]!.name].join(" ").toLocaleLowerCase().includes(needle)) return false;
    return true;
  });
  const byDay = new Map<string, RoomBooking[]>();
  for (const b of [...visible].sort((x, y) => x.start.localeCompare(y.start))) {
    const k = dayKeyOf(b.start);
    byDay.set(k, [...(byDay.get(k) ?? []), b]);
  }
  // In the upcoming view the past (yesterday) is noise; keep every other day so empty weekends read as free.
  const days = agendaDays.filter((d) => (show === "upcoming" ? d >= TODAY : true)).filter((d) => byDay.has(d) || (!needle && room === "all" && show !== "cancelled" && show !== "tentative"));

  const today = bookings.filter((b) => dayKeyOf(b.start) === TODAY && b.status !== "cancelled");
  const live = today.filter((b) => b.start <= NOW && b.end > NOW);
  const nextUp = today.filter((b) => b.start > NOW)[0];
  const tentative = bookings.filter((b) => b.status === "tentative" && b.end >= NOW).length;

  const markers = Object.fromEntries(
    agendaDays.map((d) => [d, bookings.filter((b) => dayKeyOf(b.start) === d && b.status !== "cancelled")] as const).filter(([, l]) => l.length).map(([d, l]) => [d, { label: c(`${l.length} bookings`, `${l.length} rezervasyon`), count: l.length, tone: "accent" as const }]),
  );

  const jumpTo = (d: string | null) => {
    if (!d) return;
    const el = document.getElementById(`agenda-${d}`);
    if (!el) {
      toast(c("Nothing booked that day", "O gün rezervasyon yok"));
      return;
    }
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };

  const open = bookings.find((b) => b.id === openId) ?? null;

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <PageHeader
        eyebrow={c("Kestrel Works · Moda", "Kestrel Works · Moda")}
        title={c("Room bookings", "Oda rezervasyonları")}
        description={
          live.length
            ? c(
                `${live.map((b) => roomsById[b.roomId]!.name).join(", ")} in use right now.${nextUp ? ` Next: ${nextUp.title.en} at ${nextUp.start.slice(11, 16)}.` : ""}`,
                `Şu anda kullanımda: ${live.map((b) => roomsById[b.roomId]!.name).join(", ")}.${nextUp ? ` Sıradaki: ${nextUp.start.slice(11, 16)} ${nextUp.title.tr}.` : ""}`,
              )
            : nextUp
              ? c(`All rooms are free right now. Next: ${nextUp.title.en} in ${roomsById[nextUp.roomId]!.name} at ${nextUp.start.slice(11, 16)}.`, `Şu anda tüm odalar boş. Sıradaki: ${nextUp.start.slice(11, 16)}, ${roomsById[nextUp.roomId]!.name} odasında ${nextUp.title.tr}.`)
              : c("All rooms are free right now.", "Şu anda tüm odalar boş.")
        }
        actions={
          <Button variant="primary" onClick={() => setCreating(true)}>
            <CalendarPlus /> {c("New booking", "Yeni rezervasyon")}
          </Button>
        }
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section aria-labelledby="agenda-title" className="min-w-0">
          <h2 id="agenda-title" className="sr-only">
            {c("Agenda", "Ajanda")}
          </h2>
          <div className="flex flex-wrap items-center gap-2 pb-4">
            <Input
              type="search"
              size="sm"
              leading={<Search />}
              clearable
              onClear={() => setQ("")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label={c("Search bookings", "Rezervasyonlarda ara")}
              placeholder={c("Title, member or room…", "Başlık, üye ya da oda…")}
              className="w-full sm:w-56"
            />
            <div className="w-40">
            <Select
              size="sm"
              aria-label={c("Room", "Oda")}
              value={room}
              onValueChange={(v) => setRoom(v ?? "all")}
              items={[{ value: "all", label: c("All rooms", "Tüm odalar") }, ...rooms.map((r) => ({ value: r.id, label: r.name }))]}
            />
            </div>
            <div className="-mx-1 max-w-full overflow-x-auto px-1 py-0.5 sm:ms-auto">
              <ToggleGroup type="single" size="sm" value={show} onValueChange={(v) => setShow((v || "upcoming") as Show)} aria-label={c("Show", "Göster")}>
                <ToggleGroupItem value="upcoming">{c("Upcoming", "Yaklaşan")}</ToggleGroupItem>
                <ToggleGroupItem value="tentative" className="whitespace-nowrap">
                  {c("Tentative", "Ön rezervasyon")} <span className="tabular text-fg-subtle">{tentative}</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="cancelled">{c("Cancelled", "İptal")}</ToggleGroupItem>
                <ToggleGroupItem value="all">{c("All", "Tümü")}</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {days.length === 0 ? (
            <EmptyState
              kind="no-results"
              framed
              title={c("No bookings match", "Eşleşen rezervasyon yok")}
              description={c("Try another room or clear the search.", "Başka bir oda deneyin ya da aramayı temizleyin.")}
              actions={
                <Button
                  size="sm"
                  onClick={() => {
                    setQ("");
                    setRoom("all");
                    setShow("all");
                  }}
                >
                  {c("Show everything", "Hepsini göster")}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-6">
              {days.map((d) => (
                <AgendaDay key={d} date={d} bookings={byDay.get(d) ?? []} fresh={fresh} onOpen={(b) => setOpenId(b.id)} onStatus={setStatus} />
              ))}
            </div>
          )}
          <p role="status" aria-live="polite" className="sr-only">
            {announce}
          </p>
        </section>

        <aside aria-label={c("Overview", "Genel bakış")} className="grid content-start gap-4 max-lg:order-first max-lg:hidden">
          <Card className="p-3">
            <Calendar
              value={null}
              onValueChange={jumpTo}
              defaultMonth="2026-11"
              markers={markers}
              holidays={false}
              size="sm"
              gridProps={{ today: TODAY_DATE }}
              aria-label={c("Jump to a day", "Bir güne git")}
            />
          </Card>
          <Card className="grid gap-3.5 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-[13px] font-medium text-fg">{c("Rooms today", "Bugün odalar")}</h2>
              <span className="text-[11.5px] text-fg-subtle">08:00–20:00</span>
            </div>
            <ul className="grid gap-3">
              {rooms.map((r) => {
                const mins = today.filter((b) => b.roomId === r.id).reduce((s, b) => s + durationOf(b), 0);
                const busy = live.some((b) => b.roomId === r.id);
                return (
                  <li key={r.id} className="grid gap-1.5">
                    <div className="flex items-center justify-between gap-2 text-[12.5px]">
                      <span className="flex min-w-0 items-center gap-2">
                        <span aria-hidden className={cn("size-2 shrink-0 rounded-full", r.tone)} />
                        <span className="truncate text-fg">{r.name}</span>
                        {busy ? <span className="text-[11px] text-success">{c("in use", "dolu")}</span> : null}
                      </span>
                      <span className="tabular text-fg-subtle">{c(`${(mins / 60).toLocaleString("en", { maximumFractionDigits: 1 })} h`, `${(mins / 60).toLocaleString("tr", { maximumFractionDigits: 1 })} sa`)}</span>
                    </div>
                    <Progress size="xs" value={Math.min(100, Math.round((mins / OPEN_MINUTES) * 100))} aria-label={c(`${r.name} booked today`, `${r.name} bugünkü doluluk`)} />
                  </li>
                );
              })}
            </ul>
          </Card>
        </aside>
      </div>

      <BookingSheet booking={open} onOpenChange={(o) => !o && setOpenId(null)} onStatus={setStatus} />
      <NewBookingDialog
        open={creating}
        onOpenChange={setCreating}
        bookings={bookings}
        onCreate={(b) => {
          setBookings((all) => [...all, b]);
          setShow("upcoming");
          setRoom("all");
          setQ("");
          setFresh(b.id);
          toast.success(c(`Booked ${roomsById[b.roomId]!.name}`, `${roomsById[b.roomId]!.name} rezerve edildi`), { description: `${f.date(b.start, { weekday: "long", day: "numeric", month: "long" })} · ${b.start.slice(11, 16)}–${b.end.slice(11, 16)}` });
          window.setTimeout(() => jumpTo(dayKeyOf(b.start)), 80);
        }}
      />
    </div>
  );
}

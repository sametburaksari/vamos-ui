"use client";

import { Badge, Button, DescriptionList, Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { NOW } from "../../_shared/time";
import { useDuration } from "./agenda-day";
import { durationOf, extraLabels, roomsById, statusLabels, statusTone, type BookingStatus, type RoomBooking } from "./agenda-data";

/** A booking's details in a side sheet, with the same check-in / confirm / cancel actions as the row. */
export function BookingSheet({ booking: b, onOpenChange, onStatus }: { booking: RoomBooking | null; onOpenChange: (open: boolean) => void; onStatus: (b: RoomBooking, s: BookingStatus) => void }) {
  const { c, t, f } = useBlockFormat();
  const duration = useDuration();
  const room = b ? roomsById[b.roomId]! : null;
  const open = b && b.end > NOW && b.status !== "cancelled";
  return (
    <Sheet open={Boolean(b)} onOpenChange={onOpenChange}>
      <SheetContent side="end" size="md">
        {b && room ? (
          <>
            <SheetHeader
              title={t(b.title)}
              description={`${f.date(b.start, { weekday: "long", day: "numeric", month: "long" })} · ${b.start.slice(11, 16)}–${b.end.slice(11, 16)}`}
              action={<Badge tone={statusTone[b.status]}>{t(statusLabels[b.status])}</Badge>}
            />
            <SheetBody className="grid content-start gap-6">
              <DescriptionList
                items={[
                  { key: "room", label: c("Room", "Oda"), value: `${room.name} · ${t(room.floor)}` },
                  { key: "host", label: c("Booked by", "Rezervasyonu yapan"), value: `${b.host}, ${b.company}` },
                  { key: "len", label: c("Length", "Süre"), value: duration(durationOf(b)) },
                  { key: "guests", label: c("People", "Kişi"), value: c(`${b.guests} of ${room.seats} seats`, `${room.seats} koltuktan ${b.guests}`) },
                  { key: "cost", label: c("Credits", "Kredi"), value: c(`${(durationOf(b) / 60) * room.rate} credits (${room.rate}/hour)`, `${(durationOf(b) / 60) * room.rate} kredi (saatlik ${room.rate})`) },
                  { key: "extras", label: c("Extras", "Ekstralar"), value: b.extras.length ? b.extras.map((x) => t(extraLabels[x])).join(", ") : c("None", "Yok") },
                  { key: "desk", label: c("Front desk", "Resepsiyon"), value: b.visitors?.length ? b.visitors.join(", ") : c("No visitors registered", "Kayıtlı ziyaretçi yok"), span: "full" },
                  { key: "phone", label: c("Desk phone", "Resepsiyon telefonu"), value: "+90 216 000 00 00", copyable: true },
                ]}
              />
              <p className="rounded-ui border border-line bg-surface-2 px-3.5 py-3 text-[12.5px] text-fg-muted">
                {c("Free cancellation up to 2 hours before the start. Later cancellations still use the credits.", "Başlangıçtan 2 saat öncesine kadar iptal ücretsizdir. Daha geç iptallerde kredi düşülür.")}
              </p>
            </SheetBody>
            {open ? (
              <SheetFooter>
                <Button variant="danger-ghost" onClick={() => onStatus(b, "cancelled")}>
                  {c("Cancel booking", "Rezervasyonu iptal et")}
                </Button>
                {b.status === "tentative" ? (
                  <Button onClick={() => onStatus(b, "confirmed")}>{c("Confirm", "Onayla")}</Button>
                ) : null}
                {b.status !== "checked-in" ? (
                  <Button variant="primary" onClick={() => onStatus(b, "checked-in")}>
                    {c("Check in", "Giriş yap")}
                  </Button>
                ) : null}
              </SheetFooter>
            ) : null}
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

"use client";

import * as React from "react";
import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, Field, Input, RadioGroup, Select } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { TODAY, day } from "../../_shared/time";
import { rooms, roomsById, type RoomBooking } from "./agenda-data";

const times = Array.from({ length: 23 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, "0")}:${i % 2 ? "30" : "00"}`);
const lengths = [30, 60, 90, 120];

const toTime = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const toMins = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

interface NewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: RoomBooking[];
  onCreate: (b: RoomBooking) => void;
}

/** Book a room: title, room, day, start and length. Refuses a slot that overlaps another booking. */
export function NewBookingDialog({ open, onOpenChange, bookings, onCreate }: NewBookingDialogProps) {
  const { c, f } = useBlockFormat();
  const [title, setTitle] = React.useState("");
  const [roomId, setRoomId] = React.useState("rm-s3");
  const [date, setDate] = React.useState(day(1));
  const [start, setStart] = React.useState("10:00");
  const [length, setLength] = React.useState("60");
  const [tried, setTried] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setTried(false);
    }
  }, [open]);

  const endMins = Math.min(20 * 60, toMins(start) + Number(length));
  const s = `${date}T${start}:00+03:00`;
  const e = `${date}T${toTime(endMins)}:00+03:00`;
  const clash = bookings.find((b) => b.roomId === roomId && b.status !== "cancelled" && b.start < e && b.end > s);
  const days = Array.from({ length: 8 }, (_, i) => day(i));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader title={c("New booking", "Yeni rezervasyon")} description={c("Booked for Defne Kaya. Members get a calendar invite.", "Defne Kaya adına. Üyelere takvim daveti gider.")} />
        <form
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            setTried(true);
            if (!title.trim() || clash) return;
            onCreate({ id: `b-new-${bookings.length + 1}`, start: s, end: e, title: { en: title.trim(), tr: title.trim() }, host: "Defne Kaya", company: "Kestrel Works", roomId, guests: 2, status: "confirmed", extras: [] });
            onOpenChange(false);
          }}
        >
          <DialogBody className="grid gap-4">
            <Field label={c("What is it for", "Ne için")} required error={tried && !title.trim() ? c("Give the booking a title.", "Rezervasyona bir başlık verin.") : undefined}>
              <Input value={title} onChange={(ev) => setTitle(ev.target.value)} placeholder={c("Client workshop", "Müşteri atölyesi")} data-autofocus />
            </Field>
            <Field label={c("Room", "Oda")}>
              <Select value={roomId} onValueChange={(v) => v && setRoomId(v)} items={rooms.map((r) => ({ value: r.id, label: c(`${r.name} · ${r.seats} seats`, `${r.name} · ${r.seats} kişilik`) }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={c("Day", "Gün")}>
                <Select value={date} onValueChange={(v) => v && setDate(v)} items={days.map((d) => ({ value: d, label: d === TODAY ? c("Today", "Bugün") : f.date(d, { weekday: "short", day: "numeric", month: "short" }) }))} />
              </Field>
              <Field label={c("Starts", "Başlangıç")}>
                <Select value={start} onValueChange={(v) => v && setStart(v)} items={times.map((x) => ({ value: x, label: x }))} />
              </Field>
            </div>
            <Field
              label={c("Length", "Süre")}
              error={clash ? c(`${roomsById[roomId]!.name} is booked ${clash.start.slice(11, 16)}–${clash.end.slice(11, 16)}. Pick another time or room.`, `${roomsById[roomId]!.name} ${clash.start.slice(11, 16)}–${clash.end.slice(11, 16)} arası dolu. Başka bir saat ya da oda seçin.`) : undefined}
            >
              <RadioGroup variant="segmented" size="sm" value={length} onValueChange={(v) => setLength(v)} items={lengths.map((l) => ({ value: String(l), label: l < 60 ? c(`${l} min`, `${l} dk`) : c(`${l / 60} h`, `${l / 60} sa`) }))} />
            </Field>
          </DialogBody>
          <DialogFooter>
            <Button type="button" onClick={() => onOpenChange(false)}>
              {c("Cancel", "Vazgeç")}
            </Button>
            <Button type="submit" variant="primary">
              {c("Book room", "Odayı ayır")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

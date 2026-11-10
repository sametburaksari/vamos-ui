"use client";

import * as React from "react";
import { Button, Calendar, CalendarSlots, addIsoDays, todayIso, type CalendarMarker, type CalendarSlot } from "@vamos-ui/react";

// Spa appointment booking: pick a day, then a time.
function slotsFor(day: string): CalendarSlot[] {
  const seed = Number(day.slice(8, 10));
  return ["10:00", "11:00", "12:30", "14:00", "15:00", "16:30", "17:30", "18:30", "19:30"].map((start, i) => ({
    start,
    available: (seed + i * 3) % 4 !== 0,
    label: (seed + i) % 5 === 0 ? "1 left" : undefined,
  }));
}

export default function CalendarBooking() {
  const today = todayIso();
  const [day, setDay] = React.useState<string | null>(addIsoDays(today, 2));
  const [time, setTime] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const markers = React.useMemo(() => {
    const out: Record<string, CalendarMarker> = {};
    for (let i = 0; i < 35; i++) {
      const d = addIsoDays(today, i);
      const left = slotsFor(d).filter((s) => s.available).length;
      out[d] = { label: `${left} slots left`, tone: left <= 5 ? "warning" : "success" };
    }
    return out;
  }, [today]);

  return (
    <div className="surface grid w-full max-w-3xl gap-6 rounded-ui-lg p-5 md:grid-cols-[auto_1fr]">
      <Calendar
        value={day}
        onValueChange={(d) => {
          setDay(d);
          setTime(null);
          setLoading(true);
          window.setTimeout(() => setLoading(false), 450);
        }}
        min={today}
        max={addIsoDays(today, 34)}
        disabledDays={[{ dayOfWeek: [1] }]}
        markers={markers}
        required
        legend={[
          { label: "Plenty of times", tone: "success" },
          { label: "Filling up", tone: "warning" },
        ]}
      />
      <div className="grid content-start gap-4">
        <CalendarSlots day={day} slots={day ? slotsFor(day) : []} loading={loading} value={time} onValueChange={setTime} />
        <Button variant="primary" disabled={!time} className="justify-self-start">
          Book 60-min deep tissue massage
        </Button>
        <p className="text-xs text-fg-subtle">Closed on Mondays. Free cancellation up to 24 hours before.</p>
      </div>
    </div>
  );
}

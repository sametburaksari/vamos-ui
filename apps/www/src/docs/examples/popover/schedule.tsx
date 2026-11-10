"use client";

import * as React from "react";
import { CalendarClock } from "lucide-react";
import { Badge, Button, Field, Input, Popover, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from "@vamos-ui/react";

export default function PopoverSchedule() {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState("2026-11-18");
  const [time, setTime] = React.useState("09:30");
  const [scheduled, setScheduled] = React.useState<string | null>(null);
  const label = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(`${date}T${time}`),
  );
  return (
    <div className="flex items-center gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button>
            <CalendarClock /> {scheduled ? "Reschedule" : "Schedule"}
          </Button>
        </PopoverTrigger>
        <PopoverContent size="md" align="start" arrow>
          <PopoverHeader title="Schedule post" description="Publishes automatically in Europe/Istanbul time." />
          <div className="grid grid-cols-[1fr_6.5rem] gap-2">
            <Field label="Date">
              <Input type="date" size="sm" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Time">
              <Input type="time" size="sm" value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </div>
          <PopoverFooter>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setScheduled(label);
                setOpen(false);
              }}
            >
              Schedule
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      {scheduled ? (
        <Badge tone="info" dot>
          {scheduled}
        </Badge>
      ) : null}
    </div>
  );
}

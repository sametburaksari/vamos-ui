"use client";

import * as React from "react";
import { LocaleProvider, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";
import { Scheduler, type SchedulerEvent } from "@vamos-ui/react/scheduler";
import { trWorkCalendar } from "@vamos-ui/react/locale-data";

const at = (day: string, time: string) => new Date(`${day}T${time}:00+03:00`).toISOString();

const events: SchedulerEvent[] = [
  { id: "1", title: "Facial · Elif Kaya", start: at("2026-10-27", "10:00"), end: at("2026-10-27", "11:00"), tone: "chart-3" },
  { id: "2", title: "Massage · Jonas Weber", start: at("2026-10-28", "11:30"), end: at("2026-10-28", "12:30"), tone: "chart-2" },
  { id: "3", title: "Hammam package", start: at("2026-10-30", "14:00"), end: at("2026-10-30", "16:00"), tone: "chart-4" },
];

export default function SchedulerBusinessHours() {
  const [locale, setLocale] = React.useState("tr-TR");
  return (
    <div className="grid w-full gap-3">
      <ToggleGroup size="sm" aria-label="Locale" value={locale} onValueChange={(v) => v && setLocale(v)}>
        <ToggleGroupItem value="en-US">en-US</ToggleGroupItem>
        <ToggleGroupItem value="tr-TR">tr-TR</ToggleGroupItem>
      </ToggleGroup>
      <LocaleProvider locale={locale}>
        {/* 28 Oct is a half day from 13:00, 29 Oct (Republic Day) is off. Moves outside 09:00–18:00 are refused. */}
        <Scheduler
          events={events}
          defaultDate="2026-10-28"
          defaultView="workweek"
          views={["day", "workweek", "week"]}
          timeZone="Europe/Istanbul"
          workCalendar={locale === "tr-TR" ? trWorkCalendar : { workDays: [1, 2, 3, 4, 5], businessHours: [{ start: "09:00", end: "18:00" }] }}
          restrictToBusinessHours
          dayRange={{ start: "07:00", end: "21:00" }}
          height="26rem"
          onEventChange={() => {}}
        />
      </LocaleProvider>
    </div>
  );
}

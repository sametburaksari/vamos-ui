"use client";

import { Calendar, LocaleProvider } from "@vamos-cms/ui";

export default function CalendarWeekNumbers() {
  return (
    <div className="grid w-full max-w-2xl gap-6 sm:grid-cols-2">
      <div className="grid gap-2">
        <p className="text-xs font-medium text-fg-subtle">en-US · weeks start Sunday</p>
        <Calendar mode="none" defaultMonth="2026-11" showWeekNumbers holidays={false} />
      </div>
      <LocaleProvider locale="en-GB">
        <div className="grid gap-2">
          <p className="text-xs font-medium text-fg-subtle">en-GB · ISO weeks, Monday start</p>
          <Calendar mode="none" defaultMonth="2026-11" showWeekNumbers holidays={false} />
        </div>
      </LocaleProvider>
    </div>
  );
}

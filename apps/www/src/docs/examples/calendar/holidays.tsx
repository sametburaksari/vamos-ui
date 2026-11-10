"use client";

import * as React from "react";
import { Calendar, LocaleProvider, ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";

export default function CalendarHolidays() {
  const [locale, setLocale] = React.useState("tr-TR");
  return (
    <div className="grid w-full max-w-sm gap-3">
      <ToggleGroup type="single" size="sm" value={locale} onValueChange={(v) => v && setLocale(v)} aria-label="Locale">
        <ToggleGroupItem value="en-US">en-US</ToggleGroupItem>
        <ToggleGroupItem value="tr-TR">tr-TR</ToggleGroupItem>
      </ToggleGroup>
      <LocaleProvider locale={locale}>
        {/* tr: Monday week start, Republic Day Eve (half day from 13:00) and Republic Day */}
        <Calendar mode="none" defaultMonth="2026-10" legend />
      </LocaleProvider>
    </div>
  );
}

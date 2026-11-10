"use client";

import * as React from "react";
import { Input, LocaleProvider, ToggleGroup, ToggleGroupItem, useLocale } from "@vamos-ui/react";
import { formatDuration, parseDuration } from "@vamos-ui/react/scheduler";

const samples = ["1.5", "1,5", "1:30", "90m", "1h 30m", "1 sa 30 dk", "2 hours", "45"];

function Playground() {
  const { locale } = useLocale();
  const [text, setText] = React.useState("1h 30m");
  const parsed = parseDuration(text, locale);
  return (
    <div className="grid gap-3">
      <label className="grid gap-1">
        <span className="text-[12px] font-medium text-fg-muted">Try a duration</span>
        <Input value={text} onChange={(e) => setText(e.target.value)} invalid={parsed === null} className="max-w-xs" />
      </label>
      <p className="text-[13px] tabular text-fg" aria-live="polite">
        {parsed === null ? "Can't read that" : `${parsed} min · ${formatDuration(parsed, locale)} · ${formatDuration(parsed, locale, "clock")} · ${formatDuration(parsed, locale, "decimal")} h`}
      </p>
      <table className="w-full max-w-md text-[13px]">
        <tbody className="tabular">
          {samples.map((s) => {
            const m = parseDuration(s, locale);
            return (
              <tr key={s} className="border-b border-line">
                <td className="py-1.5 font-mono text-fg">{s}</td>
                <td className="py-1.5 text-end text-fg-muted">{m === null ? "–" : formatDuration(m, locale)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TimeTrackerParseDuration() {
  const [locale, setLocale] = React.useState("en-US");
  return (
    <div className="grid w-full gap-3">
      <ToggleGroup size="sm" aria-label="Locale" value={locale} onValueChange={(v) => v && setLocale(v)}>
        <ToggleGroupItem value="en-US">en-US</ToggleGroupItem>
        <ToggleGroupItem value="tr-TR">tr-TR</ToggleGroupItem>
      </ToggleGroup>
      <LocaleProvider locale={locale}>
        <Playground />
      </LocaleProvider>
    </div>
  );
}

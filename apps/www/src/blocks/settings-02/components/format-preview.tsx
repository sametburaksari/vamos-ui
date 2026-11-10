"use client";

import { DescriptionItem, DescriptionList, LocaleProvider, useFormat } from "@vamos-ui/react";
import { SAMPLE_INSTANT, type PreferencesForm } from "./data";

function Samples({ hourCycle }: { hourCycle: PreferencesForm["hourCycle"] }) {
  const f = useFormat();
  const hc = hourCycle === "auto" ? {} : { hourCycle };
  return (
    <DescriptionList layout="grid" columns={2} className="tabular">
      <DescriptionItem label="Date">{f.date(SAMPLE_INSTANT, "long")}</DescriptionItem>
      <DescriptionItem label="Short date">{f.date(SAMPLE_INSTANT, "short")}</DescriptionItem>
      <DescriptionItem label="Time">{f.time(SAMPLE_INSTANT, { hour: "numeric", minute: "2-digit", ...hc })}</DescriptionItem>
      <DescriptionItem label="Relative">{f.relative(-2, "day")}</DescriptionItem>
      <DescriptionItem label="Number">{f.number(1284093.5)}</DescriptionItem>
      <DescriptionItem label="Money">{f.currency("48250.00")}</DescriptionItem>
      <DescriptionItem label="Percent">{f.percent(0.124, { maximumFractionDigits: 1 })}</DescriptionItem>
      <DescriptionItem label="File size">{f.bytes(5_240_000)}</DescriptionItem>
    </DescriptionList>
  );
}

/** Live sample of how numbers, money and dates read with the chosen locale, currency and time zone. */
export function FormatPreview({ form }: { form: PreferencesForm }) {
  return (
    <div className="rounded-ui border border-line bg-surface-2 p-4" aria-live="polite">
      <LocaleProvider locale={form.locale} currency={form.currency} timeZone={form.timeZone} dir="ltr">
        <Samples hourCycle={form.hourCycle} />
      </LocaleProvider>
    </div>
  );
}

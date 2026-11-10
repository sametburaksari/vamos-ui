import { LocaleProvider, Stat, StatGroup } from "@vamos-ui/react";
import { tr } from "@vamos-ui/react/locale/tr";

function Row() {
  return (
    <StatGroup columns={3}>
      <Stat label="Revenue · Gelir" value={1240000} format="compact-currency" delta={0.124} />
      <Stat label="Avg. visit · Ort. ziyaret" value={167} format="duration" delta={-0.041} />
      <Stat label="Orders · Sipariş" value={28412} delta={0.031} />
    </StatGroup>
  );
}

export default function StatLocale() {
  return (
    <div className="grid w-full gap-4">
      <LocaleProvider locale="en-US" currency="USD">
        <Row />
      </LocaleProvider>
      <LocaleProvider locale="tr-TR" messages={tr} currency="TRY" timeZone="Europe/Istanbul">
        <Row />
      </LocaleProvider>
    </div>
  );
}

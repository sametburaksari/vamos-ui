"use client";

import * as React from "react";
import { Card, CardBody, CardHeader, RadioGroup, Switch, TimePicker, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import type { DeliveryRules as Rules } from "./notify-data";

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Quiet hours drawn on a 24-hour rail (wrapping past midnight), urgent pass-through and email digest. */
export function DeliveryRules({ rules, set }: { rules: Rules; set: (patch: Partial<Rules>) => void }) {
  const { c } = useBlockFormat();
  const from = toMin(rules.quietFrom);
  const to = toMin(rules.quietTo);
  // One or two shaded spans: 22:00 → 07:30 wraps, so it is [22:00, 24:00] + [0:00, 07:30].
  const spans = from <= to ? [[from, to]] : [[from, 1440], [0, to]];
  const nowMin = 10 * 60 + 24;
  const hours = (from <= to ? to - from : 1440 - from + to) / 60;

  return (
    <Card className="min-w-0">
      <CardHeader titleAs="h2" title={c("Delivery rules", "Gönderim kuralları")} description={c("Apply to push and SMS. In-app always collects everything quietly.", "Anlık bildirim ve SMS için geçerli. Uygulama içi her şeyi sessizce toplar.")} />
      <CardBody className="grid gap-6 pt-0">
        <div className="grid gap-3">
          <div className="flex items-start justify-between gap-4">
            <span>
              <span id="quiet-label" className="block text-[13px] font-medium text-fg">
                {c("Quiet hours", "Sessiz saatler")}
              </span>
              <span className="block text-xs text-fg-muted">
                {rules.quiet ? c(`${hours.toFixed(1).replace(".0", "")} hours a night, in your time zone (Istanbul)`, `Gecede ${hours.toFixed(1).replace(".0", "")} saat, kendi saat diliminizde (İstanbul)`) : c("Off — push and SMS arrive at any hour", "Kapalı — anlık bildirim ve SMS her saatte gelir")}
              </span>
            </span>
            <Switch aria-labelledby="quiet-label" checked={rules.quiet} onCheckedChange={(v) => set({ quiet: v })} />
          </div>
          <div className={cn("grid gap-3 transition-opacity", !rules.quiet && "pointer-events-none opacity-45")} aria-disabled={!rules.quiet || undefined}>
            <div className="relative h-8 rounded-ui-sm bg-track" aria-hidden>
              {spans.map(([a, b]) => (
                <span key={a} className="absolute inset-y-0 bg-fg-muted/35" style={{ insetInlineStart: `${(a! / 1440) * 100}%`, width: `${((b! - a!) / 1440) * 100}%` }} />
              ))}
              {[0, 6, 12, 18].map((h) => (
                <span key={h} className="absolute inset-y-0 border-s border-line" style={{ insetInlineStart: `${(h / 24) * 100}%` }}>
                  <span className="absolute top-full mt-1 -translate-x-1/2 font-mono text-[10.5px] text-fg-subtle rtl:translate-x-1/2">{String(h).padStart(2, "0")}</span>
                </span>
              ))}
              <span className="absolute -inset-y-1 w-0.5 rounded-full bg-accent-ink" style={{ insetInlineStart: `${(nowMin / 1440) * 100}%` }} title={c("Now", "Şimdi")} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="grid gap-1 text-xs text-fg-muted">
                {c("From", "Başlangıç")}
                <TimePicker hourCycle={24} value={rules.quietFrom} onValueChange={(v) => v && set({ quietFrom: v })} size="sm" disabled={!rules.quiet} aria-label={c("Quiet hours start", "Sessiz saat başlangıcı")} />
              </label>
              <label className="grid gap-1 text-xs text-fg-muted">
                {c("Until", "Bitiş")}
                <TimePicker hourCycle={24} value={rules.quietTo} onValueChange={(v) => v && set({ quietTo: v })} size="sm" disabled={!rules.quiet} aria-label={c("Quiet hours end", "Sessiz saat bitişi")} />
              </label>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-line pt-3">
              <span>
                <span id="urgent-label" className="block text-[13px] text-fg">
                  {c("Let urgent alerts through", "Acil uyarılar geçsin")}
                </span>
                <span className="block text-xs text-fg-muted">{c("SLA breaches and new-device sign-ins.", "SLA ihlalleri ve yeni cihaz girişleri.")}</span>
              </span>
              <Switch aria-labelledby="urgent-label" checked={rules.urgentThrough} disabled={!rules.quiet} onCheckedChange={(v) => set({ urgentThrough: v })} />
            </div>
          </div>
        </div>

        <div className="grid gap-2 border-t border-line pt-5">
          <span id="digest-label" className="text-[13px] font-medium text-fg">
            {c("Email", "E-posta")}
          </span>
          <RadioGroup
            aria-labelledby="digest-label"
            variant="segmented"
            size="sm"
            value={rules.digest}
            onValueChange={(v) => set({ digest: v as Rules["digest"] })}
            items={[
              { value: "instant", label: c("Each event", "Her olayda") },
              { value: "hourly", label: c("Hourly", "Saatlik") },
              { value: "daily", label: c("Daily 08:00", "Günlük 08:00") },
            ]}
          />
          <span className="text-xs text-fg-muted">
            {rules.digest === "instant" ? c("One email per event.", "Her olay için bir e-posta.") : c("Events are bundled into one summary. Security emails still go out at once.", "Olaylar tek bir özette toplanır. Güvenlik e-postaları yine hemen gider.")}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

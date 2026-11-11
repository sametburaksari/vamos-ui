"use client";

import * as React from "react";
import { Moon } from "lucide-react";
import { Card, CardBody, CardHeader } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { me } from "../../_shared/people";
import { channelIcon } from "./channel-matrix";
import { destinations, events, notifyChannels, urgentEvents, type DeliveryRules, type NotifyChannel } from "./notify-data";

/** How the selected event reaches you on each channel it is switched on for. */
export function MessagePreview({ eventKey, channels, rules, paused }: { eventKey: string; channels: NotifyChannel[]; rules: DeliveryRules; paused: boolean }) {
  const { c, t } = useBlockFormat();
  const e = events.find((x) => x.key === eventKey)!;
  const title = t(e.sample.title);
  const body = t(e.sample.body);
  const held = rules.quiet && !(rules.urgentThrough && urgentEvents.includes(e.key));
  const quietText = `${rules.quietFrom}–${rules.quietTo}`;
  const sms = `Kiln & Linen: ${title}. ${body}`;
  const segments = Math.ceil(sms.length / (/[^\x00-\x7F]/.test(sms) ? 70 : 160));
  const ordered = notifyChannels.map((ch) => ch.key).filter((k) => channels.includes(k));

  return (
    <Card className="min-w-0">
      <CardHeader titleAs="h2" eyebrow={c("Preview", "Önizleme")} title={t(e.label)} description={t(e.hint)} />
      <CardBody className="grid gap-4 pt-0" aria-live="polite">
        {paused ? <p className="text-[13px] text-fg-muted">{c("Notifications are paused. Nothing is sent until you resume.", "Bildirimler duraklatıldı. Devam edene kadar hiçbir şey gönderilmez.")}</p> : null}
        {ordered.length === 0 ? (
          <p className="rounded-ui border border-dashed border-line px-4 py-6 text-center text-[13px] text-fg-muted">
            {c("Switched off everywhere. You won't hear about this event.", "Her yerde kapalı. Bu olaydan haberiniz olmaz.")}
          </p>
        ) : null}
        {ordered.map((ch) => {
          const Icon = channelIcon[ch];
          const label = t(notifyChannels.find((x) => x.key === ch)!.label);
          const quiet = held && (ch === "push" || ch === "sms");
          return (
            <section key={ch} className="min-w-0">
              <h3 className="mb-1.5 flex items-center gap-1.5 text-xs text-fg-muted">
                <Icon aria-hidden className="size-3.5" /> {label}
                <span className="text-fg-subtle">· {ch === "email" ? me.email : t(destinations[ch].to)}</span>
              </h3>
              {ch === "push" ? (
                <div className="flex gap-3 rounded-[14px] border border-line surface-2 p-3 shadow-sm">
                  <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-fg font-display text-[13px] text-scene">
                    KL
                  </span>
                  <span className="min-w-0">
                    <span className="flex justify-between gap-2 text-[11px] text-fg-subtle">
                      <span>Kiln & Linen</span>
                      <span>{c("now", "şimdi")}</span>
                    </span>
                    <span className="block text-[13px] font-semibold text-fg">{title}</span>
                    <span className="line-clamp-2 block text-[12.5px] text-fg-muted">{body}</span>
                  </span>
                </div>
              ) : ch === "email" ? (
                <div className="overflow-hidden rounded-ui border border-line">
                  <div className="grid gap-0.5 border-b border-line surface-2 px-3 py-2 text-[12px]">
                    <span className="truncate text-fg-muted">
                      {c("From", "Kimden")} <span className="text-fg">Kiln & Linen</span> &lt;notify@kilnlinen.example.com&gt;
                    </span>
                    <span className="truncate font-medium text-fg">{rules.digest === "instant" ? title : rules.digest === "hourly" ? c("Your hourly summary · 4 updates", "Saatlik özetiniz · 4 güncelleme") : c("Your daily summary · 17 updates", "Günlük özetiniz · 17 güncelleme")}</span>
                  </div>
                  <p className="px-3 py-2.5 text-[12.5px] text-pretty text-fg-muted">{rules.digest === "instant" ? body : c(`Includes “${title}” and other updates.`, `“${title}” ve diğer güncellemeleri içerir.`)}</p>
                </div>
              ) : ch === "sms" ? (
                <div>
                  <p className="w-fit max-w-[92%] rounded-[16px] rounded-es-[4px] bg-selected px-3 py-2 text-[12.5px] text-fg">{sms}</p>
                  <p className="mt-1 font-mono text-[11px] text-fg-subtle tabular">
                    {c(`${sms.length} characters · ${segments} ${segments === 1 ? "message" : "messages"}`, `${sms.length} karakter · ${segments} mesaj`)}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 rounded-ui border border-line px-3 py-2.5">
                  <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-accent-ink" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-medium text-fg">{title}</span>
                    <span className="block text-[12px] text-fg-muted">{body}</span>
                  </span>
                </div>
              )}
              {quiet ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-fg-subtle">
                  <Moon aria-hidden className="size-3" /> {c(`Held during quiet hours (${quietText})`, `Sessiz saatlerde bekletilir (${quietText})`)}
                </p>
              ) : null}
            </section>
          );
        })}
      </CardBody>
    </Card>
  );
}

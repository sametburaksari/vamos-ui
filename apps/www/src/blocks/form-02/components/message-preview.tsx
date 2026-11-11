"use client";

import * as React from "react";
import { Monitor, Smartphone } from "lucide-react";
import { ToggleGroup, ToggleGroupItem, cn } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { fillTags, senders, type CampaignDraft } from "./data";

/**
 * What a recipient sees, with merge tags filled from a sample customer. Email can be checked at
 * desktop or phone width; SMS and push show as they land on a lock screen.
 */
export function MessagePreview({ draft }: { draft: CampaignDraft }) {
  const { c } = useBlockFormat();
  const [frame, setFrame] = React.useState<"desktop" | "phone">("desktop");
  const sender = senders.find((s) => s.value === draft.sender)!;

  return (
    <figure className="grid gap-2.5" aria-label={c("Message preview", "İleti önizlemesi")}>
      <figcaption className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">{c("Preview · as Elif from Izmir", "Önizleme · İzmir'den Elif olarak")}</span>
        {draft.channel === "email" ? (
          <ToggleGroup type="single" size="sm" value={frame} onValueChange={(v) => v && setFrame(v as typeof frame)} aria-label={c("Preview width", "Önizleme genişliği")}>
            <ToggleGroupItem value="desktop" aria-label={c("Desktop", "Masaüstü")}>
              <Monitor />
            </ToggleGroupItem>
            <ToggleGroupItem value="phone" aria-label={c("Phone", "Telefon")}>
              <Smartphone />
            </ToggleGroupItem>
          </ToggleGroup>
        ) : null}
      </figcaption>

      {draft.channel === "email" ? (
        <div className={cn("mx-auto w-full overflow-hidden rounded-ui border border-line bg-surface transition-[max-width] duration-300", frame === "phone" ? "max-w-[300px]" : "max-w-full")}>
          <div className="border-b border-line bg-surface-2 px-3.5 py-2.5 text-[12px]">
            <p className="truncate text-fg">
              <span className="font-medium">{sender.label}</span> <span className="text-fg-subtle">&lt;{sender.description}&gt;</span>
            </p>
            <p className="mt-0.5 truncate font-medium text-fg">{fillTags(draft.subject) || <span className="text-fg-subtle">{c("No subject", "Konu yok")}</span>}</p>
            <p className="truncate text-fg-muted">{fillTags(draft.preheader)}</p>
          </div>
          <div className="px-4 py-4">
            <p className="font-display text-[17px] leading-tight text-fg">Kiln &amp; Linen</p>
            {/* Hero: a kiln shelf of vessels, drawn with tokens so it follows every theme. */}
            <div className="relative mt-3 flex h-20 items-end gap-2 overflow-hidden rounded-ui-sm bg-surface-2 px-4" aria-hidden>
              {[
                ["h-11 w-7 rounded-t-[999px]", "bg-fg/75"],
                ["h-7 w-10 rounded-t-[999px]", "bg-fg/35"],
                ["h-14 w-6 rounded-t-[999px]", "bg-accent"],
                ["h-9 w-9 rounded-t-[999px]", "bg-fg/55"],
                ["h-5 w-12 rounded-t-[999px]", "bg-fg/20"],
              ].map(([shape, tone], i) => (
                <span key={i} className={cn("shrink-0", shape, tone)} />
              ))}
              <span className="absolute inset-x-0 bottom-0 h-px bg-fg/25" />
              <span className="absolute end-3 top-2.5 text-[10px] tracking-[0.08em] text-fg-subtle">{c("EARLY ACCESS · THU", "ERKEN ERİŞİM · PERŞ")}</span>
            </div>
            <div className="mt-3 grid gap-2 text-[12.5px] leading-relaxed text-fg-muted">
              {fillTags(draft.body)
                .split(/\n{2,}/)
                .filter(Boolean)
                .slice(0, 4)
                .map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
            </div>
            {draft.cta ? <span className="mt-4 inline-block rounded-ui-sm bg-fg px-3.5 py-2 text-[12px] font-medium text-scene">{draft.cta}</span> : null}
            <p className="mt-5 border-t border-line pt-3 text-[10.5px] text-fg-subtle">{c("You get this because you subscribed at kilnlinen.example.com · Unsubscribe", "Bu e-postayı kilnlinen.example.com'da abone olduğunuz için alıyorsunuz · Abonelikten çık")}</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[300px] rounded-[28px] border border-line bg-surface-2 p-3 pb-10">
          <p className="tabular mt-4 text-center font-display text-[42px] leading-none text-fg">10:00</p>
          <p className="mb-6 mt-1 text-center text-[11px] text-fg-muted">{c("Thursday 26 November", "26 Kasım Perşembe")}</p>
          <div className="rounded-[16px] border border-line bg-surface px-3 py-2.5 shadow-sm">
            <p className="flex items-center justify-between text-[11px] text-fg-subtle">
              <span className="font-medium uppercase tracking-[0.06em]">{draft.channel === "sms" ? c("Messages", "Mesajlar") : "Kiln & Linen"}</span>
              <span>{c("now", "şimdi")}</span>
            </p>
            {draft.channel === "push" ? <p className="mt-1 text-[13px] font-semibold text-fg">{fillTags(draft.pushTitle)}</p> : <p className="mt-1 text-[13px] font-semibold text-fg">KILNLINEN</p>}
            <p className="mt-0.5 line-clamp-4 text-[12.5px] leading-snug text-fg-muted">{fillTags(draft.channel === "sms" ? draft.sms : draft.preheader) || "…"}</p>
          </div>
        </div>
      )}
    </figure>
  );
}

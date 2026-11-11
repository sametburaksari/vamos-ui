"use client";

import * as React from "react";
import { ExternalLink, Printer } from "lucide-react";
import { Button, Card, CardBody, CardHeader, QrCode, toast } from "@vamos-ui/react";
import { useBlockFormat } from "../../_shared/format";
import { order, origin, parcel, shippingAddress, trackingScans } from "./data";

/** Bars for a tracking number: a start pattern, two bars per character, a stop pattern. Decorative. */
function barcodeBars(code: string) {
  const widths: number[] = [2, 1, 1, 2];
  for (const ch of code) {
    const n = ch.charCodeAt(0);
    widths.push(1 + (n % 3), 1 + ((n >> 2) % 2), 1 + ((n >> 1) % 3), 1 + (n % 2));
  }
  widths.push(2, 3, 1, 1);
  let x = 0;
  return widths.map((w, i) => {
    const bar = { x, w, ink: i % 2 === 0 };
    x += w;
    return bar;
  }).filter((b) => b.ink).map((b) => ({ x: b.x, w: b.w, total: x }));
}

/**
 * The carrier label as it was printed: always on a light "paper" plate (the `light` class
 * re-scopes the tokens), so it reads like the sticker on the box in dark mode too.
 */
export function ShippingLabel() {
  const { c, t, f } = useBlockFormat();
  const tracking = order.tracking ?? "";
  const bars = React.useMemo(() => barcodeBars(tracking), [tracking]);
  const total = bars[0]?.total ?? 1;
  const trackUrl = `https://track.kirlangic.example.com/${tracking}`;

  return (
    <Card>
      <CardHeader
        title={c("Shipping label", "Kargo etiketi")}
        description={`${order.carrier} · ${t(parcel.service)}`}
        action={
          <Button size="sm" variant="ghost" onClick={() => toast.success(c("Label sent to the packing-desk printer", "Etiket paketleme masası yazıcısına gönderildi"))}>
            <Printer /> {c("Reprint", "Yeniden yazdır")}
          </Button>
        }
      />
      <CardBody className="grid gap-5">
        <figure
          aria-label={c(`Shipping label, tracking number ${tracking}`, `Kargo etiketi, takip numarası ${tracking}`)}
          className="light grid gap-0 overflow-hidden rounded-ui border border-line bg-[var(--surface-solid)] font-mono text-[12px] leading-snug text-fg shadow-[var(--surface-shadow)]"
        >
          <div className="flex items-center justify-between border-b-2 border-fg px-4 py-2.5">
            <span className="text-[15px] font-bold tracking-tight uppercase">{order.carrier}</span>
            <span className="rounded-[3px] bg-fg px-1.5 py-0.5 text-[11px] font-bold text-scene">{c("NEXT DAY", "ERTESİ GÜN")}</span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-fg/40">
            <div className="grid gap-0.5 px-4 py-3">
              <span className="text-[10px] tracking-[0.12em] text-fg-muted uppercase">{c("Ship to", "Alıcı")}</span>
              <span className="text-[14px] font-bold">{shippingAddress.name}</span>
              <span>{shippingAddress.line1}</span>
              <span>{shippingAddress.line2}</span>
              <span className="font-bold">
                {shippingAddress.postcode} {shippingAddress.city}
              </span>
              <span>{shippingAddress.phone}</span>
            </div>
            <div className="grid place-items-center border-s border-fg/40 px-3 py-3">
              <QrCode value={trackUrl} size={84} plate={false} margin={0} aria-label={c("QR code: tracking page", "QR kod: takip sayfası")} />
            </div>
          </div>
          <div className="grid grid-cols-3 border-b border-fg/40 [&>div]:px-4 [&>div]:py-2">
            <div className="grid">
              <span className="text-[10px] text-fg-muted uppercase">{c("From", "Gönderen")}</span>
              <span className="truncate">KL · {origin.code}</span>
            </div>
            <div className="grid border-s border-fg/40">
              <span className="text-[10px] text-fg-muted uppercase">{c("Weight", "Ağırlık")}</span>
              <span>{f.number(parcel.weightKg, { maximumFractionDigits: 1 })} kg</span>
            </div>
            <div className="grid border-s border-fg/40">
              <span className="text-[10px] text-fg-muted uppercase">{c("Parcel", "Koli")}</span>
              <span>1 / 1</span>
            </div>
          </div>
          <div className="grid gap-1.5 px-4 pt-3 pb-3.5">
            <svg viewBox={`0 0 ${total} 40`} preserveAspectRatio="none" className="h-14 w-full" aria-hidden>
              {bars.map((b, i) => (
                <rect key={i} x={b.x} width={b.w} y={0} height={40} fill="currentColor" />
              ))}
            </svg>
            <span className="text-center text-[13px] tracking-[0.3em]">{tracking}</span>
            <span className="text-center text-[10px] text-fg-muted">
              {order.number} · {parcel.dimensions}
            </span>
          </div>
        </figure>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-small font-medium text-fg">{c("Carrier scans", "Kargo hareketleri")}</h4>
            <Button size="sm" variant="link" asChild>
              <a href={trackUrl} target="_blank" rel="noreferrer">
                {c("Track", "Takip et")} <ExternalLink />
              </a>
            </Button>
          </div>
          <ol className="grid gap-0">
            {trackingScans.map((s, i) => (
              <li key={s.id} className="relative grid grid-cols-[14px_minmax(0,1fr)] gap-3 pb-3 last:pb-0">
                <span className="relative flex justify-center" aria-hidden>
                  <span className={`mt-1.5 size-2 rounded-full ${i === 0 ? "bg-success" : "bg-fg-subtle"}`} />
                  {i < trackingScans.length - 1 ? <span className="absolute top-4 bottom-[-6px] w-px bg-line" /> : null}
                </span>
                <span className="grid">
                  <span className={i === 0 ? "font-medium text-fg" : "text-fg"}>{t(s.label)}</span>
                  <span className="text-small text-fg-muted">
                    {s.place} · {f.dateTime(s.at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" })}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </CardBody>
    </Card>
  );
}

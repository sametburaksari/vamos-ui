import { Ticket } from "lucide-react";
import { QrCode } from "@vamos-ui/react";

export default function QrCodeMark() {
  return (
    <div className="flex items-center gap-5 rounded-ui-lg border border-line bg-surface p-5">
      {/* A centre mark switches error correction to "H" so the covered modules are recovered. */}
      <QrCode value="TICKET:KL-WS-2026-1204:ROW-C:SEAT-14" size={132} aria-label="Ticket QR code for the door scanner">
        <Ticket className="text-fg" aria-hidden="true" />
      </QrCode>
      <div className="grid gap-1 text-sm">
        <p className="text-[11px] font-medium tracking-[0.08em] text-fg-subtle uppercase">Ceramics workshop</p>
        <p className="font-medium text-fg">Thu 4 Dec · 14:00</p>
        <p className="text-fg-muted">Studio A · Row C, seat 14</p>
        <p className="mt-2 font-mono text-xs text-fg-subtle">KL-WS-2026-1204</p>
      </div>
    </div>
  );
}

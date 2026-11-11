import { QrCode } from "@vamos-ui/react";

export default function QrCodePlain() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-8">
      {/* plate={false}: current text colour, transparent background, 4-module quiet zone. */}
      <QrCode plate={false} size={120} value="https://example.com/menu" aria-label="Menu link" className="text-fg" />
      <QrCode plate={false} size={120} value="https://example.com/menu" aria-label="Menu link in accent ink" className="text-accent-ink" />
    </div>
  );
}

import { QrCode } from "@vamos-ui/react";

const url = "https://example.com/orders/KL-24228/track";

export default function QrCodeLevels() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {(["L", "M", "Q", "H"] as const).map((level, i) => (
        <figure key={level} className="grid justify-items-center gap-2">
          <QrCode value={url} errorCorrection={level} size={88 + i * 24} aria-label={`Order tracking link, error correction ${level}`} />
          <figcaption className="text-xs text-fg-muted">
            <span className="font-mono text-fg">{level}</span> · {["7%", "15%", "25%", "30%"][i]} recovery
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

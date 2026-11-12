import * as React from "react";
import { cn } from "../lib/cn";
import { encodeQr, qrPath, type QrErrorCorrection, type QrMatrix } from "./_qr-core";

export { encodeQr, qrPath, type QrErrorCorrection, type QrMatrix };

export interface QrCodeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Text to encode (URL, otpauth:// URI, Wi-Fi string…). UTF-8, byte mode. */
  value: string;
  /** Accessible name — say what scanning does: "QR code to add Kiln & Linen to your authenticator app". */
  "aria-label": string;
  /** `"M"` (default) recovers ~15% damage; a centre mark switches to `"H"` automatically. */
  errorCorrection?: QrErrorCorrection;
  /** Rendered width (px or any CSS length). Default `176`. */
  size?: number | string;
  /**
   * Quiet zone in modules. Default `4` without a plate, `2` on the plate (the plate's padding
   * adds the rest). Scanners need light space around the code.
   */
  margin?: number;
  /**
   * Draw the code on a light plate (default). Codes scan most reliably dark-on-light, so the plate
   * stays light in dark mode. `false` uses the current text colour on a transparent background.
   */
  plate?: boolean;
  /** Shown when `value` is too long for version 40. Default "Too long for a QR code". */
  fallback?: React.ReactNode;
  /** Small mark in the centre (logo, icon). Keep it under ~20% of the width. */
  children?: React.ReactNode;
}

/**
 * A QR code drawn as one SVG path — for two-factor enrolment, invite links, tickets and
 * payment slips. Encoded on the server or client with no dependency; works in RSC.
 *
 * ```tsx
 * <QrCode value={otpauthUri} aria-label="QR code for your authenticator app" />
 * ```
 */
export const QrCode = /*#__PURE__*/ React.forwardRef<HTMLDivElement, QrCodeProps>(function QrCode(
  { value, errorCorrection, size = 176, margin, plate = true, fallback = "Too long for a QR code", children, className, style, ...props },
  ref,
) {
  const ecl = errorCorrection ?? (children ? "H" : "M");
  let qr: QrMatrix | null = null;
  try {
    qr = encodeQr(value, { errorCorrection: ecl });
  } catch {
    qr = null;
  }
  const quiet = margin ?? (plate ? 2 : 4);
  const dim = qr ? qr.size + quiet * 2 : 0;
  const width = typeof size === "number" ? `${size}px` : size;
  return (
    <div
      ref={ref}
      role="img"
      data-slot="qr-code"
      data-version={qr?.version}
      className={cn(
        "relative inline-grid shrink-0 place-items-center",
        plate && "light rounded-ui border border-line bg-[var(--surface-solid)] p-2 text-fg shadow-[var(--surface-shadow)]",
        className,
      )}
      style={{ width, ...style }}
      {...props}
    >
      {qr ? (
        <svg viewBox={`0 0 ${dim} ${dim}`} aria-hidden="true" focusable="false" shapeRendering="crispEdges" className="block size-full">
          <path d={qrPath(qr, quiet)} fill="currentColor" />
        </svg>
      ) : (
        <span className="grid aspect-square w-full place-items-center p-3 text-center text-xs text-fg-muted">{fallback}</span>
      )}
      {children && qr ? (
        <span
          data-slot="qr-code-mark"
          className="absolute top-1/2 left-1/2 grid size-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-ui-sm bg-[var(--surface-solid)] p-[3%] [&>svg]:size-full [&>img]:size-full [&>img]:object-contain"
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

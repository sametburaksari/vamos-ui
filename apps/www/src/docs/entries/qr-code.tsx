import { ex, type DocEntry } from "../types";
import QrCodeDemo from "../examples/qr-code/demo";
import QrCodeLevels from "../examples/qr-code/levels";
import QrCodeMark from "../examples/qr-code/mark";
import QrCodeTwoFactor from "../examples/qr-code/two-factor";
import QrCodePlain from "../examples/qr-code/plain";

const entry: DocEntry = {
  slug: "qr-code",
  title: "QR code",
  group: "Data display",
  description:
    "Scannable QR codes for two-factor enrolment, invite links, tickets and payment slips. Encoded in the kit (byte mode, versions 1–40, all four error-correction levels, automatic mask) with no dependency, drawn as a single SVG path, and works in server components.",
  source: ["components/qr-code.tsx", "components/_qr-core.ts"],
  basedOn: "ISO/IEC 18004 (QR Model 2)",
  usage: `import { QrCode } from "@vamos-ui/react";

<QrCode value={otpauthUri} aria-label="QR code for your authenticator app" />`,
  demo: ex("demo", "Demo", "qr-code/demo.tsx", QrCodeDemo),
  examples: [
    ex("two-factor", "Two-factor enrolment (auth)", "qr-code/two-factor.tsx", QrCodeTwoFactor, "An otpauth:// URI with the manual key beside it for people who can't scan."),
    ex("levels", "Error correction and size", "qr-code/levels.tsx", QrCodeLevels, "Higher levels survive more damage but need more modules; the version grows to fit."),
    ex("mark", "Centre mark (tickets)", "qr-code/mark.tsx", QrCodeMark, "children sits in the middle; error correction switches to H automatically."),
    ex("plain", "Without the plate", "qr-code/plain.tsx", QrCodePlain, "plate={false} draws in the current text colour. Keep strong contrast — some scanners reject light-on-dark codes."),
  ],
  api: [
    { name: "QrCode", props: [
      { name: "value", type: "string", description: "Text to encode — URL, otpauth:// URI, Wi-Fi string. UTF-8, byte mode." },
      { name: "aria-label", type: "string", description: "Required. Say what scanning does, not \"QR code\"." },
      { name: "errorCorrection", type: '"L" | "M" | "Q" | "H"', default: '"M" ("H" with children)', description: "Recovery capacity: 7 / 15 / 25 / 30%." },
      { name: "size", type: "number | string", default: "176", description: "Rendered width (px or CSS length). Height follows." },
      { name: "margin", type: "number", default: "2 on the plate, 4 without", description: "Quiet zone in modules." },
      { name: "plate", type: "boolean", default: "true", description: "Light plate that stays light in dark mode so the code always scans dark-on-light." },
      { name: "fallback", type: "ReactNode", default: '"Too long for a QR code"', description: "Shown when the value exceeds version 40." },
      { name: "children", type: "ReactNode", description: "Centre mark (icon, logo). Keep it under ~20% of the width." },
    ] },
    { name: "encodeQr(text, options?)", props: [
      { name: "options.errorCorrection", type: '"L" | "M" | "Q" | "H"', default: '"M"', description: "Level." },
      { name: "options.minVersion / mask", type: "number", description: "Force a minimum version or a mask (0–7)." },
      { name: "returns", type: "{ size, version, mask, errorCorrection, modules: boolean[][] }", description: "The module matrix — draw it yourself (canvas, print). qrPath(matrix, margin) gives the SVG path." },
    ] },
  ],
  notes: [
    "Verified against a reference decoder for versions 1–40 and UTF-8 text.",
    "The plate uses the light theme tokens (class \"light\"), so it is not a raw colour and still follows the light palette.",
  ],
  covers: [],
};

export default entry;

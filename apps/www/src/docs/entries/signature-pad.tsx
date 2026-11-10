import { ex, type DocEntry } from "../types";
import SignaturePadDemo from "../examples/signature-pad/demo";
import SignatureReadOnly from "../examples/signature-pad/read-only";
import SignatureConsentForm from "../examples/signature-pad/form";

const entry: DocEntry = {
  slug: "signature-pad",
  title: "Signature pad",
  group: "Forms & inputs",
  description:
    "Capture a handwritten or typed signature: delivery confirmations, consent forms, timesheet sign-off, customer approvals. Strokes are pressure-aware and smoothed, Undo and Clear are one click away, and Type is the keyboard path. Exports are SVG (and PNG on request) with dark ink in every theme, so they print correctly.",
  source: ["components/signature-pad.tsx", "components/tabs.tsx"],
  basedOn: "Pointer Events · perfect-freehand",
  usage: `import { Field, SignaturePad } from "@vamos-ui/react";

<Field label="Customer signature" required>
  <SignaturePad name="signature" exportPng onValueChange={(sig) => setSignature(sig)} />
</Field>`,
  demo: ex("demo", "Demo", "signature-pad/demo.tsx", SignaturePadDemo),
  examples: [
    ex("form", "Required in a consent form", "signature-pad/form.tsx", SignatureConsentForm, "Controlled value, accent ink on screen, PNG export. The Field error marks the pad invalid."),
    ex("read-only", "Read-only", "signature-pad/read-only.tsx", SignatureReadOnly, "A stored signature as an image (never injected as markup) with its localized timestamp."),
  ],
  api: [
    { name: "SignaturePad", props: [
      { name: "value / defaultValue / onValueChange", type: "SignatureValue | null", description: "{ kind: drawn | typed, svg, png?, text?, strokes?, width?, height?, signedAt }." },
      { name: "modes", type: '("draw" | "type")[]', default: '["draw", "type"]', description: "Type is the accessible alternative — keep it unless you provide another." },
      { name: "height", type: "number", default: "176", description: "Pad height in px." },
      { name: "penColor", type: '"fg" | "accent"', default: '"fg"', description: "On-screen ink. Exports always use dark ink (SIGNATURE_INK)." },
      { name: "exportPng", type: "boolean", default: "false", description: "Adds a PNG data URL; the hidden input then carries the PNG instead of the SVG." },
      { name: "name", type: "string", description: "Hidden input name (falls back to the Field's name)." },
      { name: "readOnly · disabled · invalid · required", type: "boolean", description: "Read from the surrounding Field when not set." },
      { name: "labels", type: "Partial<SignaturePadLabels>", description: "Built-in strings (signature namespace)." },
    ] },
    { name: "Helpers", props: [
      { name: "strokesToSvg(strokes, w, h) · textToSvg(text, w, h)", type: "string", description: "Standalone SVG documents." },
      { name: "strokesToPng(strokes, w, h)", type: "string | undefined", description: "PNG data URL (browser only)." },
      { name: "svgDataUrl(svg)", type: "string", description: "For <img src>: safe display of stored SVG." },
    ] },
  ],
  notes: [
    "Typed signatures use --font-signature (a cursive system stack by default) — point it at a handwriting font you load.",
    "A drawn or typed image is not a qualified electronic signature (eIDAS, Turkey's Law 5070). The legal wording around it is your app's job.",
  ],
  covers: ["Signature pad"],
};

export default entry;

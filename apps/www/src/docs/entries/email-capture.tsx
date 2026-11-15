import { ex, type DocEntry } from "../types";
import EmailCaptureDemo from "../examples/email-capture/demo";
import EmailCaptureStacked from "../examples/email-capture/stacked";
import EmailCaptureServerAction from "../examples/email-capture/server-action";
import EmailCaptureStates from "../examples/email-capture/states";

const entry: DocEntry = {
  slug: "email-capture",
  title: "Email capture",
  group: "Forms & inputs",
  description:
    "A compact email signup for a newsletter, a waitlist or the end of an article: field and button in one row (or stacked), validation tied to the input, success and error states, and the privacy link or KVKK checkbox. It speaks the ContactForm contract — a URL or server action, honeypot and time trap, privacy / _notice / _form fields — so one server check covers both. For a full-width signup section use the Cta block's newsletter variant.",
  source: ["components/email-capture.tsx"],
  usage: `import { EmailCapture } from "@vamos-ui/react";

<EmailCapture action="/api/subscribe" hint="One email a month." privacyLink={{ href: "/privacy" }} />

// Server side (same check as ContactForm)
const v = validateContactForm([{ name: "email", required: true }], data, { privacyCheckbox: true });`,
  demo: ex("demo", "Inline", "email-capture/demo.tsx", EmailCaptureDemo, "Field and button share a row once the container is wide enough; the privacy sentence sits underneath."),
  examples: [
    ex("stacked", "Stacked in a card, KVKK checkbox", "email-capture/stacked.tsx", EmailCaptureStacked, "privacyCheckbox adds a required, never pre-checked box; version is posted as _notice so the server can record which wording was shown."),
    ex("server-action", "Server action", "email-capture/server-action.tsx", EmailCaptureServerAction, "action takes a useActionState function (prev, FormData) → SiteFormState. Invalid results map back onto the field."),
    ex("states", "States", "email-capture/states.tsx", EmailCaptureStates, "initialState renders invalid, error and success — for docs, tests or a server-rendered result."),
  ],
  api: [
    { name: "EmailCapture", props: [
      { name: "layout", type: '"inline" | "stacked"', default: '"inline"', description: "One row once there is room, or the button under the field." },
      { name: "action", type: "SiteFormAction | string", description: "A server action, or a URL: plain POST without JS, fetch with Accept: application/json after hydration ({ status: \"success\" | \"invalid\" | \"error\" })." },
      { name: "onSubmit", type: "(email, data: FormData) => void | Promise<void>", description: "Client handler instead of action; a rejection shows the error state." },
      { name: "label / hideLabel", type: "ReactNode / boolean", default: '"Email address"', description: "The field label; hideLabel keeps it for screen readers only." },
      { name: "placeholder / hint / submitLabel", type: "string / ReactNode / string", description: "Placeholder, small print under the field, button text." },
      { name: "privacyLink", type: "{ href; label?; version? }", description: "Privacy notice link (KVKK requires one); version is posted as _notice." },
      { name: "privacyCheckbox", type: "boolean", description: "A required, never pre-checked confirmation (posted as privacy=on)." },
      { name: "successMessage", type: "ReactNode", description: "Replaces the form after success; focus moves to it." },
      { name: "name / size", type: 'string / "md" | "lg"', default: '"email" / "md"', description: "Input name and control height." },
      { name: "initialState", type: "SiteFormState", description: "Render a given state." },
      { name: "labels", type: "Partial<EmailCaptureLabels>", description: 'Dictionary namespace "emailCapture" (en, tr, de, fr, es, ar built in).' },
    ] },
  ],
  notes: [
    "Validates on submit, then re-validates on the next submit; errors are tied to the input with aria-describedby and focus moves to the field.",
    "Without JS a URL action is a normal POST; a server can redirect back with ?vb_sent=<form id> to show the success state.",
    "Consent to marketing is the signup itself here; keep any separate offers out of it (ContactForm has marketingConsent for that).",
  ],
  covers: [],
};

export default entry;

import { ex, type DocEntry } from "../types";
import Demo from "../examples/contact-form/demo";
import StackedQuote from "../examples/contact-form/stacked-quote";
import Minimal from "../examples/contact-form/minimal";
import ServerAction from "../examples/contact-form/server-action";
import States from "../examples/contact-form/states";

const entry: DocEntry = {
  slug: "contact-form",
  title: "Contact form",
  group: "Site blocks",
  description:
    "Contact and quote requests feeding whatever lead store the app uses — CRM, email or a webhook. A server component around a ~2 KB useActionState island: the same validation runs in the browser and in your server action (validateContactForm, or the zod contactFormSchema), native HTML constraints cover the no-JS path, a honeypot and a time trap catch bots (answered with a silent fake success), and an error summary with role=alert links to each field. KVKK/GDPR: a linked privacy notice, consent boxes never pre-checked, marketing consent always separate.",
  source: ["blocks/site/contact-form.tsx", "blocks/site/shared/contact-form-island.tsx", "blocks/site/shared/site-form.ts", "blocks/site/registry-2.ts"],
  basedOn: "React 19 useActionState",
  usage: `import { ContactForm, validateContactForm, type SiteFormState } from "@vamos-ui/react/blocks";

const fields = [{ name: "name", required: true }, { name: "email", required: true }, { name: "message", required: true }] as const;

async function sendLead(prev: SiteFormState, data: FormData): Promise<SiteFormState> {
  "use server";
  const v = validateContactForm(fields, data, { privacyCheckbox: true });
  if (v.spam) return { status: "success" };
  if (!v.ok) return v.state;
  await crm.createLead(v.values);
  return { status: "success" };
}

<ContactForm title="Ask us *anything*" fields={[...fields]} action={sendLead} privacyLink={{ href: "/kvkk" }} privacyCheckbox />`,
  demo: ex("demo", "Split (clinic)", "contact-form/demo.tsx", Demo),
  examples: [
    ex("stacked-quote", "Stacked quote request (agency)", "contact-form/stacked-quote.tsx", StackedQuote, "Subject and budget as native selects (platform pickers on phones), date field, a custom submit label."),
    ex("minimal", "Minimal (under a CTA)", "contact-form/minimal.tsx", Minimal, "Three fields and the button in one row."),
    ex("server-action", "Next.js server action", "contact-form/server-action.tsx", ServerAction, "The action validates with the same config, drops spam silently and posts the lead. Without JavaScript the browser does a full round trip and gets the same states."),
    ex("states", "States", "contact-form/states.tsx", States, "Rendered from initialState: field errors with a linked summary (values kept), a server error with the fallback phone number, success."),
  ],
  api: [
    {
      name: "ContactForm",
      props: [
        { name: "variant", type: '"split" | "stacked" | "minimal"', default: '"split"', description: "Layout." },
        { name: "fields", type: "ContactFieldConfig[]", default: "name, email, message", description: "2–8 of name · email · phone · company · subject · budget · message · date, each { required?, label?, options?, placeholder?, hint?, max? }." },
        { name: "action", type: "(prev: SiteFormState, data: FormData) => Promise<SiteFormState> | string", description: "Your server action, or a URL for a plain POST. Without it the form only validates (previews)." },
        { name: "successMessage", type: "ReactNode | RichDoc", description: "Replaces the form; focus moves to it." },
        { name: "privacyLink / privacyCheckbox", type: "{ href; label? } / boolean", description: "Linked notice; with privacyCheckbox a required, never pre-checked box." },
        { name: "marketingConsent", type: "boolean", default: "false", description: "A separate, optional marketing box." },
        { name: "info / showInfo", type: "{ address?; phone?; email?; hours? } / boolean", description: "Contact column (split). phone is also the fallback on server errors." },
        { name: "submitLabel", type: "string", default: '"Send message"', description: "Button text." },
        { name: "initialState", type: "SiteFormState", description: "Render a given state (docs, a server-rendered result)." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Field labels and error messages (site2LabelsTr for Turkish)." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    {
      name: "validateContactForm(fields, data, opts)",
      props: [
        { name: "opts", type: "{ privacyCheckbox?; labels?; locale?; spamMinMs? }", description: "spamMinMs: submits faster than this after render count as bots (default 2500)." },
        { name: "returns", type: "{ ok; spam; values; errors; privacy; marketing; state }", description: "state is ready to return from the action." },
      ],
    },
    { name: "contactFormSchema(fields, opts) — blocks/site/registry-2", props: [{ name: "returns", type: "z.ZodObject", description: "zod schema for Object.fromEntries(formData) (server only)." }] },
  ],
  notes: ["The block renderer has no way to pass a server action yet, so a stored contact-form block only validates until the app wires one (see the 06 plan: actions={{ contact }})."],
  covers: ["Contact form"],
};

export default entry;

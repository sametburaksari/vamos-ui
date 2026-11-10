import { ex, type DocEntry } from "../types";
import Demo from "../examples/contact-dock/demo";
import Fab from "../examples/contact-dock/fab";
import BarRestaurant from "../examples/contact-dock/bar-restaurant";

const entry: DocEntry = {
  slug: "contact-dock",
  title: "Contact dock",
  group: "Site blocks",
  description:
    "A floating messaging button and a mobile action bar (“Call · Directions · WhatsApp”) — the main conversion channel for local businesses in Turkey and many other markets. Plain links with data-track for the app's analytics, last in DOM order, 44px+ targets, safe-area padding; the page gets bottom padding so content isn't covered, the button moves above a visible consent bar, and the bar steps aside when the on-screen keyboard is open. Off-hours behaviour (label or hide) is a ~0.4 KB island using the business's opening hours.",
  source: ["blocks/site/contact-dock.tsx", "blocks/site/shared/dock-hours.tsx", "blocks/site/shared/brand-icons.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  usage: `import { ContactDock } from "@vamos-ui/react/blocks";

// app/layout.tsx, after {children}
<ContactDock
  whatsapp="+902168072907"
  message="Hi, I’d like to book a table."
  phone="+902168072907"
  directionsHref="https://maps.app.goo.gl/…"
  bookingHref="/reservations"
/>`,
  demo: ex("demo", "Both (fab + mobile bar)", "contact-dock/demo.tsx", Demo),
  examples: [
    ex("fab", "Fab with off-hours label (spa)", "contact-dock/fab.tsx", Fab, "Outside opening hours a note says when you'll hear back; offHours=\"hide\" removes the dock instead."),
    ex("bar-restaurant", "Mobile bar (restaurant)", "contact-dock/bar-restaurant.tsx", BarRestaurant, "2–4 equal actions in the order you give."),
  ],
  api: [
    {
      name: "ContactDock",
      props: [
        { name: "variant", type: '"fab" | "bar" | "both"', default: '"both"', description: "both: fab from 48rem up, bar below." },
        { name: "provider", type: '"whatsapp" | "telegram" | "messenger"', default: '"whatsapp"', description: "Messaging network of the fab." },
        { name: "whatsapp / telegram / messenger", type: "string", description: "E.164 number, Telegram username, or Facebook page name." },
        { name: "message", type: "string", description: "Prefilled WhatsApp text (wa.me/<digits>?text=…)." },
        { name: "label", type: "string", default: '"Message us"', description: "Fab label on desktop." },
        { name: "phone / directionsHref / bookingHref / email", type: "string", description: "Targets for the bar actions." },
        { name: "actions", type: '("call" | "whatsapp" | "directions" | "booking" | "email")[]', description: "Bar order (max 4); unconfigured ones are skipped." },
        { name: "position", type: '"end" | "start"', default: '"end"', description: "Logical side (mirrors in RTL)." },
        { name: "hours / offHours", type: 'OpeningHours / "show" | "label" | "hide"', default: '— / "show"', description: "Off-hours behaviour, computed on the client in the business's zone." },
        { name: "now", type: "string (ISO)", description: "Pin the clock for previews." },
        { name: "contained", type: "boolean", default: "false", description: "Render in place (docs, builder) instead of fixed." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Message us on {network}, Call, Directions…" },
      ],
    },
    { name: "BrandIcon", props: [{ name: "name / title", type: "BrandName / string", description: "WhatsApp, Instagram, Facebook, LinkedIn, X, YouTube, TikTok, Telegram, Messenger, Google/Apple/Yandex Maps, Waze — monochrome SVG, aria-hidden unless titled." }] },
  ],
  covers: ["Contact dock (WhatsApp · call)"],
};

export default entry;

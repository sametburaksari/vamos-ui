import { ex, type DocEntry } from "../types";
import Demo from "../examples/cta/demo";
import Split from "../examples/cta/split";
import Minimal from "../examples/cta/minimal";
import Newsletter from "../examples/cta/newsletter";
import BookingWa from "../examples/cta/booking-whatsapp";
import BookingEmbed from "../examples/cta/booking-embed";
import ServiceBooking from "../examples/cta/service-booking";

const entry: DocEntry = {
  slug: "cta",
  title: "CTA",
  group: "Site blocks",
  description:
    "End-of-page call to action — “Get a quote”, “Book a table”, “Start a 14-day trial” — plus a newsletter signup and a booking bar for appointments and reservations. Server component: the newsletter is a plain form that works without JS, the booking bar a ~2 KB island that prefills WhatsApp with Intl-formatted dates, and calendar embeds a click-to-load facade.",
  source: ["blocks/site/cta.tsx", "blocks/site/cta-booking.tsx", "blocks/site/embed-facade.tsx", "blocks/site/registry-1.ts", "styles/blocks.css"],
  usage: `import { Cta, waLink } from "@vamos-ui/react/blocks";

<Cta
  title="Book the *long table*"
  actions={[{ link: { href: "/reservations", label: "Book a table" }, style: "primary" }]}
  contact={{ phone: "+902168072907", whatsapp: "+905321234567" }}
/>

<Cta variant="newsletter" title="The Thursday wine list" newsletter={{ action: subscribe /* server action */, status, message }} />

<Cta variant="booking" title="Reserve a table"
  booking={{ provider: "whatsapp", whatsapp: "+905321234567", closedDays: ["mon"], timeZone: "Europe/Istanbul" }} />`,
  demo: ex("demo", "Band", "cta/demo.tsx", Demo),
  examples: [
    ex("split", "Split with a photo", "cta/split.tsx", Split, "Title + action at the start, a cropped photo at the end; the band height follows the photo."),
    ex("minimal", "Minimal", "cta/minimal.tsx", Minimal, "No background change, one huge underlined text link, no buttons — one of the two places centred alignment is allowed."),
    ex("newsletter", "Newsletter", "cta/newsletter.tsx", Newsletter, "Real label, type=email, a honeypot, consent described by aria-describedby. Pass status=\"success\" | \"error\" back to show role=status / role=alert."),
    ex("booking-whatsapp", "Booking → WhatsApp (restaurant)", "cta/booking-whatsapp.tsx", BookingWa, "Date · time · guests with visible mono labels; past dates disabled in the business time zone, closed days refused with a localized message; opens wa.me with the message filled in."),
    ex("service-booking", "Booking → booking page (spa)", "cta/service-booking.tsx", ServiceBooking, "provider=\"url\" sends service, date and time as query params (plain GET — no JS needed)."),
    ex("booking-embed", "Booking → calendar embed", "cta/booking-embed.tsx", BookingEmbed, "A static preview and “Open calendar”; the iframe loads in place only after a click."),
  ],
  api: [
    {
      name: "Cta",
      props: [
        { name: "variant", type: '"band" | "split" | "minimal" | "newsletter" | "booking"', default: '"band"', description: "Character (see examples). band defaults to theme.surface = \"accent\"." },
        { name: "title", type: "ReactNode", description: "h2 (one *emphasis*)." },
        { name: "eyebrow / lead / fineprint", type: "ReactNode", description: "Supporting copy." },
        { name: "actions", type: "SiteCta[]", description: "≤ 2, one primary (later primaries demoted). minimal uses the first as a large text link." },
        { name: "media", type: "ImageData", description: "split: the photo (4:5 crop)." },
        { name: "contact", type: "{ phone?; whatsapp?; whatsappText? }", description: "Mono phone + WhatsApp line (E.164); WhatsApp announces “(opens WhatsApp)”." },
        { name: "newsletter", type: "{ action?; placeholder?; buttonLabel?; consent?; status?; message? }", description: "action is a URL or a server action. consent is RichDoc or text — the legal copy is the app's responsibility (e.g. İYS/ETK in Turkey)." },
        { name: "booking", type: "CtaBookingConfig", description: "{ provider: whatsapp | url | phone | embed, whatsapp?, phone?, url?, fields?, services?, times?, maxGuests?, closedDays?, timeZone?, messageTemplate?, preview? }" },
        { name: "labels", type: "Partial<Site1Labels>", description: "date, time, guests, guestsCount, askAvailability, closedOn, bookingMessage, subscribe, subscribed…" },
        { name: "theme / anchor / id / className / locale / components / editMode / headingLevel", type: "BlockBaseProps", description: "locale drives the WhatsApp message's date and time format." },
      ],
    },
    { name: "waLink(e164, text?)", props: [{ name: "returns", type: "string", description: "https://wa.me/<digits>?text=<encoded>" }] },
  ],
  notes: ["Message template placeholders: {date}, {time}, {guests} (already pluralised), {service}. Default: “Hi, I’d like to book for {guests} on {date} at {time}.”"],
  covers: ["CTA"],
};

export default entry;

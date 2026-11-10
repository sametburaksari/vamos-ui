import { ex, type DocEntry } from "../types";
import Demo from "../examples/map-hours/demo";
import Info from "../examples/map-hours/info";
import Branches from "../examples/map-hours/branches";
import SpecialDays from "../examples/map-hours/special-days";

const entry: DocEntry = {
  slug: "map-hours",
  title: "Map & opening hours",
  group: "Site blocks",
  description:
    "Address, map, hours and directions — the most visited section of restaurant, spa and clinic sites, and the source of LocalBusiness SEO. The map is a ConsentGate facade (a greyscale static image with an accent pin; the keyless Google Maps or OpenStreetMap iframe loads after a click or functional consent — no Maps JS API, no key). Hours run through the OpeningHours module: IANA time zone, ranges past midnight, special days, Intl weekday names, week start and 12/24 h. “Open now” is a ~1 KB island that renders nothing without JS, so a cached page never shows a stale status.",
  source: ["blocks/site/map-hours.tsx", "blocks/site/shared/opening-hours.ts", "blocks/site/shared/open-now.tsx", "blocks/site/shared/consent-gate.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  basedOn: "Intl.DateTimeFormat (time zones)",
  usage: `import { MapHours, isOpenAt, hoursStatus } from "@vamos-cms/ui/blocks";

const hours = { timeZone: "Europe/Istanbul", weekly: { fri: [{ open: "17:00", close: "01:00" }] },
  special: [{ date: "2027-01-01", closed: true, note: "New Year’s Day" }] };

<MapHours title="Find *us*" businessType="Restaurant" directions={["google", "apple", "yandex"]}
  branches={[{ name: "Kıyı Meyhane", address, phone: "+902168072907", hours, mapImage }]} />

isOpenAt(hours, new Date());               // past midnight + special days, in Europe/Istanbul
hoursStatus(hours).closesAt;               // "01:00"`,
  demo: ex("demo", "Map split (restaurant)", "map-hours/demo.tsx", Demo),
  examples: [
    ex("info", "Info (no map)", "map-hours/info.tsx", Info, "Address / Hours / Contact in three typographic columns; consecutive days with the same hours are grouped."),
    ex("branches", "Branches (three-branch clinic)", "map-hours/branches.tsx", Branches, "A radio location picker with open/closed per branch; the selected branch's map, address and hours (0 JS)."),
    ex("special-days", "Special days, past midnight, Turkish", "map-hours/special-days.tsx", SpecialDays, "New Year's Eve overrides Thursday with 19:00–03:00; Monday-first, 24-hour, Turkish weekday names."),
  ],
  api: [
    {
      name: "MapHours",
      props: [
        { name: "variant", type: '"map-split" | "info" | "branches"', default: '"map-split"', description: "No map image falls back to info; one branch falls back to map-split." },
        { name: "branches", type: "Branch[]", description: "{ name, address: AddressValue, phone?, email?, hours: OpeningHours, mapImage?, placeUrl?, mapEmbedUrl?, notes? } — 1–12." },
        { name: "businessType", type: '"LocalBusiness" | "Restaurant" | "DaySpa" | "BeautySalon" | "MedicalClinic" | "ProfessionalService"', default: '"LocalBusiness"', description: "JSON-LD @type." },
        { name: "mapProvider", type: '"google" | "osm" | "none"', default: '"google"', description: "Embed loaded by the facade (osm needs geo)." },
        { name: "directions", type: '("google" | "apple" | "yandex" | "waze")[]', default: '["google","apple"]', description: "Direction links (Yandex is common in Turkey)." },
        { name: "showOpenNow", type: "boolean", default: "true", description: "The client-side status island." },
        { name: "now", type: "string (ISO)", description: "Pin the clock (previews, tests). Default: render time for the table, live clock for the island." },
        { name: "eyebrow / title / lead", type: "ReactNode", description: "Section header." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Open now, closes at {time}, Load map, Directions…" },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    {
      name: "OpeningHours helpers",
      props: [
        { name: "isOpenAt(hours, at?)", type: "boolean", description: "Open at an instant, computed in hours.timeZone." },
        { name: "hoursStatus(hours, at?, { soonMinutes })", type: "OpenStatus", description: "{ state: open | closing-soon | closed, closesAt, opensAt: { time, weekday, dayOffset }, allDay, special }." },
        { name: "weekRows(hours, { locale, at })", type: "WeekRow[]", description: "Seven rows in locale order with today and special-day notes." },
        { name: "summarizeHours / formatTime / formatRange / weekStartOf / orderedWeek", type: "functions", description: "Intl-based formatting." },
        { name: "openingHoursJsonLd(hours) / localBusinessJsonLd(props)", type: "object[]", description: "schema.org nodes without the renderer." },
      ],
    },
    { name: "HoursTable / OpenNow", props: [{ name: "hours / labels / locale / now", type: "—", description: "The table and the island on their own (e.g. in a footer)." }] },
  ],
  covers: ["Map & opening hours"],
};

export default entry;

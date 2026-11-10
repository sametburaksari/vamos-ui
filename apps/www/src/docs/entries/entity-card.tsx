import { ex, type DocEntry } from "../types";
import EntityCardPerson from "../examples/entity-card/person";
import EntityCardOrganization from "../examples/entity-card/organization";
import EntityCardProduct from "../examples/entity-card/product";
import EntityCardHeader from "../examples/entity-card/header";
import EntityCardChipHover from "../examples/entity-card/chip-hover";
import EntityCardCompact from "../examples/entity-card/compact";

const entry: DocEntry = {
  slug: "entity-card",
  title: "Entity card",
  group: "Data display",
  description:
    "The identity of a record at a glance — a contact, a company, a product, an employee — with status, key facts, a stat row and quick actions. Four shapes: a grid card, a compact row for side panels, the header of a record page, and an inline chip that opens a hover card.",
  source: ["components/entity-card.tsx"],
  basedOn: "Card surface + Avatar + Description list + Radix Hover Card (chip)",
  usage: `import { EntityCard } from "@vamos-ui/react";

<EntityCard
  name="Jane Cooper"
  subtitle="Head of Operations · Northwind Traders"
  status={{ tone: "success", label: "Customer" }}
  contact={{ email: "jane.cooper@northwind.com", phone: "+1 (415) 555-0136" }}
  fields={[{ key: "owner", label: "Owner", value: "Ayşe Kaya" }]}
  href="/contacts/jane-cooper"
/>`,
  demo: ex("person", "Contact card (CRM)", "entity-card/person.tsx", EntityCardPerson),
  examples: [
    ex("organization", "Company with stats", "entity-card/organization.tsx", EntityCardOrganization, "stats is a row of 2–3 numbers formatted with the current locale (currency, percent); they wrap instead of truncating."),
    ex("product", "Product tiles (commerce admin)", "entity-card/product.tsx", EntityCardProduct, "kind=\"product\" swaps the avatar for an image tile; without a photo it shows a package icon."),
    ex("header", "Record header (HR)", "entity-card/header.tsx", EntityCardHeader, "variant=\"header\": larger media, an h1 (or headingAs), a stat band and a three-column fact grid."),
    ex("chip-hover", "Inline chip with hover card", "entity-card/chip-hover.tsx", EntityCardChipHover, "variant=\"chip\" fits inside text; the hover card is supplementary — the link carries everything."),
    ex("compact", "Side-panel rows, archived, selected, loading", "entity-card/compact.tsx", EntityCardCompact),
  ],
  api: [
    { name: "EntityCard", props: [
      { name: "name", type: "string", description: "Record name — the heading, the initials and the accessible name of the actions." },
      { name: "kind", type: '"person" | "organization" | "product" | "generic"', default: '"person"', description: "Defaults only: avatar shape and fallback icon; product uses an image tile." },
      { name: "variant", type: '"card" | "compact" | "header" | "chip"', default: '"card"', description: "Grid tile, side-panel row, record header or inline chip with hover card." },
      { name: "subtitle", type: "ReactNode", description: "Role · company, domain or SKU." },
      { name: "media", type: "{ src?: string; alt?: string; fallback?: ReactNode }", description: "Photo, logo or product image. Missing → initials or an icon." },
      { name: "status", type: '{ tone: "neutral" | "accent" | "success" | "warning" | "danger" | "info"; label: string }', description: "One status pill (\"Active\", \"Out of stock\")." },
      { name: "badges", type: "ReactNode", description: "Extra badges after the status." },
      { name: "description", type: "ReactNode", description: "Bio or summary (clamped to 3 lines on cards)." },
      { name: "fields", type: "DescriptionEntry[]", description: "Key facts rendered as a small Description list (copyable, formatted)." },
      { name: "stats", type: "{ label: string; value: number | string; format?: ValueFormat }[]", description: "2–4 numbers in a row." },
      { name: "contact", type: "{ email?: string; phone?: string; website?: string }", description: "Built-in labelled quick actions (\"Email Jane Cooper\")." },
      { name: "actions", type: "ReactNode", description: "Your own quick actions (labelled IconButtons, a menu)." },
      { name: "href", type: "string", description: "The name becomes the one primary link, stretched over the card." },
      { name: "headingAs", type: '"h1" | "h2" | "h3" | "h4" | "p"', default: '"h3" (header: "h1")', description: "Heading level of the name." },
      { name: "archived", type: "boolean", default: "false", description: "Muted, with an \"Archived\" badge." },
      { name: "selected", type: "boolean", default: "false", description: "Picker state: accent outline and aria-current." },
      { name: "loading", type: "boolean", default: "false", description: "Skeleton in the variant's shape (aria-busy)." },
      { name: "labels", type: "Partial<EntityCardLabels>", description: "email, call, website, archived, selected." },
    ] },
  ],
  notes: [
    "The card is an <article> labelled by the name heading. With href, only the name is a link; actions stay separate buttons above the stretched link, each with a name that includes the record.",
    "Initials are locale-correct (\"ilker şahin\" → \"İŞ\" in Turkish) via Avatar.",
  ],
  covers: ["Entity card (person · company · product)"],
};

export default entry;

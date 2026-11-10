import { ex, type DocEntry } from "../types";
import Demo from "../examples/footer/demo";
import Wordmark from "../examples/footer/wordmark";
import Minimal from "../examples/footer/minimal";
import EcommerceLegal from "../examples/footer/ecommerce-legal";

const entry: DocEntry = {
  slug: "footer",
  title: "Footer",
  group: "Site blocks",
  description:
    "Site footer: navigation, contact, socials, legal links and the company details e-commerce law requires in many countries (legal name, tax office and number, MERSİS, trade registry — labels are free text so any country's identifiers fit). A footer landmark with labelled inner navs, social links named by network, and “Cookie settings” as a button that reopens the consent preferences. Dark mode is the recommended default, not enforced.",
  source: ["blocks/site/footer.tsx", "blocks/site/shared/brand-icons.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  usage: `import { Footer } from "@vamos-ui/react/blocks";

<Footer
  theme={{ mode: "dark" }}
  brand={{ name: "Vamos", href: "/" }}
  columns={[{ title: "Studio", links: [{ href: "/work", label: "Work" }] }]}
  social={[{ network: "instagram", href: "https://instagram.com/vamos.ist" }]}
  legalLinks={[{ href: "/kvkk", label: "KVKK notice" }]}
  company={{ legalName: "Vamos Dijital Ajans Ltd. Şti.", registry: [{ label: "Tax no.", value: "923 145 6780" }] }}
/>`,
  demo: ex("demo", "Columns (dark, agency)", "footer/demo.tsx", Demo),
  examples: [
    ex("wordmark", "Wordmark (restaurant)", "footer/wordmark.tsx", Wordmark, "Details across the top; the brand at container width at the very bottom, clipped by the edge."),
    ex("minimal", "Minimal (landing page)", "footer/minimal.tsx", Minimal, "One row: logo, a few links, socials, ©."),
    ex("ecommerce-legal", "E-commerce legal + newsletter", "footer/ecommerce-legal.tsx", EcommerceLegal, "Full company details, distance-sales and refund links, a newsletter form through the app's action, a credit line."),
  ],
  api: [
    {
      name: "Footer",
      props: [
        { name: "variant", type: '"columns" | "wordmark" | "minimal"', default: '"columns"', description: "Layout." },
        { name: "brand", type: "{ name; logo?: ReactNode | Image; href? }", description: "Logo or a display-type name." },
        { name: "about", type: "ReactNode", description: "≤ 200 characters." },
        { name: "columns", type: "{ title; links: { href; label; newTab? }[] }[]", description: "Up to 4 columns of up to 8 links, each a labelled nav." },
        { name: "contact", type: "{ address?; phone?; email? }", description: "Address (AddressValue or text), E.164 phone, email." },
        { name: "social", type: "{ network; href }[]", description: "Up to 6 brand icons named by network." },
        { name: "legalLinks", type: "Link[]", description: "Privacy, terms, KVKK… in the bottom line." },
        { name: "company", type: "{ legalName; registry?: { label; value }[] }", description: "Legal name and registry numbers." },
        { name: "cookieSettings", type: "boolean", default: "true", description: "“Cookie settings” button." },
        { name: "newsletter", type: "{ action?; title?; hint? }", description: "Email sign-up through the form island." },
        { name: "credit", type: "Link", description: "“Site by …”." },
        { name: "year", type: "number", default: "render year", description: "© year." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Footer, Legal, Social media, © {year} {name}…" },
        { name: "theme / anchor / id / className / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
  ],
  notes: ["footerBlock emits an Organization node; its lint warns when company details are missing (needed when the site sells online)."],
  covers: ["Footer"],
};

export default entry;

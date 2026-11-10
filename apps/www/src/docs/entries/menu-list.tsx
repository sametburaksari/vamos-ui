import { ex, type DocEntry } from "../types";
import Demo from "../examples/menu-list/demo";
import Photo from "../examples/menu-list/photo";
import ServiceSpa from "../examples/menu-list/service-list-spa";
import QrPage from "../examples/menu-list/qr-page";

const entry: DocEntry = {
  slug: "menu-list",
  title: "Menu / price list",
  group: "Site blocks",
  description:
    "Restaurant menus and spa or salon price lists — also a QR-menu page. Each category is a labelled section with a sticky jump bar of plain anchors, prices are tabular and formatted by Intl (the full currency name for screen readers), tags are words (never emoji), the 14 EU allergens are localized, unavailable items say “Not today” instead of a strikethrough and missing prices read “Market price”. Zero JavaScript.",
  source: ["blocks/site/menu-list.tsx", "blocks/site/registry-2.ts", "styles/blocks.css"],
  usage: `import { MenuList } from "@vamos-cms/ui/blocks";

<MenuList
  title="Tonight at *Kıyı*"
  priceNote="Prices include VAT. No service charge is added."
  categories={[{ title: "Cold meze", items: [
    { name: "Haydari", description: "Strained yoghurt, dill.", prices: [{ amount: { amount: "180", currency: "TRY" } }], tags: ["vegetarian"], allergens: ["milk"] },
  ] }]}
/>`,
  demo: ex("demo", "Classic (meyhane)", "menu-list/demo.tsx", Demo),
  examples: [
    ex("photo", "Photo (brunch)", "menu-list/photo.tsx", Photo, "A 72px square photo per item; items without one keep the column."),
    ex("service-list-spa", "Service list (spa, Turkish)", "menu-list/service-list-spa.tsx", ServiceSpa, "Service · duration · price rows; several durations become small columns; “Randevu” links are named after the service."),
    ex("qr-page", "QR menu at phone width", "menu-list/qr-page.tsx", QrPage, "The category bar scrolls horizontally and sticks under the top edge."),
  ],
  api: [
    {
      name: "MenuList",
      props: [
        { name: "variant", type: '"classic" | "photo" | "service-list"', default: '"classic"', description: "Layout." },
        { name: "categories", type: "{ title; note?; anchor?; items: MenuItem[] }[]", description: "Empty categories are hidden (shown in edit mode)." },
        { name: "categories[].items", type: "MenuItem[]", description: "{ name, description?, prices: { label?, amount?: Money }[] (1–4), duration?, tags?, allergens?, image?, unavailable?, bookHref? }" },
        { name: "tags", type: '("vegetarian" | "vegan" | "gluten-free" | "spicy" | "new" | "chef-pick")[]', description: "Rendered as accent-ink words." },
        { name: "allergens", type: "Allergen[]", description: "gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, nuts, celery, mustard, sesame, sulphites, lupin, molluscs." },
        { name: "priceNote", type: "ReactNode", description: "Tax / service note (required by the house rules)." },
        { name: "showNav", type: "boolean", default: "more than 2 categories", description: "Sticky category jump bar." },
        { name: "bookHref", type: "string", description: "service-list: booking page for every row." },
        { name: "showAllergens", type: "boolean", default: "true", description: "Allergen line under items." },
        { name: "labels / locale", type: "Partial<Site2Labels> / string", description: "Tag and allergen names, Market price, Not today, Book." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    { name: "menuJsonLd({ categories, name? })", props: [{ name: "returns", type: "object", description: "schema.org Menu → MenuSection → MenuItem + Offer (+ suitableForDiet)." }] },
  ],
  covers: ["Menu / price list"],
};

export default entry;

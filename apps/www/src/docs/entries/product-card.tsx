import { ex, type DocEntry } from "../types";
import Demo from "../examples/product-card/demo";
import Grid from "../examples/product-card/grid";
import List from "../examples/product-card/list";
import Slots from "../examples/product-card/slots";
import Mobile from "../examples/product-card/mobile";

const entry: DocEntry = {
  slug: "product-card",
  title: "Product card & grid",
  group: "Site blocks",
  description:
    "Product tiles for shops. ProductCard: the photo (a second photo on hover, or one photo per colour swatch), sale, new and sold-out badges, vendor and title (the title link covers the card), the price (sale price with the regular one struck through, or a range), star rating, colour swatches as native radios that swap the photo with CSS, and slots for quick add and wishlist. No cart logic inside. ProductGrid: a section with header and “Shop all”, 2–5 columns by container width, a list variant with the photo beside the text, an empty state and ItemList JSON-LD; bare renders only the list. productJsonLd builds the Product node for a product page.",
  source: ["blocks/site/product-grid.tsx", "blocks/site/product-card.tsx", "styles/commerce.css"],
  basedOn: "Native radios + :has()",
  usage: `import { ProductCard, ProductGrid, productJsonLd, JsonLd } from "@vamos-ui/react/blocks";

<ProductGrid
  title="New this *week*"
  columns={4}
  allLink={{ href: "/shop", label: "Shop all" }}
  products={[{
    title: "Morning cup", href: "/shop/morning-cup", image,
    price: { amount: "28", currency: "USD" }, compareAt: { amount: "34", currency: "USD" },
    rating: { value: 4.6, count: 128 },
    swatches: [{ name: "Clay foot", color: "#e8dcc8", image: clayPhoto }, { name: "Chalk", color: "#f4f1ea", image: chalkPhoto }],
  }]}
/>

// product page
<JsonLd data={productJsonLd(product, { url: "https://shop.example.com/shop/morning-cup", brand: "Kilnhouse" })} />`,
  demo: ex("demo", "Cards: swatches, sale, quick add", "product-card/demo.tsx", Demo),
  examples: [
    ex("grid", "Grid section (4 columns)", "product-card/grid.tsx", Grid, "Header, “Shop all”, sale / new / sold-out badges, a price range and a hover photo. Columns step 4 → 3 → 2 → 1 with the container."),
    ex("list", "List variant (bare)", "product-card/list.tsx", List, "variant=\"list\" puts the photo beside the text; bare drops Section and header. cardProps sets aspect, saleStyle and rangeStyle for every card."),
    ex("slots", "Wishlist and quick-add slots", "product-card/slots.tsx", Slots, "Your own controls on the photo. The built-in + button (onQuickAdd) is the alternative to the quickAdd slot."),
    ex("mobile", "Phone width", "product-card/mobile.tsx", Mobile, "One column; quick add is always visible on touch screens."),
  ],
  api: [
    {
      name: "ProductCard",
      props: [
        { name: "title / href / vendor", type: "string / string / ReactNode", description: "The title link covers the card; vendor sits above it." },
        { name: "image / hoverImage", type: "SiteImage", description: "Photo, and a second photo shown on hover / focus." },
        { name: "price / compareAt", type: "MoneyValue", description: "compareAt above price → sale price, struck-through regular price, sale badge." },
        { name: "priceRange / rangeStyle", type: "{ min; max } / \"from\" | \"range\"", default: '— / "from"', description: "“From $54” or “$54 – $88”." },
        { name: "isNew / soldOut / badge", type: "boolean / boolean / ReactNode", description: "Badges top-start. soldOut also disables the built-in quick add." },
        { name: "rating", type: "{ value; count? }", description: "StarRating, small." },
        { name: "swatches / maxSwatches", type: "{ name; color; image?; soldOut? }[] / number", default: "— / 5", description: "Native radios; up to 8 swap the photo with CSS; more show “+N more”." },
        { name: "swatchIndex / defaultSwatchIndex / onSwatchChange", type: "number / number / (i) => void", description: "Controlled from a client component, or uncontrolled." },
        { name: "quickAdd / onQuickAdd", type: "ReactNode / (swatchIndex) => void", description: "Your own control, or a built-in round + button." },
        { name: "wishlist", type: "ReactNode", description: "A control top-end on the photo." },
        { name: "onNavigate", type: "(swatchIndex) => void", description: "Runs when the title link is followed." },
        { name: "layout / size / aspect / sizes / priority / headingLevel", type: '"stack" | "row" / "md" | "lg" / ImageAspect / string / boolean / 2 | 3 | 4', default: '"stack" / "md" / "4:5" / — / — / 3', description: "Card shape and photo loading." },
        { name: "saleStyle", type: '"percent" | "label"', default: '"percent"', description: "Sale badge “−20%” or “Sale”." },
        { name: "labels / locale / components", type: "Partial<CommerceLabels> / string / BlockAdapters", description: "Strings, money format, Image / Link adapters." },
      ],
    },
    {
      name: "ProductGrid",
      props: [
        { name: "products", type: "ProductCardData[]", description: "The cards." },
        { name: "variant / columns", type: '"grid" | "list" / 2 | 3 | 4 | 5', default: '"grid" / 4', description: "Responsive columns by container width, or one row per product." },
        { name: "eyebrow / title / lead / allLink", type: "ReactNode / SiteLink", description: "Section header; the title also names the list." },
        { name: "cardProps / renderCard", type: "Partial<ProductCardProps> / (product, i) => ReactNode", description: "Shared card props, or render each card yourself." },
        { name: "priorityCount", type: "number", default: "0", description: "Eager photos for the first row." },
        { name: "bare / listLabel", type: "boolean / string", description: "Only the list (no section); its name when there is no title." },
        { name: "empty", type: "{ title?; text?; action? }", description: "Empty state." },
        { name: "jsonLd / siteUrl", type: "boolean / string", default: "false", description: "ItemList JSON-LD of product URLs." },
        { name: "theme / anchor / id / className / headingLevel / components / editMode", type: "BlockBaseProps", description: "Shared block props." },
      ],
    },
    {
      name: "productJsonLd(product, options)",
      props: [{ name: "options", type: "{ url?; sku?; brand?; description?; images? }", description: "Product with Offer / AggregateOffer, availability and AggregateRating." }],
    },
  ],
  notes: ["Put productJsonLd on the product page only, not on every card in a grid."],
  covers: ["Product card & grid"],
};

export default entry;

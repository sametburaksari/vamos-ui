import { ex, type DocEntry } from "../types";
import LinkPreviewsDemo from "../examples/link-previews/demo";
import LinkPreviewsSearch from "../examples/link-previews/search-desktop-mobile";
import LinkPreviewsSocial from "../examples/link-previews/social-cards";
import LinkPreviewsFallbacks from "../examples/link-previews/fallbacks";
import LinkPreviewsLengthMeter from "../examples/link-previews/length-meter";

const entry: DocEntry = {
  slug: "link-previews",
  title: "Link previews",
  group: "Media",
  description:
    "Shows how a URL will look in a search result (desktop and mobile, truncated by pixel width like the real thing) and as a shared card on Facebook, LinkedIn, X, WhatsApp and Slack, with length meters and image warnings. For SEO panels, product pages and shareable quote links.",
  source: ["media/link-preview.tsx", "media/serp.ts", "styles/media.css"],
  basedOn: "Pure (canvas measureText for pixel widths)",
  usage: `import { LinkPreviewTabs, SearchPreview, SocialCardPreview, LengthMeter } from "@vamos-ui/react/media";

<LinkPreviewTabs data={{ url, title, description, siteName, image }} highlight={focusKeyword} />
<LengthMeter value={seoTitle} field="title" label="SEO title" />`,
  demo: ex("demo", "Demo", "link-previews/demo.tsx", LinkPreviewsDemo),
  examples: [
    ex("search-desktop-mobile", "Search: desktop and mobile", "link-previews/search-desktop-mobile.tsx", LinkPreviewsSearch, "Titles are cut at ≈600 px on desktop with the ellipsis at a word; the focus keyword is bolded."),
    ex("social-cards", "Social cards: every platform", "link-previews/social-cards.tsx", LinkPreviewsSocial, "Each platform's own layout and theme. appearance=\"auto\" follows the surrounding light/dark theme."),
    ex("fallbacks", "Missing fields and warnings", "link-previews/fallbacks.tsx", LinkPreviewsFallbacks, "Greyed fallbacks, a noindex banner, and warnings for a missing, square or small image — said in words."),
    ex("length-meter", "Length meters (SEO panel)", "link-previews/length-meter.tsx", LinkPreviewsLengthMeter, "Counts graphemes and rendered pixels: \"52 of 60 characters, 498 of 600 px: good\"."),
  ],
  api: [
    { name: "LinkPreviewData", props: [
      { name: "url / title", type: "string", description: "Required. An empty title shows the \"Untitled page\" fallback." },
      { name: "description", type: "string", description: "Meta / OG description." },
      { name: "siteName / favicon", type: "string", description: "Shown in the search header and Slack." },
      { name: "image", type: "MediaAsset | string | null", description: "OG image. Assets use variants.og when present and are checked for ratio and size." },
      { name: "publishedAt", type: 'Date | "YYYY-MM-DD"', description: "Date before the description (locale dateStyle: medium)." },
      { name: "breadcrumbs", type: "string[]", description: "Replaces the URL path in the search breadcrumb." },
      { name: "twitterCard", type: '"summary" | "summary_large_image"', default: '"summary_large_image"', description: "X card type." },
      { name: "noindex", type: "boolean", description: "Shows \"Hidden from search engines\"." },
    ] },
    { name: "SearchPreview", props: [
      { name: "data", type: "LinkPreviewData", description: "The page." },
      { name: "device", type: '"desktop" | "mobile"', default: '"desktop"', description: "Layout and truncation widths." },
      { name: "highlight", type: "string", description: "Keyword to bold in the description (locale-aware)." },
      { name: "appearance", type: '"light" | "dark" | "auto"', default: '"auto"', description: "auto follows the surrounding theme." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "sm for sidebars." },
    ] },
    { name: "SocialCardPreview", props: [
      { name: "platform", type: '"facebook" | "linkedin" | "x" | "whatsapp" | "slack"', description: "Which card." },
      { name: "data / appearance / size", type: "as above", description: "—" },
      { name: "hideWarnings", type: "boolean", default: "false", description: "Hide the image warnings under the card." },
    ] },
    { name: "LengthMeter", props: [
      { name: "value", type: "string", description: "Text to measure (graphemes)." },
      { name: "field", type: '"title" | "description"', description: "Also measure the SERP pixel width and use its ideal range." },
      { name: "max / min", type: "number", default: "SERP ideal, else 160 / 0", description: "Character limits; below min is \"too short\"." },
      { name: "device", type: '"desktop" | "mobile"', default: '"desktop"', description: "Pixel limits." },
      { name: "label", type: "string", description: "Accessible name (role=\"meter\")." },
    ] },
    { name: "LinkPreviewTabs", props: [
      { name: "platforms", type: '("search" | SocialPlatform)[]', default: '["search", "facebook", "x", "whatsapp"]', description: "Tabs to show; search has a desktop/mobile switch." },
      { name: "defaultValue / highlight / appearance / size", type: "—", description: "Passed through." },
    ] },
    { name: "measureSerp(text, field, device?, locale?)", props: [
      { name: "→", type: "{ px, maxPx, truncated, cutAt, display }", description: "Pixel width and where a search engine cuts the text. Constants in SERP_LIMITS (versioned)." },
    ] },
  ],
  notes: [
    "The one deliberate token exception: the previews imitate third-party UIs (white background, link blue, system fonts, each platform's own dark theme) through local --preview-* variables in styles/media.css. The frame, meters and warnings use kit tokens.",
    "Preview content is real, readable text (role=\"figure\" with a label); meters never rely on colour alone.",
  ],
  covers: ["Link previews (search · social card)"],
};

export default entry;

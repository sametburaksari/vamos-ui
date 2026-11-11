import { ex, type DocEntry } from "../types";
import PlaceholderArtDemo from "../examples/placeholder-art/demo";
import PlaceholderArtPatterns from "../examples/placeholder-art/patterns";
import ImageWithoutSrc from "../examples/placeholder-art/image-without-src";
import PlaceholderArtLoadingError from "../examples/placeholder-art/loading-error";
import PlaceholderArtHero from "../examples/placeholder-art/hero";

const entry: DocEntry = {
  slug: "placeholder-art",
  title: "Placeholder Art",
  group: "Media",
  description:
    "Tasteful stand-ins for missing images: a token-tinted pattern (grid, dots, lines, rings or glow) picked deterministically from a seed string, with an optional glyph and caption. No assets, no network, no dependencies — it follows theme and accent. Image uses it automatically when there is no src, so blocks never need hard-coded stock photos.",
  source: ["components/placeholder-art.tsx", "components/image.tsx"],
  basedOn: "CSS gradients (no dependencies)",
  usage: `import { Image, PlaceholderArt } from "@vamos-ui/react";

// Image with no src renders art, named by alt
<Image src={post.cover} alt={post.title} aspect="16/9" />

// Art while loading and on error
<Image src={url} alt="Team offsite" aspect="4/3" placeholder="art" />

// Standalone (fills its parent)
<PlaceholderArt seed="harbour-terrace" label="Harbour terrace" caption />`,
  demo: ex("demo", "Demo", "placeholder-art/demo.tsx", PlaceholderArtDemo),
  examples: [
    ex("patterns", "Patterns", "placeholder-art/patterns.tsx", PlaceholderArtPatterns, "The seed picks the pattern, tint (a chart palette slot), angle and focal point. pattern forces one."),
    ex("image-without-src", "Image without a src (blog list)", "placeholder-art/image-without-src.tsx", ImageWithoutSrc, "src null, undefined or \"\" renders art at the given aspect (4:3 if none) with alt as its accessible name. seed defaults to alt."),
    ex("loading-error", "While loading and on error", "placeholder-art/loading-error.tsx", PlaceholderArtLoadingError, "placeholder=\"art\" shows the art under a loading image and keeps it when the source fails. placeholderCaption prints the alt."),
    ex("hero", "Site hero before photography", "placeholder-art/hero.tsx", PlaceholderArtHero, "strength=\"bold\" for large areas, a custom glyph and a caption that says what goes there."),
  ],
  api: [
    { name: "PlaceholderArt", props: [
      { name: "seed", type: "string", default: "label", description: "Any stable string (slug, title, record id). Same seed → same art on server and client." },
      { name: "pattern", type: '"auto" | "grid" | "dots" | "lines" | "rings" | "glow"', default: '"auto"', description: "Force a pattern; auto picks from the seed." },
      { name: "label", type: "string", description: "What the missing image would show. Set → role=\"img\" with this name; unset → decorative (aria-hidden)." },
      { name: "icon", type: "ReactNode | false", default: "image glyph", description: "Centre glyph in a small frosted ring. false hides it." },
      { name: "caption", type: "boolean | ReactNode", description: "true prints the label in the bottom corner; or pass your own text." },
      { name: "strength", type: '"subtle" | "bold"', default: '"subtle"', description: "bold raises the tint for large hero areas." },
    ] },
    { name: "Image (placeholder props)", props: [
      { name: "src", type: "string | MediaAsset | null", description: "null, undefined or \"\" renders art (alt required, \"\" = decorative)." },
      { name: "placeholder", type: '"blur" | "color" | "skeleton" | "art" | "none"', description: "art: seeded art while loading and as the error fallback (unless fallback is set)." },
      { name: "seed", type: "string", default: "alt, then URL", description: "Seed for the art." },
      { name: "placeholderPattern", type: "PlaceholderArtPattern | \"auto\"", default: '"auto"', description: "Force the art pattern." },
      { name: "placeholderIcon", type: "ReactNode | false", description: "Glyph in the art; false hides it." },
      { name: "placeholderCaption", type: "boolean | ReactNode", description: "true prints alt as a caption on the art." },
    ] },
    { name: "Helpers (pure, server-safe)", props: [
      { name: "placeholderArtRecipe(seed, pattern?)", type: "→ PlaceholderArtRecipe", description: "{ pattern, hue, hue2, angle, cell, x, y } from an FNV-1a hash of the seed." },
      { name: "placeholderArtStyle(recipe, strength?)", type: "→ CSSProperties", description: "The background for a recipe — use it on your own element." },
      { name: "hashSeed(seed)", type: "→ number", description: "32-bit FNV-1a hash." },
      { name: "PLACEHOLDER_ART_PATTERNS", type: "PlaceholderArtPattern[]", description: "All pattern names." },
    ] },
  ],
  notes: [
    "Colours are color-mix() of --chart-1…6 and --surface-2, so the art follows dark mode and the accent (chart-1 is the accent ink).",
    "PlaceholderArt has no client code and renders in server components. It fills its parent: give the parent a size, or use it inside AspectRatio or Image.",
    "Placeholder art is a stand-in, not decoration: give it a label when the image carries meaning, so screen readers still hear what belongs there.",
  ],
  covers: ["Placeholder art"],
};

export default entry;

import { ex, type DocEntry } from "../types";
import SlugInputDemo from "../examples/slug-input/demo";
import SlugInputField from "../examples/slug-input/field";
import SlugInputUnique from "../examples/slug-input/unique";
import SlugLocales from "../examples/slug-input/locales";
import SlugStates from "../examples/slug-input/states";

const entry: DocEntry = {
  slug: "slug-input",
  title: "Slug input",
  group: "Forms & inputs",
  description:
    "A URL segment derived from a title with locale transliteration — \"İşe Alım & Oryantasyon\" becomes ise-alim-ve-oryantasyon in Turkish. It follows the title until someone edits it, sanitises as you type without moving the caret, and can check uniqueness and suggest a free alternative.",
  source: ["components/slug-input.tsx", "lib/text.ts", "lib/use-formatted-input.ts"],
  basedOn: "Input · slugify (lib/text)",
  usage: `import { Field, SlugInput } from "@vamos-ui/react";

<Field label="URL">
  <SlugInput
    source={title}
    prefix="vamos.ist/blog/"
    validate={(slug, signal) => api.checkSlug(slug, { signal })}  // true | "Used by …"
    suggestUnique={(slug) => api.suggestSlug(slug)}
    name="slug"
  />
</Field>`,
  demo: ex("demo", "Demo", "slug-input/demo.tsx", SlugInputDemo),
  examples: [
    ex("field", "Field variant", "slug-input/field.tsx", SlugInputField, "Always an input. New content follows the source (Auto badge); saved content starts locked; the refresh button regenerates from the title."),
    ex("unique", "Uniqueness check", "slug-input/unique.tsx", SlugInputUnique, "validate is debounced and aborted when the slug changes; the result is announced politely and linked to the input."),
    ex("locales", "Locale rules", "slug-input/locales.tsx", SlugLocales, "slugify() lowercases with the locale, transliterates (tr ç→c ı→i, de ä→ae ß→ss), strips marks and turns & into the locale's word."),
    ex("states", "States", "slug-input/states.tsx", SlugStates, "Disabled and a Field error, small size."),
  ],
  api: [
    { name: "SlugInput", props: [
      { name: "value / defaultValue / onValueChange", type: "string", description: "The slug." },
      { name: "source", type: "string", description: "Text to derive from (the title) while unlocked." },
      { name: "locked / defaultLocked / onLockedChange", type: "boolean", default: "true when there is an initial slug", description: "Manual mode: stops following source. Editing the slug locks it." },
      { name: "prefix", type: "string", description: "Shown before the slug (vamos.ist/blog/). A URL prefix also makes the permalink a link." },
      { name: "variant", type: '"field" | "permalink"', default: '"field"', description: "permalink: a link with Edit; Enter confirms, Escape restores and returns focus." },
      { name: "href", type: "string", description: "Permalink target override." },
      { name: "maxLength", type: "number", default: "80", description: "Cut at a word boundary when possible." },
      { name: "locale", type: "string", default: "provider locale", description: "Transliteration rules." },
      { name: "validate", type: "(slug, signal: AbortSignal) => Promise<string | true>", description: "Uniqueness check: true when free, else a message." },
      { name: "suggestUnique", type: "(slug) => Promise<string>", description: "Offers \"Use spring-menu-2\" after a failed check." },
      { name: "validateDelay", type: "number", default: "350", description: "Debounce in ms." },
      { name: "name", type: "string", description: "Hidden input with the slug (falls back to the Field's name)." },
      { name: "size · disabled · invalid · placeholder", type: "Input props", description: "Same box as Input." },
      { name: "labels", type: "Partial<SlugInputLabels>", description: "Built-in strings (slug namespace)." },
    ] },
  ],
  notes: ["Redirects on slug change (\"Create a 301\") belong to your publishing flow: listen to onValueChange and keep the previous value."],
  covers: ["Slug input"],
};

export default entry;

import { ex, type DocEntry } from "../types";
import TagInputDemo from "../examples/tag-input/demo";
import TagInputSuggestions from "../examples/tag-input/suggestions";
import TagInputEmails from "../examples/tag-input/emails";
import TagInputMax from "../examples/tag-input/max";
import TagInputPaste from "../examples/tag-input/paste";
import TagInputStates from "../examples/tag-input/states";

const entry: DocEntry = {
  slug: "tag-input",
  title: "Tag input",
  group: "Forms & inputs",
  description:
    "Free-form multi-value entry: post tags, contact segments, skills, invoice recipients, keywords. Chips sit inside the box with a trailing text input; Enter, Tab or comma add, pasted lists split, duplicates are caught with locale folding, and every add or removal is announced.",
  source: ["components/tag-input.tsx", "lib/use-async-list.ts", "lib/text.ts", "components/badge.tsx", "styles/forms.css"],
  basedOn: "Badge chips + Radix Popover (suggestions)",
  usage: `import { Field, TagInput } from "@vamos-ui/react";

<Field label="Tags">
  <TagInput name="tags" suggestions={existingTags} max={10} />
</Field>

<TagInput validate={(v) => /^\\S+@\\S+\\.\\S+$/.test(v) || "Not an email address"} />`,
  demo: ex("demo", "Demo", "tag-input/demo.tsx", TagInputDemo),
  examples: [
    ex("suggestions", "Suggestions (CRM segments)", "tag-input/suggestions.tsx", TagInputSuggestions, "suggestions turns the input into a combobox: ↑/↓ move, Enter picks. Already-added tags are hidden. tagTone colours chips per tag. Pass a function (query, signal) for server suggestions."),
    ex("emails", "Recipients with validation", "tag-input/emails.tsx", TagInputEmails, "validate keeps invalid entries as danger chips (with the message for screen readers) and marks the field invalid. Space and semicolon are delimiters here; addOnBlur commits what's left."),
    ex("max", "Maximum (SEO keywords)", "tag-input/max.tsx", TagInputMax, "max shows a counter and makes the input read-only when full; the limit is part of the description. maxLength rejects long tags."),
    ex("paste", "Paste a list (HR)", "tag-input/paste.tsx", TagInputPaste, "Pasting splits on commas, semicolons, tabs and newlines — straight from a spreadsheet column."),
    ex("states", "Sizes & states", "tag-input/states.tsx", TagInputStates, "sm and md, empty, error from Field, read-only (no remove buttons), disabled and ghost."),
  ],
  api: [
    {
      name: "TagInput",
      props: [
        { name: "value / defaultValue", type: "string[]", default: "[]", description: "Tags (controlled / uncontrolled)." },
        { name: "onValueChange", type: "(tags: string[]) => void", description: "Called with the next array." },
        { name: "suggestions", type: "string[] | (query, signal) => Promise<string[]>", description: "Static list (locale-folded filter) or a debounced, abortable loader." },
        { name: "allowCustom", type: "boolean", default: "true", description: "false: only suggestions can be added." },
        { name: "delimiters", type: "string[]", default: '["Enter", "Tab", ","]', description: "Keys that commit. Paste always splits on , ; tab and newline." },
        { name: "max", type: "number", description: "Maximum number of tags; shows a counter." },
        { name: "maxLength", type: "number", description: "Maximum characters per tag." },
        { name: "validate", type: "(tag) => string | true", description: "Error message for an invalid tag; kept as a danger chip." },
        { name: "transform", type: "(tag) => string", default: "trim + collapse spaces", description: "Normalise before adding (e.g. lowercase emails)." },
        { name: "dedupe", type: '"fold" | "exact"', default: '"fold"', description: "fold treats “İstanbul” and “istanbul” as the same tag (current locale)." },
        { name: "tagTone", type: "(tag) => BadgeProps[\"tone\"]", description: "Chip tone per tag." },
        { name: "addOnBlur", type: "boolean", default: "false", description: "Commit the typed text when focus leaves." },
        { name: "name", type: "string", description: "One hidden input per tag (formData.getAll(name))." },
        { name: "placeholder", type: "string", default: '"Add a tag…"', description: "Shown while there are no tags." },
        { name: "size / variant", type: '"sm" | "md"  ·  "default" | "ghost"', default: '"md" · "default"', description: "Box look from controlVariants." },
        { name: "disabled / readOnly / invalid / required", type: "boolean", description: "Also inherited from Field." },
        { name: "labels", type: "Partial<TagInputLabels>", description: "placeholder, list, suggestions, added, removed, duplicate, max, notAllowed, tooLong, invalid, remove, loading." },
      ],
    },
  ],
  notes: [
    "Keyboard: Backspace on the empty input moves focus to the last chip; a second Backspace (or Delete) removes it. ←/→ move between chips and back to the input; typing on a chip returns to the input.",
    "Chips are a list (role=list) with one remove button each; the input is a combobox only when suggestions are given.",
    "Typing a duplicate pulses the existing chip (no animation under reduced motion) and keeps the text for editing.",
    "Hierarchical categories belong in Tree select, not Tag input.",
  ],
  covers: ["Tag input"],
};

export default entry;

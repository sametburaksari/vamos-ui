"use client";

import { Field, TagInput } from "@vamos-cms/ui";

const segments = ["Enterprise", "Mid-market", "Startups", "Event attendees", "Newsletter", "Trial users", "Churn risk", "Partners", "Istanbul office", "Berlin office"];

export default function TagInputSuggestions() {
  return (
    <Field label="Segments" hint="Pick from existing segments or create a new one." className="w-full max-w-md">
      <TagInput
        name="segments"
        suggestions={segments}
        defaultValue={["Enterprise"]}
        placeholder="Add segment…"
        tagTone={(tag) => (tag === "Churn risk" ? "warning" : tag === "Enterprise" ? "accent" : "neutral")}
      />
    </Field>
  );
}

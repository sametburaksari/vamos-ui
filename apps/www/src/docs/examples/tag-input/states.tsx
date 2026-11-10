import { Field, TagInput } from "@vamos-ui/react";

export default function TagInputStates() {
  return (
    <div className="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <Field label="Small">
        <TagInput size="sm" defaultValue={["draft", "q4"]} />
      </Field>
      <Field label="Empty">
        <TagInput placeholder="No tags yet" />
      </Field>
      <Field label="With error" error="Add at least one tag.">
        <TagInput />
      </Field>
      <Field label="Read-only" hint="Synced from the CRM.">
        <TagInput readOnly defaultValue={["Enterprise", "EMEA"]} />
      </Field>
      <Field label="Disabled">
        <TagInput disabled defaultValue={["Archived"]} />
      </Field>
      <Field label="Ghost">
        <TagInput variant="ghost" defaultValue={["inline", "toolbar"]} />
      </Field>
    </div>
  );
}

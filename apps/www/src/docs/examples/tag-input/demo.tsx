import { Field, TagInput } from "@vamos-cms/ui";

export default function TagInputDemo() {
  return (
    <Field label="Tags" hint="Press Enter or comma to add. Backspace on the empty box edits the last tag." className="w-full max-w-md">
      <TagInput name="tags" defaultValue={["Product design", "Case study"]} placeholder="Add a tag…" />
    </Field>
  );
}

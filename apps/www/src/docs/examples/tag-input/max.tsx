import { Field, TagInput } from "@vamos-cms/ui";

export default function TagInputMax() {
  return (
    <Field label="Focus keywords" hint="Search engines read at most five; extra ones are ignored." className="w-full max-w-md">
      <TagInput name="keywords" max={5} maxLength={40} defaultValue={["booking software", "online appointments", "salon scheduling", "spa"]} />
    </Field>
  );
}

import { Field, Textarea } from "@vamos-ui/react";

export default function TextareaDemo() {
  return (
    <Field label="Excerpt" hint="Grows as you type." className="w-full max-w-md">
      <Textarea rows={3} placeholder="A short summary of the post…" />
    </Field>
  );
}

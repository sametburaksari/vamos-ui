import { Field, Input } from "@vamos-ui/react";

export default function InputCount() {
  return (
    <Field label="SEO title" hint="Shown as the headline in Google results." className="w-full max-w-md">
      <Input maxLength={60} showCount defaultValue="Spring menu 2026: twelve new dishes in Kadıköy" />
    </Field>
  );
}

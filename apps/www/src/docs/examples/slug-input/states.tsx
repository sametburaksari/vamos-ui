import { Field, SlugInput } from "@vamos-ui/react";

export default function SlugStates() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      <Field label="Published (locked by the publish workflow)" disabled>
        <SlugInput defaultValue="privacy-policy" prefix="vamos.ist/legal/" />
      </Field>
      <Field label="Category URL" error="Slugs can't be reserved words like admin or api.">
        <SlugInput defaultValue="admin" prefix="shop.vamos.ist/c/" size="sm" />
      </Field>
    </div>
  );
}

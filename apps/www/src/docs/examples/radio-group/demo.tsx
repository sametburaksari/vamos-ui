import { Field, RadioGroup } from "@vamos-cms/ui";

export default function RadioGroupDemo() {
  return (
    <Field label="Visibility">
      <RadioGroup
        name="visibility"
        defaultValue="public"
        items={[
          { value: "public", label: "Public", description: "Anyone with the link can read this post." },
          { value: "private", label: "Private", description: "Only people in your workspace." },
          { value: "password", label: "Password protected", description: "Readers need a password you share." },
        ]}
      />
    </Field>
  );
}

import { Field, FormattedInput } from "@vamos-cms/ui";

export default function MaskExample() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-3">
      <Field label="Order reference" hint="# digit, A letter.">
        <FormattedInput mask="AA-####-###" uppercase mono defaultValue="VM2026114" />
      </Field>
      <Field label="Card expiry">
        <FormattedInput mask="##/##" inputMode="numeric" placeholder="MM/YY" mono />
      </Field>
      <Field label="US phone (fixed)">
        <FormattedInput mask="(###) ###-####" inputMode="tel" mono />
      </Field>
    </div>
  );
}

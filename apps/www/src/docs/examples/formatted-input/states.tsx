import { CurrencyInput, Field, IbanInput, NumberInput, PhoneInput } from "@vamos-ui/react";

export default function FormattedStates() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Field label="Approved budget" readOnly>
        <CurrencyInput currency="USD" defaultValue="18000" />
      </Field>
      <Field label="Quantity" disabled>
        <NumberInput defaultValue={3} stepper />
      </Field>
      <Field label="Office line (small)">
        <PhoneInput size="sm" defaultCountry="TR" defaultValue="+902125550000" />
      </Field>
      <Field className="sm:col-span-2" label="Refund to" error="Invalid IBAN checksum. Check it for typos.">
        <IbanInput defaultValue="TR180006200012345678901234" />
      </Field>
    </div>
  );
}

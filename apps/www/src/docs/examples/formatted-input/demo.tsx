import { CurrencyInput, Field, IbanInput, PhoneInput, TaxIdInput } from "@vamos-cms/ui";

export default function FormattedInputDemo() {
  return (
    <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
      <Field label="Invoice total" hint="Including 20% VAT.">
        <CurrencyInput currency="EUR" defaultValue="4280.00" align="end" />
      </Field>
      <Field label="Supplier tax number">
        <TaxIdInput defaultValue="1847205636" />
      </Field>
      <Field label="Accounts contact" className="sm:col-span-2">
        <PhoneInput defaultCountry="TR" defaultValue="+902165550148" />
      </Field>
      <Field label="Pay to IBAN" className="sm:col-span-2">
        <IbanInput defaultValue="TR530004600078150004761932" />
      </Field>
    </div>
  );
}

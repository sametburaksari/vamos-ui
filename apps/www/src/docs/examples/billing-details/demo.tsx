"use client";

import * as React from "react";
import { Button } from "@vamos-ui/react";
import { BillingDetailsFields, billingErrorMessages, validateBillingDetails, type BillingDetails, type BillingField, type BillingParty } from "@vamos-ui/react/business";

export default function BillingDetailsDemo() {
  const [details, setDetails] = React.useState<BillingDetails>({ type: "individual", address: { country: "TR" } });
  const [errors, setErrors] = React.useState<Partial<Record<BillingField, string>>>({});
  const [party, setParty] = React.useState<BillingParty>();
  return (
    <form
      noValidate
      className="grid w-full max-w-xl gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const v = validateBillingDetails(details);
        setErrors(billingErrorMessages(v.errors));
        setParty(v.party);
      }}
    >
      <BillingDetailsFields name="billing" value={details} onValueChange={setDetails} errors={errors} hint="Try 10000000146 as a TCKN, or a VKN / TCKN for a company." />
      <Button type="submit" variant="primary" className="justify-self-start">
        Continue to payment
      </Button>
      {party ? (
        <pre className="overflow-x-auto rounded-ui bg-surface-2 px-3.5 py-3 text-[12px] leading-relaxed text-fg-muted">{JSON.stringify(party, null, 2)}</pre>
      ) : null}
    </form>
  );
}

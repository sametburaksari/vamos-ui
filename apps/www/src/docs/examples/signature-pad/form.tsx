"use client";

import * as React from "react";
import { Button, Checkbox, Field, SignaturePad, type SignatureValue } from "@vamos-ui/react";

export default function SignatureConsentForm() {
  const [signature, setSignature] = React.useState<SignatureValue | null>(null);
  const [tried, setTried] = React.useState(false);
  const [done, setDone] = React.useState<string>();
  return (
    <form
      className="grid w-full max-w-lg gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (signature) setDone(`Signed (${signature.kind}) — ${Math.round(signature.svg.length / 1024)} kB SVG${signature.png ? " + PNG" : ""}`);
      }}
    >
      <div className="rounded-ui bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-fg-muted">
        I confirm the treatment plan discussed today and consent to the 6-session laser programme at Moda Wellness, Kadıköy.
      </div>
      <Field label="I have read the pre-treatment guidance" orientation="horizontal" required>
        <Checkbox name="guidance" />
      </Field>
      <Field label="Client signature" required error={tried && !signature ? "Please sign to continue." : undefined}>
        <SignaturePad name="signature" exportPng penColor="accent" height={150} value={signature} onValueChange={setSignature} />
      </Field>
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary">
          Sign consent form
        </Button>
        {done ? <span className="text-xs text-fg-muted">{done}</span> : null}
      </div>
    </form>
  );
}

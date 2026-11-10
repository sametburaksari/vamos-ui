import { Field, SignaturePad } from "@vamos-ui/react";

export default function SignaturePadDemo() {
  return (
    <Field label="Received by" hint="Sign with a finger, pen or mouse — or switch to Type." className="w-full max-w-lg">
      <SignaturePad name="deliverySignature" />
    </Field>
  );
}

import { Field, InputOTP } from "@vamos-ui/react";

export default function InputOTPDemo() {
  return (
    <Field label="Verification code" hint="We sent a 6-digit code to +90 532 ••• 41 07.">
      <InputOTP name="code" />
    </Field>
  );
}

import { Field, InputOTP } from "@vamos-cms/ui";

export default function InputOTPGroups() {
  return (
    <div className="grid gap-6">
      <Field label="Code from your authenticator app">
        <InputOTP name="totp" groups={[3, 3]} size="lg" />
      </Field>
      <Field label="Backup code" hint="Letters and numbers, from the list you saved when you turned on 2FA.">
        <InputOTP name="backup" length={8} groups={[4, 4]} pattern="alphanumeric" />
      </Field>
      <Field label="Card PIN" hint="Masked — the characters are never shown.">
        <InputOTP name="pin" length={4} mask />
      </Field>
    </div>
  );
}

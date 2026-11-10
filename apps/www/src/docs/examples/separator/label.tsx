import { Button, Field, Input, Separator } from "@vamos-ui/react";

export default function SeparatorLabel() {
  return (
    <form className="grid w-full max-w-xs gap-4">
      <Button block>Continue with Google</Button>
      <Separator label="or sign in with email" />
      <Field label="Work email">
        <Input type="email" placeholder="you@company.com" />
      </Field>
      <Button variant="primary" block type="submit">
        Send magic link
      </Button>
    </form>
  );
}

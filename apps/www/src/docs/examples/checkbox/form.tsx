"use client";

import * as React from "react";
import { Button, Checkbox, Field } from "@vamos-ui/react";

export default function CheckboxForm() {
  const [error, setError] = React.useState<string>();
  return (
    <form
      className="grid w-full max-w-sm gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setError(data.get("terms") ? undefined : "Please accept the terms to create your account.");
      }}
    >
      <Field
        label={
          <>
            I agree to the <a className="text-accent-ink underline underline-offset-2" href="#terms">Terms of Service</a> and the{" "}
            <a className="text-accent-ink underline underline-offset-2" href="#privacy">Privacy Policy</a>
          </>
        }
        orientation="horizontal"
        required
        error={error}
      >
        <Checkbox name="terms" onCheckedChange={() => setError(undefined)} />
      </Field>
      <Field label="Send me product updates (about once a month)" orientation="horizontal">
        <Checkbox name="newsletter" />
      </Field>
      <Button type="submit" variant="primary" className="justify-self-start">
        Create account
      </Button>
    </form>
  );
}

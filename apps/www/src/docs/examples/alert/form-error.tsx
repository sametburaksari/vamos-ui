"use client";

import * as React from "react";
import { Alert, Button, Field, Input } from "@vamos-cms/ui";

export default function AlertFormError() {
  const [error, setError] = React.useState(false);
  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(true);
      }}
    >
      {/* Inserted after submit → live="assertive" announces it (role="alert"). */}
      {error ? (
        <Alert tone="danger" live="assertive" size="sm" title="Couldn't save the invoice">
          The IBAN doesn&apos;t match the bank country. Check it and try again.
        </Alert>
      ) : null}
      <Field label="IBAN" error={error ? "Expected a TR IBAN (26 characters)." : undefined}>
        <Input defaultValue="DE89 3704 0044 0532 0130 00" />
      </Field>
      <Button type="submit" variant="primary">
        Save invoice
      </Button>
    </form>
  );
}

"use client";

import * as React from "react";
import { Button, Field, InputOTP } from "@vamos-ui/react";

// In this demo the right code is 246810.
async function verify(code: string) {
  await new Promise((r) => setTimeout(r, 900));
  return code === "246810";
}

export default function InputOTPAutoSubmit() {
  const [code, setCode] = React.useState("");
  const [state, setState] = React.useState<"idle" | "verifying" | "error" | "ok">("idle");
  return (
    <div className="grid w-full max-w-sm gap-4">
      <Field
        label="Confirm the payment"
        hint={state === "ok" ? "Payment confirmed — 1,250.00 € to Bright Labs GmbH." : "Enter the code your bank sent. Hint: 246810."}
        error={state === "error" ? "That code is incorrect. 2 attempts left." : undefined}
      >
        <InputOTP
          name="otp"
          groups={[3, 3]}
          value={code}
          onValueChange={(v) => {
            setCode(v);
            if (state === "error") setState("idle");
          }}
          loading={state === "verifying"}
          disabled={state === "ok"}
          autoFocus
          onComplete={async (v) => {
            setState("verifying");
            setState((await verify(v)) ? "ok" : "error");
          }}
        />
      </Field>
      <div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setCode("");
            setState("idle");
          }}
        >
          Send a new code
        </Button>
      </div>
    </div>
  );
}

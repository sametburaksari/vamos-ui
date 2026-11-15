"use client";

import { AuthDialog } from "@vamos-ui/react/blocks";
import { Button } from "@vamos-ui/react";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Reader sign-in with a password-recovery view in the same dialog. Any address ending in
// @example.com signs in; anything else shows the server's message.
export default function AuthDialogDemo() {
  return (
    <AuthDialog
      brand="The Harbour Ledger"
      joinHref="/join"
      trigger={<Button variant="secondary">Sign in / Join</Button>}
      onSignIn={async ({ email }) => {
        await wait(600);
        if (!email.endsWith("@example.com")) return "We couldn’t find that email and password together.";
      }}
      onRecover={async () => {
        await wait(600);
      }}
    />
  );
}

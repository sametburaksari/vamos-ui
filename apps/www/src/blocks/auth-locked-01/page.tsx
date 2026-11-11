import { Toaster } from "@vamos-ui/react";
import { AuthBar } from "../auth-2fa-setup-01/components/kiln-brand";
import { LockedAccount } from "./components/locked-account";

/** Account locked after too many attempts: countdown, the failed attempts, and an email-code unlock flow. */
export default function AuthLocked01() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <AuthBar />
      <main className="mx-auto flex w-full max-w-[66rem] flex-1 flex-col justify-center px-4 pb-14 pt-2 sm:px-8">
        <LockedAccount />
      </main>
      <Toaster />
    </div>
  );
}

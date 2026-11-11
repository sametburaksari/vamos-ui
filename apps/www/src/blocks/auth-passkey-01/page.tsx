import { Toaster } from "@vamos-ui/react";
import { AuthBar } from "../auth-2fa-setup-01/components/kiln-brand";
import { PasskeyFlow } from "./components/passkey-flow";

/** Passkey sign-in ceremony, then the account's passkeys: add (with a device prompt), rename, remove with undo. */
export default function AuthPasskey01() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <AuthBar />
      <main className="flex flex-1 flex-col justify-center px-4 pb-16 pt-2 sm:px-8">
        <PasskeyFlow />
      </main>
      <Toaster />
    </div>
  );
}

import { Toaster } from "@vamos-ui/react";
import { AuthBar } from "./components/kiln-brand";
import { CancelLink } from "./components/cancel-link";
import { TwoFactorSetup } from "./components/two-factor-setup";

/** TOTP enrolment: QR + manual key, verify step with the live code window, backup codes, summary. */
export default function Auth2faSetup01() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <AuthBar end={<CancelLink />} />
      <main className="flex-1">
        <TwoFactorSetup />
      </main>
      <Toaster />
    </div>
  );
}

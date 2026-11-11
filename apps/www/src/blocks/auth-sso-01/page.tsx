import { Toaster } from "@vamos-ui/react";
import { AuthBar } from "../auth-2fa-setup-01/components/kiln-brand";
import { HowItWorks } from "./components/how-it-works";
import { SsoFinder } from "./components/sso-finder";

/** Find your organisation by email domain (or ID), then a staged redirect to its identity provider. */
export default function AuthSso01() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <AuthBar />
      <main className="mx-auto grid w-full max-w-[72rem] flex-1 gap-10 px-4 pb-12 pt-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-stretch lg:gap-16 lg:pb-8">
        <div className="mx-auto flex w-full max-w-[29rem] flex-col justify-center lg:py-10">
          <SsoFinder />
        </div>
        <HowItWorks />
      </main>
      <Toaster />
    </div>
  );
}

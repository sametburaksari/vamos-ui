import { KilnMark } from "../auth-2fa-setup-01/components/kiln-brand";
import { EmailFirstSignIn } from "./components/email-first-sign-in";
import { LegalFooter } from "./components/legal-footer";
import { ProductStory } from "./components/product-story";

/** Split-screen sign-in: the product told in three chapters on one side, social + email-first sign-in on the other. */
export default function Login03() {
  return (
    <div className="relative z-10 grid min-h-dvh lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)]">
      <div className="order-last lg:order-none">
        <ProductStory />
      </div>
      <div className="flex min-h-[88dvh] flex-col px-4 py-6 sm:px-10 lg:min-h-0 lg:px-16 lg:py-10">
        <a href="#" className="w-fit rounded-ui-sm focus-ring lg:hidden">
          <KilnMark />
        </a>
        <main className="mx-auto flex w-full max-w-[24rem] flex-1 flex-col justify-center py-6">
          <EmailFirstSignIn />
        </main>
        <LegalFooter />
      </div>
    </div>
  );
}

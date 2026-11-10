import { AuthFrame } from "../login-02/components/auth-frame";
import { MagicLink } from "./components/magic-link";

/** Passwordless sign-in: "check your email" state with mail shortcuts, resend cooldown and cross-device hint. */
export default function MagicLink01() {
  return (
    <AuthFrame
      topAction={
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">
          Need help?
        </a>
      }
    >
      <MagicLink />
    </AuthFrame>
  );
}

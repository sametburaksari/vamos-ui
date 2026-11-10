import { ShieldCheck } from "lucide-react";
import { Avatar, Card } from "@vamos-ui/react";
import { AuthFrame, AuthHeading } from "../login-02/components/auth-frame";
import { TwoFactorForm } from "./components/two-factor-form";

/** Two-step verification after the password: authenticator / SMS code with Input OTP, or a recovery code. */
export default function Otp01() {
  return (
    <AuthFrame
      topAction={
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">
          Sign out
        </a>
      }
    >
      <div className="ui-rise grid gap-6">
        <div className="flex items-center gap-3 self-start rounded-full border border-line py-1 ps-1 pe-3 text-[12.5px] text-fg-muted">
          <Avatar name="Maya Chen" size="xs" aria-hidden />
          <span>maya.chen@northwind.io</span>
        </div>
        <AuthHeading
          title={
            <span className="inline-flex items-center gap-2.5">
              <ShieldCheck aria-hidden className="size-[0.9em] shrink-0 text-accent-ink" strokeWidth={1.75} />
              Two-step verification
            </span>
          }
        >
          Your workspace requires a second step. Enter the 6-digit code — it fills in automatically from SMS or your password manager.
        </AuthHeading>
        <Card className="p-5 sm:p-7">
          <TwoFactorForm />
        </Card>
      </div>
    </AuthFrame>
  );
}

import { Card } from "@vamos-ui/react";
import { AuthFrame, AuthHeading } from "./components/auth-frame";
import { SignInForm } from "./components/sign-in-form";

/** Centred sign-in card with Google / Microsoft / GitHub and SAML SSO above email + password. */
export default function Login02() {
  return (
    <AuthFrame
      topAction={
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">
          Need help?
        </a>
      }
    >
      <div className="ui-rise grid gap-6">
        <AuthHeading title={<>Welcome <em>back</em></>}>Sign in to the Northwind workspace.</AuthHeading>
        <Card className="p-5 sm:p-7">
          <SignInForm />
        </Card>
        <p className="text-center text-[13px] text-fg-muted">
          New to Northpoint?{" "}
          <a href="#" className="rounded-ui-sm font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
            Create an account
          </a>
        </p>
      </div>
    </AuthFrame>
  );
}

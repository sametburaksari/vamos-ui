import { AuthFrame } from "../login-02/components/auth-frame";
import { ResetFlow } from "./components/reset-flow";

/** Forgot password → reset link sent → new password with strength meter → confirmation. */
export default function ForgotPassword01() {
  return (
    <AuthFrame
      topAction={
        <a href="#" className="rounded-ui-sm hover:text-fg focus-ring">
          Back to sign in
        </a>
      }
    >
      <ResetFlow />
    </AuthFrame>
  );
}

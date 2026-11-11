import { Toaster } from "@vamos-ui/react";
import { SessionExpired } from "./components/session-expired";

/** Session-expired re-auth dialog over the order desk; the unsaved note survives the sign-in. */
export default function AuthSession01() {
  return (
    <>
      <SessionExpired />
      <Toaster />
    </>
  );
}

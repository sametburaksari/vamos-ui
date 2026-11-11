import { AuthBar } from "../auth-2fa-setup-01/components/kiln-brand";
import { InviteAccept } from "./components/invite-accept";

/** Accept a team invite: the invitation (inviter, role, access, expiry) beside create-password or sign-in-to-join. */
export default function AuthInvite01() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <AuthBar />
      <main className="mx-auto flex w-full max-w-[66rem] flex-1 flex-col justify-center px-4 pb-14 pt-2 sm:px-8">
        <InviteAccept />
      </main>
    </div>
  );
}

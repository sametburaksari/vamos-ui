// Lockout data: the failed attempts come from the shared sign-in history so the security
// settings blocks tell the same story (three failures from Frankfurt, then a block).
import { signInHistory } from "../../_shared/account";
import { me } from "../../_shared/people";
import { NOW_MS } from "../../_shared/time";

export const account = { name: me.name, email: me.email };

/** "de•••@example.com" */
export const maskedEmail = (() => {
  const [user, domain] = me.email.split("@");
  return `${user!.slice(0, 2)}•••@${domain}`;
})();

export const LOCK_SECONDS = 15 * 60;
/** Seconds already elapsed when the page renders (deterministic for SSR). */
export const ELAPSED = 68;

/**
 * The shared history has these attempts two days ago; here they are the ones that just caused the
 * lock, so they are re-timed to end when the block started (ELAPSED seconds before NOW).
 */
export const attempts = signInHistory
  .filter((s) => s.result !== "success")
  .sort((a, b) => a.at.localeCompare(b.at))
  .map((s, i, all) => ({ ...s, at: new Date(NOW_MS - (ELAPSED + (all.length - 1 - i) * 47) * 1000).toISOString() }));

/** Demo rule for the emailed code. */
export const isUnlockCode = (code: string) => /^\d{6}$/.test(code) && code !== "000000";

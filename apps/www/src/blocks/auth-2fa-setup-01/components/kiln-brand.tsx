import * as React from "react";
import { cn } from "@vamos-ui/react";

/**
 * Brand pieces shared by the account-security blocks (2FA, passkeys, SSO, invites, lockout,
 * session expiry, login-03). "Kiln & Linen" is the fictional company that runs this back office.
 * Swap `KilnMark` for your own logo.
 */
export function KilnMark({ className, label = "Kiln & Linen" }: { className?: string; label?: string | false }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg", className)}>
      <svg viewBox="0 0 28 28" aria-hidden focusable="false" className="size-7 shrink-0">
        <rect x="0.5" y="0.5" width="27" height="27" rx="8" className="fill-accent" />
        {/* the kiln arch */}
        <path d="M8 20.5V13a6 6 0 0 1 12 0v7.5" fill="none" strokeWidth="2.2" strokeLinecap="round" className="stroke-accent-fg" />
        {/* the linen fold */}
        <path d="M5.5 20.5h17" fill="none" strokeWidth="2.2" strokeLinecap="round" className="stroke-accent-fg" />
        <circle cx="14" cy="14.2" r="1.7" className="fill-accent-fg" />
      </svg>
      {label ? <span className="text-[15px] font-semibold tracking-[-0.01em]">{label}</span> : null}
    </span>
  );
}

/** Thin top bar used on the full-screen auth pages: logo on the start side, one slot on the end. */
export function AuthBar({ end, className }: { end?: React.ReactNode; className?: string }) {
  return (
    <header className={cn("flex items-center justify-between gap-4 px-4 py-4 sm:px-8 sm:py-5", className)}>
      <a href="#" className="rounded-ui-sm focus-ring">
        <KilnMark />
      </a>
      {end ? <div className="flex items-center gap-3 text-[13px] text-fg-muted">{end}</div> : null}
    </header>
  );
}

/** Small uppercase label used above section titles. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-mono text-[11px] uppercase tracking-[0.14em] text-fg-subtle", className)}>{children}</p>;
}

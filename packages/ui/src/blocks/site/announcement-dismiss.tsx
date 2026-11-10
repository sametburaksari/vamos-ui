"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

export interface AnnouncementDismissProps {
  /** Cookie name that remembers the dismissal (`vb_ann_<hash>`). */
  cookie: string;
  /** Days the cookie lives. Default 30. */
  days?: number;
  /** Accessible name ("Dismiss announcement"). */
  label: string;
  /** Element to focus after dismissing. Default `"content"`. */
  focusTarget?: string;
  className?: string;
}

const readCookie = (name: string) => typeof document !== "undefined" && document.cookie.split("; ").some((c) => c.startsWith(`${name}=`));

/**
 * Dismiss island of the Announcement bar (~0.5 KB). Hides the closest
 * `[data-announcement]`, writes a cookie the server can read, and moves focus to `#content`.
 * On statically cached pages it also hides an already-dismissed bar on mount.
 */
export function AnnouncementDismiss({ cookie, days = 30, label, focusTarget = "content", className }: AnnouncementDismissProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (readCookie(cookie)) ref.current?.closest<HTMLElement>("[data-announcement]")?.setAttribute("hidden", "");
  }, [cookie]);
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "-me-2 inline-flex size-8 shrink-0 items-center justify-center rounded-ui-sm text-current opacity-70 transition-opacity hover:opacity-100 focus-ring",
        className,
      )}
      onClick={() => {
        document.cookie = `${cookie}=1; max-age=${days * 86400}; path=/; samesite=lax`;
        ref.current?.closest<HTMLElement>("[data-announcement]")?.setAttribute("hidden", "");
        const target = document.getElementById(focusTarget);
        if (target) {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus();
        }
      }}
    >
      <X aria-hidden strokeWidth={1.5} className="size-4" />
    </button>
  );
}

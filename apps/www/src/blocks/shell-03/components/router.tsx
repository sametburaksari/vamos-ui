"use client";

import * as React from "react";
import type { VamosLinkProps } from "@vamos-ui/react";

/**
 * In-memory router so clicks inside the preview move the active item instead of leaving the page.
 * In your app, pass Next's `Link`, `usePathname()` and `router.push` to AppShellProvider instead.
 */
export function useMemoryRouter(initial: string) {
  const [currentPath, setPath] = React.useState(initial);
  const navigate = React.useCallback((href: string) => setPath(href), []);
  const Link = React.useMemo(
    () =>
      React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function MemoryLink({ href, onClick, replace: _replace, prefetch: _prefetch, ...props }, ref) {
        return (
          <a
            ref={ref}
            href={href}
            onClick={(e) => {
              onClick?.(e);
              if (e.defaultPrevented || /^https?:/.test(href)) return;
              e.preventDefault();
              setPath(href);
            }}
            {...props}
          />
        );
      }),
    [],
  );
  return { currentPath, navigate, Link };
}

"use client";

import * as React from "react";
import { AppShell, AppShellProvider, type VamosLinkProps } from "@vamos-ui/react";
import { workspaceApps, workspaceSharedNav } from "./nav";

/**
 * In-memory router so clicks inside the preview move the active item instead of leaving the page.
 * In your app, pass Next's `Link`, `usePathname()` and `router.push` to AppShellProvider instead.
 */
function useMemoryRouter(initial: string) {
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

export interface WorkspaceShellProps {
  /** The page this screen lives at — the sidebar highlights it. */
  path: string;
  /** Show this app's menu (shared pages like Settings belong to every app). */
  app?: string;
  children: React.ReactNode;
}

/**
 * The workspace's App shell: app switcher, the active app's menu, shared Users & roles and
 * Settings, top bar with search and account menu; a sheet on phones. It also mounts the
 * Toaster and the confirm dialog, so pages can call `toast()` and `useConfirm()`.
 * Clicking elsewhere in the menu shows a placeholder, the screen comes back on its own path.
 */
export function WorkspaceShell({ path, app = "crm", children }: WorkspaceShellProps) {
  const router = useMemoryRouter(path);
  const owner = workspaceApps.find((a) => router.currentPath === a.href || router.currentPath.startsWith(a.href + "/"));

  return (
    <AppShellProvider
      apps={workspaceApps}
      sharedNav={workspaceSharedNav}
      activeApp={owner?.id ?? app}
      currentPath={router.currentPath}
      navigate={router.navigate}
      linkComponent={router.Link}
    >
      <AppShell
        user={{
          name: "Samet Burak Sarı",
          email: "samet@northwind.studio",
          items: [
            { id: "profile", label: "Your profile", href: "/settings/profile" },
            { id: "appearance", label: "Appearance", href: "/settings/appearance" },
            { type: "separator", id: "sep" },
            { id: "signout", label: "Sign out" },
          ],
        }}
      >
        {router.currentPath === path ? (
          children
        ) : (
          <div className="grid place-items-center rounded-ui-lg border border-dashed border-line px-6 py-24 text-center text-fg-muted">
            <p>
              This preview only has one screen.{" "}
              <a href={path} className="font-medium text-accent-ink hover:underline" onClick={(e) => (e.preventDefault(), router.navigate(path))}>
                Go back
              </a>
            </p>
          </div>
        )}
      </AppShell>
    </AppShellProvider>
  );
}

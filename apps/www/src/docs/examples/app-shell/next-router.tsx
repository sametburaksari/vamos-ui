"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Component, LayoutTemplate, Palette } from "lucide-react";
import { AppShell, AppShellProvider, PageHeader, type AppDefinition } from "@vamos-cms/ui";
import { ShellFrame } from "./demo-kit";

// App definitions hold components (icons), so define them in a client module.
const docsApp: AppDefinition = {
  id: "docs",
  name: "Vamos UI",
  description: "Documentation",
  icon: BookOpen,
  href: "/docs",
  nav: [
    { id: "intro", label: "Introduction", href: "/docs", icon: BookOpen },
    { id: "theming", label: "Theming", href: "/docs/theming", icon: Palette },
    { id: "components", label: "Components", href: "/docs/components", icon: Component, children: [{ id: "c.shell", label: "App shell", href: "/docs/components/app-shell" }, { id: "c.sidebar", label: "Sidebar", href: "/docs/components/sidebar" }] },
    { id: "blocks", label: "Blocks", href: "/blocks", icon: LayoutTemplate },
  ],
};

/**
 * Real Next.js wiring: Link, usePathname and router.push. These links navigate this site.
 * In a server layout, read the rail preference to avoid a flash:
 *   const collapsed = parseSidebarCookie((await cookies()).get(SIDEBAR_COOKIE)?.value);
 */
export default function AppShellNextRouter() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <ShellFrame height={480}>
      <AppShellProvider apps={[docsApp]} linkComponent={Link} currentPath={pathname} navigate={(href) => router.push(href)} shortcuts={false}>
        <AppShell height="fill" announceRouteChanges={false}>
          <PageHeader breadcrumb="auto" title="Routing" description="The shell reads the route from Next and navigates through it — nothing else to wire." />
          <dl className="surface grid max-w-xl divide-y divide-line overflow-hidden rounded-ui-lg text-[13px]">
            {[
              ["linkComponent", "next/link", "Sidebar, breadcrumb and app switcher links"],
              ["currentPath", pathname, "Active item and automatic breadcrumb"],
              ["navigate", "router.push", "Command palette and keyboard shortcuts"],
            ].map(([prop, value, role]) => (
              <div key={prop} className="grid gap-0.5 px-4 py-3 sm:grid-cols-[8.5rem_1fr]">
                <dt className="font-mono text-xs text-fg-muted">{prop}</dt>
                <dd className="grid gap-0.5">
                  <code className="font-mono text-xs text-fg">{value}</code>
                  <span className="text-fg-subtle">{role}</span>
                </dd>
              </div>
            ))}
          </dl>
        </AppShell>
      </AppShellProvider>
    </ShellFrame>
  );
}

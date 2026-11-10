"use client";

import * as React from "react";
import { ChevronsUpDown, Check, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@vamos-cms/ui";
import { apps, sharedNav, appForPath, type AppDef, type NavEntry, type NavLink } from "./nav";

const isLink = (e: NavEntry): e is NavLink => "href" in e;

/** Longest-prefix match across every link, so "/site" (dashboard) isn't active on "/site/posts". */
function activeHref(path: string, entries: NavEntry[]) {
  let best = "";
  for (const e of entries) {
    if (!isLink(e)) continue;
    for (const h of [e.href, ...(e.children?.map((c) => c.href) ?? [])]) {
      if ((path === h || path.startsWith(h + "/")) && h.length > best.length) best = h;
    }
  }
  return best;
}

type Flyout = { key: string; top: number; left: number; item: NavLink } | null;

/**
 * WordPress-style menu on a multi-app shell.
 * - Top: app switcher (Site, CRM, People, Work…). Each app brings its own menu.
 * - The active item's submenu stays open inline; others open as a flyout on hover/focus.
 * - Bottom: shared menu (users, settings, kit), the same in every app.
 * Flyouts are fixed-positioned so the scrolling menu can't clip them.
 */
export function AppSidebar({ path, onNavigate, collapsed, onToggle }: { path: string; onNavigate: (href: string) => void; collapsed: boolean; onToggle: () => void }) {
  // In your app, replace `path`/`onNavigate` with your router (usePathname + <Link>).
  const Link = ({ href, onClick, ...rest }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest} onClick={(e) => { e.preventDefault(); onClick?.(e); onNavigate(href); }} />
  );
  const [lastApp, setLastApp] = React.useState<AppDef>(apps[0]!);
  const routeApp = appForPath(path);
  const app = routeApp ?? lastApp;
  React.useEffect(() => { if (routeApp) setLastApp(routeApp); }, [routeApp]);

  const active = activeHref(path, [...app.nav, ...sharedNav]);
  const [flyout, setFlyout] = React.useState<Flyout>(null);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const openFlyout = (key: string, item: NavLink, el: HTMLElement) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const r = el.getBoundingClientRect();
    setFlyout({ key, item, top: r.top, left: r.right + 6 });
  };
  const closeFlyout = () => {
    closeTimer.current = setTimeout(() => setFlyout(null), 120);
  };
  React.useEffect(() => setFlyout(null), [path]);

  const renderEntries = (entries: NavEntry[], scope: string) =>
    entries.map((e, i) => {
      if (!isLink(e)) {
        return collapsed ? (
          <li key={`${scope}-s${i}`} aria-hidden className="mx-4 my-2 h-px bg-nav-line" />
        ) : (
          <li key={`${scope}-s${i}`} className="px-4.5 pt-4 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-nav-fg/45">
            {e.section}
          </li>
        );
      }
      const childActive = e.children?.some((c) => c.href === active);
      const isActive = e.href === active || !!childActive;
      const inline = isActive && !collapsed && e.children;
      const hasFlyout = (!inline && e.children) || collapsed;
      const Icon = e.icon;
      const key = `${scope}-${e.href}`;
      return (
        <li
          key={key}
          onMouseEnter={hasFlyout ? (ev) => openFlyout(key, e, ev.currentTarget) : undefined}
          onMouseLeave={hasFlyout ? closeFlyout : undefined}
          onFocus={hasFlyout ? (ev) => openFlyout(key, e, ev.currentTarget) : undefined}
          onBlur={hasFlyout ? closeFlyout : undefined}
        >
          <Link
            href={e.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative mx-2 flex h-9 items-center gap-3 rounded-lg text-[13.5px] transition-colors focus-ring",
              collapsed ? "justify-center" : "px-2.5",
              isActive ? "bg-nav-active font-medium text-nav-fg-strong" : "hover:bg-nav-hover hover:text-nav-fg-strong",
            )}
          >
            {isActive && <span aria-hidden className="absolute -start-2 top-1.5 bottom-1.5 w-[3px] rounded-e-full bg-accent" />}
            <Icon className={cn("size-[17px] shrink-0", isActive ? "text-accent" : "opacity-80")} strokeWidth={1.8} />
            {!collapsed && <span className="flex-1 truncate">{e.label}</span>}
            {!collapsed && e.badge && <span className="rounded-full bg-accent px-1.5 text-[10.5px] font-semibold leading-[18px] text-accent-fg tabular">{e.badge}</span>}
            {collapsed && e.badge && <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-accent" />}
          </Link>
          {inline && (
            <ul className="mx-2 mt-px mb-1 grid gap-px rounded-lg bg-nav-sub py-1">
              {e.children!.map((c) => (
                <li key={c.href + c.label}>
                  <Link
                    href={c.href}
                    aria-current={c.href === active ? "page" : undefined}
                    className={cn("block rounded-md py-1.5 ps-[42px] pe-3 text-[13px] transition-colors focus-ring", c.href === active ? "font-medium text-nav-fg-strong" : "hover:text-nav-fg-strong")}
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    });

  return (
    <aside className={cn("surface-nav sticky top-0 z-30 flex h-dvh shrink-0 flex-col border-e border-nav-line transition-[width] duration-200", collapsed ? "w-[60px]" : "w-[240px]")}>
      <AppSwitcher app={app} collapsed={collapsed} onNavigate={onNavigate} />

      <nav className="flex-1 overflow-y-auto py-2 scrollbar-none" aria-label={`${app.name} menu`}>
        <ul className="grid gap-px">{renderEntries(app.nav, app.id)}</ul>
      </nav>

      <nav className="border-t border-nav-line py-2" aria-label="Workspace">
        <ul className="grid gap-px">{renderEntries(sharedNav, "shared")}</ul>
      </nav>

      <button
        onClick={onToggle}
        aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        className={cn("flex h-10 items-center gap-3 border-t border-nav-line text-[12.5px] text-nav-fg/70 hover:text-nav-fg-strong focus-ring", collapsed ? "justify-center" : "px-4.5")}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        {!collapsed && "Collapse"}
      </button>

      {flyout && (
        <div
          className="fixed z-50"
          style={{ top: flyout.top, left: flyout.left }}
          onMouseEnter={() => closeTimer.current && clearTimeout(closeTimer.current)}
          onMouseLeave={closeFlyout}
        >
          <ul className="min-w-48 rounded-xl border border-nav-popover-border bg-nav-popover p-1.5 text-nav-fg shadow-2xl">
            {collapsed && <li className="px-2.5 pt-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-nav-fg/60">{flyout.item.label}</li>}
            {(flyout.item.children ?? [{ label: flyout.item.label, href: flyout.item.href }]).map((c) => (
              <li key={c.href + c.label}>
                <Link href={c.href} className="block rounded-md px-2.5 py-1.5 text-[13px] hover:bg-nav-hover hover:text-nav-fg-strong focus-ring">{c.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

/** Workspace + app switcher. */
function AppSwitcher({ app, collapsed, onNavigate }: { app: AppDef; collapsed: boolean; onNavigate: (href: string) => void }) {
  const Link = ({ href, onClick, ...rest }: React.ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...rest} onClick={(e) => { e.preventDefault(); onClick?.(e); onNavigate(href); }} />
  );
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const Icon = app.icon;

  return (
    <div ref={ref} className="relative border-b border-nav-line p-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        // Expanded: the visible app name is the accessible name (WCAG 2.5.3); collapsed: icon only, so label it.
        aria-label={collapsed ? `Switch app (current: ${app.name})` : undefined}
        className={cn("flex w-full items-center gap-2.5 rounded-lg p-1.5 text-start hover:bg-nav-hover focus-ring", collapsed && "justify-center")}
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-accent text-accent-fg">
          <Icon className="size-[17px]" strokeWidth={2} />
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13.5px] font-semibold text-nav-fg-strong">{app.name}</span>
              <span className="block truncate text-[11.5px] text-nav-fg/60">Vamos · {app.description}</span>
            </span>
            <span className="sr-only">, switch app</span>
            <ChevronsUpDown className="size-4 shrink-0 text-nav-fg/50" aria-hidden />
          </>
        )}
      </button>

      {open && (
        <div role="menu" className={cn("absolute z-50 mt-1 w-60 rounded-xl border border-nav-popover-border bg-nav-popover p-1.5 text-nav-fg shadow-2xl", collapsed ? "start-full top-2 ms-2" : "inset-x-2")}>
          <div className="px-2.5 pt-1 pb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-nav-fg/50">Apps</div>
          {apps.map((a) => {
            const AIcon = a.icon;
            return (
              <Link
                key={a.id}
                role="menuitem"
                href={a.base}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-nav-hover focus-ring"
              >
                <span className={cn("grid size-7 place-items-center rounded-[8px]", a.id === app.id ? "bg-accent text-accent-fg" : "bg-nav-active text-nav-fg-strong")}>
                  <AIcon className="size-[15px]" />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[13px] font-medium text-nav-fg-strong">{a.name}</span>
                  <span className="block truncate text-[11.5px] text-nav-fg/55">{a.description}</span>
                </span>
                {a.id === app.id && <Check className="size-4 text-accent" />}
              </Link>
            );
          })}
          <div className="my-1 h-px bg-nav-line" />
          <Link role="menuitem" href="/settings/apps" onClick={() => setOpen(false)} className="block rounded-lg px-2.5 py-1.5 text-[12.5px] hover:bg-nav-hover hover:text-nav-fg-strong focus-ring">
            Manage apps & modules…
          </Link>
        </div>
      )}
    </div>
  );
}

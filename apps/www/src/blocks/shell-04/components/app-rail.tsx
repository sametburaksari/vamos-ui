"use client";

import type * as React from "react";
import { LifeBuoy } from "lucide-react";
import { Avatar, cn, IconButton, SmartLink, Tooltip, useAppShell } from "@vamos-ui/react";
import { appUnread } from "./apps";

/**
 * First column of the two-level sidebar: workspace logo, one tile per app, help at the bottom.
 * Each tile is a link to the app's home, so it works with the browser and the router alike.
 */
export function AppRail() {
  const { apps, activeApp } = useAppShell();
  return (
    <nav aria-label="Apps" className="vb-app-rail surface-nav flex h-full w-(--sidebar-w-rail) shrink-0 flex-col items-center gap-1 border-e border-nav-line py-2.5">
      <Avatar name="Brightline Studio" shape="square" size="md" className="mb-2" />
      <ul className="grid gap-1.5">
        {apps.map((a) => {
          const Icon = a.icon as React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
          const active = a.id === activeApp?.id;
          return (
            <li key={a.id} className="relative">
              {active ? <span aria-hidden className="absolute -start-2.5 top-2 bottom-2 w-[3px] rounded-e-full bg-accent" /> : null}
              <Tooltip content={a.name} side="right">
                <SmartLink
                  href={a.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={appUnread[a.id] ? `${a.name}, new activity` : a.name}
                  className={cn(
                    "relative grid size-10 place-items-center rounded-ui transition-colors focus-ring",
                    active ? "bg-accent text-accent-fg" : "text-nav-fg/75 hover:bg-nav-hover hover:text-nav-fg-strong",
                  )}
                >
                  <Icon aria-hidden className="size-[18px]" strokeWidth={active ? 2.1 : 1.8} />
                  {appUnread[a.id] && !active ? <span aria-hidden className="absolute end-1.5 top-1.5 size-2 rounded-full bg-accent ring-2 ring-(--nav)" /> : null}
                </SmartLink>
              </Tooltip>
            </li>
          );
        })}
      </ul>
      <div className="flex-1" />
      <IconButton label="Help & shortcuts" variant="ghost" size="md" tooltipSide="right" className="text-nav-fg/70 hover:bg-nav-hover hover:text-nav-fg-strong">
        <LifeBuoy />
      </IconButton>
    </nav>
  );
}

"use client";

import * as React from "react";
import { ChevronsUpDown, CreditCard, Keyboard, LifeBuoy, LogOut, Moon, Settings, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@vamos-ui/react";

export default function DropdownMenuUserMenu() {
  const [theme, setTheme] = React.useState("system");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-64 items-center gap-2.5 rounded-ui p-1.5 text-start hover:bg-hover focus-ring data-[state=open]:bg-hover">
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-fg">
          SD
        </span>
        <span className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-sm font-medium text-fg">Selin Demir</span>
          <span className="truncate text-xs text-fg-subtle">selin@harborpine.com</span>
        </span>
        <ChevronsUpDown className="size-4 text-fg-subtle" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuLabel>Harbor &amp; Pine · Admin</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem icon={<UserRound />}>Profile</DropdownMenuItem>
          <DropdownMenuItem icon={<CreditCard />} badge="Pro">
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Settings />} shortcut="mod+comma">
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem icon={<Keyboard />} shortcut="shift+?">
            Keyboard shortcuts
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger icon={<Moon />}>Appearance</DropdownMenuSubTrigger>
          <DropdownMenuSubContent size="sm">
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem icon={<LifeBuoy />}>Help centre</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<LogOut />}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

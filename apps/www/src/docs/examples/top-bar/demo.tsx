"use client";

import { HelpCircle, LogOut, Plus, Settings, UserRound } from "lucide-react";
import {
  Button,
  CommandPalette,
  CommandProvider,
  IconButton,
  NotificationCenter,
  TopBar,
  TopBarActions,
  TopBarSearch,
  TopBarSeparator,
  TopBarSpacer,
  UserMenu,
  createMemoryNotificationAdapter,
} from "@vamos-cms/ui";

const inbox = createMemoryNotificationAdapter([
  { id: "n1", title: "Hannah Lindqvist mentioned you in “Q4 pricing”", createdAt: new Date(Date.now() - 6e5).toISOString(), actor: { name: "Hannah Lindqvist" }, category: "mention" },
  { id: "n2", title: "Export finished: contacts-2026-11.csv", createdAt: new Date(Date.now() - 4e6).toISOString(), tone: "success" },
]);

export default function TopBarDemo() {
  return (
    // App shell provides the command palette; standalone, mount it yourself.
    <CommandProvider shortcut={false} actions={[{ id: "nav.contacts", title: "Contacts", group: "Go to" }]}>
      <div className="w-full overflow-hidden rounded-ui-lg border border-line">
        <TopBar sticky={false}>
          <TopBarSearch />
          <TopBarSpacer />
          <TopBarActions>
            <IconButton label="Help" size="sm">
              <HelpCircle />
            </IconButton>
            <TopBarSeparator />
            <NotificationCenter adapter={inbox} />
            <Button variant="primary" size="sm">
              <Plus /> New
            </Button>
            <UserMenu
              name="Ada Lovelace"
              email="ada@northwind.io"
              items={[
                { id: "profile", label: "Your profile", icon: <UserRound /> },
                { id: "settings", label: "Settings", icon: <Settings />, shortcut: "mod+comma" },
                { type: "separator" },
                { id: "out", label: "Sign out", icon: <LogOut /> },
              ]}
            />
          </TopBarActions>
        </TopBar>
      </div>
      <CommandPalette />
    </CommandProvider>
  );
}

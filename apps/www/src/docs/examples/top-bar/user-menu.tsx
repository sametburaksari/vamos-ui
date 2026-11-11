"use client";

import * as React from "react";
import { CreditCard, Keyboard, LogOut, UserRound } from "lucide-react";
import { Badge, UserMenu, type MenuEntry } from "@vamos-ui/react";

export default function TopBarUserMenu() {
  const [dark, setDark] = React.useState(false);
  const [lang, setLang] = React.useState("en");
  const items: MenuEntry[] = [
    { id: "profile", label: "Your profile", icon: <UserRound />, href: "#profile" },
    { id: "billing", label: "Billing", icon: <CreditCard />, description: "Team plan · renews Dec 1" },
    { id: "shortcuts", label: "Keyboard shortcuts", icon: <Keyboard />, shortcut: "shift+?" },
    { type: "separator" },
    { type: "checkbox", id: "dark", label: "Dark theme", checked: dark, onCheckedChange: setDark },
    { type: "radio", id: "lang", label: "Language", value: lang, onValueChange: setLang, options: [{ value: "en", label: "English" }, { value: "tr", label: "Türkçe" }] },
    { type: "separator" },
    { id: "out", label: "Sign out", icon: <LogOut />, tone: "danger" },
  ];
  return (
    <div className="flex items-center gap-6">
      <UserMenu name="Ada Lovelace" email="ada@northwind.io" items={items} />
      <UserMenu name="Jonas Becker" email="jonas@northpoint.de" items={items} showName>
        <div className="px-2 pb-1.5">
          <Badge tone="accent">Owner · Northpoint GmbH</Badge>
        </div>
      </UserMenu>
    </div>
  );
}

"use client";

import { Languages, Monitor, Moon, Palette, Sun } from "lucide-react";
import { Button, CommandPalette, CommandProvider, toast, useCommandPalette, type CommandAction } from "@vamos-ui/react";

const actions: CommandAction[] = [
  {
    id: "prefs.theme",
    title: "Change theme",
    group: "Preferences",
    icon: Palette,
    keywords: ["dark", "light", "appearance"],
    children: [
      { id: "prefs.theme.light", title: "Light", icon: Sun, perform: () => toast("Theme: Light") },
      { id: "prefs.theme.dark", title: "Dark", icon: Moon, perform: () => toast("Theme: Dark") },
      { id: "prefs.theme.system", title: "Match system", icon: Monitor, perform: () => toast("Theme: System") },
    ],
  },
  {
    id: "prefs.language",
    title: "Change language",
    group: "Preferences",
    icon: Languages,
    // Children can load lazily.
    children: async () => {
      await new Promise((r) => setTimeout(r, 500));
      return [
        { id: "lang.en", title: "English", perform: () => toast("Language: English") },
        { id: "lang.tr", title: "Türkçe", perform: () => toast("Dil: Türkçe") },
        { id: "lang.de", title: "Deutsch", perform: () => toast("Sprache: Deutsch") },
      ];
    },
  },
];

function Open() {
  const palette = useCommandPalette();
  return (
    <div className="flex gap-2">
      <Button onClick={() => palette.open()}>Open palette</Button>
      <Button variant="ghost" onClick={() => palette.open("prefs.theme")}>
        Open on “Change theme”
      </Button>
    </div>
  );
}

export default function CommandNestedPages() {
  return (
    <CommandProvider shortcut={false} actions={actions}>
      <Open />
      <CommandPalette />
    </CommandProvider>
  );
}

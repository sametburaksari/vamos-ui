"use client";

import * as React from "react";
import { ModeToggle, ThemeScope, type ColorMode } from "@vamos-ui/react";

// target={null}: the toggle only reports. Here the mode drives a ThemeScope (SiteShell's
// `theme` prop works the same way).
export default function ModeToggleControlled() {
  const [mode, setMode] = React.useState<ColorMode>("dark");
  return (
    <ThemeScope theme={mode === "dark" ? "dark" : "light"} className="flex w-full max-w-xs items-center justify-between rounded-ui-lg border border-line bg-surface p-4 text-fg">
      <span className="text-sm">Reader view</span>
      <ModeToggle value={mode} onValueChange={(m) => setMode(m)} target={null} showLabel />
    </ThemeScope>
  );
}

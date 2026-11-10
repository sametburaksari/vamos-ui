"use client";

import * as React from "react";
import { Moon, Sun, Layers, Square, Code2, Eye } from "lucide-react";
import { cn, IconButton, ThemeScope } from "@vamos-cms/ui";
import { CodeFrame } from "./code-frame";

type Theme = "inherit" | "light" | "dark";

/**
 * Preview / Code tabs. Each preview has its own theme and material toggles that
 * only affect this box (subtree tokens) — the rest of the page stays as is.
 */
export function PreviewTabs({ preview, html, raw, file, align = "center" }: { preview: React.ReactNode; html: string; raw: string; file: string; align?: "center" | "start" }) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [theme, setTheme] = React.useState<Theme>("inherit");
  const [material, setMaterial] = React.useState<"inherit" | "glass" | "solid">("inherit");
  const id = React.useId();

  const isDarkNow = () => (theme === "inherit" ? document.documentElement.classList.contains("dark") : theme === "dark");
  const isGlassNow = () => (material === "inherit" ? document.documentElement.dataset.material === "glass" : material === "glass");

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div role="tablist" className="flex gap-1 rounded-ui-sm bg-selected p-0.5 text-[12.5px]">
          {(["preview", "code"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              id={`${id}-${t}`}
              aria-selected={tab === t}
              aria-controls={`${id}-panel`}
              onClick={() => setTab(t)}
              className={cn("flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 font-medium transition focus-ring", tab === t ? "bg-surface text-fg shadow-sm" : "text-fg-muted hover:text-fg")}
            >
              {t === "preview" ? <Eye className="size-3.5" /> : <Code2 className="size-3.5" />}
              {t === "preview" ? "Preview" : "Code"}
            </button>
          ))}
        </div>
        {tab === "preview" && (
          <div className="flex items-center gap-0.5">
            <IconButton size="xs" label="Toggle material in this preview" onClick={() => setMaterial(isGlassNow() ? "solid" : "glass")}>
              {material === "solid" ? <Square /> : <Layers />}
            </IconButton>
            <IconButton size="xs" label="Toggle theme in this preview" onClick={() => setTheme(isDarkNow() ? "light" : "dark")}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </IconButton>
          </div>
        )}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className="min-w-0">
        {tab === "preview" ? (
          <div
            className={cn(
              "preview-stage relative flex min-h-[220px] flex-wrap items-center overflow-hidden rounded-ui-lg border border-line bg-scene p-8 md:p-12",
              align === "center" ? "justify-center" : "justify-start",
              theme !== "inherit" && theme,
            )}
            data-material={material === "inherit" ? undefined : material}
          >
            {/* Overlays opened in the preview portal into this scope, so they take the preview's own
                theme/material. No z-index here: a stacking context would trap dialogs and menus
                under the next preview and the sticky header. */}
            <ThemeScope className="relative flex w-full flex-wrap items-center justify-center">{preview}</ThemeScope>
          </div>
        ) : (
          <CodeFrame html={html} raw={raw} title={file} />
        )}
      </div>
    </div>
  );
}

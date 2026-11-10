"use client";

import * as React from "react";
import { useEditorState } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";
import { AlertTriangle } from "lucide-react";
import { cn } from "../lib/cn";
import { useBlockEditor } from "./context";
import { countWords } from "./convert";

interface OutlineData {
  headings: { pos: number; level: number; text: string; warning?: string }[];
  words: number;
  missingAlt: number;
  h1: number;
}

export interface BlockEditorOutlineProps {
  className?: string;
  /** Show the word count and reading time row. Default true. */
  stats?: boolean;
}

/**
 * Headings outline with word count, reading time and structure warnings (skipped levels,
 * several H1s, images without alt text). Clicking a heading moves the cursor there.
 */
export function BlockEditorOutline({ className, stats = true }: BlockEditorOutlineProps) {
  const { editor, t, lang } = useBlockEditor();
  const data = useEditorState({
    editor,
    selector: ({ editor: e }): OutlineData | null => {
      if (!e) return null;
      const headings: OutlineData["headings"] = [];
      let missingAlt = 0;
      let h1 = 0;
      let prev = 0;
      e.state.doc.descendants((n, pos) => {
        if (n.type.name === "heading") {
          const level = Number(n.attrs.level) || 2;
          if (level === 1) h1++;
          const warning = prev && level > prev + 1 ? t("skippedLevel", { from: prev, to: level }) : level === 1 && h1 > 1 ? t("multipleH1") : undefined;
          headings.push({ pos, level, text: n.textContent.trim(), warning });
          prev = level;
          return false;
        }
        if (n.type.name === "image" && n.attrs.src && !n.attrs.decorative && !String(n.attrs.alt ?? "").trim()) missingAlt++;
        return undefined;
      });
      return { headings, words: countWords(e.state.doc.textBetween(0, e.state.doc.content.size, "\n", " "), lang), missingAlt, h1 };
    },
    equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b),
  });

  const go = (pos: number) => {
    if (!editor) return;
    const tr = editor.state.tr.setSelection(TextSelection.near(editor.state.doc.resolve(pos + 1))).scrollIntoView();
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  const minutes = data && data.words ? Math.max(1, Math.ceil(data.words / 230)) : 0;
  const minLevel = data?.headings.reduce((m, h) => Math.min(m, h.level), 6) ?? 1;

  return (
    <nav data-slot="block-editor-outline" aria-label={t("outline")} className={cn("vui-outline", className)}>
      {stats ? (
        <p className="vui-outline-stats">
          <span>{t("words", { count: data?.words ?? 0 })}</span>
          <span aria-hidden>·</span>
          <span>{t("readingTime", { count: minutes })}</span>
        </p>
      ) : null}
      {data?.headings.length ? (
        <ol className="vui-outline-list">
          {data.headings.map((h) => (
            <li key={h.pos} style={{ paddingInlineStart: `${(h.level - minLevel) * 0.85}rem` }}>
              <button type="button" className="vui-outline-item focus-ring" onClick={() => go(h.pos)} data-level={h.level}>
                <span className="vui-outline-level" aria-hidden>
                  H{h.level}
                </span>
                <span className="min-w-0 flex-1 truncate">{h.text || <em className="text-fg-subtle">{t("empty")}</em>}</span>
              </button>
              {h.warning ? (
                <p className="vui-outline-warn">
                  <AlertTriangle aria-hidden className="size-3 shrink-0" />
                  {h.warning}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-fg-muted">{t("outlineEmpty")}</p>
      )}
      {data?.missingAlt ? (
        <p className="vui-outline-warn mt-2">
          <AlertTriangle aria-hidden className="size-3 shrink-0" />
          {t("imagesWithoutAlt", { count: data.missingAlt })}
        </p>
      ) : null}
    </nav>
  );
}

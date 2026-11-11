"use client";

import * as React from "react";
import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { Button } from "./button";

export const backupCodesLabels = {
  title: "Backup codes",
  copy: "Copy",
  copied: "Copied",
  copiedAnnouncement: "Backup codes copied to the clipboard",
  download: "Download",
  regenerate: "New codes",
  used: "used",
  remaining: "{left} of {total} left",
  fileHeader: "Backup codes — each code works once. Keep them somewhere safe.",
};
export type BackupCodesLabels = typeof backupCodesLabels;

export interface BackupCodesProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "onCopy"> {
  /** One-time recovery codes, in display order. */
  codes: string[];
  /** Codes already spent — struck through and announced as used. */
  used?: string[];
  /** Heading above the grid. Default "Backup codes"; `null` hides it (label the region yourself). */
  title?: React.ReactNode;
  /** Name of the downloaded text file. Default `"backup-codes.txt"`. */
  filename?: string;
  /** Extra first line(s) of the downloaded file (account, service). */
  fileNote?: string;
  /** Called after the codes were copied. */
  onCopy?: (text: string) => void;
  /** Replace the default download (Blob + link) — e.g. to log it. */
  onDownload?: (text: string) => void;
  /** Shows a "New codes" button. */
  onRegenerate?: () => void;
  regenerating?: boolean;
  labels?: Partial<BackupCodesLabels>;
}

/**
 * One-time recovery codes after two-factor enrolment: a numbered monospace grid with copy,
 * download and regenerate. Used codes stay visible, struck through.
 *
 * ```tsx
 * <BackupCodes codes={codes} used={["4K7Q-PX2M"]} onRegenerate={regenerate} />
 * ```
 */
export const BackupCodes = React.forwardRef<HTMLDivElement, BackupCodesProps>(function BackupCodes(
  { codes, used = [], title, filename = "backup-codes.txt", fileNote, onCopy, onDownload, onRegenerate, regenerating, labels, className, ...props },
  ref,
) {
  const t = useLabels("backupCodes", backupCodesLabels, labels);
  const f = useFormat();
  const [copied, setCopied] = React.useState(false);
  const usedSet = React.useMemo(() => new Set(used), [used]);
  const titleId = React.useId();
  const text = React.useMemo(
    () => [fileNote, t("fileHeader"), "", ...codes.map((c, i) => `${String(i + 1).padStart(2, " ")}. ${c}${usedSet.has(c) ? ` (${t("used")})` : ""}`)].filter((l) => l !== undefined).join("\n") + "\n",
    [codes, usedSet, fileNote, t],
  );

  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      /* clipboard blocked — still report so the user can select manually */
    }
    setCopied(true);
    onCopy?.(text);
  };

  const download = () => {
    if (onDownload) return onDownload(text);
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const left = codes.filter((c) => !usedSet.has(c)).length;
  const heading = title === undefined ? t("title") : title;

  return (
    <div ref={ref} data-slot="backup-codes" role="group" aria-labelledby={heading ? titleId : undefined} className={cn("grid gap-3", className)} {...props}>
      {heading ? (
        <div className="flex items-baseline justify-between gap-3">
          <h3 id={titleId} className="text-sm font-medium text-fg">
            {heading}
          </h3>
          <span className="text-xs text-fg-muted tabular">{t("remaining", { left: f.number(left), total: f.number(codes.length) })}</span>
        </div>
      ) : null}
      <ol className="grid grid-cols-2 gap-x-6 gap-y-1.5 rounded-ui border border-line bg-surface-2 px-4 py-3.5 font-mono text-[13px] tabular" translate="no">
        {codes.map((code, i) => {
          const spent = usedSet.has(code);
          return (
            <li key={code} data-used={spent || undefined} className="flex items-baseline gap-3">
              <span aria-hidden="true" className="w-4 text-end text-[11px] text-fg-subtle">
                {i + 1}
              </span>
              <span className={cn("tracking-wide select-all", spent ? "text-fg-subtle line-through decoration-fg-subtle" : "text-fg")}>{code}</span>
              {spent ? <span className="sr-only">({t("used")})</span> : null}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary" onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? t("copied") : t("copy")}
        </Button>
        <Button size="sm" variant="secondary" onClick={download}>
          <Download aria-hidden="true" />
          {t("download")}
        </Button>
        {onRegenerate ? (
          <Button size="sm" variant="ghost" className="ms-auto" onClick={onRegenerate} loading={regenerating}>
            <RefreshCw aria-hidden="true" />
            {t("regenerate")}
          </Button>
        ) : null}
        <span role="status" aria-live="polite" className="sr-only">
          {copied ? t("copiedAnnouncement") : ""}
        </span>
      </div>
    </div>
  );
});

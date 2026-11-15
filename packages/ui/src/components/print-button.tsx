"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { useLabels } from "../lib/labels";
import { Button, type ButtonProps } from "./button";

export const printButtonLabels = {
  print: "Print",
  /** Screen-reader hint after the label. */
  hint: "Opens the print dialog. Choose Save as PDF to download a copy.",
};
export type PrintButtonLabels = typeof printButtonLabels;

export interface PrintButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  /**
   * Suggested file name for "Save as PDF". Browsers name the file after the document title, so the
   * title is swapped while the dialog is open (`"cv-2026"` → `cv-2026.pdf`).
   */
  fileName?: string;
  /** Called right before the dialog opens (expand collapsed sections, load lazy images). */
  onBeforePrint?: () => void;
  /** Called after the dialog closed. */
  onAfterPrint?: () => void;
  /** Hide the screen-reader hint ("Opens the print dialog…"). */
  noHint?: boolean;
  labels?: Partial<PrintButtonLabels>;
}

/**
 * Opens the browser's print dialog — "Print" or "Download PDF" for a CV, an invoice, a recipe, a
 * ticket. Pair it with `PrintStyles` so the paper version drops the site chrome. The button
 * itself never prints (`data-print="hide"`).
 *
 * ```tsx
 * <PrintStyles />
 * <PrintButton fileName="cv-2026">Download PDF</PrintButton>
 * ```
 */
export const PrintButton = /*#__PURE__*/ React.forwardRef<HTMLButtonElement, PrintButtonProps>(function PrintButton(
  { fileName, onBeforePrint, onAfterPrint, noHint, labels, children, variant = "secondary", ...props },
  ref,
) {
  const t = useLabels("printButton", printButtonLabels, labels);
  const hintId = React.useId();
  const print = () => {
    onBeforePrint?.();
    const previous = document.title;
    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      if (fileName) document.title = previous;
      window.removeEventListener("afterprint", restore);
      onAfterPrint?.();
    };
    if (fileName) document.title = fileName;
    window.addEventListener("afterprint", restore);
    window.print();
    // Some browsers return from print() before (or without) afterprint: never leave the title swapped.
    window.setTimeout(restore, 1000);
  };
  return (
    <>
      <Button ref={ref} type="button" variant={variant} data-print="hide" onClick={print} aria-describedby={noHint ? undefined : hintId} {...props}>
        <Printer aria-hidden />
        {children ?? t("print")}
      </Button>
      {noHint ? null : (
        <span id={hintId} hidden>
          {t("hint")}
        </span>
      )}
    </>
  );
});

export interface PrintStylesOptions {
  /** Extra selectors to hide on paper (besides `nav`, `[role="banner"]`, `[role="contentinfo"]` and `[data-print="hide"]`). */
  hide?: string[];
  /** Hide the page header, navigation and footer landmarks. Default `true`. */
  hideChrome?: boolean;
  /** Print the address after external links: "Portfolio (https://example.com)". Default `true`. */
  showUrls?: boolean;
  /** `@page` margin. Default `"16mm"`. */
  margin?: string;
  /** `@page` size ("A4", "letter"). Default: the printer's. */
  size?: string;
}

/**
 * The print stylesheet as a string — for a `<style>` tag, a CSS file or `PrintStyles`. Rules apply
 * only under `@media print`:
 *
 * - hides `[data-print="hide"]`, plus `nav`, `header[role=banner]`/`body > header`, `footer` landmarks;
 * - `[data-print="only"]` shows only on paper; `[data-print="keep"]` avoids page breaks inside;
 * - prints external link addresses after the link text (opt out per link with `data-print-url="off"`);
 * - flattens backgrounds and shadows so text stays readable in any theme.
 */
export function printStyles({ hide = [], hideChrome = true, showUrls = true, margin = "16mm", size }: PrintStylesOptions = {}): string {
  const hidden = ['[data-print="hide"]', ...(hideChrome ? ["nav", 'header[role="banner"]', "body > header", 'footer[role="contentinfo"]', "body > footer", '[data-slot="top-bar"]', '[data-slot="sidebar"]'] : []), ...hide];
  return [
    `@media screen{[data-print="only"]{display:none!important}}`,
    `@media print{`,
    `@page{margin:${margin}${size ? `;size:${size}` : ""}}`,
    `html{color-scheme:light}`,
    `${hidden.join(",")}{display:none!important}`,
    `*,*::before,*::after{box-shadow:none!important;text-shadow:none!important;backdrop-filter:none!important}`,
    `body{background:transparent!important}`,
    `[data-print="keep"],figure,img,tr,pre,blockquote{break-inside:avoid}`,
    `h1,h2,h3,h4{break-after:avoid}`,
    showUrls ? `a[href^="http"]:not([data-print-url="off"])::after{content:" (" attr(href) ")";font-size:.85em;word-break:break-all}` : "",
    `}`,
  ].join("");
}

export interface PrintStylesProps extends PrintStylesOptions {
  /** CSP nonce for the inline `<style>`. */
  nonce?: string;
}

/** Renders `printStyles()` in a `<style>` tag. Put it once on the pages people print. */
export function PrintStyles({ nonce, ...options }: PrintStylesProps) {
  return <style nonce={nonce} data-vui-print="" dangerouslySetInnerHTML={{ __html: printStyles(options) }} />;
}

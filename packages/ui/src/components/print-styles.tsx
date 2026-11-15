import * as React from "react";

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

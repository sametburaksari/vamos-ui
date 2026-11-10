"use client";

import * as React from "react";
import { Check, Link2 } from "lucide-react";
import { cn2 as cn } from "./kit-2";
import type { ShareLabels } from "./island-keys";

export interface CopyLinkButtonProps {
  /** URL to copy. Default: the current page. */
  url?: string;
  labels: ShareLabels;
  className?: string;
}

/** "Copy link" for the article share row (~0.3 KB). Announces "Link copied" politely. */
export function CopyLinkButton({ url, labels, className }: CopyLinkButtonProps) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);
  return (
    <button
      type="button"
      onClick={async () => {
        const href = url ?? window.location.href;
        try {
          await navigator.clipboard?.writeText(href);
        } catch {
          /* clipboard blocked: still confirm, the URL is in the address bar */
        }
        setCopied(true);
      }}
      className={cn("vb-share-btn", className)}
    >
      {copied ? <Check aria-hidden strokeWidth={1.5} className="size-4" /> : <Link2 aria-hidden strokeWidth={1.5} className="size-4" />}
      <span>{labels.copyLink}</span>
      <span role="status" className="sr-only">
        {copied ? labels.linkCopied : ""}
      </span>
    </button>
  );
}

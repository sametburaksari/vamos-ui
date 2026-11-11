"use client";

import * as React from "react";
import { Button } from "@vamos-ui/react";
import { Check, Copy, Headphones, Mail, Rss } from "lucide-react";
import { copyFor, FEED_URL, type SiteLocale } from "./content";

/** Generic ways to follow the show: copy the RSS feed, open a podcast app, get the email. */
export function ListenLinks({ locale }: { locale: SiteLocale }) {
  const { t } = copyFor(locale);
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(FEED_URL);
    } catch {
      /* clipboard blocked: the URL is visible below */
    }
    setCopied(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="primary">
          <a href={FEED_URL.replace("https://", "podcast://")}>
            <Headphones aria-hidden />
            {t({ en: "Open in your podcast app", tr: "Podcast uygulamanda aç" })}
          </a>
        </Button>
        <Button variant="secondary" onClick={copy}>
          {copied ? <Check aria-hidden /> : <Rss aria-hidden />}
          {copied ? t({ en: "Feed copied", tr: "Akış kopyalandı" }) : t({ en: "Copy RSS feed", tr: "RSS akışını kopyala" })}
        </Button>
        <Button asChild variant="ghost">
          <a href="mailto:kitchen@longtable.example.com?subject=Subscribe">
            <Mail aria-hidden />
            {t({ en: "Episodes by email", tr: "E-postayla bölümler" })}
          </a>
        </Button>
      </div>
      <p className="m-0 flex items-center gap-2 font-mono text-xs text-fg-muted">
        <Copy aria-hidden className="size-3.5" />
        <span className="break-all">{FEED_URL}</span>
        <span role="status" className="sr-only">
          {copied ? t({ en: "Feed address copied", tr: "Akış adresi kopyalandı" }) : ""}
        </span>
      </p>
    </div>
  );
}

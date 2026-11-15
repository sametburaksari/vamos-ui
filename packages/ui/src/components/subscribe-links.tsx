"use client";

import * as React from "react";
import { ArrowUpRight, Check, Rss } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels } from "../lib/labels";
import { Button } from "./button";
import { copyText } from "./_clipboard";

export const subscribeLinksLabels = {
  /** Accessible name of the group when there is no title. */
  group: "Follow",
  copyFeed: "Copy RSS feed",
  feedCopied: "Feed copied",
  feedCopiedAnnouncement: "Feed address copied",
  copyFailed: "Couldn't copy. Select the address and copy it yourself.",
  feedAddress: "Feed address",
  /** Appended to the accessible name of links that open a new tab. */
  newTab: "(opens in a new tab)",
};
export type SubscribeLinksLabels = typeof subscribeLinksLabels;

export interface SubscribeLink {
  /** Visible name: the platform or channel ("Podcast app", "Video channel", "Email"). */
  label: string;
  href: string;
  /** Your own icon (no logos are bundled). */
  icon?: React.ReactNode;
  /** One line under the label in the `list` variant ("New episodes every Tuesday"). */
  description?: React.ReactNode;
  /** Open in a new tab. Default: true for `http(s)` links to another origin. */
  newTab?: boolean;
  /** Visual weight in the `buttons` variant. Default: the first link is primary. */
  primary?: boolean;
}

export interface SubscribeLinksProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Where people can listen, watch or follow, best first. */
  links: SubscribeLink[];
  /** RSS / Atom feed: adds a copy button and shows the address. */
  feedUrl?: string;
  /** Show the feed address under the links. Default `true`. */
  showFeedUrl?: boolean;
  /** `"buttons"` (default): a wrapping row of buttons · `"list"`: one row per link with a description. */
  variant?: "buttons" | "list";
  /** Heading above the links ("Listen on"). Without it the group is named "Follow". */
  title?: React.ReactNode;
  /** Heading level of `title`. Default `2`. */
  headingLevel?: 2 | 3 | 4;
  /** Called after the feed address was copied. */
  onCopyFeed?: (url: string) => void;
  labels?: Partial<SubscribeLinksLabels>;
}

/** Absolute http(s) links open in a new tab by default (same answer on the server and the client). */
const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * "Listen on / follow on" links for a podcast, a channel or a newsletter: the platforms you pass
 * (text and your own icons — no trademark logos are bundled), plus a "Copy RSS feed" button with
 * the address visible for people who paste it into an app. The copy result is announced.
 *
 * ```tsx
 * <SubscribeLinks title="Listen on" feedUrl="https://example.com/feed.xml"
 *   links={[{ label: "Podcast app", href: "podcast://example.com/feed.xml" }, { label: "Episodes by email", href: "/subscribe" }]} />
 * ```
 */
export const SubscribeLinks = /*#__PURE__*/ React.forwardRef<HTMLDivElement, SubscribeLinksProps>(function SubscribeLinks(
  { links, feedUrl, showFeedUrl = true, variant = "buttons", title, headingLevel = 2, onCopyFeed, labels, className, ...props },
  ref,
) {
  const t = useLabels("subscribeLinks", subscribeLinksLabels, labels);
  const uid = React.useId();
  const [copied, setCopied] = React.useState<"ok" | "failed" | null>(null);
  React.useEffect(() => {
    if (copied !== "ok") return;
    const id = window.setTimeout(() => setCopied(null), 2400);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    if (!feedUrl) return;
    const ok = await copyText(feedUrl);
    setCopied(ok ? "ok" : "failed");
    if (ok) onCopyFeed?.(feedUrl);
  };

  const H = `h${headingLevel}` as "h2";
  const anyPrimary = links.some((l) => l.primary);
  const linkProps = (l: SubscribeLink) => {
    const newTab = l.newTab ?? isExternal(l.href);
    return newTab ? { target: "_blank", rel: "noopener noreferrer", "data-new-tab": "" } : {};
  };
  const newTabNote = (l: SubscribeLink) => ((l.newTab ?? isExternal(l.href)) ? <>{" "}<span className="sr-only">{t("newTab")}</span></> : null);

  const feedButton = feedUrl ? (
    <Button variant={variant === "list" ? "secondary" : "ghost"} onClick={copy} data-copied={copied === "ok" ? "" : undefined}>
      {copied === "ok" ? <Check aria-hidden /> : <Rss aria-hidden />}
      {copied === "ok" ? t("feedCopied") : t("copyFeed")}
    </Button>
  ) : null;

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={title ? `${uid}-title` : undefined}
      aria-label={title ? undefined : t("group")}
      data-slot="subscribe-links"
      data-variant={variant}
      className={cn("flex flex-col gap-3", className)}
      {...props}
    >
      {title ? (
        <H id={`${uid}-title`} className="m-0 text-sm font-semibold text-fg">
          {title}
        </H>
      ) : null}

      {variant === "list" ? (
        <ul className="m-0 flex list-none flex-col divide-y divide-line rounded-ui border border-line p-0">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                {...linkProps(l)}
                className="group flex min-h-11 items-center gap-3 px-4 py-3 text-fg transition-colors hover:bg-hover focus-ring rounded-ui motion-reduce:transition-none [&_svg]:size-4"
              >
                {l.icon ? (
                  <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-ui-sm bg-surface-2 text-fg-muted">
                    {l.icon}
                  </span>
                ) : null}
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-sm font-medium">
                    {l.label}
                    {newTabNote(l)}
                  </span>
                  {l.description ? <span className="text-xs text-fg-muted">{l.description}</span> : null}
                </span>
                <ArrowUpRight aria-hidden className="shrink-0 text-fg-subtle transition-transform group-hover:-translate-y-px rtl:-scale-x-100 motion-reduce:transition-none" />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {links.map((l, i) => (
            <li key={l.href}>
              <Button asChild variant={(anyPrimary ? l.primary : i === 0) ? "primary" : "secondary"}>
                <a href={l.href} {...linkProps(l)}>
                  {l.icon ? <span aria-hidden="true" className="contents">{l.icon}</span> : null}
                  {l.label}
                  {newTabNote(l)}
                </a>
              </Button>
            </li>
          ))}
          {feedButton ? <li>{feedButton}</li> : null}
        </ul>
      )}

      {variant === "list" && feedButton ? <div>{feedButton}</div> : null}

      {feedUrl && showFeedUrl ? (
        <p className="m-0 flex min-w-0 items-center gap-2 font-mono text-xs text-fg-muted">
          <Rss aria-hidden className="size-3.5 shrink-0" />
          <span className="sr-only">{t("feedAddress")}: </span>
          <span dir="ltr" className="break-all select-all">
            {feedUrl}
          </span>
        </p>
      ) : null}
      <p role="status" className={cn("m-0 text-xs text-danger", copied !== "failed" && "sr-only")}>
        {copied === "ok" ? t("feedCopiedAnnouncement") : copied === "failed" ? t("copyFailed") : ""}
      </p>
    </div>
  );
});

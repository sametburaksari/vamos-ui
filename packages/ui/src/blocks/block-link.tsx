import * as React from "react";
import { cn } from "../lib/cn";
import { buttonVariants } from "../components/button";
import { blockText, type BlockLabels } from "./labels";
import { isExternalUrl, sanitizeHref } from "./schema/safety";
import type { BlockAdapters } from "./types";
import type { CtaStyle } from "./schema/types";

export interface BlockLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** Open in a new tab (adds `rel="noopener noreferrer"` and an announced "(opens in a new tab)"). */
  newTab?: boolean;
  /** Render as a button-styled call to action. One `primary` per block. */
  appearance?: CtaStyle;
  /** Button size when `appearance` is set. Default `"lg"`. */
  size?: "md" | "lg" | "xl";
  components?: BlockAdapters;
  labels?: Partial<BlockLabels>;
  locale?: string;
  /** Prop path for edit mode (`data-field`). */
  field?: string;
  editMode?: boolean;
}

/**
 * Links for site blocks. Internal paths go through the app's router `Link` (`components.Link`);
 * external URLs, `mailto:` and `tel:` render `<a>`. Unsafe hrefs (`javascript:`, `data:`…) render
 * as plain text. Server component.
 *
 * ```tsx
 * <BlockLink href="/reservations" appearance="primary">Book a table</BlockLink>
 * <BlockLink href="https://maps.app.goo.gl/x" newTab>Directions</BlockLink>
 * ```
 */
export const BlockLink = React.forwardRef<HTMLAnchorElement, BlockLinkProps>(function BlockLink(
  { href, newTab, appearance, size = "lg", components, labels, locale, field, editMode, className, children, rel, target, ...props },
  ref,
) {
  const safe = sanitizeHref(href);
  const classes = cn(
    appearance === "link" ? "inline-flex min-h-6 pointer-coarse:min-h-11 items-center gap-1.5 font-medium text-fg underline decoration-line underline-offset-[0.3em] transition-colors hover:decoration-current focus-ring rounded-[2px]" : null,
    appearance && appearance !== "link" ? cn(buttonVariants({ variant: appearance, size }), appearance === "primary" && "vb-action-primary", appearance === "secondary" && "vb-action-secondary") : null,
    className,
  );
  const fieldAttr = editMode && field ? { "data-field": field } : undefined;

  if (!safe) {
    if (process.env.NODE_ENV !== "production") console.warn(`[vamos-ui] BlockLink: unsafe href "${href}" was not rendered as a link.`);
    return (
      <span className={classes} data-unsafe-href="" {...fieldAttr}>
        {children}
      </span>
    );
  }

  const t = blockText(labels, locale);
  const content = newTab ? (
    <>
      {children}{" "}
      <span className="sr-only">{t("opensInNewTab")}</span>
    </>
  ) : (
    children
  );
  const relValue = rel ?? (newTab ? "noopener noreferrer" : undefined);
  const targetValue = target ?? (newTab ? "_blank" : undefined);
  const Link = components?.Link;
  const routable = !isExternalUrl(safe) && !/^[a-z][a-z\d+.-]*:/i.test(safe) && !safe.startsWith("#");

  if (Link && routable) {
    return (
      <Link ref={ref} href={safe} className={classes} rel={relValue} target={targetValue} {...fieldAttr} {...props}>
        {content}
      </Link>
    );
  }
  return (
    <a ref={ref} href={safe} className={classes} rel={relValue} target={targetValue} {...fieldAttr} {...props}>
      {content}
    </a>
  );
});

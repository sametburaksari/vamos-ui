import * as React from "react";
import { ArrowRight } from "lucide-react";
import { cn2 as cn, useBlockIds2, type SiteLink2 } from "./shared/kit-2";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockLink } from "../block-link";
import { JsonLd } from "../json-ld";
import type { BlockBaseProps } from "../types";
import { ProductCard, type ProductCardData, type ProductCardProps } from "./product-card";
import { commerceText, type CommerceBlockLabels } from "./shared/labels-commerce";

export type ProductGridVariant = "grid" | "list";
export type ProductGridColumns = 2 | 3 | 4 | 5;

export interface ProductGridProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /** grid: responsive columns of photo-first cards. list: one product per row, photo beside the text. */
  variant?: ProductGridVariant;
  /** Columns on wide containers (grid). Narrower containers step down to 3, 2 and 1. Default 4. */
  columns?: ProductGridColumns;
  products: ProductCardData[];
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  /** "Shop all" link beside the header. */
  allLink?: SiteLink2;
  /** Shared card props (aspect, saleStyle, maxSwatches, headingLevel…). */
  cardProps?: Omit<Partial<ProductCardProps>, keyof ProductCardData>;
  /** Render each card yourself (e.g. a client wrapper with quick add). Default: `<ProductCard {...product} />`. */
  renderCard?: (product: ProductCardData, index: number) => React.ReactNode;
  /** Photos loaded eagerly (first row above the fold). Default 0. */
  priorityCount?: number;
  /** Only the list, without Section, Container or header — for shop pages with their own layout. */
  bare?: boolean;
  /** Accessible name of the list when there is no title. Default "Products". */
  listLabel?: string;
  /** Empty state copy and an optional action. */
  empty?: { title?: React.ReactNode; text?: React.ReactNode; action?: React.ReactNode };
  /** Emit an `ItemList` JSON-LD of product URLs (category pages). Default false. */
  jsonLd?: boolean;
  /** Origin for the JSON-LD URLs when hrefs are relative ("https://shop.example.com"). */
  siteUrl?: string;
  labels?: CommerceBlockLabels;
}

const COLS: Record<ProductGridColumns, string> = {
  2: "@xl:grid-cols-2",
  3: "@xl:grid-cols-2 @4xl:grid-cols-3",
  4: "@xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4",
  5: "@xl:grid-cols-2 @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5",
};
const SIZES: Record<ProductGridColumns, string> = {
  2: "(min-width: 40rem) min(46vw, 36rem), 90vw",
  3: "(min-width: 64rem) min(31vw, 24rem), (min-width: 40rem) 46vw, 90vw",
  4: "(min-width: 64rem) min(23vw, 18rem), (min-width: 40rem) 46vw, 90vw",
  5: "(min-width: 80rem) min(19vw, 15rem), (min-width: 64rem) 23vw, (min-width: 40rem) 46vw, 90vw",
};

/**
 * Product listing: a responsive grid of `ProductCard`s (2–5 columns by container width) or a list
 * of row cards, with an optional section header, "Shop all" link, empty state and `ItemList`
 * JSON-LD. `bare` renders just the list for pages with their own filters and layout. Server component.
 *
 * ```tsx
 * <ProductGrid title="New this *week*" columns={4} products={products} allLink={{ href: "/shop", label: "Shop all" }} />
 * ```
 */
export function ProductGrid({
  variant = "grid",
  columns = 4,
  products,
  eyebrow,
  title,
  lead,
  allLink,
  cardProps,
  renderCard,
  priorityCount = 0,
  bare,
  listLabel,
  empty,
  jsonLd,
  siteUrl,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: ProductGridProps) {
  const t = commerceText(labels, locale);
  const { headingId } = useBlockIds2(id, "products");
  const list = variant === "list";
  const hasHeader = !bare && !!(title || eyebrow || lead);
  const cardHeading = (cardProps?.headingLevel ?? (hasHeader ? Math.min(4, headingLevel + 1) : 3)) as 2 | 3 | 4;

  const items = products.length ? (
    <ul
      aria-label={hasHeader && title ? undefined : (listLabel ?? t("products"))}
      aria-labelledby={hasHeader && title ? headingId : undefined}
      className={cn("vb-pgrid grid", list ? "grid-cols-1 gap-y-6 divide-y divide-line [&>li:not(:first-child)]:pt-6" : cn("grid-cols-1 gap-x-5 gap-y-10", COLS[columns]))}
      data-variant={variant}
      data-cols={list ? undefined : columns}
    >
      {products.map((p, i) => (
        <li key={p.id ?? p.href} className="flex min-w-0 flex-col">
          {renderCard ? (
            renderCard(p, i)
          ) : (
            <ProductCard
              {...p}
              layout={list ? "row" : "stack"}
              sizes={list ? undefined : SIZES[columns]}
              priority={i < priorityCount}
              {...cardProps}
              headingLevel={cardHeading}
              labels={labels}
              locale={locale}
              components={components}
            />
          )}
        </li>
      ))}
    </ul>
  ) : (
    <div className="flex flex-col items-start gap-3 rounded-ui-lg border border-dashed border-line p-8">
      <p className="font-display text-h3 text-fg">{empty?.title ?? t("noProducts")}</p>
      <p className="text-small text-fg-muted">{empty?.text ?? t("noProductsHint")}</p>
      {empty?.action}
    </div>
  );

  const ld = jsonLd && products.length ? <JsonLd data={productListJsonLd(products, siteUrl)} /> : null;

  if (bare) {
    return (
      <div className={cn("@container", className)} id={anchor}>
        {items}
        {ld}
      </div>
    );
  }

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="product-grid" editMode={editMode} className={cn("vb-products", className)} data-variant={variant}>
      <Container className="flex flex-col gap-10">
        {hasHeader || allLink ? (
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            {hasHeader ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} editMode={editMode} labels={labels} locale={locale} /> : <span />}
            {allLink ? (
              <BlockLink href={allLink.href} newTab={allLink.newTab} appearance="link" components={components} labels={labels} locale={locale}>
                {allLink.label}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" strokeWidth={1.75} />
              </BlockLink>
            ) : null}
          </div>
        ) : null}
        {items}
        {ld}
      </Container>
    </Section>
  );
}

/** schema.org `ItemList` of product URLs, for category / collection pages. */
export function productListJsonLd(products: ProductCardData[], siteUrl?: string): Record<string, unknown> {
  const abs = (href: string) => (siteUrl && href.startsWith("/") ? siteUrl.replace(/\/$/, "") + href : href);
  return {
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(p.href), name: p.title })),
  };
}

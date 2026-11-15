import * as React from "react";
import { Plus } from "lucide-react";
import { buttonVariants } from "../../components/button";
import { cn2 as cn, formatMoney, type SiteImage2 } from "./shared/kit-2";
import { BlockImage, type ImageAspect } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockAdapters } from "../types";
import type { MoneyValue } from "../schema/types";
import { StarRating } from "./star-rating";
import { commerceText, type CommerceBlockLabels, type CommerceText } from "./shared/labels-commerce";

/** One colour / finish / material option. Up to 8 swap the photo; more are listed as "+N more". */
export interface ProductSwatch {
  /** "Sea salt", "Midnight". Also the radio's accessible name. */
  name: string;
  /** Any CSS colour or gradient — product data shown as a dot, not a UI colour. */
  color: string;
  /** The photo for this option; the card shows it while the swatch is hovered, focused or chosen. */
  image?: SiteImage2;
  soldOut?: boolean;
}

/** Plain product data — what a shop backend maps into. */
export interface ProductCardData {
  /** Stable key in lists. */
  id?: string;
  title: string;
  href: string;
  /** Small line above the title (brand, maker, category). */
  vendor?: React.ReactNode;
  image?: SiteImage2;
  /** Shown on hover / focus (a second angle). Ignored when swatches carry their own photos. */
  hoverImage?: SiteImage2;
  /** Current price. */
  price?: MoneyValue;
  /** The regular price; when higher than `price` the card shows a sale price and badge. */
  compareAt?: MoneyValue;
  /** Variants with different prices: "From $40" or "$40 – $85" (see `rangeStyle`). Replaces `price`. */
  priceRange?: { min: MoneyValue; max: MoneyValue };
  isNew?: boolean;
  /** The whole product is unavailable (per-option: `swatches[i].soldOut`). */
  soldOut?: boolean;
  /** One more badge ("Bestseller", "Limited"). */
  badge?: React.ReactNode;
  rating?: { value: number; count?: number };
  swatches?: ProductSwatch[];
}

export interface ProductCardProps extends ProductCardData {
  /** stack: photo above the text (grids). row: photo beside the text (lists, search results). */
  layout?: "stack" | "row";
  size?: "md" | "lg";
  /** Photo crop. Default `"4:5"`. */
  aspect?: ImageAspect;
  /** Responsive `sizes` for the photo. Default fits a 4-column grid. */
  sizes?: string;
  /** Above the fold: load the photo eagerly. */
  priority?: boolean;
  /** Title level. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** Sale badge text: "Sale" or the discount ("−20%"). Default `"percent"`. */
  saleStyle?: "label" | "percent";
  /** "From $40" (default) or "$40 – $85". */
  rangeStyle?: "from" | "range";
  /** Swatches shown before "+N more". Default 5. */
  maxSwatches?: number;
  /** Controlled swatch index (client components). Without it the radios are uncontrolled and CSS swaps the photo. */
  swatchIndex?: number;
  defaultSwatchIndex?: number;
  onSwatchChange?: (index: number) => void;
  /** Your own add-to-cart control, placed on the photo. No cart logic lives in the card. */
  quickAdd?: React.ReactNode;
  /** Or: a built-in round "+" button that calls this with the chosen swatch index. */
  onQuickAdd?: (swatchIndex: number) => void;
  /** Wishlist / save control, placed top-end on the photo. */
  wishlist?: React.ReactNode;
  /** Called when the title link is followed (e.g. to remember the chosen swatch). */
  onNavigate?: (swatchIndex: number) => void;
  className?: string;
  labels?: CommerceBlockLabels;
  locale?: string;
  components?: BlockAdapters;
}

const MAX_SWAP = 8;
const GRID_SIZES = "(min-width: 64rem) min(23vw, 18rem), (min-width: 40rem) 45vw, 90vw";

/** Discount in whole percent, or null when there is none. */
export function discountPercent(price: MoneyValue | undefined, compareAt: MoneyValue | undefined): number | null {
  if (!price || !compareAt || price.currency !== compareAt.currency) return null;
  const now = Number(price.amount);
  const was = Number(compareAt.amount);
  if (!(was > now) || !(now >= 0)) return null;
  return Math.round(((was - now) / was) * 100);
}

/** Index of the chosen swatch radio inside a card element (uncontrolled cards). */
const chosenIn = (el: Element | null): number => {
  const input = el?.closest("[data-product-card]")?.querySelector<HTMLInputElement>("input[data-swatch]:checked");
  return input ? Number(input.value) : 0;
};

/**
 * A product tile: photo (with a second photo on hover, or one photo per colour swatch), sale /
 * new / sold-out badges, vendor and title (the title link covers the card), the price — sale price
 * with the regular one struck through, or a price range — star rating, colour swatches, and slots
 * for quick add and wishlist. No cart logic inside. Server component: swatches are native radios and
 * CSS swaps the photo; pass `swatchIndex` / `onSwatchChange` / `onQuickAdd` from a client component
 * when you need the choice in state.
 *
 * ```tsx
 * <ProductCard title="Tide mug" href="/shop/tide-mug" image={photo} price={{ amount: "38", currency: "USD" }}
 *   compareAt={{ amount: "48", currency: "USD" }} rating={{ value: 4.7, count: 52 }} />
 * ```
 */
export function ProductCard(props: ProductCardProps) {
  const {
    title,
    href,
    vendor,
    image,
    hoverImage,
    price,
    compareAt,
    priceRange,
    isNew,
    soldOut,
    badge,
    rating,
    swatches = [],
    layout = "stack",
    size = "md",
    aspect = "4:5",
    sizes,
    priority,
    headingLevel = 3,
    saleStyle = "percent",
    rangeStyle = "from",
    maxSwatches = 5,
    swatchIndex,
    defaultSwatchIndex = 0,
    onSwatchChange,
    quickAdd,
    onQuickAdd,
    wishlist,
    onNavigate,
    className,
    labels,
    locale = "en-US",
    components,
  } = props;
  const t = commerceText(labels, locale);
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const titleId = `pc-${uid}-title`;
  const Heading = `h${headingLevel}` as "h3";
  const row = layout === "row";

  const shown = swatches.slice(0, Math.max(0, maxSwatches));
  const extra = swatches.length - shown.length;
  const controlled = swatchIndex !== undefined;
  const chosen = controlled ? swatchIndex : defaultSwatchIndex;
  const chosenSwatch = swatches[chosen];
  // One photo per swatch (when they carry photos), else the main photo + optional hover photo.
  const swapPhotos = shown.slice(0, MAX_SWAP).some((sw) => sw.image);
  const photos: { img: SiteImage2; i?: number; hover?: boolean }[] = swapPhotos
    ? shown.slice(0, MAX_SWAP).map((sw, i) => ({ img: sw.image ?? image!, i })).filter((p) => p.img)
    : [...(image ? [{ img: image, i: 0 }] : []), ...(hoverImage ? [{ img: hoverImage, hover: true }] : [])];

  // The photo that carries the alt text: the chosen swatch's when the choice is in state.
  const altIndex = swapPhotos && controlled && chosen < photos.length ? chosen : 0;
  const pct = discountPercent(price, compareAt);
  const onSale = pct !== null && !priceRange;
  const unavailable = soldOut || (controlled && chosenSwatch?.soldOut);
  const imgSizes = sizes ?? (row ? "(min-width: 40rem) 12rem, 8rem" : size === "lg" ? "(min-width: 64rem) 40vw, 90vw" : GRID_SIZES);

  const quickAddButton = onQuickAdd ? (
    <button
      type="button"
      disabled={!!unavailable}
      aria-label={chosenSwatch && controlled ? t("quickAddVariant", { name: title, variant: chosenSwatch.name }) : t("quickAdd", { name: title })}
      title={unavailable ? t("soldOut") : undefined}
      onClick={(e) => {
        const i = controlled ? swatchIndex : chosenIn(e.currentTarget);
        if (soldOut || swatches[i]?.soldOut) return;
        onQuickAdd(i);
      }}
      className={cn(buttonVariants({ variant: "secondary", size: "icon", pill: true }), "vb-pc-quick bg-surface shadow-sm")}
    >
      <Plus aria-hidden />
    </button>
  ) : (
    quickAdd
  );

  return (
    <article
      aria-labelledby={titleId}
      data-product-card=""
      data-layout={layout}
      data-sold-out={soldOut ? "" : undefined}
      className={cn("vb-pc group relative flex gap-3", row ? "flex-row items-start gap-4 @lg:gap-6" : "flex-col", className)}
    >
      <div className={cn("vb-pc-media relative isolate overflow-hidden rounded-ui-lg bg-surface-2", row ? "w-32 shrink-0 @lg:w-48" : "w-full")}>
        {photos.length ? (
          photos.map((p, k) => (
            <div key={k} className={cn("vb-pc-photo", k > 0 && "absolute inset-0")} data-i={p.i} data-hover={p.hover ? "" : undefined} aria-hidden={k !== altIndex ? true : undefined}>
              <BlockImage
                {...p.img}
                alt={k === altIndex ? (p.img.alt ?? "") : ""}
                decorative={k !== altIndex || !p.img.alt}
                aspect={aspect}
                sizes={imgSizes}
                priority={priority && k === 0}
                components={components}
                className="w-full"
                imgClassName="transition-[scale] duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
              />
            </div>
          ))
        ) : (
          <div aria-hidden className="vb-pc-photo w-full" style={{ aspectRatio: typeof aspect === "number" ? String(aspect) : aspect.replace(":", " / ") }} />
        )}

        {soldOut || onSale || isNew || badge ? (
          <div className="pointer-events-none absolute start-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5">
            {soldOut ? <span className="vb-pc-badge bg-fg text-scene">{t("soldOut")}</span> : null}
            {!soldOut && onSale ? <span className="vb-pc-badge bg-danger-solid text-white">{saleStyle === "percent" ? t("saleOff", { percent: pct }) : t("saleBadge")}</span> : null}
            {isNew ? <span className="vb-pc-badge bg-surface text-fg">{t("newBadge")}</span> : null}
            {badge ? <span className="vb-pc-badge bg-surface text-fg">{badge}</span> : null}
          </div>
        ) : null}

        {wishlist ? <div className="absolute end-2.5 top-2.5 z-20">{wishlist}</div> : null}
        {quickAddButton ? <div className={cn("vb-pc-quick-slot absolute end-2.5 bottom-2.5 z-20", row && "hidden")}>{quickAddButton}</div> : null}
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col gap-2 px-0.5", row && "py-1")}>
        {vendor ? <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{vendor}</p> : null}
        <div className={cn("flex gap-x-3 gap-y-1", row ? "flex-col" : "flex-wrap items-baseline justify-between")}>
          <Heading id={titleId} className={cn("min-w-0 font-display leading-tight text-fg", size === "lg" ? "text-[1.6rem]" : "text-[1.2rem]")}>
            <BlockLink
              href={href}
              components={components}
              labels={labels}
              locale={locale}
              onClick={onNavigate ? (e) => onNavigate(controlled ? swatchIndex : chosenIn(e.currentTarget)) : undefined}
              className="rounded-[2px] focus-ring after:absolute after:inset-0 after:z-0 after:content-[''] hover:underline hover:decoration-line hover:underline-offset-4"
            >
              {title}
            </BlockLink>
          </Heading>
          <Price price={price} compareAt={onSale ? compareAt : undefined} range={priceRange} rangeStyle={rangeStyle} t={t} locale={locale} />
        </div>

        {rating ? <StarRating value={rating.value} count={rating.count} size="sm" labels={labels} locale={locale} /> : null}

        {shown.length ? (
          <fieldset className="vb-pc-swatches relative z-10 m-0 flex min-w-0 items-center justify-between gap-3 border-0 p-0">
            <legend className="sr-only">{t("optionsOf", { name: title })}</legend>
            <div className="flex items-center gap-1">
              {shown.map((sw, i) => (
                <label key={i} className="vb-pc-sw grid size-7 cursor-pointer place-items-center rounded-full" data-i={i < MAX_SWAP ? i : undefined} data-sold-out={sw.soldOut ? "" : undefined} title={sw.name}>
                  <input
                    type="radio"
                    name={`pc-${uid}-swatch`}
                    value={i}
                    data-swatch=""
                    className="sr-only"
                    {...(controlled ? { checked: i === swatchIndex, ...(onSwatchChange ? null : { readOnly: true }) } : { defaultChecked: i === defaultSwatchIndex })}
                    onChange={onSwatchChange ? (e) => e.currentTarget.checked && onSwatchChange(i) : undefined}
                  />
                  <span className="sr-only">
                    {sw.name}
                    {sw.soldOut ? `, ${t("soldOut")}` : ""}
                  </span>
                  <span aria-hidden className="vb-pc-dot size-[1.125rem] rounded-full" style={{ background: sw.color }} />
                </label>
              ))}
              {extra > 0 ? <span className="ms-1 text-xs text-fg-muted tabular">{t("moreOptions", { count: extra })}</span> : null}
            </div>
            <p aria-hidden className="vb-pc-names relative min-w-0 flex-1 truncate text-end text-small text-fg-muted">
              {shown.slice(0, MAX_SWAP).map((sw, i) => (
                <span key={i} className="vb-pc-name" data-i={i}>
                  {sw.name}
                  {sw.soldOut ? ` · ${t("soldOut").toLowerCase()}` : ""}
                </span>
              ))}
            </p>
          </fieldset>
        ) : null}

        {row && quickAddButton ? <div className="relative z-10 pt-1">{quickAddButton}</div> : null}
      </div>
    </article>
  );
}

function Price({ price, compareAt, range, rangeStyle, t, locale }: { price?: MoneyValue; compareAt?: MoneyValue; range?: ProductCardData["priceRange"]; rangeStyle: "from" | "range"; t: CommerceText; locale: string }) {
  if (range) {
    const min = formatMoney(range.min, locale);
    const text = rangeStyle === "range" && range.max.amount !== range.min.amount ? t("priceRange", { min, max: formatMoney(range.max, locale) }) : t("priceFrom", { price: min });
    return <p className="vb-pc-price tabular shrink-0 text-fg">{text}</p>;
  }
  if (!price) return null;
  const now = formatMoney(price, locale);
  if (!compareAt) return <p className="vb-pc-price tabular shrink-0 text-fg">{now}</p>;
  const was = formatMoney(compareAt, locale);
  return (
    <p className="vb-pc-price tabular flex shrink-0 items-baseline gap-2">
      <span className="sr-only">
        {t("priceNow", { price: now })}, {t("priceWas", { price: was })}
      </span>
      <span aria-hidden className="font-medium text-danger-ink">
        {now}
      </span>
      <s aria-hidden className="text-small text-fg-muted decoration-1">
        {was}
      </s>
    </p>
  );
}

export interface ProductJsonLdOptions {
  /** Absolute product URL; defaults to `product.href`. */
  url?: string;
  sku?: string;
  brand?: string;
  description?: string;
  /** Extra image URLs (absolute). */
  images?: string[];
}

/**
 * schema.org `Product` for a product page: name, image, brand, `Offer` (or `AggregateOffer` for a
 * price range) with availability, and `AggregateRating` when the product has reviews. Pass it to
 * `<JsonLd data={…} />`. Use it on the product page, not on every card in a grid.
 */
export function productJsonLd(product: ProductCardData, opts: ProductJsonLdOptions = {}): Record<string, unknown> {
  const url = opts.url ?? product.href;
  const images = [product.image?.src, ...(product.swatches ?? []).map((s) => s.image?.src), ...(opts.images ?? [])].filter((s): s is string => !!s);
  const allSoldOut = product.soldOut || (product.swatches?.length ? product.swatches.every((s) => s.soldOut) : false);
  const availability = `https://schema.org/${allSoldOut ? "OutOfStock" : "InStock"}`;
  const offers = product.priceRange
    ? { "@type": "AggregateOffer", lowPrice: product.priceRange.min.amount, highPrice: product.priceRange.max.amount, priceCurrency: product.priceRange.min.currency, availability, url }
    : product.price
      ? { "@type": "Offer", price: product.price.amount, priceCurrency: product.price.currency, availability, url }
      : undefined;
  return {
    "@type": "Product",
    name: product.title,
    url,
    ...(images.length ? { image: [...new Set(images)] } : null),
    ...(opts.sku ? { sku: opts.sku } : null),
    ...(opts.brand ? { brand: { "@type": "Brand", name: opts.brand } } : null),
    ...(opts.description ? { description: opts.description } : null),
    ...(offers ? { offers } : null),
    ...(product.rating && product.rating.count ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.value, reviewCount: product.rating.count, bestRating: 5, worstRating: 1 } } : null),
  };
}

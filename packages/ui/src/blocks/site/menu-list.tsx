import * as React from "react";
import { cn2 as cn } from "./shared/kit-2";
import { slugify } from "../../lib/text";
import { Section, Container } from "../section";
import { SectionHeader } from "../section-header";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import type { MoneyValue } from "../schema/types";
import { site2Text, type Site2BlockLabels, type Site2Key, type Site2Text } from "./shared/labels-2";
import { fieldAttr, formatMoney, formatMoneyLong, textOf, useBlockIds2, type SiteImage2 } from "./shared/kit-2";

export type MenuVariant = "classic" | "photo" | "service-list";
export type MenuTag = "vegetarian" | "vegan" | "gluten-free" | "spicy" | "new" | "chef-pick";
/** The 14 EU / Codex allergens. */
export const ALLERGENS = ["gluten", "crustaceans", "eggs", "fish", "peanuts", "soybeans", "milk", "nuts", "celery", "mustard", "sesame", "sulphites", "lupin", "molluscs"] as const;
export type Allergen = (typeof ALLERGENS)[number];

const TAG_KEY: Record<MenuTag, Site2Key> = { vegetarian: "tagVegetarian", vegan: "tagVegan", "gluten-free": "tagGlutenFree", spicy: "tagSpicy", new: "tagNew", "chef-pick": "tagChefPick" };

export interface MenuPrice {
  /** "Small", "Bottle", "50 min". */
  label?: React.ReactNode;
  /** Missing = "Market price". */
  amount?: MoneyValue;
}

export interface MenuItem {
  name: React.ReactNode;
  description?: React.ReactNode;
  /** 1–4 prices. */
  prices: MenuPrice[];
  /** "50 min" (service-list). */
  duration?: React.ReactNode;
  tags?: MenuTag[];
  allergens?: Allergen[];
  /** Square photo (`photo` variant). */
  image?: SiteImage2;
  /** "Not today" — shown as a label, never a strikethrough. */
  unavailable?: boolean;
  /** service-list: the item's booking link (falls back to `bookHref`). */
  bookHref?: string;
}

export interface MenuCategory {
  title: React.ReactNode;
  note?: React.ReactNode;
  items: MenuItem[];
  /** Anchor id; default derived from the title. */
  anchor?: string;
}

export interface MenuListProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * classic: printed-menu feel — dotted leaders, tabular prices, serif category titles under a
   * thin double rule. photo: a 72px square photo per item. service-list: spa/salon rows of
   * service · duration · price with a "Book" link.
   */
  variant?: MenuVariant;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  lead?: React.ReactNode;
  categories: MenuCategory[];
  /** Required by D6-8: "Prices include VAT. 10% service is not added." */
  priceNote?: React.ReactNode;
  /** Sticky category jump bar. Default: more than two categories. */
  showNav?: boolean;
  /** service-list: booking page for every row. */
  bookHref?: string;
  /** Show allergen lists under items. Default true. */
  showAllergens?: boolean;
  labels?: Site2BlockLabels;
}

/**
 * Restaurant menus and spa/salon price lists — also a QR-menu page. Category jump bar with plain
 * anchors, money through `Intl` (full currency name for screen readers), tags as words (never
 * emoji), the 14 allergens localized. Server component, 0 JS.
 *
 * ```tsx
 * <MenuList title="The *menu*" priceNote="Prices include VAT." categories={[{ title: "Cold meze", items: [{ name: "Haydari", prices: [{ amount: { amount: "180", currency: "TRY" } }] }] }]} />
 * ```
 */
export function MenuList({
  variant = "classic",
  eyebrow,
  title,
  lead,
  categories: all,
  priceNote,
  showNav,
  bookHref,
  showAllergens = true,
  id,
  anchor,
  theme,
  headingLevel = 2,
  className,
  labels,
  locale = "en-US",
  components,
  editMode,
}: MenuListProps) {
  const t = site2Text(labels, locale);
  const { base, headingId } = useBlockIds2(id, "menu");
  const categories = all.filter((c) => c.items.length > 0 || editMode);
  const nav = showNav ?? categories.length > 2;
  const catId = (c: MenuCategory, i: number) => c.anchor ?? (`${slugify(textOf(c.title), { locale }) || "section"}-${i}` as string);
  const ctx: ItemCtx = { t, locale, components, labels, editMode, variant, bookHref, showAllergens };

  return (
    <Section theme={theme} anchor={anchor} headingId={title ? headingId : undefined} blockId={id} blockType="menu" editMode={editMode} className={cn("vb-menu", className)} data-variant={variant}>
      <Container className="flex flex-col gap-10 @4xl:gap-14">
        {title || eyebrow || lead ? <SectionHeader eyebrow={eyebrow} title={title} lead={lead} headingId={headingId} headingLevel={headingLevel} align="split" editMode={editMode} labels={labels} locale={locale} /> : null}

        {nav ? (
          <nav aria-label={t("menuCategories")} className="vb-menu-nav sticky top-[var(--topbar-h,0px)] z-10 -mx-(--gutter) border-b border-line bg-scene px-(--gutter)">
            <ul className="scrollbar-none flex gap-1 overflow-x-auto py-2">
              {categories.map((c, i) => (
                <li key={i} className="shrink-0">
                  <a href={`#${base}-${catId(c, i)}`} className="inline-flex h-10 items-center whitespace-nowrap rounded-full px-3.5 text-sm text-fg-muted transition-colors hover:bg-hover hover:text-fg focus-ring">
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="flex flex-col gap-14 @4xl:gap-20">
          {categories.map((c, ci) => {
            const hid = `${base}-${catId(c, ci)}`;
            return (
              <section key={ci} id={hid} aria-labelledby={`${hid}-h`} className="vb-menu-cat flex flex-col gap-6">
                <div className="flex flex-col gap-2 border-t-[3px] border-double border-line pt-5 @2xl:flex-row @2xl:items-baseline @2xl:justify-between @2xl:gap-8">
                  <h3 id={`${hid}-h`} className="font-display text-display-m text-fg" {...fieldAttr(editMode, `categories.${ci}.title`)}>
                    {c.title}
                  </h3>
                  {c.note ? <p className="max-w-[44ch] text-small text-fg-muted @2xl:text-end">{c.note}</p> : null}
                </div>
                {variant === "service-list" ? (
                  <ul className="flex flex-col">
                    {c.items.map((item, ii) => (
                      <ServiceRow key={ii} item={item} ctx={ctx} />
                    ))}
                  </ul>
                ) : (
                  <ul className={cn("grid gap-x-(--gutter) gap-y-7", variant === "classic" && "@4xl:grid-cols-2 @4xl:gap-x-16")}>
                    {c.items.map((item, ii) => (
                      <DishItem key={ii} item={item} ctx={ctx} />
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        {priceNote ? (
          <p className="border-t border-line pt-5 text-small text-fg-muted" {...fieldAttr(editMode, "priceNote")}>
            {priceNote}
          </p>
        ) : null}
      </Container>
    </Section>
  );
}

interface ItemCtx {
  t: Site2Text;
  locale: string;
  components?: BlockBaseProps["components"];
  labels?: Site2BlockLabels;
  editMode?: boolean;
  variant: MenuVariant;
  bookHref?: string;
  showAllergens: boolean;
}

function Price({ price, ctx, className }: { price: MenuPrice; ctx: ItemCtx; className?: string }) {
  if (!price.amount) return <span className={cn("text-small text-fg-muted", className)}>{ctx.t("marketPrice")}</span>;
  return (
    <span className={cn("tabular text-fg", className)}>
      <span aria-hidden>{formatMoney(price.amount, ctx.locale)}</span>
      <span className="sr-only">{formatMoneyLong(price.amount, ctx.locale)}</span>
    </span>
  );
}

function Prices({ item, ctx }: { item: MenuItem; ctx: ItemCtx }) {
  if (item.prices.length === 1 && !item.prices[0]!.label) return <Price price={item.prices[0]!} ctx={ctx} className="font-medium" />;
  return (
    <span className="flex flex-wrap justify-end gap-x-4 gap-y-1">
      {item.prices.slice(0, 4).map((p, i) => (
        <span key={i} className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
          {p.label ? <span className="text-xs text-fg-muted">{p.label}</span> : null}
          <Price price={p} ctx={ctx} className="font-medium" />
        </span>
      ))}
    </span>
  );
}

function Tags({ item, ctx }: { item: MenuItem; ctx: ItemCtx }) {
  const words = [
    ...(item.unavailable ? [<span key="u" className="text-fg">{ctx.t("unavailable")}</span>] : []),
    ...(item.tags ?? []).map((tag) => (
      <span key={tag} className="text-accent-ink">
        {ctx.t(TAG_KEY[tag])}
      </span>
    )),
  ];
  if (!words.length) return null;
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-eyebrow uppercase tracking-[0.06em]">
      {words}
    </span>
  );
}

function Allergens({ item, ctx }: { item: MenuItem; ctx: ItemCtx }) {
  if (!ctx.showAllergens || !item.allergens?.length) return null;
  return (
    <p className="text-xs text-fg-muted">
      <span className="font-medium">{ctx.t("allergens")}:</span> {item.allergens.map((a) => ctx.t(`allergen_${a}` as Site2Key)).join(", ")}
    </p>
  );
}

function DishItem({ item, ctx }: { item: MenuItem; ctx: ItemCtx }) {
  const photo = ctx.variant === "photo";
  return (
    <li data-unavailable={item.unavailable ? "" : undefined} className={cn("vb-menu-item flex gap-4", item.unavailable && "opacity-70")}>
      {photo ? (
        item.image?.src ? (
          <BlockImage {...item.image} alt={item.image.alt ?? ""} decorative={!item.image.alt} aspect="1:1" sizes="72px" className="size-[72px] shrink-0 rounded-ui-sm" components={ctx.components} />
        ) : (
          <span aria-hidden className="size-[72px] shrink-0" />
        )
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline gap-3">
          <h4 className="text-body font-medium text-fg">{item.name}</h4>
          {!photo ? <span aria-hidden className="vb-leader min-w-6 flex-1 translate-y-[-0.3em] border-b border-dotted border-fg-subtle" /> : <span className="flex-1" />}
          <Prices item={item} ctx={ctx} />
        </div>
        {item.description ? <p className="max-w-[56ch] text-small text-fg-muted text-pretty">{item.description}</p> : null}
        <Tags item={item} ctx={ctx} />
        <Allergens item={item} ctx={ctx} />
      </div>
    </li>
  );
}

function ServiceRow({ item, ctx }: { item: MenuItem; ctx: ItemCtx }) {
  const href = item.bookHref ?? ctx.bookHref;
  const name = textOf(item.name);
  return (
    <li data-unavailable={item.unavailable ? "" : undefined} className="grid gap-x-(--gutter) gap-y-2 border-b border-line py-5 first:border-t @2xl:grid-cols-12 @2xl:items-baseline">
      <div className="flex flex-col gap-1.5 @2xl:col-span-6">
        <h4 className="text-body font-medium text-fg">{item.name}</h4>
        {item.description ? <p className="text-small text-fg-muted text-pretty">{item.description}</p> : null}
        <Tags item={item} ctx={ctx} />
      </div>
      <p className="font-mono text-eyebrow uppercase tracking-[0.06em] text-fg-muted @2xl:col-span-2">{item.prices.length === 1 ? item.duration : null}</p>
      <div className="@2xl:col-span-3 @2xl:text-end">
        <Prices item={item} ctx={ctx} />
      </div>
      <div className="@2xl:col-span-1 @2xl:text-end">
        {href && !item.unavailable ? (
          <BlockLink href={href} components={ctx.components} labels={ctx.labels} locale={ctx.locale} aria-label={name ? ctx.t("bookService", { service: name }) : undefined} className="text-small font-medium text-fg underline decoration-line underline-offset-[0.25em] hover:decoration-current focus-ring rounded-[2px]" data-track="book">
            {ctx.t("book")}
          </BlockLink>
        ) : null}
      </div>
    </li>
  );
}

/** schema.org `Menu` → `MenuSection` → `MenuItem` + `Offer`. */
export function menuJsonLd(props: Pick<MenuListProps, "categories"> & { name?: string }): Record<string, unknown> {
  return {
    "@type": "Menu",
    name: props.name,
    hasMenuSection: props.categories.map((c) => ({
      "@type": "MenuSection",
      name: textOf(c.title),
      hasMenuItem: c.items.map((i) => ({
        "@type": "MenuItem",
        name: textOf(i.name),
        description: textOf(i.description) || undefined,
        offers: i.prices.filter((p) => p.amount).map((p) => ({ "@type": "Offer", price: p.amount!.amount, priceCurrency: p.amount!.currency, name: textOf(p.label) || undefined })),
        suitableForDiet: (i.tags ?? []).flatMap((tag) => (tag === "vegan" ? ["https://schema.org/VeganDiet"] : tag === "vegetarian" ? ["https://schema.org/VegetarianDiet"] : tag === "gluten-free" ? ["https://schema.org/GlutenFreeDiet"] : [])),
      })),
    })),
  };
}

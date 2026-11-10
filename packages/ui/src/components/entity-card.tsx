"use client";

import * as React from "react";
import { Building2, Globe, Mail, Package, Phone, Shapes, UserRound } from "lucide-react";
import { cn } from "../lib/cn";
import { useLabels, type LabelFn } from "../lib/labels";
import { useFormat } from "../lib/locale";
import { formatValue, type ValueFormat } from "../lib/value-format";
import { Avatar, type AvatarSize } from "./avatar";
import { Badge } from "./badge";
import { IconButton } from "./button";
import { DescriptionList, type DescriptionEntry } from "./description-list";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Skeleton } from "./skeleton";

export type EntityKind = "person" | "organization" | "product" | "generic";
export type EntityTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

/** A compact fact in the card's stat row ("Open deals · 4", "Lifetime value · $182,400"). */
export interface EntityStat {
  label: string;
  value: number | string;
  format?: ValueFormat;
}

export const entityCardLabels = {
  email: "Email {name}",
  call: "Call {name}",
  website: "Open {name}'s website",
  archived: "Archived",
  selected: "Selected",
};
export type EntityCardLabels = Partial<typeof entityCardLabels>;

export interface EntityCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Changes defaults only: avatar shape and fallback icon. Default `"person"`. */
  kind?: EntityKind;
  name: string;
  /** Role · company, domain, SKU. */
  subtitle?: React.ReactNode;
  /** Photo, logo or product image. Missing → initials (person, organization) or an icon. */
  media?: { src?: string | null; alt?: string; fallback?: React.ReactNode };
  /** Badges after the name (tags, plan, segment). */
  badges?: React.ReactNode;
  /** One status pill ("Active", "Out of stock"). */
  status?: { tone: EntityTone; label: string };
  /** Key facts — a mini Description list. */
  fields?: DescriptionEntry[];
  /** 2–3 numbers in a row. */
  stats?: EntityStat[];
  /** Quick actions. Each is a labelled button or link ("Email Jane Cooper"). */
  actions?: React.ReactNode;
  /** Built-in labelled quick actions: mailto / tel / website links. */
  contact?: { email?: string; phone?: string; website?: string };
  /** Short free text (bio, product summary). */
  description?: React.ReactNode;
  /** The name becomes the card's one primary link (stretched over the card). */
  href?: string;
  /** `card` (grid tile), `compact` (row in a side panel), `header` (top of a record page), `chip` (inline name with a hover card). Default `"card"`. */
  variant?: "card" | "compact" | "header" | "chip";
  /** Heading level of the name. Default `h3` (`h1` for `header`). */
  headingAs?: "h1" | "h2" | "h3" | "h4" | "p";
  /** Muted with an "Archived" badge. */
  archived?: boolean;
  /** Picker state: accent outline + `aria-current`. */
  selected?: boolean;
  /** Skeleton in the variant's shape. */
  loading?: boolean;
  labels?: EntityCardLabels;
}

const KIND_ICON = { person: UserRound, organization: Building2, product: Package, generic: Shapes } as const;

function EntityMedia({ kind, name, media, size, className }: { kind: EntityKind; name: string; media?: EntityCardProps["media"]; size: AvatarSize | "product-lg" | "product"; className?: string }) {
  const Icon = KIND_ICON[kind];
  if (kind === "product" || size === "product" || size === "product-lg") {
    const big = size === "product-lg";
    return (
      <span
        data-slot="entity-media"
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden bg-surface-2 text-fg-subtle ring-1 ring-inset ring-line",
          big ? "aspect-[4/3] w-full rounded-[calc(var(--radius)-2px)]" : size === "xl" ? "size-16 rounded-ui" : size === "lg" ? "size-12 rounded-ui-sm" : "size-10 rounded-ui-sm",
          className,
        )}
      >
        {media?.src ? <img src={media.src} alt={media.alt ?? ""} loading="lazy" className="size-full object-cover" /> : (media?.fallback ?? <Icon aria-hidden strokeWidth={1.5} className={big ? "size-9" : "size-5"} />)}
      </span>
    );
  }
  const avatarSize = size as AvatarSize;
  return (
    <Avatar
      data-slot="entity-media"
      name={name}
      src={media?.src}
      size={avatarSize}
      shape={kind === "person" ? "circle" : "square"}
      fallback={media?.fallback ?? (kind === "generic" ? <Icon aria-hidden /> : undefined)}
      className={cn("ring-2 ring-(--surface-solid)", className)}
      aria-hidden
    />
  );
}

function EntityStats({ stats, size = "md" }: { stats: EntityStat[]; size?: "sm" | "md" | "lg" }) {
  const f = useFormat();
  return (
    <dl data-slot="entity-stats" className="flex flex-wrap gap-y-2">
      {stats.map((s) => (
        <div key={s.label} className="grid min-w-0 flex-auto gap-0.5 border-s border-line px-3 first:border-s-0 first:ps-0 last:pe-0">
          <dt className="truncate text-[11.5px] text-fg-muted">{s.label}</dt>
          <dd className={cn("whitespace-nowrap font-heading font-semibold tracking-[-0.01em] text-fg tabular", size === "lg" ? "text-xl" : size === "sm" ? "text-sm" : "text-base")}>
            {typeof s.value === "number" ? formatValue(f, s.value, s.format ?? "number") : s.format && !Number.isNaN(Number(s.value)) ? formatValue(f, s.value, s.format) : s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ContactActions({ name, contact, t, size = "sm" }: { name: string; contact: NonNullable<EntityCardProps["contact"]>; t: LabelFn<typeof entityCardLabels>; size?: "xs" | "sm" }) {
  return (
    <>
      {contact.email ? (
        <IconButton asChild label={t("email", { name })} size={size} variant="secondary" tooltip={false}>
          <a href={`mailto:${contact.email}`}>
            <Mail />
          </a>
        </IconButton>
      ) : null}
      {contact.phone ? (
        <IconButton asChild label={t("call", { name })} size={size} variant="secondary" tooltip={false}>
          <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>
            <Phone />
          </a>
        </IconButton>
      ) : null}
      {contact.website ? (
        <IconButton asChild label={t("website", { name })} size={size} variant="secondary" tooltip={false}>
          <a href={contact.website} target="_blank" rel="noreferrer">
            <Globe />
          </a>
        </IconButton>
      ) : null}
    </>
  );
}

/**
 * The identity of a record at a glance — a contact, a company, a product, an employee — with
 * key facts and quick actions. An `<article>` with the name as its heading; with `href` the name
 * is the one primary link (stretched over the card) and actions stay separate, labelled buttons.
 *
 * ```tsx
 * <EntityCard
 *   name="Jane Cooper"
 *   subtitle="Head of Operations · Northwind Traders"
 *   status={{ tone: "success", label: "Customer" }}
 *   contact={{ email: "jane@northwind.com", phone: "+1 415 555 0136" }}
 *   fields={[{ key: "owner", label: "Owner", value: "Ayşe Kaya" }]}
 *   href="/contacts/jane-cooper"
 * />
 * ```
 */
export const EntityCard = React.forwardRef<HTMLElement, EntityCardProps>(function EntityCard(
  {
    kind = "person",
    name,
    subtitle,
    media,
    badges,
    status,
    fields,
    stats,
    actions,
    contact,
    description,
    href,
    variant = "card",
    headingAs,
    archived,
    selected,
    loading,
    labels,
    className,
    ...props
  },
  ref,
) {
  const t = useLabels("entityCard", entityCardLabels, labels);
  const H = headingAs ?? (variant === "header" ? "h1" : "h3");
  const headingId = React.useId();

  if (variant === "chip") {
    const chip = (
      <span className="inline-flex max-w-full items-center gap-1.5 align-middle">
        <EntityMedia kind={kind} name={name} media={media} size="xs" className="ring-0" />
        <span className="truncate font-medium">{name}</span>
      </span>
    );
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          {href ? (
            <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} data-slot="entity-chip" className={cn("inline-flex max-w-full rounded-full py-0.5 pe-2 ps-0.5 text-[13px] text-fg hover:bg-hover focus-ring", className)} {...(props as React.HTMLAttributes<HTMLAnchorElement>)}>
              {chip}
            </a>
          ) : (
            <span ref={ref as React.Ref<HTMLSpanElement>} tabIndex={0} data-slot="entity-chip" className={cn("inline-flex max-w-full cursor-default rounded-full py-0.5 pe-2 ps-0.5 text-[13px] text-fg hover:bg-hover focus-ring", className)} {...props}>
              {chip}
            </span>
          )}
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-0">
          <EntityCardPreview kind={kind} name={name} subtitle={subtitle} media={media} badges={badges} status={status} fields={fields} stats={stats} contact={contact} actions={actions} description={description} archived={archived} headingAs="p" className="border-0 bg-transparent shadow-none backdrop-blur-none" labels={labels} />
        </HoverCardContent>
      </HoverCard>
    );
  }

  if (loading) {
    return (
      <article
        ref={ref}
        aria-busy="true"
        data-slot="entity-card"
        data-variant={variant}
        className={cn(variant === "card" && "surface rounded-ui p-(--gap)", variant === "compact" && "flex items-center gap-3 py-2", variant === "header" && "flex items-center gap-5", className)}
        {...props}
      >
        <span className={cn("flex items-center gap-3", variant === "card" && "mb-4")}>
          <Skeleton shape="circle" className={variant === "header" ? "size-16" : variant === "compact" ? "size-8" : "size-10"} />
          <span className="grid flex-1 gap-2">
            <Skeleton className={cn("h-4 rounded-ui-sm", variant === "header" ? "w-56" : "w-32")} />
            <Skeleton className="h-3 w-44 rounded-ui-sm" />
          </span>
        </span>
        {variant === "card" ? (
          <span className="grid gap-2">
            <Skeleton className="h-3 w-full rounded-ui-sm" />
            <Skeleton className="h-3 w-4/5 rounded-ui-sm" />
          </span>
        ) : null}
      </article>
    );
  }

  const title = (
    <H id={headingId} className={cn("min-w-0 text-fg", variant === "header" ? "font-heading text-2xl font-semibold tracking-[-0.02em] sm:text-[1.75rem]" : variant === "compact" ? "truncate text-[13.5px] font-semibold" : "truncate text-[15px] font-semibold tracking-[-0.005em]")}>
      {href ? (
        <a href={href} className="rounded-ui-sm outline-none after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] hover:underline underline-offset-[3px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-(--ring)">
          {name}
        </a>
      ) : (
        name
      )}
    </H>
  );

  const pills =
    status || badges || archived ? (
      <span data-slot="entity-badges" className="flex flex-wrap items-center gap-1">
        {status ? (
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
        ) : null}
        {archived ? <Badge tone="outline">{t("archived")}</Badge> : null}
        {badges}
      </span>
    ) : null;

  const quick =
    contact || actions ? (
      <div data-slot="entity-actions" className="relative z-1 flex shrink-0 flex-wrap items-center gap-1.5">
        {contact ? <ContactActions name={name} contact={contact} t={t} size={variant === "compact" ? "xs" : "sm"} /> : null}
        {actions}
      </div>
    ) : null;

  const shared = {
    ref,
    "data-slot": "entity-card",
    "data-variant": variant,
    "data-kind": kind,
    "data-archived": archived ? "" : undefined,
    "aria-labelledby": headingId,
    "aria-current": selected ? (true as const) : undefined,
    ...props,
  };

  if (variant === "compact") {
    return (
      <article
        {...shared}
        className={cn(
          "group relative flex items-center gap-3 rounded-ui-sm px-2 py-2 transition-colors",
          href && "hover:bg-hover",
          selected && "bg-selected ring-1 ring-inset ring-[color-mix(in_srgb,var(--accent-ink)_45%,transparent)]",
          archived && "opacity-65",
          className,
        )}
      >
        <EntityMedia kind={kind} name={name} media={media} size="md" className="ring-0" />
        <div className="grid min-w-0 flex-1 gap-0.5">
          <div className="flex min-w-0 items-center gap-2">
            {title}
            {status ? (
              <Badge tone={status.tone} dot size="sm" className="shrink-0">
                {status.label}
              </Badge>
            ) : null}
          </div>
          {subtitle ? <p className="truncate text-xs text-fg-muted">{subtitle}</p> : null}
        </div>
        {quick}
      </article>
    );
  }

  if (variant === "header") {
    return (
      <article {...shared} className={cn("relative grid gap-5", archived && "[&_[data-slot=entity-media]]:grayscale", className)}>
        <div className="flex flex-wrap items-start gap-x-5 gap-y-4">
          <EntityMedia kind={kind} name={name} media={media} size="xl" className={kind === "product" ? undefined : "size-16 text-xl"} />
          <div className="grid min-w-0 flex-1 basis-64 gap-1.5">
            {pills}
            {title}
            {subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
            {description ? <p className="max-w-[62ch] text-[13.5px] leading-relaxed text-fg-muted">{description}</p> : null}
          </div>
          {quick ? <div className="self-start">{quick}</div> : null}
        </div>
        {stats?.length ? (
          <div className="border-y border-line py-3">
            <EntityStats stats={stats} size="lg" />
          </div>
        ) : null}
        {fields?.length ? (
          <div className="@container">
            <DescriptionList items={fields} layout="grid" size="sm" className="grid-cols-2 @2xl:grid-cols-3" />
          </div>
        ) : null}
      </article>
    );
  }

  // card
  const productTile = kind === "product";
  return (
    <article
      {...shared}
      className={cn(
        "surface group relative flex flex-col overflow-hidden rounded-ui transition-[border-color,box-shadow]",
        href && "hover:border-field-border-hover",
        selected && "border-[color-mix(in_srgb,var(--accent-ink)_55%,var(--line))] shadow-[0_0_0_1px_color-mix(in_srgb,var(--accent-ink)_55%,transparent)]",
        archived && "[&>*]:opacity-70",
        className,
      )}
    >
      {productTile ? (
        <div className="p-1.5 pb-0">
          <EntityMedia kind={kind} name={name} media={media} size="product-lg" />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-(--gap)">
        <div className="flex min-w-0 items-start gap-3">
          {!productTile ? <EntityMedia kind={kind} name={name} media={media} size="lg" /> : null}
          <div className="grid min-w-0 flex-1 gap-0.5">
            {title}
            {subtitle ? <p className="truncate text-[12.5px] text-fg-muted">{subtitle}</p> : null}
          </div>
        </div>
        {pills}
        {description ? <p className="line-clamp-3 text-[13px] leading-relaxed text-fg-muted">{description}</p> : null}
        {stats?.length ? (
          <div className="rounded-ui-sm bg-surface-2 px-3 py-2.5">
            <EntityStats stats={stats} size="sm" />
          </div>
        ) : null}
        {fields?.length ? <DescriptionList items={fields} layout="grid" size="sm" className="relative z-1 grid-cols-2 gap-y-3" /> : null}
        {quick ? <div className="mt-auto flex items-center pt-1">{quick}</div> : null}
      </div>
    </article>
  );
});

/** The card shown inside the chip variant's hover card. */
function EntityCardPreview(props: EntityCardProps) {
  return <EntityCard {...props} />;
}

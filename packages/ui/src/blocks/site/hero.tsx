import * as React from "react";
import { cn } from "../../lib/cn";
import { Container, Section } from "../section";
import { BlockHeading, renderEmphasis } from "../block-heading";
import { BlockImage } from "../block-image";
import { BlockLink } from "../block-link";
import type { BlockBaseProps } from "../types";
import { HeroVideo } from "./hero-video";
import { ArrowEnd, CtaList, field, siteText, useBlockIds, type SiteBlockLabels, type SiteCta, type SiteImage, type SiteMeta } from "./_kit-1";
import { headingLines } from "./shared/heading-lines";
import { columnSizes, SITE_SIZES } from "./shared/image-sizes";

export type HeroVariant = "editorial" | "split-media" | "full-bleed" | "product" | "statement";

export interface HeroProps extends Omit<BlockBaseProps, "variant" | "labels"> {
  /**
   * editorial: huge start-aligned title, narrow lead, a 21:9 photo strip bleeding edge to edge.
   * split-media: 7/5 split, a 4:5 portrait bleeding off the end edge with a mono caption.
   * full-bleed: full-screen photo/video under a scrim, title bottom-start, an aside card bottom-end.
   * product: release chip, title, two actions, a real screenshot cropped by the section edge.
   * statement: one centred sentence, services as slash-separated links. No image.
   */
  variant?: HeroVariant;
  /** Small mono line above the title ("Agency · Maltepe, Istanbul"). */
  eyebrow?: React.ReactNode;
  /** The page `h1`. A string supports one `*emphasis*`; `\n` sets a line break (each line is a block, joined by a real space so search engines and screen readers read "közde, muhabbet"). ≤ 9 words reads best. */
  title: React.ReactNode;
  lead?: React.ReactNode;
  /** Up to two actions; one primary. */
  actions?: SiteCta[];
  /** `sizes`: editorial strip and full-bleed `100vw`; split-media portrait `(min-width: 56rem) 42vw, 100vw` (it bleeds to the edge). Above the fold: always `priority`. */
  media?: SiteImage;
  /** full-bleed: muted looping MP4 (`media` is the required poster). */
  video?: { src: string };
  /** split-media: mono caption in the photo's corner ("Hammam room, 2nd floor"). */
  caption?: React.ReactNode;
  /** Small true facts ("Founded" · "2014"), up to 4. */
  meta?: SiteMeta[];
  /** product: the product screenshot (no device frame). `sizes`: `min(100vw, 76rem)`. */
  screenshot?: SiteImage;
  /** product: a live composition instead of a screenshot (plain JSX only). */
  visual?: React.ReactNode;
  /** product: chip above the title ("v2.4 · November — what's new"). */
  release?: { label: React.ReactNode; href: string; tag?: React.ReactNode };
  /** statement: services as inline links separated by slashes. */
  services?: { label: React.ReactNode; href: string }[];
  /** full-bleed: corner card (today's hours + "Book a table"). */
  aside?: { title: React.ReactNode; body?: React.ReactNode; cta?: SiteCta };
  /** full-bleed only: `screen` fills the viewport. Default `"auto"`. */
  height?: "auto" | "screen";
  labels?: SiteBlockLabels;
}

/**
 * The first screen and the page `h1`, in five characters per sector — never the generic
 * "centred title + two buttons + abstract visual". Server component; the background video is a
 * tiny island. Above the fold, so nothing animates in.
 *
 * ```tsx
 * <Hero variant="split-media" eyebrow="Day spa · Moda" title="Two hours, *nowhere* to be." media={{ src, alt, width, height }} />
 * ```
 */
export function Hero(props: HeroProps) {
  const { variant = "editorial", id, theme, anchor, className, headingLevel = 1, editMode, components, labels, locale } = props;
  const { base, headingId } = useBlockIds(id, "hero");
  const sectionTheme = variant === "full-bleed" ? { ...theme, mode: "dark" as const } : theme;
  return (
    <Section
      theme={sectionTheme}
      anchor={anchor}
      headingId={headingId}
      blockId={base}
      blockType="hero"
      editMode={editMode}
      components={components}
      labels={labels}
      priority
      data-variant={variant}
      className={cn("vb-hero", className)}
    >
      {variant === "split-media" ? (
        <SplitMedia {...props} headingId={headingId} headingLevel={headingLevel} />
      ) : variant === "full-bleed" ? (
        <FullBleed {...props} headingId={headingId} headingLevel={headingLevel} />
      ) : variant === "product" ? (
        <Product {...props} headingId={headingId} headingLevel={headingLevel} />
      ) : variant === "statement" ? (
        <Statement {...props} headingId={headingId} headingLevel={headingLevel} />
      ) : (
        <Editorial {...props} headingId={headingId} headingLevel={headingLevel} />
      )}
    </Section>
  );
}

type Inner = HeroProps & { headingId: string; headingLevel: 1 | 2 | 3 };

/**
 * Entrance cascade (motion.css `.vm-enter`): CSS keyframes from the first paint, no JS, so the
 * hero never waits for hydration. Follows the SiteShell motion level; off in edit mode.
 */
const ENTER = ["[--vm-i:0]", "[--vm-i:1]", "[--vm-i:2]", "[--vm-i:3]", "[--vm-i:4]", "[--vm-i:5]"] as const;
const enter = (editMode: boolean | undefined, i: number, kind?: "title" | "media") =>
  editMode ? undefined : cn("vm-enter", ENTER[i], kind === "title" && "vm-enter-title", kind === "media" && "vm-enter-media");

function Eyebrow({ children, editMode, className }: { children?: React.ReactNode; editMode?: boolean; className?: string }) {
  if (!children) return null;
  return (
    <p className={cn("font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted", className)} {...field(editMode, "eyebrow")}>
      {renderEmphasis(children)}
    </p>
  );
}

function Lead({ children, editMode, className }: { children?: React.ReactNode; editMode?: boolean; className?: string }) {
  if (!children) return null;
  return (
    <p className={cn("vb-lead text-lead text-fg-muted", className)} {...field(editMode, "lead")}>
      {children}
    </p>
  );
}

function Meta({ items, className }: { items?: SiteMeta[]; className?: string }) {
  if (!items?.length) return null;
  return (
    <dl className={cn("flex flex-col gap-1.5 font-mono text-small text-fg-muted", className)}>
      {items.slice(0, 4).map((m, i) => (
        <div key={i} className="flex gap-2">
          <dt className="text-fg-subtle after:content-['·'] after:ps-2">{m.label}</dt>
          <dd className="text-fg">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Title({ p, size, className }: { p: Inner; size: "display-2xl" | "display-xl"; className?: string }) {
  return (
    <BlockHeading
      id={p.headingId}
      level={p.headingLevel}
      size={size}
      text={headingLines(p.title)}
      editMode={p.editMode}
      field="props.title"
      labels={p.labels}
      locale={p.locale}
      className={cn("vb-hero-title", enter(p.editMode, 1, "title"), className)}
    />
  );
}

/* editorial ----------------------------------------------------------- */

function Editorial(p: Inner) {
  const { eyebrow, lead, actions, meta, media, components, labels, locale, editMode } = p;
  return (
    <>
      <Container className="flex flex-col gap-8">
        <Eyebrow editMode={editMode} className={enter(editMode, 0)}>{eyebrow}</Eyebrow>
        <Title p={p} size="display-xl" className="max-w-[18ch]" />
        <div className="grid gap-x-(--gutter) gap-y-8 pt-2 @4xl:grid-cols-12 @4xl:items-end">
          <div className="flex flex-col gap-6 @4xl:col-span-6 @6xl:col-span-5">
            <Lead editMode={editMode} className={enter(editMode, 2)}>{lead}</Lead>
            <CtaList actions={actions} components={components} labels={labels} locale={locale} max={1} editMode={editMode} className={enter(editMode, 3)} />
          </div>
          <Meta items={meta} className={cn("@4xl:col-span-4 @4xl:col-start-9 @4xl:items-end @4xl:text-end", enter(editMode, 4))} />
        </div>
      </Container>
      {media ? (
        <div className={cn("vb-hero-strip mt-[calc(var(--section-y)*0.6)]", enter(editMode, 4, "media"))}>
          <BlockImage {...media} aspect="21:9" priority sizes={SITE_SIZES.bleed} components={components} labels={labels} editMode={editMode} field="props.media" />
        </div>
      ) : null}
    </>
  );
}

/* split-media ---------------------------------------------------------- */

function SplitMedia(p: Inner) {
  const { eyebrow, lead, actions, meta, media, caption, components, labels, locale, editMode } = p;
  return (
    <Container className="grid gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-start">
      <div className="order-2 flex flex-col gap-7 @4xl:order-1 @4xl:col-span-7 @4xl:pt-[calc(var(--section-y)*0.35)] @6xl:pe-[calc(var(--gutter)*2)]">
        <Eyebrow editMode={editMode} className={enter(editMode, 0)}>{eyebrow}</Eyebrow>
        <Title p={p} size="display-xl" />
        <Lead editMode={editMode} className={cn("max-w-[46ch]", enter(editMode, 2))}>
          {lead}
        </Lead>
        <CtaList actions={actions} components={components} labels={labels} locale={locale} editMode={editMode} className={cn("pt-2", enter(editMode, 3))} />
        <Meta items={meta} className={cn("mt-auto border-t border-line pt-5 @4xl:mt-10", enter(editMode, 4))} />
      </div>
      {media ? (
        <figure className={cn("vb-hero-portrait vb-bleed-end relative order-1 my-0 @4xl:order-2 @4xl:col-span-5", enter(editMode, 1, "media"))} {...field(editMode, "media")}>
          <BlockImage {...media} aspect="4:5" priority sizes={columnSizes(5 / 12, { bleed: true })} className="aspect-square! @4xl:aspect-[4/5]!" components={components} labels={labels} />
          {caption ? (
            <figcaption className="absolute bottom-0 start-0 bg-scene px-3 py-2 font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted" {...field(editMode, "caption")}>
              {caption}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </Container>
  );
}

/* full-bleed ----------------------------------------------------------- */

function FullBleed(p: Inner) {
  const { eyebrow, lead, actions, media, video, aside, height = "auto", components, labels, locale, editMode } = p;
  const t = siteText(labels, locale);
  return (
    <div className={cn("vb-hero-bleed", height === "screen" && "vb-hero-screen")}>
      <div className={cn("vb-hero-media", enter(editMode, 0, "media"))} aria-hidden={video ? undefined : "true"}>
        {media ? (
          <BlockImage {...media} decorative priority sizes={SITE_SIZES.bleed} className="absolute inset-0 h-full" components={components} labels={labels} editMode={editMode} field="props.media" />
        ) : null}
        {video && media ? <HeroVideo src={video.src} poster={media.src} pauseLabel={t("pauseVideo")} playLabel={t("resumeVideo")} /> : null}
      </div>
      <Container className="relative z-[1] grid w-full content-end gap-x-(--gutter) gap-y-10 @4xl:grid-cols-12 @4xl:items-end">
        <div className="flex flex-col gap-6 @4xl:col-span-8 @6xl:col-span-7">
          <Eyebrow editMode={editMode} className={enter(editMode, 0)}>{eyebrow}</Eyebrow>
          <Title p={p} size="display-xl" />
          <Lead editMode={editMode} className={cn("max-w-[52ch] text-fg", enter(editMode, 2))}>
            {lead}
          </Lead>
          <CtaList actions={actions} components={components} labels={labels} locale={locale} editMode={editMode} className={cn("pt-2", enter(editMode, 3))} />
        </div>
        {aside ? (
          <aside className={cn("vb-hero-aside surface flex flex-col gap-3 rounded-ui p-5 @4xl:col-span-4 @4xl:col-start-9 @6xl:col-span-3 @6xl:col-start-10", enter(editMode, 4))} {...field(editMode, "aside")}>
            <p className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{aside.title}</p>
            {aside.body ? <p className="text-body tabular text-fg">{aside.body}</p> : null}
            {aside.cta ? <CtaList actions={[aside.cta]} components={components} labels={labels} locale={locale} size="md" max={1} className="pt-1 [&>a]:w-full" /> : null}
          </aside>
        ) : null}
      </Container>
    </div>
  );
}

/* product -------------------------------------------------------------- */

function Product(p: Inner) {
  const { eyebrow, lead, actions, release, screenshot, visual, meta, components, labels, locale, editMode } = p;
  return (
    <Container className="flex flex-col">
      <div className="flex flex-col gap-7">
        {release ? (
          <BlockLink
            href={release.href}
            components={components}
            labels={labels}
            locale={locale}
            editMode={editMode}
            field="props.release"
            className={cn("group/rel inline-flex w-fit items-center gap-3 rounded-full border border-line py-1 ps-1 pe-3.5 text-small text-fg-muted transition-colors hover:border-field-border-hover hover:text-fg focus-ring", enter(editMode, 0))}
          >
            {release.tag ? <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-eyebrow tracking-[0.04em] text-accent-ink">{release.tag}</span> : null}
            <span>{release.label}</span>
            <ArrowEnd className="group-hover/rel:translate-x-0.5 rtl:group-hover/rel:-translate-x-0.5" />
          </BlockLink>
        ) : (
          <Eyebrow editMode={editMode} className={enter(editMode, 0)}>{eyebrow}</Eyebrow>
        )}
        <div className="grid gap-x-(--gutter) gap-y-7 @4xl:grid-cols-12 @4xl:items-end">
          <Title p={p} size="display-xl" className="@4xl:col-span-8" />
          <div className="flex flex-col gap-6 @4xl:col-span-4">
            <Lead editMode={editMode} className={enter(editMode, 2)}>{lead}</Lead>
            <CtaList actions={actions} components={components} labels={labels} locale={locale} size="md" editMode={editMode} className={enter(editMode, 3)} />
          </div>
        </div>
        <Meta items={meta} className={cn("flex-row flex-wrap gap-x-6", enter(editMode, 4))} />
      </div>
      {screenshot || visual ? (
        <div className={cn("vb-hero-shot mt-[calc(var(--section-y)*0.55)]", enter(editMode, 5, "media"))} {...field(editMode, "screenshot")}>
          {visual ?? <BlockImage {...screenshot!} priority sizes={SITE_SIZES.container} components={components} labels={labels} />}
        </div>
      ) : null}
    </Container>
  );
}

/* statement ------------------------------------------------------------ */

function Statement(p: Inner) {
  const { eyebrow, services, actions, components, labels, locale, editMode } = p;
  return (
    <Container className="flex flex-col items-center gap-10 text-center">
      <Eyebrow editMode={editMode} className={enter(editMode, 0)}>{eyebrow}</Eyebrow>
      <Title p={p} size="display-2xl" className="max-w-[16ch]" />
      {services?.length ? (
        <ul className={cn("flex max-w-(--prose) flex-wrap justify-center gap-x-3 gap-y-2 text-lead text-fg-muted", enter(editMode, 2))} {...field(editMode, "services")}>
          {services.map((s, i) => (
            <li key={i} className="flex items-baseline gap-3">
              {i > 0 ? (
                <span aria-hidden className="text-fg-subtle">
                  /
                </span>
              ) : null}
              <BlockLink href={s.href} components={components} labels={labels} locale={locale} className="rounded-[2px] text-fg underline decoration-line underline-offset-[0.25em] transition-[text-decoration-color] hover:decoration-current focus-ring">
                {s.label}
              </BlockLink>
            </li>
          ))}
        </ul>
      ) : null}
      <CtaList actions={actions} components={components} labels={labels} locale={locale} editMode={editMode} className={cn("justify-center", enter(editMode, 3))} />
    </Container>
  );
}

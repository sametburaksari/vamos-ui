import * as React from "react";
import { Section, type SectionProps } from "./section";
import { BlockImage, type BlockImageProps } from "./block-image";
import { BlockLink, type BlockLinkProps } from "./block-link";
import { RichText, type RichTextProps } from "./rich-text";
import { SectionHeader, type SectionHeaderProps } from "./section-header";
import { BlockHeading, type BlockHeadingProps } from "./block-heading";
import { SkipLink, type SkipLinkProps } from "./section";
import type { BlockLabels } from "./labels";
import type { BlockAdapters } from "./types";

export interface CreateBlocksOptions extends BlockAdapters {
  /** Built-in strings for every bound block (e.g. `blockLabelsTr`). */
  labels?: Partial<BlockLabels>;
  /** Default locale for Intl formatting. */
  locale?: string;
}

/** Props `bind()` fills in: adapters, labels and locale. */
interface Bindable {
  components?: BlockAdapters;
  labels?: Partial<BlockLabels>;
  locale?: string;
}

export interface BoundBlocks {
  Section: React.ComponentType<SectionProps>;
  SectionHeader: React.ComponentType<SectionHeaderProps>;
  BlockHeading: React.ComponentType<BlockHeadingProps>;
  BlockImage: React.ComponentType<BlockImageProps>;
  BlockLink: React.ComponentType<BlockLinkProps>;
  RichText: React.ComponentType<RichTextProps>;
  SkipLink: React.ComponentType<SkipLinkProps>;
  /** Binds the adapters/labels/locale into any block component (yours or the kit's). */
  bind<P extends Bindable>(Component: React.ComponentType<P>): React.ComponentType<P>;
  /** The options, for passing on (`<BlockRenderer components={blocks.adapters} />`). */
  adapters: BlockAdapters;
  labels?: Partial<BlockLabels>;
  locale?: string;
}

/**
 * Binds framework adapters once, without React context (works in Server Components).
 *
 * ```ts
 * // app/blocks.ts
 * import NextImage from "next/image";
 * import NextLink from "next/link";
 * export const { Section, BlockImage, BlockLink, RichText, bind } = createBlocks({ Image: NextImage, Link: NextLink });
 * export const MyHero = bind(Hero);
 * ```
 */
export function createBlocks(options: CreateBlocksOptions = {}): BoundBlocks {
  const { labels, locale, ...adapters } = options;
  function bind<P extends Bindable>(Component: React.ComponentType<P>): React.ComponentType<P> {
    function Bound(props: P) {
      const merged = {
        ...props,
        components: { ...adapters, ...props.components },
        labels: labels || props.labels ? { ...labels, ...props.labels } : undefined,
        locale: props.locale ?? locale,
      } as P;
      return <Component {...merged} />;
    }
    Bound.displayName = `Bound(${Component.displayName ?? Component.name ?? "Block"})`;
    return Bound;
  }
  return {
    Section: bind(Section as React.ComponentType<SectionProps>),
    SectionHeader: bind(SectionHeader as unknown as React.ComponentType<SectionHeaderProps & Bindable>) as React.ComponentType<SectionHeaderProps>,
    BlockHeading: bind(BlockHeading as unknown as React.ComponentType<BlockHeadingProps & Bindable>) as React.ComponentType<BlockHeadingProps>,
    BlockImage: bind(BlockImage),
    BlockLink: bind(BlockLink as React.ComponentType<BlockLinkProps>),
    RichText: bind(RichText),
    SkipLink: bind(SkipLink as React.ComponentType<SkipLinkProps & Bindable>) as React.ComponentType<SkipLinkProps>,
    bind,
    adapters,
    labels,
    locale,
  };
}

/** `data-field` for edit mode (spread onto the element that shows a prop). */
export function fieldAttrs(editMode: boolean | undefined, path: string): { "data-field"?: string } {
  return editMode ? { "data-field": path.startsWith("props.") ? path : `props.${path}` } : {};
}

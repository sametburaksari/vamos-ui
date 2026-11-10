// Layer-1 contracts shared by every site block. Types only.

import type * as React from "react";
import type { VamosImageComponent, VamosLinkComponent } from "../lib/provider";
import type { BlockTheme } from "./schema/types";
import type { BlockLabels } from "./labels";

/** Framework bindings. Defaults: `<img>` and `<a>`. Next.js: `{ Image: NextImage, Link: NextLink }`. */
export interface BlockAdapters {
  Image?: VamosImageComponent;
  Link?: VamosLinkComponent;
}

/** Props every block component accepts (the renderer sets them from the node). */
export interface BlockBaseProps {
  /** One of the block's variants. */
  variant?: string;
  /** Node id (`data-block-id` in edit mode). */
  id?: string;
  /** Level of the block's title: 1 for the page intro, 2 otherwise. The renderer sets it. */
  headingLevel?: 1 | 2 | 3;
  theme?: BlockTheme;
  /** Section anchor (`#menu`). */
  anchor?: string;
  className?: string;
  /** Built-in UI strings (RSC has no context). */
  labels?: Partial<BlockLabels>;
  /** BCP 47 locale for Intl formatting. Default `"en-US"`. */
  locale?: string;
  /** Framework bindings (set once with `createBlocks`). */
  components?: BlockAdapters;
  /** Builder canvas: emit `data-block-id` / `data-field` and empty-field placeholders. */
  editMode?: boolean;
}

/** Runtime info the renderer passes to a registered block. Plain data (crosses RSC boundaries). */
export interface BlockRuntime {
  id: string;
  type: string;
  mode: "view" | "edit";
  /** Schema version after migration. */
  v: number;
}

/** What a registered block component receives: its (localized, validated) props + base props. */
export type BlockComponentProps<P = Record<string, unknown>> = P &
  BlockBaseProps & {
    /** Rendered child blocks per slot (layout blocks). */
    slots?: Record<string, React.ReactNode>;
    block?: BlockRuntime;
  };

/** Plain image data accepted by `BlockImage` and every block's media props. */
export interface ImageData {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
  focal?: { x: number; y: number };
  decorative?: boolean;
}

/** Plain link data accepted by `BlockLink` and every block's action props. */
export interface LinkData {
  href: string;
  label: React.ReactNode;
  newTab?: boolean;
}

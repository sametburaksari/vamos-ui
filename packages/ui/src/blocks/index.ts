// Public API of @vamos-cms/ui/blocks — layer 1 (plain components, server-compatible, no zod).
// Schema: @vamos-cms/ui/blocks/schema · Renderer: @vamos-cms/ui/render.

export { Section, Container, SkipLink, sectionThemeAttributes, accentForeground, type SectionProps, type ContainerProps, type ContainerSize, type SkipLinkProps } from "./section";
export { SectionHeader, type SectionHeaderProps } from "./section-header";
export { BlockHeading, renderEmphasis, type BlockHeadingProps, type BlockHeadingSize } from "./block-heading";
export { BlockImage, type BlockImageProps, type ImageAspect } from "./block-image";
export { BlockLink, type BlockLinkProps } from "./block-link";
export { RichText, renderInline, renderRichBlocks, type RichTextProps, type RichTextRenderOptions } from "./rich-text";
export { JsonLd, mergeJsonLd, serializeJsonLd, type JsonLdProps, type JsonLdNode } from "./json-ld";
export { createBlocks, fieldAttrs, type CreateBlocksOptions, type BoundBlocks } from "./create-blocks";
export { blockLabels, blockLabelsTr, blockText, type BlockLabels } from "./labels";
export type { BlockAdapters, BlockBaseProps, BlockComponentProps, BlockRuntime, ImageData, LinkData } from "./types";

// Pure helpers (no zod) re-exported for components
export { parseEmphasis, stripEmphasis, type EmphasisPart } from "./schema/emphasis";
export { sanitizeHref, isExternalUrl, linkKindOf } from "./schema/safety";
export { pickLocale, type Localized } from "./schema/localized";
export { richToText, richFromText, countWords } from "./schema/rich-doc";
export type { BlockTheme, ImageRef, LinkRef, CtaRef, CtaStyle, BlockNode, VamosDoc, PageDoc, OpeningHours, MoneyValue, AddressValue, SocialLink } from "./schema/types";
export type { RichDoc, RichBlock, RichInline, RichMark } from "./schema/rich-doc";

// Public API of @vamos-cms/ui/render — layer 3: VamosDoc → React. RSC-safe, zero editor code.

export { BlockRenderer, renderDoc, renderPrepared, BlockNotice, type BlockRendererProps, type RenderDocOptions } from "./block-renderer";
export { prepareDoc, resolveDoc, isOutsideSchedule, type PreparedDoc, type PreparedNode, type PreparedStatus, type PreparedQuery, type PrepareOptions, type Resolvers } from "./prepare";
export { RichText, renderInline, renderRichBlocks, type RichTextProps, type RichTextRenderOptions } from "../blocks/rich-text";
export { JsonLd, mergeJsonLd } from "../blocks/json-ld";
/** Alias of `BlockRenderer` (plan 05 vocabulary). */
export { BlockRenderer as DocRenderer } from "./block-renderer";

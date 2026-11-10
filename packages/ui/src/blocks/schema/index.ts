// Public API of @vamos-ui/react/blocks/schema — layer 2 (zod, no React). Server, edge and admin only:
// a site's client bundle never imports this entry (components use `import type`).

export { z } from "zod";

// Formats (frozen — docs/plan/BLOCK-FORMAT.md)
export type {
  BlockNode,
  VamosDoc,
  PageDoc,
  BlockTheme,
  BuiltInAccent,
  ImageRef,
  LinkRef,
  CtaRef,
  CtaStyle,
  MoneyValue,
  AddressValue,
  OpeningHours,
  TimeRange,
  Weekday,
  QueryValue,
  EmbedValue,
  SocialLink,
  SocialNetwork,
  SeoMeta,
  DocMeta,
  BlockSchedule,
} from "./types";
export type {
  RichDoc,
  RichBlock,
  RichInline,
  RichTextRun,
  RichBreak,
  RichMark,
  RichMarkType,
  RichNodeType,
  RichParagraph,
  RichHeading,
  RichList,
  RichListItem,
  RichBlockquote,
  RichCode,
  RichRule,
} from "./rich-doc";
export { RICH_NODE_TYPES, RICH_MARK_TYPES, richFromText, richToText, inlineToText, countWords, forEachRun, isBreak } from "./rich-doc";
export { RichDocSchema, RichBlockSchema, RichInlineSchema, RichMarkSchema, richDocAllows } from "./rich-doc-schema";
export {
  BlockNodeSchema,
  VamosDocSchema,
  PageDocSchema,
  BlockThemeSchema,
  BlockIdSchema,
  BlockTypeSchema,
  AnchorSchema,
  ScheduleSchema,
  SeoMetaSchema,
  docSchemaOf,
  CORE_TEXT_TYPES,
  isCoreTextType,
  ACCENTS,
  VAMOS_DOC_SCHEMA_URL,
  type CoreTextType,
} from "./nodes";

// Localization
export { pickLocale, isLocaleMap, localeChain, localesOf, LOCALE_KEY_RE, type Localized, type LocaleCode, type PickLocaleOptions } from "./localized";
export { localize, localizeProps, type LocalizeOptions } from "./localize";

// Fields
export {
  f,
  getFieldMeta,
  unwrapSchema,
  schemaKind,
  localizedSchema,
  isLocalizedSchema,
  ImageRefSchema,
  LinkRefSchema,
  OpeningHoursSchema,
  TimeRangeSchema,
  EMBED_PROVIDERS,
  SOCIAL_NETWORKS,
  type FieldKind,
  type FieldMeta,
  type FieldOptions,
} from "./fields";
export { BLOCK_ICONS, type BlockIconName } from "./icons";
export { mapFields, walkFields, type FieldVisit, type FieldVisitor } from "./walk";

// Definitions, registry, migrations, validation, lint
export {
  defineBlock,
  createRegistry,
  BlockDefinitionError,
  type BlockDefinition,
  type BlockDefinitionInput,
  type AnyBlockDefinition,
  type BlockRegistry,
  type BlockCategory,
  type BlockRegion,
  type BlockSupports,
  type SlotSpec,
  type FieldHints,
  type BlockPropsOf,
  type Delocalized,
  type JsonLdContext,
} from "./define-block";
export { migrateNode, migrateDoc, docMigrations, CURRENT_DOC_VERSION, type MigrationResult } from "./migrate";
export { validateNode, type ValidationResult } from "./validate";
export { lintPage, CLICHE_PHRASES, oklchHue, type LintOptions, type LintReport } from "./lint";
export type { LintIssue, LintIssueInput, LintCode, LintSeverity } from "./lint-types";

// Pure helpers shared with layer 1
export { parseEmphasis, countEmphasis, stripEmphasis, type EmphasisPart } from "./emphasis";
export { sanitizeHref, isExternalUrl, linkKindOf, hasEmoji, EMOJI_RE, type LinkKind } from "./safety";

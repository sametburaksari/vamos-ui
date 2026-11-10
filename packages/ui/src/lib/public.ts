// Public helpers re-exported from the package root. Owned by the foundations group.
// Component authors: import from these modules directly (`../lib/labels`, `../lib/variants`…).

export { cn } from "./cn";

// Locale, built-in strings, formatting
export {
  LocaleProvider,
  useLocale,
  useMessages,
  useFormat,
  useText,
  mergeMessages,
  directionOf,
  type LocaleProviderProps,
  type LocaleValue,
  type ResolvedMessages,
} from "./locale";
export { useLabels, createLabels, resolveLabels, type LabelFn, type LabelValues, type LabelsProp } from "./labels";
export { formatMessage } from "./message-format";
export { en, type Messages, type MessagesInput } from "../locales/en";
export type { Formatter } from "../format/core";

// Text (search, sort, case, initials, slugs)
export {
  foldText,
  matchText,
  highlightText,
  highlightParts,
  cmdkFilter,
  compareText,
  getCollator,
  upperText,
  lowerText,
  initials,
  slugify,
  registerTextRules,
  baseLanguage,
  type TextRules,
  type SlugifyOptions,
} from "./text";

// Hooks
export { useControllableState, useLatest, useEventCallback, useIsomorphicLayoutEffect, type UseControllableStateOptions } from "./use-controllable-state";
export { composeRefs, useComposedRefs, mergeIds, setRef } from "./compose-refs";
export { useMediaQuery, useBreakpoint, breakpoints } from "./use-media-query";
export { useReducedMotion, useReducedTransparency } from "./use-reduced-motion";
export {
  useHotkeys,
  useIsMac,
  isApplePlatform,
  parseShortcut,
  matchesShortcut,
  shortcutKeys,
  formatKey,
  formatShortcut,
  type Shortcut,
  type ParsedShortcut,
  type UseHotkeysOptions,
} from "./use-hotkeys";
export { useHoverIntent, type UseHoverIntentOptions } from "./use-hover-intent";
export { useContainerWidth, type ContainerSize } from "./use-container-width";

// Shared variants & menu model
export {
  controlVariants,
  itemVariants,
  itemSlots,
  type ControlVariantProps,
  type ItemVariantProps,
  type MenuEntry,
  type MenuItemEntry,
  type MenuCheckboxEntry,
  type MenuRadioEntry,
  type MenuSubmenuEntry,
  type MenuGroupEntry,
  type MenuSeparatorEntry,
  type MenuLabelEntry,
} from "./variants";

// Theming, portals, layers
export { ThemeScope, PortalContainer, usePortalContainer, themeAttributes, type ThemeAxes, type ThemeScopeProps } from "./theme-scope";
export { Layer, LayerProvider, useLayerDepth, layerAttributes, type LayerProps } from "./layer";

// App bridge
export {
  VamosProvider,
  useVamos,
  useLink,
  useImage,
  useCan,
  useNavigation,
  useMediaAdapter,
  SmartLink,
  DefaultLink,
  DefaultImage,
  isExternalHref,
  type VamosProviderProps,
  type VamosContextValue,
  type VamosLinkProps,
  type VamosLinkComponent,
  type VamosImageProps,
  type VamosImageComponent,
  type NavigateOptions,
  type SmartLinkProps,
} from "./provider";

// Async lists (Combobox, Record picker and custom pickers build on it)
export { useAsyncList, type AsyncLoader, type AsyncPage, type AsyncListState, type UseAsyncListOptions } from "./use-async-list";

// Colour parsing, formatting and contrast (Color picker)
export { parseColor, toHex, formatColor, contrastRatio, contrastLevel, readableOn, type ColorFormat } from "./color";

// Forms
export { FieldContext, useFieldContext, useFieldControl, FieldContextReset, focusFirstInvalid, type FieldContextValue, type ControlA11yProps } from "./field-context";

// Client islands for server-compatible components
export { ChipRemoveButton, LocalizedText, LocaleCount, type ChipRemoveButtonProps } from "./islands";

// Public API of @vamos-ui/react/blocks — layer 1 (plain components, server-compatible, no zod).
// Schema: @vamos-ui/react/blocks/schema · Renderer: @vamos-ui/react/render.

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

// Site blocks · registry 1 (definitions with zod live in ./site/registry-1.ts — server/admin only)
export { AnnouncementBar, type AnnouncementBarProps, type AnnouncementVariant, type AnnouncementTone } from "./site/announcement-bar";
export { Navbar, formatSitePhone, type NavbarProps, type NavbarVariant, type NavbarItem, type NavbarLink, type NavbarLocale } from "./site/navbar";
export { Hero, type HeroProps, type HeroVariant } from "./site/hero";
export { FeatureGrid, type FeatureGridProps, type FeatureGridVariant, type FeatureItem } from "./site/feature-grid";
export { LogoStrip, type LogoStripProps, type LogoStripVariant, type LogoItem } from "./site/logo-strip";
export { StatsBand, type StatsBandProps, type StatsBandVariant, type StatItem } from "./site/stats-band";
export { PageIntro, breadcrumbJsonLd, type PageIntroProps, type PageIntroVariant, type PageIntroCrumb } from "./site/page-intro";
export { RichTextSection, type RichTextSectionProps, type RichTextSectionVariant } from "./site/rich-text-section";
export { MediaText, videoEmbedUrl, type MediaTextProps, type MediaTextVariant, type MediaTextVideo } from "./site/media-text";
export { Cta, waLink, type CtaProps, type CtaVariant, type CtaBookingConfig } from "./site/cta";
export { Faq, faqJsonLd, type FaqProps, type FaqVariant, type FaqItem } from "./site/faq";
export { Steps, type StepsProps, type StepsVariant, type StepsItem } from "./site/process";
export { site1Labels, site1LabelsTr, type Site1Labels, type SiteCta, type SiteMeta, type SiteImage } from "./site/_kit-1";

// Site blocks · registry 2 (definitions with zod live in ./site/registry-2.ts — server/admin only)
export { PricingTable, type PricingTableProps, type PricingVariant, type PricingBilling, type PricingPlan, type PricingFeature } from "./site/pricing-table";
export { ComparisonTable, type ComparisonTableProps, type ComparisonVariant, type ComparisonColumn, type ComparisonGroup, type ComparisonRow, type ComparisonValue } from "./site/comparison-table";
export { Testimonials, RatingStars, REVIEW_SOURCE_NAMES, type TestimonialsProps, type TestimonialsVariant, type TestimonialItem, type ReviewSummary, type ReviewSource } from "./site/testimonials";
export { Team, type TeamProps, type TeamVariant, type TeamMember } from "./site/team";
export { BlogList, BlogListSkeleton, type BlogListProps, type BlogListVariant, type PostSummary, type BlogPagination } from "./site/blog-list";
export { ArticleLayout, shareUrl, type ArticleLayoutProps, type ArticleVariant, type ArticlePost, type ArticleAuthor, type ShareTarget } from "./site/article-layout";
export { ContactForm, type ContactFormProps, type ContactFormVariant, type ContactInfo } from "./site/contact-form";
export { MapHours, HoursTable, directionsUrl, mapEmbedUrl, localBusinessJsonLd, type MapHoursProps, type MapHoursVariant, type Branch, type DirectionsProvider, type BusinessType, type HoursDisplay } from "./site/map-hours";
export { MenuList, menuJsonLd, ALLERGENS, type MenuListProps, type MenuVariant, type MenuCategory, type MenuItem, type MenuPrice, type MenuTag, type Allergen } from "./site/menu-list";
export { GallerySection, type GallerySectionProps, type GalleryVariant, type GalleryImage, type GallerySpan } from "./site/gallery-section";
export { ConsentBanner, ConsentDefaults, type ConsentBannerProps, type ConsentVariant } from "./site/consent-banner";
export { ContactDock, type ContactDockProps, type ContactDockVariant, type DockAction, type MessagingProvider } from "./site/contact-dock";
export { EmbedFacade, type EmbedFacadeProps } from "./site/embed-facade";
export { Footer, type FooterProps, type FooterVariant } from "./site/footer";
export { NotFound, type NotFoundProps, type NotFoundVariant, type NotFoundKind } from "./site/not-found";
// Shared modules: opening hours, consent, form contract, brand marks, labels
export { isOpenAt, hoursStatus, hoursOn, weekRows, summarizeHours, orderedWeek, weekStartOf, weekdayName, formatTime, formatRange, zonedMoment, openingHoursJsonLd, describeStatus, type OpenStatus, type OpenState, type WeekRow, type DayHours, type ZonedMoment, type Weekday, type TimeRange } from "./site/shared/opening-hours";
export { OpenNow, type OpenNowProps } from "./site/shared/open-now";
export { ConsentGate, type ConsentGateProps } from "./site/shared/consent-gate";
export { ConsentSettingsButton } from "./site/shared/consent-island";
export { getConsent, onConsent, readConsent, writeConsent, parseConsent, openConsentPreferences, consentDefaultsScript, consentModeSignals, CONSENT_COOKIE, CONSENT_EVENT, CONSENT_OPEN_EVENT, CONSENT_CATEGORIES, type ConsentCategory, type ConsentRecord, type ConsentChoices } from "./site/shared/consent";
export { validateContactForm, isSpam, contactFieldLabel, HONEYPOT_FIELD, type ContactFieldConfig, type ContactFieldName, type SiteFormState, type SiteFormAction, type ContactValidation } from "./site/shared/site-form";
export { BrandIcon, BRAND_NAMES, type BrandName, type BrandIconProps } from "./site/shared/brand-icons";
export { site2Labels, site2LabelsTr, type Site2Labels, type Site2BlockLabels } from "./site/shared/labels-2";

// Site shell: locale switch, inner pages and a scoped accent for whole-site blocks
export { SiteShell, SiteShellPage, SiteShellLocale, SiteShellLink, useSiteShell, type SiteShellProps, type SiteShellPageProps, type SiteShellLocaleProps, type SiteShellLinkProps, type SiteShellContextValue } from "./site/site-shell";
export { siteAccent, siteAccentCss, siteAccentKey, isBuiltInAccent, BUILT_IN_SITE_ACCENTS, SITE_TEXT_CONTRAST, type SiteAccentPalette, type SiteAccentOptions } from "./site/shared/site-accent";
export { sitePageHref, siteLocaleHref, parseSiteHref, readSiteLocation, writeSiteLocation, type SiteRouting, type SiteLocation, type SiteRouteParams } from "./site/shared/site-routing";

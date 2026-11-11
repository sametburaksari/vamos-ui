// Label keys each client island needs. Kept out of the "use client" files: a server component
// importing a plain value from a client module would receive a client reference, not the array.

export const carouselLabelKeys = ["previous", "next", "slideCounter", "slideLabel", "carousel", "slide"] as const;
export type CarouselLabels = Record<(typeof carouselLabelKeys)[number], string>;

export const openNowLabelKeys = ["openNow", "openUntil", "closingSoon", "closingSoonUntil", "openAllDay", "closed", "closedToday", "opensAt", "opensTodayAt", "opensTomorrowAt"] as const;
export type OpenNowLabels = Record<(typeof openNowLabelKeys)[number], string>;

export const contactIslandLabelKeys = [
  "send",
  "sending",
  "sent",
  "optional",
  "errorSummary",
  "errorServer",
  "errorServerCall",
  "privacyRead",
  "privacyLink",
  "privacyRequired",
  "marketingConsent",
  "honeypot",
  "choose",
  "errorRequired",
  "errorEmail",
  "errorPhone",
  "errorTooLong",
] as const;
export type ContactIslandLabels = Record<(typeof contactIslandLabelKeys)[number], string>;

export const consentLabelKeys = [
  "cookies",
  "cookieConsent",
  "acceptAll",
  "rejectAll",
  "preferences",
  "savePreferences",
  "cookiePreferences",
  "cookiePreferencesLead",
  "cookiePolicy",
  "catNecessary",
  "catNecessaryHint",
  "catFunctional",
  "catFunctionalHint",
  "catAnalytics",
  "catAnalyticsHint",
  "catMarketing",
  "catMarketingHint",
  "alwaysOn",
] as const;
export type ConsentLabels = Record<(typeof consentLabelKeys)[number], string>;

export const shareLabelKeys = ["copyLink", "linkCopied"] as const;
export type ShareLabels = Record<(typeof shareLabelKeys)[number], string>;

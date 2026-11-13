import { ConsentBanner, consentDefaultsScript } from "@vamos-ui/react/blocks";

// Google Consent Mode v2 (GA4 / Google Ads): defaults go in <head> BEFORE the gtag script.
// Every choice then calls gtag('consent', 'update', …) and fires a `vb:consent` event.
//
// app/layout.tsx
//   <head>
//     <script dangerouslySetInnerHTML={{ __html: consentDefaultsScript({ version: 2 }) }} />
//     (then <Analytics … /> in <body> loads the Google tag after consent — see "Analytics after consent")
//   </head>
//   <body>{children}<ConsentBanner version={2} policyLink={{ href: "/cookies" }} /></body>
export default function ConsentBannerConsentMode() {
  const snippet = consentDefaultsScript({ version: 2 });
  return (
    <div className="flex w-full flex-col gap-4">
      <pre tabIndex={0} role="region" aria-label="Consent defaults script" className="focus-ring max-h-48 overflow-auto rounded-ui border border-line bg-surface-2 p-4 font-mono text-xs text-fg-muted whitespace-pre-wrap">{snippet}</pre>
      <div className="overflow-hidden rounded-ui border border-line">
        <ConsentBanner version={2} policyLink={{ href: "/cookies" }} contained forceShow />
      </div>
    </div>
  );
}

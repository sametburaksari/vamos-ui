import type { Metadata } from "next";
import { Onest, Instrument_Serif, JetBrains_Mono, Hanken_Grotesk, Bricolage_Grotesque, Geist_Mono, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { fontBootScript } from "@vamos-ui/react/fonts";
import { TooltipProvider } from "@vamos-ui/react";
import "./globals.css";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";

// The four font presets. Only the default (editorial) is preloaded;
// the browser fetches the others when a preset is selected.
const onest = Onest({ subsets: ["latin", "latin-ext"], variable: "--ff-onest" });
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--ff-instrument" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--ff-jetbrains" });
const hanken = Hanken_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--ff-hanken", preload: false });
const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--ff-bricolage" });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--ff-geist-mono", preload: false });
// Variable (wght 100–700): Google serves static Plex instances as `/l/font?kit=…&skey=…` URLs, which Turbopack 15.5 cannot resolve.
const plex = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], variable: "--ff-plex", preload: false });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--ff-plex-mono", preload: false });
const fonts = [onest, instrument, jetbrains, hanken, bricolage, geistMono, plex, plexMono];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Vamos UI — React component kit for admin panels and websites", template: "%s · Vamos UI" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: ["React components", "admin panel", "dashboard", "Tailwind CSS", "design system", "component library", "CMS", "CRM", "Next.js", "MCP"],
  authors: [{ name: "Vamos", url: "https://vamos.ist" }],
  creator: "Vamos",
  publisher: "Vamos",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, url: "/", title: "Vamos UI — React component kit for admin panels and websites", description: SITE_DESCRIPTION, images: [OG_IMAGE], locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Vamos UI — React component kit for admin panels and websites", description: SITE_DESCRIPTION, images: [OG_IMAGE.url] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://vamos.ist/#org", name: "Vamos", url: "https://vamos.ist", logo: `${SITE_URL}/brand/vamos-ui-icon-512.png` },
    { "@type": "WebSite", "@id": `${SITE_URL}/#site`, name: SITE_NAME, url: SITE_URL, description: SITE_DESCRIPTION, publisher: { "@id": "https://vamos.ist/#org" }, inLanguage: "en" },
    {
      "@type": "SoftwareSourceCode",
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      codeRepository: "https://github.com/sametburaksari/vamos-ui",
      programmingLanguage: ["TypeScript", "React"],
      runtimePlatform: "Node.js",
      license: "https://opensource.org/licenses/MIT",
      author: { "@id": "https://vamos.ist/#org" },
    },
  ],
};

// Apply the theme axes before first paint (no flash). A saved non-preset font pairing
// ("fontPairing" in vamos-theme) also gets its tokens and a render-blocking Google Fonts link.
const boot = `try{var s=JSON.parse(localStorage.getItem("vamos-theme")||"{}");var h=document.documentElement;if(s.dark)h.classList.add("dark");h.dataset.material=s.material||"glass";h.dataset.accent=s.accent||"lime";h.dataset.density=s.density||"comfortable";h.dataset.font=s.font||"editorial"}catch(e){}` + fontBootScript("vamos-theme", "fontPairing");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-material="glass" data-accent="lime" data-font="editorial" suppressHydrationWarning className={fonts.map((f) => f.variable).join(" ")}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh font-sans text-[14px]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

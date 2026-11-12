import type { Metadata } from "next";
import { Onest, Instrument_Serif, JetBrains_Mono, Hanken_Grotesk, Bricolage_Grotesque, Geist_Mono, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// The four font presets. Only the default (editorial) is preloaded;
// the browser fetches the others when a preset is selected.
const onest = Onest({ subsets: ["latin", "latin-ext"], variable: "--ff-onest" });
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--ff-instrument" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--ff-jetbrains" });
const hanken = Hanken_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--ff-hanken", preload: false });
const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], variable: "--ff-bricolage", preload: false });
const geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--ff-geist-mono", preload: false });
const plex = IBM_Plex_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], variable: "--ff-plex", preload: false });
const plexMono = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--ff-plex-mono", preload: false });
const fonts = [onest, instrument, jetbrains, hanken, bricolage, geistMono, plex, plexMono];

export const metadata: Metadata = { title: "Vamos", description: "Open-source admin panel and component kit" };

// Apply the theme axes before first paint (no flash).
const boot = `try{var s=JSON.parse(localStorage.getItem("vamos-theme")||"{}");var h=document.documentElement;if(s.dark)h.classList.add("dark");h.dataset.material=s.material||"glass";h.dataset.accent=(["fener","graphite"].indexOf(s.accent)>=0?s.accent:"fener");h.dataset.density=s.density||"comfortable";h.dataset.font=s.font||"editorial"}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-material="glass" data-accent="fener" data-font="editorial" suppressHydrationWarning className={fonts.map((f) => f.variable).join(" ")}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className="min-h-dvh font-sans text-[14px]">{children}</body>
    </html>
  );
}

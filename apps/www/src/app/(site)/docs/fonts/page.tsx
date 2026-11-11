import { fontCategories, fontPairings, googleFonts } from "@vamos-ui/react/fonts";
import { A, C, Callout, Code, DocPage, H2, H3, P, Table } from "@/components/docs/prose";
import { FontCatalog, PairingGallery } from "./specimens";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Fonts", description: "Font presets and pairings for Vamos UI: editorial, grotesk, corporate and system, plus a Google Fonts picker that sets the type tokens.", path: "/docs/fonts/" });

const count = (id: string) => googleFonts.filter((f) => f.category === id).length;

export default function FontsPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title={<>Fonts, <em>paired</em> with care</>}
      description={`${googleFonts.length} Google Fonts families in ${fontCategories.length} categories, ${fontPairings.length} curated pairings, and a loader that requests only what a page uses. Every family covers latin-ext, so Turkish ğ ş ı İ render in the chosen face.`}
      toc={[
        { id: "catalog", title: "Catalog" },
        { id: "pairings", title: "Pairings" },
        { id: "tokens", title: "Tokens", sub: true },
        { id: "loading", title: "Loading fonts" },
        { id: "picker", title: "Font picker", sub: true },
        { id: "boot", title: "No flash on reload", sub: true },
        { id: "privacy", title: "Privacy" },
        { id: "self-host", title: "Self-hosting with next/font" },
      ]}
      prev={{ href: "/docs/theming", title: "Theming" }}
      next={{ href: "/docs/localization", title: "Localization" }}
    >
      <Table
        head={["Category", "Families", "Use for"]}
        rows={[
          ["Sans", count("sans"), "Geometric, humanist and grotesk faces for UI and body text"],
          ["Serif", count("serif"), "Text serifs for long reads, display serifs for headlines"],
          ["Display", count("display"), "Posters, campaigns, one-word headlines"],
          ["Rounded", count("rounded"), "Friendly products, education, health"],
          ["Condensed", count("condensed"), "Tight headlines, stat-heavy headers, dense tables"],
          ["Mono", count("mono"), "Code, IDs, invoice numbers, tabular figures"],
          ["Handwriting", count("handwriting"), "Annotations and small accents — never body text"],
        ]}
      />

      <H2 id="catalog">Catalog</H2>
      <P>
        Every row is set in its own face. Open one to load the full family and see each weight. The list comes from <C>googleFonts</C>, with weights,
        italics, variable axes, subsets and a short note per family — verified against the Google Fonts metadata.
      </P>
      <FontCatalog />

      <H2 id="pairings">Pairings</H2>
      <P>
        A pairing is a heading face, a body face, a mono face and the character of display headings: weight, tracking, how <C>{"<em>"}</C> looks and a
        size scale (wide faces need less size). <C>editorial</C>, <C>grotesk</C>, <C>corporate</C> and <C>system</C> are also <C>data-font</C> presets
        in <C>styles.css</C>.
      </P>
      <PairingGallery />

      <H3 id="tokens">Tokens</H3>
      <Table
        head={["Token", "Set from", "Read by"]}
        rows={[
          [<C key="a">--font-ui</C>, "pairing.body", "font-sans (body, controls)"],
          [<C key="b">--font-heading</C>, "pairing.heading", "font-display"],
          [<C key="c">--font-code</C>, "pairing.mono", "font-mono, tabular numbers"],
          [<C key="d">--display-weight · --display-tracking</C>, "pairing.display", ".font-display"],
          [<C key="e">--display-em</C>, "pairing.display.em", ".font-display em"],
          [<C key="f">--display-scale</C>, "pairing.display.scale", "--text-display-* sizes"],
        ]}
      />

      <H2 id="loading">Loading fonts</H2>
      <P>
        <C>loadGoogleFonts</C> adds one <C>{'<link rel="stylesheet">'}</C> for the families a page has not requested yet, plus preconnect hints for
        both Google origins. Calling it again with the same families does nothing.
      </P>
      <Code
        code={`import { loadGoogleFonts, applyFontPairing, getFontPairing } from "@vamos-ui/react/fonts";

await loadGoogleFonts(["Fraunces", "Figtree"], { display: "swap" });

// Or apply a whole pairing to <html> (data-font + tokens + fonts):
await applyFontPairing(document.documentElement, getFontPairing("boutique")!);`}
      />
      <P>On the server, render the link yourself with the same URL:</P>
      <Code
        code={`import { googleFontsUrl } from "@vamos-ui/react/fonts";

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="stylesheet" href={googleFontsUrl(["Newsreader", "Source Sans 3"])} />`}
      />
      <P>
        For one section only — a website preview inside the CMS, an email template — wrap it in <C>FontProvider</C>. The rest of the panel keeps its
        fonts.
      </P>
      <Code
        code={`import { FontProvider, createFontPairing } from "@vamos-ui/react/fonts";

const brand = createFontPairing({ heading: "Young Serif", body: "Plus Jakarta Sans", mono: "JetBrains Mono" });

<FontProvider pairing={brand}>
  <HomepagePreview />
</FontProvider>`}
      />

      <H3 id="picker">Font picker</H3>
      <P>
        <A href="/docs/components/font-picker">FontPicker</A> and <C>FontPairingPicker</C> let editors choose. The theme switcher in this site&apos;s
        header uses both: pick a pairing, or open Custom and mix any three families.
      </P>

      <H3 id="boot">No flash on reload</H3>
      <P>
        Store the resolved pairing with <C>serializeFontPairing</C>; it keeps the stylesheet URL and the token values, so a tiny inline script can
        apply them before first paint without shipping the catalog. The link is marked <C>blocking=&quot;render&quot;</C>, so supporting browsers
        wait for the CSS (not the font files) and <C>font-display: swap</C> covers the rest.
      </P>
      <Code
        code={`import { fontBootScript, serializeFontPairing } from "@vamos-ui/react/fonts";

// When the user picks:
localStorage.setItem("vamos-theme", JSON.stringify({ ...theme, fontPairing: serializeFontPairing(pairing) }));

// app/layout.tsx
<head>
  <script dangerouslySetInnerHTML={{ __html: fontBootScript("vamos-theme", "fontPairing") }} />
</head>`}
      />

      <H2 id="privacy">Privacy</H2>
      <Callout tone="warning" title="Google Fonts sees your visitors' IP addresses">
        Fetching CSS and font files from <C>fonts.googleapis.com</C> and <C>fonts.gstatic.com</C> sends each visitor&apos;s IP address and user agent
        to Google. Under GDPR and KVKK that is a transfer of personal data; a German court has fined a site for it. For public sites, self-host the
        files and keep the CDN for internal tools and the picker in your admin.
      </Callout>
      <P>
        Self-hosted fonts also skip two connections. Turn the CDN off with <C>load={"{false}"}</C> on <C>FontProvider</C> and{" "}
        <C>loadPreviews={"{false}"}</C> on the pickers.
      </P>

      <H2 id="self-host">Self-hosting with next/font</H2>
      <P>
        <C>next/font/google</C> downloads the files at build time and serves them from your domain — no request reaches Google at runtime. Define the
        three families, expose them as CSS variables and point the tokens at them.
      </P>
      <Code
        title="app/fonts.ts"
        code={`import { Fraunces, Figtree, DM_Mono } from "next/font/google";

// latin-ext keeps ğ ş ı İ in the same face.
export const heading = Fraunces({ subsets: ["latin", "latin-ext"], style: ["normal", "italic"], axes: ["opsz"], variable: "--ff-heading" });
export const body = Figtree({ subsets: ["latin", "latin-ext"], variable: "--ff-body" });
export const mono = DM_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--ff-mono", preload: false });`}
      />
      <Code
        title="app/layout.tsx"
        code={`import { heading, body, mono } from "./fonts";
import { fontPairings, pairingVars } from "@vamos-ui/react/fonts";

const boutique = fontPairings.find((p) => p.id === "boutique")!;
// Keep the pairing's display tokens, swap the families for the self-hosted variables.
const vars = { ...pairingVars(boutique), "--font-heading": "var(--ff-heading)", "--font-ui": "var(--ff-body)", "--font-code": "var(--ff-mono)" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-font="boutique" style={vars as React.CSSProperties} className={[heading, body, mono].map((f) => f.variable).join(" ")}>
      <body className="font-sans">{children}</body>
    </html>
  );
}`}
      />
      <P>
        Not on Next.js? Download the <C>woff2</C> files (the URLs are in the CSS that <C>googleFontsUrl</C> returns), serve them from your own
        origin with <C>@font-face</C> rules, and set the same three tokens.
      </P>
    </DocPage>
  );
}

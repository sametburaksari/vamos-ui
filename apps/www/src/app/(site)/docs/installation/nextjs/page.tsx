import { A, C, Callout, Code, DocPage, H2, P, Step, Steps } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";
import { axesTable, bootScript, CliAlternative, cssImports, firstComponent, TailwindNote } from "../shared";

export const metadata = pageMeta({
  title: "Install with Next.js",
  description: "Step-by-step: add Vamos UI to a Next.js App Router project with Tailwind CSS v4, next/font, the theme boot script and the router bindings.",
  path: "/docs/installation/nextjs/",
});

const fontsCode = `// app/fonts.ts
import { Instrument_Serif, JetBrains_Mono, Onest } from "next/font/google";

// The "editorial" preset (the default). Each font exposes the --ff-* variable the tokens read.
const onest = Onest({ subsets: ["latin", "latin-ext"], variable: "--ff-onest" });
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--ff-instrument" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--ff-jetbrains" });

export const fontVariables = [onest, instrument, jetbrains].map((f) => f.variable).join(" ");`;

const layoutCode = `// app/layout.tsx
import "./globals.css";
import { fontVariables } from "./fonts";
import { Providers } from "./providers";

const boot = \`${bootScript}\`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-material="glass"
      data-accent="lime"
      data-density="comfortable"
      data-font="editorial"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className="min-h-dvh font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`;

const providersCode = `// app/providers.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TooltipProvider } from "@vamos-ui/react";
import { createVamosNextProvider } from "@vamos-ui/react/next";

// Kit links, images and navigate() use the Next.js router.
const VamosNext = createVamosNextProvider({ Link, Image, useRouter, usePathname });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <VamosNext locale="en-US">
      <TooltipProvider>{children}</TooltipProvider>
    </VamosNext>
  );
}`;

export default function NextInstallPage() {
  return (
    <DocPage
      eyebrow="Installation"
      title="Next.js"
      description="Add Vamos UI to a Next.js App Router project. About five minutes."
      toc={[
        { id: "steps", title: "Steps" },
        { id: "cli", title: "With the CLI instead" },
        { id: "notes", title: "Notes" },
      ]}
      prev={{ href: "/docs/installation", title: "Installation" }}
      next={{ href: "/docs/installation/vite", title: "Vite" }}
    >
      <P>Requirements: React 19, Tailwind CSS v4, Node 20 or newer. Next.js 15 is what the docs site itself runs on.</P>

      <H2 id="steps">Steps</H2>
      <Steps>
        <Step title="Create an app with Tailwind v4">
          <Code lang="bash" code="pnpm create next-app@latest my-panel --typescript --tailwind --app --no-src-dir" />
          <P>
            <C>create-next-app</C> sets up Tailwind v4 with <C>@tailwindcss/postcss</C>. In an existing app, check that{" "}
            <C>tailwindcss</C> is version 4 and <C>globals.css</C> starts with <C>@import &quot;tailwindcss&quot;</C>.
          </P>
        </Step>
        <Step title="Install the kit">
          <Code lang="bash" code="pnpm add @vamos-ui/react" />
          <P>
            The npm package is compiled ESM with type declarations and keeps the <C>&quot;use client&quot;</C> directives,
            so no <C>transpilePackages</C> entry is needed.
          </P>
        </Step>
        <Step title="Import the styles">
          <Code lang="css" title="app/globals.css" code={cssImports} />
          <P>Keep the order: Tailwind first, then the kit tokens. Your own CSS goes after both.</P>
          <TailwindNote />
        </Step>
        <Step title="Load the fonts">
          <P>
            <C>data-font</C> presets read <C>--ff-*</C> variables. Load the families of the presets you use with{" "}
            <C>next/font</C>; this is the default editorial preset:
          </P>
          <Code code={fontsCode} />
        </Step>
        <Step title="Set the theme axes on <html>">
          {axesTable}
          <Code code={layoutCode} />
          <P>
            <C>suppressHydrationWarning</C> is needed because the boot script changes the attributes before React hydrates.
          </P>
        </Step>
        <Step title="Connect the router (recommended)">
          <P>
            The kit never imports <C>next/*</C>. Hand it <C>Link</C>, <C>Image</C> and the router once, so sidebars,
            breadcrumbs and command palettes navigate client-side. <C>TooltipProvider</C> makes icon buttons show real
            tooltips instead of a <C>title</C>.
          </P>
          <Code code={providersCode} />
        </Step>
        <Step title="Use a component">
          <Code code={firstComponent("app/page.tsx")} />
          <Code lang="bash" code="pnpm dev" />
        </Step>
      </Steps>

      <H2 id="cli">With the CLI instead</H2>
      <CliAlternative css="app/globals.css" />

      <H2 id="notes">Notes</H2>
      <Callout title="Server components">
        Display components without <C>&quot;use client&quot;</C> render on the server. Interactive ones are client components
        already. Don&apos;t pass functions (event handlers, render props) from a server component into a client part: wrap
        that wiring in your own <C>&quot;use client&quot;</C> file.
      </Callout>
      <P>
        Other fonts: see <A href="/docs/fonts">Fonts</A> for the grotesk, corporate and system presets and Google Fonts
        pairings. Turkish and other locales: <A href="/docs/localization">Localization</A>.
      </P>
    </DocPage>
  );
}

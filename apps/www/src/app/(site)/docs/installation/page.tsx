import { C, Callout, Code, DocPage, H2, P, Step, Steps } from "@/components/docs/prose";

export const metadata = { title: "Installation" };

const fontsCode = `// app/layout.tsx
import { Onest, Instrument_Serif, JetBrains_Mono } from "next/font/google";

// Editorial preset. Each font exposes a --ff-* variable the tokens read.
const onest = Onest({ subsets: ["latin", "latin-ext"], variable: "--ff-onest" });
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--ff-instrument" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--ff-jetbrains" });
const fonts = [onest, instrument, jetbrains];`;

const htmlCode = `// Apply the theme axes before first paint (no flash).
const boot = \`try{var s=JSON.parse(localStorage.getItem("vamos-theme")||"{}");var h=document.documentElement;if(s.dark)h.classList.add("dark");h.dataset.material=s.material||"glass";h.dataset.accent=s.accent||"lime";h.dataset.density=s.density||"comfortable";h.dataset.font=s.font||"editorial"}catch(e){}\`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-material="glass"
      data-accent="lime"
      data-font="editorial"
      suppressHydrationWarning
      className={fonts.map((f) => f.variable).join(" ")}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}`;

export default function InstallationPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Installation"
      description="Add Vamos UI to a Next.js app with Tailwind CSS v4."
      toc={[
        { id: "nextjs", title: "Next.js" },
        { id: "other", title: "Other frameworks" },
      ]}
      prev={{ href: "/docs", title: "Introduction" }}
      next={{ href: "/docs/theming", title: "Theming" }}
    >
      <H2 id="nextjs">Next.js</H2>
      <Steps>
        <Step title="Create an app with Tailwind v4">
          <Code lang="bash" code="pnpm create next-app@latest my-panel --typescript --tailwind --app" />
        </Step>
        <Step title="Install the kit">
          <Code lang="bash" code="pnpm add @vamos-cms/ui" />
          <P>The package ships TypeScript source. Let Next compile it:</P>
          <Code title="next.config.ts" code={`import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@vamos-cms/ui"],
};

export default config;`} />
        </Step>
        <Step title="Import the styles">
          <Code lang="css" title="app/globals.css" code={`@import "tailwindcss";
@import "@vamos-cms/ui/styles.css";`} />
        </Step>
        <Step title="Load the fonts">
          <P>The <C>data-font</C> axis reads <C>--ff-*</C> variables. Load the fonts of the presets you use:</P>
          <Code title="app/layout.tsx" code={fontsCode} />
        </Step>
        <Step title="Set the theme axes on <html>">
          <P>
            <C>class=&quot;dark&quot;</C>, <C>data-material</C>, <C>data-accent</C>, <C>data-density</C> and <C>data-font</C>.
            The small boot script restores the user&apos;s choice before the first paint.
          </P>
          <Code title="app/layout.tsx" code={htmlCode} />
        </Step>
        <Step title="Use a component">
          <Code code={`import { Button } from "@vamos-cms/ui";

export default function Page() {
  return <Button variant="primary">Publish</Button>;
}`} />
        </Step>
      </Steps>

      <H2 id="other">Other frameworks</H2>
      <P>
        The kit does not import <C>next/*</C>. In Vite or React Router, install the package, import the two stylesheets and
        set the same attributes on <C>&lt;html&gt;</C>. Load fonts with <C>@fontsource</C> or a <C>&lt;link&gt;</C> and define
        the <C>--ff-*</C> variables yourself, for example <C>:root {"{"} --ff-onest: &quot;Onest&quot;; {"}"}</C>.
      </P>
      <Callout title="Copy instead of install">
        Prefer owning the code? Each component page has a Manual tab with the full source, and the{" "}
        <C>vamos-ui</C> CLI is described in CLI &amp; registry.
      </Callout>
    </DocPage>
  );
}

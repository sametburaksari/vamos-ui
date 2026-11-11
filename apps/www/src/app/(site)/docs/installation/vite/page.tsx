import { A, C, Callout, Code, DocPage, H2, P, Step, Steps } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";
import { axesTable, bootScript, CliAlternative, cssImports, editorialFontsUrl, firstComponent, fontVarsCss, TailwindNote } from "../shared";

export const metadata = pageMeta({
  title: "Install with Vite",
  description: "Step-by-step: add Vamos UI to a Vite + React + TypeScript app with the Tailwind CSS v4 Vite plugin, fonts, theme attributes and the boot script.",
  path: "/docs/installation/vite/",
});

const viteConfig = `// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});`;

const indexHtml = `<!doctype html>
<html lang="en" data-material="glass" data-accent="lime" data-density="comfortable" data-font="editorial">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My panel</title>
    <!-- Restore the saved theme axes before the first paint. -->
    <script>${bootScript}</script>
    <!-- Fonts of the editorial preset -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="${editorialFontsUrl}" />
  </head>
  <body class="min-h-dvh font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const mainCode = `// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TooltipProvider, VamosProvider } from "@vamos-ui/react";
import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VamosProvider locale="en-US">
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </VamosProvider>
  </StrictMode>,
);`;

const selfHosted = `pnpm add @fontsource-variable/onest @fontsource/instrument-serif @fontsource-variable/jetbrains-mono`;
const selfHostedCss = `/* src/main.tsx */
import "@fontsource-variable/onest";
import "@fontsource/instrument-serif";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/jetbrains-mono";

/* src/index.css: the variable fonts register "… Variable" family names */
:root {
  --ff-onest: "Onest Variable";
  --ff-instrument: "Instrument Serif";
  --ff-jetbrains: "JetBrains Mono Variable";
}`;

export default function ViteInstallPage() {
  return (
    <DocPage
      eyebrow="Installation"
      title="Vite"
      description="Add Vamos UI to a Vite + React + TypeScript single-page app."
      toc={[
        { id: "steps", title: "Steps" },
        { id: "self-hosted-fonts", title: "Self-hosted fonts" },
        { id: "cli", title: "With the CLI instead" },
      ]}
      prev={{ href: "/docs/installation/nextjs", title: "Next.js" }}
      next={{ href: "/docs/installation/react-router", title: "React Router" }}
    >
      <P>Requirements: React 19, Tailwind CSS v4, Node 20 or newer.</P>

      <H2 id="steps">Steps</H2>
      <Steps>
        <Step title="Create the app">
          <Code lang="bash" code={`pnpm create vite@latest my-panel --template react-ts
cd my-panel && pnpm install`} />
        </Step>
        <Step title="Add Tailwind v4">
          <Code lang="bash" code="pnpm add -D tailwindcss @tailwindcss/vite" />
          <Code title="vite.config.ts" code={viteConfig} />
        </Step>
        <Step title="Install the kit">
          <Code lang="bash" code="pnpm add @vamos-ui/react" />
        </Step>
        <Step title="Import the styles">
          <P>Replace the template&apos;s <C>src/index.css</C> with the two imports, then add the font variables:</P>
          <Code lang="css" title="src/index.css" code={`${cssImports}

${fontVarsCss}`} />
          <P>Delete <C>src/App.css</C> and its import; its global rules fight the tokens.</P>
          <TailwindNote />
        </Step>
        <Step title="Theme attributes, boot script and fonts in index.html">
          {axesTable}
          <Code lang="tsx" title="index.html" code={indexHtml} />
        </Step>
        <Step title="Providers">
          <P>
            <C>VamosProvider</C> sets the locale (strings, numbers, dates) and is where you hand in your router&apos;s link
            later. <C>TooltipProvider</C> turns icon-button titles into real tooltips.
          </P>
          <Code title="src/main.tsx" code={mainCode} />
        </Step>
        <Step title="Use a component">
          <Code code={firstComponent("src/App.tsx")} />
          <Code lang="bash" code="pnpm dev" />
        </Step>
      </Steps>

      <H2 id="self-hosted-fonts">Self-hosted fonts</H2>
      <P>
        To avoid the Google Fonts request, install the families with Fontsource and point the <C>--ff-*</C> variables at
        their family names:
      </P>
      <Code lang="bash" code={selfHosted} />
      <Code code={selfHostedCss} />
      <Callout title="Using a router?">
        With React Router in data or declarative mode, pass a link adapter to <C>VamosProvider</C> as shown in{" "}
        <A href="/docs/installation/react-router">React Router</A>, so kit links navigate without a full page load.
      </Callout>

      <H2 id="cli">With the CLI instead</H2>
      <CliAlternative css="src/index.css" />
    </DocPage>
  );
}

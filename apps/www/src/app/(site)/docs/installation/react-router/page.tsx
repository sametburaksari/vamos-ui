import { A, C, Callout, Code, DocPage, H2, P, Step, Steps } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";
import { axesTable, bootScript, CliAlternative, cssImports, editorialFontsUrl, firstComponent, fontVarsCss, TailwindNote } from "../shared";

export const metadata = pageMeta({
  title: "Install with React Router",
  description: "Step-by-step: add Vamos UI to a React Router v7 (formerly Remix) app with Tailwind CSS v4, server rendering, fonts, theme attributes and a router link adapter.",
  path: "/docs/installation/react-router/",
});

const rootCode = `// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import { TooltipProvider, VamosProvider } from "@vamos-ui/react";
import { RouterLink, useVamosNavigate } from "./vamos-router";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "${editorialFontsUrl}" },
];

// Restore the saved theme axes before the first paint.
const boot = \`${bootScript}\`;

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-material="glass"
      data-accent="lime"
      data-density="comfortable"
      data-font="editorial"
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh font-sans">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useVamosNavigate();
  return (
    <VamosProvider locale="en-US" Link={RouterLink} navigate={navigate}>
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    </VamosProvider>
  );
}`;

const adapterCode = `// app/vamos-router.tsx
import * as React from "react";
import { Link, useNavigate } from "react-router";
import type { VamosLinkProps, VamosProviderProps } from "@vamos-ui/react";

/** Kit links (sidebar, breadcrumb, pagination…) become React Router links. */
export const RouterLink = React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function RouterLink(
  { href, prefetch, replace, ...props },
  ref,
) {
  return <Link ref={ref} to={href} replace={replace} prefetch={prefetch ? "intent" : "none"} {...props} />;
});

/** navigate() for the kit (command palette, row clicks). */
export function useVamosNavigate(): NonNullable<VamosProviderProps["navigate"]> {
  const navigate = useNavigate();
  return React.useCallback(
    (href, options) => navigate(href, { replace: options?.replace, preventScrollReset: options?.scroll === false }),
    [navigate],
  );
}`;

export default function ReactRouterInstallPage() {
  return (
    <DocPage
      eyebrow="Installation"
      title="React Router"
      description="Add Vamos UI to a React Router v7 app in framework mode. Remix v2 apps follow the same steps after the upgrade to React Router v7."
      toc={[
        { id: "steps", title: "Steps" },
        { id: "cli", title: "With the CLI instead" },
        { id: "remix", title: "Remix v2" },
      ]}
      prev={{ href: "/docs/installation/vite", title: "Vite" }}
      next={{ href: "/docs/theming", title: "Theming" }}
    >
      <P>Requirements: React 19, Tailwind CSS v4, Node 20 or newer.</P>

      <H2 id="steps">Steps</H2>
      <Steps>
        <Step title="Create the app">
          <Code lang="bash" code={`pnpm create react-router@latest my-panel
cd my-panel`} />
          <P>
            The default template already uses Tailwind v4 through <C>@tailwindcss/vite</C> and has <C>app/app.css</C>. In
            an existing app, add it with <C>pnpm add -D tailwindcss @tailwindcss/vite</C> and <C>tailwindcss()</C> in{" "}
            <C>vite.config.ts</C>.
          </P>
        </Step>
        <Step title="Install the kit">
          <Code lang="bash" code="pnpm add @vamos-ui/react" />
        </Step>
        <Step title="Import the styles">
          <P>
            Replace the template&apos;s <C>app/app.css</C> (its <C>@theme</C> font and the <C>html, body</C> background
            rules would override the tokens):
          </P>
          <Code lang="css" title="app/app.css" code={`${cssImports}

${fontVarsCss}`} />
          <TailwindNote />
        </Step>
        <Step title="Link adapter for the router">
          <P>
            The kit renders plain <C>&lt;a href&gt;</C> by default. This adapter maps its link props onto React Router&apos;s{" "}
            <C>Link</C> and gives it a <C>navigate()</C>:
          </P>
          <Code code={adapterCode} />
        </Step>
        <Step title="Theme attributes, boot script, fonts and providers in root.tsx">
          {axesTable}
          <P>
            The page is server-rendered, so the boot script goes in <C>Layout</C>&apos;s <C>&lt;head&gt;</C> and{" "}
            <C>suppressHydrationWarning</C> keeps React quiet about the attributes it sets. The providers wrap the{" "}
            <C>Outlet</C>, because <C>Layout</C> also renders the error boundary.
          </P>
          <Code code={rootCode} />
        </Step>
        <Step title="Use a component">
          <Code code={firstComponent("app/routes/home.tsx")} />
          <Code lang="bash" code="pnpm dev" />
        </Step>
      </Steps>

      <H2 id="cli">With the CLI instead</H2>
      <CliAlternative css="app/app.css" />
      <Callout tone="warning" title="Set the paths for the app/ folder">
        React Router keeps code in <C>app/</C> with the <C>~/*</C> alias. After <C>init</C>, set <C>&quot;uiDir&quot;: &quot;app/components/vamos&quot;</C>,{" "}
        <C>&quot;blocksDir&quot;: &quot;app/components/blocks&quot;</C> and <C>&quot;importAlias&quot;: &quot;~/components/vamos&quot;</C> in{" "}
        <C>vamos.json</C> before the first <C>add</C>.
      </Callout>

      <H2 id="remix">Remix v2</H2>
      <P>
        Remix v2 continues as React Router v7. Upgrade with the{" "}
        <A href="https://reactrouter.com/upgrading/remix">official Remix upgrade guide</A> first, then follow the steps
        above: the imports change from <C>@remix-run/react</C> to <C>react-router</C>, and everything kit-related is
        identical.
      </P>
    </DocPage>
  );
}

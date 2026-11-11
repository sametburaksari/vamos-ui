import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { A, C, Callout, Code, DocPage, H2, P, Table } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";
import { cssImports } from "./shared";

export const metadata = pageMeta({ title: "Installation", description: "Install Vamos UI in a Next.js, Vite or React Router project with Tailwind CSS v4: the npm package or the vamos-ui CLI, styles, fonts and the theme boot script.", path: "/docs/installation/" });

const guides = [
  { href: "/docs/installation/nextjs", title: "Next.js", text: "App Router, next/font, router bindings from @vamos-ui/react/next." },
  { href: "/docs/installation/vite", title: "Vite", text: "React + TypeScript SPA with the Tailwind v4 Vite plugin." },
  { href: "/docs/installation/react-router", title: "React Router", text: "v7 framework mode (formerly Remix), server-rendered, with a link adapter." },
];

export default function InstallationPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Installation"
      description="Vamos UI runs in any React 19 app with Tailwind CSS v4. Pick your framework for exact steps."
      toc={[
        { id: "frameworks", title: "Framework guides" },
        { id: "summary", title: "The short version" },
        { id: "package-or-cli", title: "Package or CLI" },
      ]}
      prev={{ href: "/docs", title: "Introduction" }}
      next={{ href: "/docs/installation/nextjs", title: "Next.js" }}
    >
      <H2 id="frameworks">Framework guides</H2>
      <div className="grid gap-3 sm:grid-cols-3">
        {guides.map((g) => (
          <Link key={g.href} href={g.href} className="group grid gap-1 rounded-ui border border-line bg-surface px-4 py-3 transition-colors hover:bg-hover focus-ring">
            <span className="flex items-center justify-between font-medium text-fg">
              {g.title}
              <ChevronRight className="size-4 text-fg-subtle transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
            </span>
            <span className="text-[13px] leading-snug text-fg-muted">{g.text}</span>
          </Link>
        ))}
      </div>

      <H2 id="summary">The short version</H2>
      <P>Every guide comes down to five things:</P>
      <Table
        head={["Step", "What"]}
        rows={[
          ["1. Install", <C key="i">pnpm add @vamos-ui/react</C>],
          ["2. Styles", <span key="s">Import Tailwind, then <C>@vamos-ui/react/styles.css</C>, in your app stylesheet.</span>],
          ["3. Theme axes", <span key="t"><C>class=&quot;dark&quot;</C>, <C>data-material</C>, <C>data-accent</C>, <C>data-density</C>, <C>data-font</C> on <C>&lt;html&gt;</C>, plus a small boot script that restores the saved choice before paint.</span>],
          ["4. Fonts", <span key="f">Load the families of your <C>data-font</C> preset and expose them as <C>--ff-*</C> variables.</span>],
          ["5. Providers", <span key="p"><C>VamosProvider</C> (locale, router link, navigate) and <C>TooltipProvider</C> at the root. Optional, recommended.</span>],
        ]}
      />
      <Code lang="css" title="app stylesheet" code={cssImports} />

      <H2 id="package-or-cli">Package or CLI</H2>
      <P>
        The npm package is compiled ESM with type declarations: you get fixes by bumping the version. The CLI copies the
        source of the components you pick into your project instead, so you own and can change every line:
      </P>
      <Code lang="bash" code={`npx vamos-ui init
npx vamos-ui add button data-table`} />
      <Callout title="Mixing both">
        You can start with the package and copy single components later with the CLI; both read the same tokens. See{" "}
        <A href="/docs/cli">CLI &amp; registry</A> for every command.
      </Callout>
    </DocPage>
  );
}

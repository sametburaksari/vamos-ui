import { A, C, Callout, Code, DocPage, H2, H3, P, Table, UL } from "@/components/docs/prose";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Migration",
  description: "Upgrade Vamos UI from 0.1 to 0.2 to 0.3: the move to @vamos-ui/react, the compiled npm package, new subpaths such as /motion and /locale-data, and the behaviour changes to check.",
  path: "/docs/migration/",
});

const OLD = "<old preview package>";

const renameCode = `# 1. Swap the dependency
pnpm remove ${OLD}
pnpm add @vamos-ui/react

# 2. Rewrite imports (macOS: sed -i '' …). Check the diff before committing.
grep -rl "${OLD}" src app | xargs sed -i 's#${OLD}#@vamos-ui/react#g'`;

const cssBefore = `/* before (0.1) */
@import "tailwindcss";
@import "${OLD}/styles.css";

/* after (0.2+) */
@import "tailwindcss";
@import "@vamos-ui/react/styles.css";`;

const nextConfig = `// next.config.ts — 0.1 shipped TypeScript source and needed this.
// With the compiled npm package from 0.2 on, remove the entry (keep it only if you
// link the kit's workspace source in a monorepo).
const config: NextConfig = {
  transpilePackages: ["@vamos-ui/react"],
};`;

const motionOff = `// Keep 0.2 behaviour on a whole site: no entrance animations.
<SiteShell motion="off">…</SiteShell>

// Or for any subtree, including admin screens:
<div data-motion="off">…</div>`;

export default function MigrationPage() {
  return (
    <DocPage
      eyebrow="Docs"
      title="Migration"
      description="What to change when you move between Vamos UI preview releases. Each step is small; do them in order."
      toc={[
        { id: "versions", title: "Versions at a glance" },
        { id: "to-02", title: "0.1 → 0.2" },
        { id: "rename", title: "New package name", sub: true },
        { id: "compiled", title: "Compiled package", sub: true },
        { id: "subpaths-02", title: "New subpaths", sub: true },
        { id: "to-03", title: "0.2 → 0.3" },
        { id: "motion", title: "Motion", sub: true },
        { id: "blocks", title: "Blocks and sites", sub: true },
        { id: "cli", title: "If you copied components" },
      ]}
      prev={{ href: "/docs/security", title: "Security" }}
      next={{ href: "/docs/changelog", title: "Changelog" }}
    >
      <Callout title="Preview releases">
        Until 1.0, minor versions may change APIs. So far, no exported component or prop has been removed between 0.1 and 0.3:
        the breaking change is the package name, the rest is additive or opt-out.
      </Callout>

      <H2 id="versions">Versions at a glance</H2>
      <Table
        head={["Version", "Package", "What changes for you"]}
        rows={[
          ["0.1", "The old preview package (source only, never on npm)", "Starting point."],
          ["0.2", <C key="p2">@vamos-ui/react</C>, "Rename imports and the CSS import. The npm package is compiled. New /scheduler/core subpath; /locale-data gets its data packs."],
          ["0.3", <C key="p3">@vamos-ui/react</C>, "New /motion subpath. Site blocks animate by default (opt out with motion=\"off\"). New blocks and example sites."],
        ]}
      />

      <H2 id="to-02">0.1 → 0.2</H2>
      <H3 id="rename">New package name</H3>
      <P>
        The first preview was published from the repository under a different scope. From 0.2 the kit is{" "}
        <C>@vamos-ui/react</C> on npm, and the other packages are <C>vamos-ui</C> (CLI) and <C>@vamos-ui/mcp</C>. Replace the
        old name everywhere it appears; below it is written as <C>{OLD}</C>, substitute the name from your{" "}
        <C>package.json</C>.
      </P>
      <Code lang="bash" code={renameCode} />
      <P>Subpath imports keep their path; only the package part changes:</P>
      <Table
        head={["0.1", "0.2+"]}
        rows={[
          [<C key="a">{`${OLD}`}</C>, <C key="b">@vamos-ui/react</C>],
          [<C key="c">{`${OLD}/charts`}</C>, <C key="d">@vamos-ui/react/charts</C>],
          [<C key="e">{`${OLD}/locale/tr`}</C>, <C key="f">@vamos-ui/react/locale/tr</C>],
          [<C key="g">{`${OLD}/styles.css`}</C>, <C key="h">@vamos-ui/react/styles.css</C>],
        ]}
      />
      <Code lang="css" title="globals.css" code={cssBefore} />

      <H3 id="compiled">Compiled package</H3>
      <P>
        0.2 is the first release on npm. It ships compiled ESM with <C>.d.ts</C> files and keeps the{" "}
        <C>&quot;use client&quot;</C> directives, so bundlers no longer need to compile the kit.
      </P>
      <Code title="next.config.ts" code={nextConfig} />

      <H3 id="subpaths-02">New and filled subpaths</H3>
      <UL>
        <li>
          <C>@vamos-ui/react/scheduler/core</C> — new: the React-free core of the scheduler (time scale, working-day math, event
          layout, Gantt scheduling, time-tracking helpers), importable from server components and workers.
        </li>
        <li>
          <C>@vamos-ui/react/locale-data</C> — the entry existed in 0.1 but exported nothing. From 0.2 it holds the React-free
          locale packs: week info, public holidays, working days, IBAN rules and decimals, with Turkish (<C>tr</C>) as the first
          pack.
        </li>
        <li>Everything else from the 0.2 changelog (143 components, blocks, registry, CLI, MCP) is new and needs no change.</li>
      </UL>

      <H2 id="to-03">0.2 → 0.3</H2>
      <Code lang="bash" code="pnpm add @vamos-ui/react@^0.3.0" />
      <H3 id="motion">Motion</H3>
      <P>
        0.3 adds <C>@vamos-ui/react/motion</C> (Reveal, Stagger, CountUp, Ticker, TextReveal, Parallax, ScrollProgress, Tilt,
        Magnetic, PageTransition, SkeletonSwap, <C>useScrollShrink</C>, MotionScope). Its CSS is part of{" "}
        <C>styles.css</C>, so there is nothing extra to import. Motion is CSS-first, never hides server-rendered content and
        renders the final state under reduced motion.
      </P>
      <H3 id="blocks">Blocks and sites</H3>
      <P>
        Behaviour change: <C>SiteShell</C> now has a <C>motion</C> level, <C>subtle</C> by default, and the site blocks (Hero,
        Feature grid, Stats band, Pricing table, Testimonials, FAQ, CTA, Media + text, Steps, Gallery section, Logo strip)
        animate on entry. To keep the 0.2 look:
      </P>
      <Code code={motionOff} />
      <P>
        If you have end-to-end tests that screenshot site pages, run them with reduced motion (Playwright:{" "}
        <C>reducedMotion: &quot;reduce&quot;</C>) or wait for the entrance to finish.
      </P>

      <H2 id="cli">If you copied components with the CLI</H2>
      <P>
        Copied files import from your alias, not from the package, so the rename does not touch them. Pull 0.3 changes with:
      </P>
      <Code lang="bash" code={`npx vamos-ui diff --summary   # what changed upstream
npx vamos-ui upgrade          # untouched files are replaced; edited ones show a diff and ask
npx vamos-ui add motion       # the motion kit, if you want it`} />
      <P>
        Full release notes: <A href="/docs/changelog">Changelog</A>.
      </P>
    </DocPage>
  );
}

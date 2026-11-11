import { C, Callout, Code, P } from "@/components/docs/prose";

/** Snippets shared by the framework install guides (not a route: only page.tsx files are). */

export const cssImports = `@import "tailwindcss";
@import "@vamos-ui/react/styles.css";`;

/** Restores the saved theme axes before the first paint, so there is no flash. Same script on every framework. */
export const bootScript = `try{var s=JSON.parse(localStorage.getItem("vamos-theme")||"{}");var h=document.documentElement;if(s.dark)h.classList.add("dark");h.dataset.material=s.material||"glass";h.dataset.accent=s.accent||"lime";h.dataset.density=s.density||"comfortable";h.dataset.font=s.font||"editorial"}catch(e){}`;

/** Google Fonts stylesheet for the default "editorial" preset (Onest, Instrument Serif, JetBrains Mono). */
export const editorialFontsUrl =
  "https://fonts.googleapis.com/css2?family=Onest:wght@100..900&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@100..800&display=swap";

/** The --ff-* variables the editorial preset reads, for frameworks without next/font. */
export const fontVarsCss = `/* The data-font="editorial" preset reads these variables. */
:root {
  --ff-onest: "Onest";
  --ff-instrument: "Instrument Serif";
  --ff-jetbrains: "JetBrains Mono";
}`;

export const firstComponent = (file: string) => `// ${file}
import { Badge, Button, Card, CardBody, CardHeader } from "@vamos-ui/react";

export default function Welcome() {
  return (
    <main className="mx-auto grid max-w-xl gap-4 p-8">
      <Card>
        <CardHeader
          title="Spring campaign"
          description="Newsletter · 12,480 recipients"
          action={<Badge tone="success" dot>Scheduled</Badge>}
        />
        <CardBody className="flex gap-2">
          <Button variant="primary">Publish</Button>
          <Button>Preview</Button>
        </CardBody>
      </Card>
    </main>
  );
}`;

export const axesTable = (
  <P>
    The five axes are attributes on <C>&lt;html&gt;</C> (or any element): <C>class=&quot;dark&quot;</C>,{" "}
    <C>data-material=&quot;glass|solid&quot;</C>, <C>data-accent=&quot;lime|ocean|ember|rose|graphite&quot;</C>,{" "}
    <C>data-density=&quot;comfortable|compact&quot;</C> and <C>data-font=&quot;editorial|grotesk|corporate|system&quot;</C>.
    The boot script reads the user&apos;s saved choice from <C>localStorage</C> (key <C>vamos-theme</C>) before the first
    paint. See <C>Theming</C> for every token.
  </P>
);

export function CliAlternative({ css }: { css: string }) {
  return (
    <>
      <P>
        Prefer owning the source? Instead of the npm package, let the CLI copy the kit into your project. It detects the
        framework, Tailwind v4 and your package manager, writes <C>vamos.json</C>, adds the stylesheet import to{" "}
        <C>{css}</C> and prints the <C>&lt;html&gt;</C> attributes:
      </P>
      <Code lang="bash" code={`npx vamos-ui init
npx vamos-ui add button card badge`} />
      <P>
        Components land in <C>components/vamos</C> (or <C>src/components/vamos</C>) and are imported from your alias, for
        example <C>@/components/vamos</C>. Every written file is recorded in <C>.vamos-lock.json</C>, so{" "}
        <C>npx vamos-ui diff</C> and <C>upgrade</C> keep your edits apart from kit updates.
      </P>
    </>
  );
}

export function TailwindNote() {
  return (
    <Callout title="No @source line needed">
      Importing <C>@vamos-ui/react/styles.css</C> after <C>tailwindcss</C> is enough: Tailwind v4 also scans the package the
      stylesheet comes from, so the classes used inside the components are generated.
    </Callout>
  );
}

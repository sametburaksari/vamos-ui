import fs from "node:fs";
import path from "node:path";
import { A, C, Callout, DocPage, H2, H3, P, Table, UL } from "@/components/docs/prose";
import { docs } from "@/docs/registry";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Accessibility",
  description: "How Vamos UI is tested for accessibility: axe in every component test, Playwright axe on blocks and sites at 390 and 1440 px, reduced motion and keyboard tests. Target WCAG 2.2 AA, with known issues.",
  path: "/docs/accessibility/",
});

/* ------------------------------------------------------------------ */
/* Numbers are counted from the repository at build time, not typed.  */
/* ------------------------------------------------------------------ */

function walk(dir: string, match: RegExp): string[] {
  let out: string[] = [];
  let list: fs.Dirent[] = [];
  try {
    list = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of list) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p, match));
    else if (match.test(e.name)) out.push(p);
  }
  return out;
}

function countIn(files: string[], re: RegExp) {
  let filesWith = 0;
  let hits = 0;
  for (const f of files) {
    const n = (fs.readFileSync(f, "utf8").match(re) ?? []).length;
    if (n) filesWith++;
    hits += n;
  }
  return { filesWith, hits };
}

function repoStats() {
  // `next build` and `next dev` run in apps/www.
  const root = path.resolve(process.cwd(), "../..");
  const unit = [...walk(path.join(root, "packages/ui/src"), /\.test\.tsx?$/), ...walk(path.join(root, "packages/ui/test"), /\.test\.tsx?$/)];
  const e2e = walk(path.join(root, "apps/www/e2e"), /\.spec\.ts$/);
  if (!unit.length) return null;
  return {
    unitFiles: unit.length,
    axe: countIn(unit, /expectNoA11yViolations\(|toHaveNoViolations\(/g),
    keyboard: countIn(unit, /user\.(keyboard|tab)\(/g),
    rtl: countIn(unit, /dir:\s*"rtl"|dir="rtl"/g),
    e2eFiles: e2e.length,
    e2eAxe: countIn(e2e, /seriousA11y\(/g),
    e2eReduced: countIn(e2e, /reducedMotion:\s*"reduce"/g),
  };
}

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Keyboard notes from the component docs entries (apps/www/src/docs/entries/*). */
const KEY_NOTE = /^(keyboard|keys)\b/i;
// "→" alone is not a hint: notes also use it for "becomes" (“ilker” → “İ”).
const KEY_HINT = /keyboard|arrow keys|[↑↓]|←\s*\/\s*→|\bEsc(ape)?\b|\bHome\b|\bPage(Up|Down)\b|\bTab\b|\bF2\b|Shift\+F10/;
const keyboardRows = docs
  .map((d) => {
    const notes = d.notes ?? [];
    const note = notes.find((n) => KEY_NOTE.test(n)) ?? notes.find((n) => KEY_HINT.test(n));
    return note ? { slug: d.slug, title: d.title, group: d.group, note: capitalize(note.replace(KEY_NOTE, "").replace(/^[:\s]+/, "")) } : null;
  })
  .filter((r): r is NonNullable<typeof r> => r !== null)
  .sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));

export default function AccessibilityPage() {
  const s = repoStats();
  const n = (v: number | undefined) => (v === undefined ? "—" : v.toLocaleString("en-US"));

  return (
    <DocPage
      eyebrow="Docs"
      title="Accessibility"
      description="Vamos UI targets WCAG 2.2 level AA. This page shows how that is tested, what each component does on the keyboard, and what is still open."
      toc={[
        { id: "target", title: "Target" },
        { id: "testing", title: "How it is tested" },
        { id: "unit", title: "Component tests", sub: true },
        { id: "e2e", title: "Blocks and sites", sub: true },
        { id: "motion", title: "Reduced motion", sub: true },
        { id: "keyboard", title: "Keyboard support" },
        { id: "known-issues", title: "Known issues" },
        { id: "your-part", title: "Your part" },
        { id: "report", title: "Reporting a problem" },
      ]}
      prev={{ href: "/docs/localization", title: "Localization" }}
      next={{ href: "/docs/security", title: "Security" }}
    >
      <H2 id="target">Target</H2>
      <P>
        Every component aims for <strong className="text-fg">WCAG 2.2 AA</strong> in both themes and both materials: the
        WAI-ARIA Authoring Practices pattern for its role, full keyboard operation, a visible focus ring (<C>focus-ring</C>),
        names for icon-only controls, 4.5:1 text contrast, 24 px minimum targets for pointer controls, logical properties for
        right-to-left layouts and no motion when the user asks for less. Interactive primitives are built on Radix, which
        handles focus management and ARIA wiring for overlays, menus and tabs.
      </P>
      <Callout title="Not a certification">
        Automated checks find roughly a third of real-world issues. The numbers below are what the test suite enforces today;
        they are not an audit by a third party.
      </Callout>

      <H2 id="testing">How it is tested</H2>
      <H3 id="unit">Component tests (Vitest + axe)</H3>
      <P>
        Each component has a test file next to it, run with Vitest, Testing Library and <C>vitest-axe</C> in jsdom. The shared
        helper <C>expectNoA11yViolations()</C> renders the component inside the providers and fails on any axe violation.
        Interaction tests drive the real keyboard through <C>user-event</C>.
      </P>
      <Table
        head={["Counted in packages/ui", "Files", "Calls"]}
        rows={[
          ["Test files", n(s?.unitFiles), ""],
          ["axe assertions (expectNoA11yViolations / toHaveNoViolations)", n(s?.axe.filesWith), n(s?.axe.hits)],
          ["Keyboard interactions (user.keyboard / user.tab)", n(s?.keyboard.filesWith), n(s?.keyboard.hits)],
          ["Right-to-left renders (dir=\"rtl\")", n(s?.rtl.filesWith), n(s?.rtl.hits)],
        ]}
      />
      <P className="text-[12.5px] text-fg-subtle">
        Counted from the repository when this page was built. jsdom has no layout, so colour contrast is not part of the unit
        run; it is checked in the browser runs below.
      </P>

      <H3 id="e2e">Blocks, docs and example sites (Playwright + axe)</H3>
      <UL>
        <li>
          {n(s?.e2eFiles)} Playwright spec files run in Chrome; {n(s?.e2eAxe.filesWith)} of them call axe (
          <C>@axe-core/playwright</C>) and fail on any <em>serious</em> or <em>critical</em> violation.
        </li>
        <li>Every admin block and every page of every example site is checked at <strong className="text-fg">1440 px and 390 px</strong>, together with one landmark, exactly one visible <C>h1</C> on site pages, no console errors and no sideways scroll.</li>
        <li>Docs component pages are smoke-tested across the theme matrix: light and dark, glass and solid.</li>
        <li>Example sites run axe <strong className="text-fg">with colour contrast on</strong>. Component and block pages disable the contrast rule, because preview stages put components on decorative backgrounds; contrast for tokens is checked by hand (see known issues).</li>
        <li>Signature interactions (menus, dialogs, sortable lists, language switch) are driven with the keyboard in the browser.</li>
      </UL>

      <H3 id="motion">Reduced motion</H3>
      <P>
        Motion in the kit (<C>@vamos-ui/react/motion</C>, overlay and collapse transitions) renders its final state under{" "}
        <C>prefers-reduced-motion: reduce</C> or <C>data-motion=&quot;off&quot;</C>. {n(s?.e2eReduced.filesWith)} spec files run
        whole suites with Playwright&apos;s <C>reducedMotion: &quot;reduce&quot;</C> and assert that every heading and section is
        visible immediately, at 1440 and 390 px. A separate test keeps layout shift on the animated home pages under the
        0.1 CLS budget.
      </P>

      <H2 id="keyboard">Keyboard support</H2>
      <P>
        Every interactive component is operable with the keyboard alone. The table lists the components whose docs page
        documents keys beyond the platform defaults (Tab, Enter, Space on buttons and fields), taken from each page&apos;s
        notes. Buttons, inputs, checkboxes and switches follow native behaviour.
      </P>
      <Table
        head={["Component", "Group", "Keys"]}
        rows={keyboardRows.map((r) => [
          <A key={r.slug} href={`/docs/components/${r.slug}`}>{r.title}</A>,
          <span key="g" className="whitespace-nowrap text-fg-muted">{r.group}</span>,
          <span key="k" className="text-fg-muted">{r.note}</span>,
        ])}
      />

      <H2 id="known-issues">Known issues</H2>
      <UL>
        <li>
          <strong className="text-fg">Status colours as plain text.</strong> The light-theme success colour was darkened from{" "}
          <C>#0f8a5f</C> (4.36:1 on white) to <C>#0b7d55</C> (5.15:1), and badges and alerts mix the status hue with the text
          colour, so their 11–13 px labels pass 4.5:1. The raw hues are still below 4.5:1 as small text directly on the light
          page background (<C>--scene</C>): success 4.48:1, danger 4.39:1, warning 3.41:1. Use them for icons, dots and large
          text, or use <C>tone-soft</C> / Badge / Alert for small text.
        </li>
        <li>
          <strong className="text-fg">Hydration id mismatch under load.</strong> A <C>useId</C> mismatch was seen twice on the
          development server under memory pressure (maintenance and list blocks). It has not reproduced in the static build
          that ui.vamos.ist serves. While it happens, an <C>aria-labelledby</C> can point at a stale id until React re-renders.
        </li>
        <li><strong className="text-fg">Unlabelled tables</strong> in two blocks (a detail block and an app shell) log a console warning; they need a caption or <C>aria-label</C>.</li>
        <li><strong className="text-fg">Floating contact dock</strong> can overlap the booking bar on the restaurant and spa example sites at phone width.</li>
        <li><strong className="text-fg">Charts</strong> are images to assistive technology. Each chart frame has a table view and a text summary; the plot itself is not navigable.</li>
        <li><strong className="text-fg">Hover cards</strong> do not open from the keyboard or on touch, by design. Their content must be reachable on the link target.</li>
        <li>No manual screen-reader pass (VoiceOver, NVDA, JAWS) has been recorded for every component yet. That is the next step before 1.0.</li>
      </UL>

      <H2 id="your-part">Your part</H2>
      <UL>
        <li>Give every icon-only button a <C>label</C> or <C>aria-label</C>, and every field a visible label through <C>Field</C>.</li>
        <li>Keep one <C>h1</C> per page and a <C>&lt;main&gt;</C> landmark; the app shell and site shell provide the others.</li>
        <li>A custom accent is contrast-checked by <C>npx vamos-ui brand check</C>; run <C>npx vamos-ui verify</C> in CI for the lint rules.</li>
        <li>Right-click and drag can never be the only path: pair context menus with an action menu and drag with keyboard moves (the kit&apos;s sortable parts do this).</li>
      </UL>

      <H2 id="report">Reporting a problem</H2>
      <P>
        Found a barrier? Open an issue on <A href="https://github.com/sametburaksari/vamos-ui/issues">GitHub</A> with the
        component, theme axes, browser and assistive technology. Accessibility bugs are treated like functional bugs.
      </P>
    </DocPage>
  );
}

import { ex, type DocEntry } from "../types";
import CodeBlockDemo from "../examples/code-block/demo";
import CodeBlockTabs from "../examples/code-block/tabs";
import CodeBlockDark from "../examples/code-block/dark";
import CodeBlockAdapter from "../examples/code-block/adapter";

const entry: DocEntry = {
  slug: "code-block",
  title: "Code block & tabs",
  group: "Data display",
  description:
    "Highlighted code with a file name, line numbers, marked lines and a copy button that works where the clipboard is blocked. CodeTabs shows one snippet in several languages, and the language picked in any of them switches every other block on the page (and is remembered per browser if you want). A small built-in highlighter colours with tokens only; Shiki or Prism output plugs in through an adapter or pre-highlighted HTML.",
  source: ["components/code-block.tsx"],
  basedOn: "WAI-ARIA Tabs (CodeTabs)",
  usage: `import { CodeBlock, CodeTabs, useCodeLanguage } from "@vamos-ui/react";

<CodeBlock title="send.ts" language="ts" code={source} lineNumbers highlightLines="3-4" />
<CodeTabs persist samples={[
  { language: "ts", label: "TypeScript", title: "send.ts", code: ts },
  { language: "python", label: "Python", title: "send.py", code: py },
]} />

// Anything else that follows the same choice (install line, SDK table):
const [language] = useCodeLanguage("default", { persist: true });

// Shiki (server): pass the HTML; each line stays its own row.
<CodeBlock code={source} html={await shiki.codeToHtml(source, { lang: "ts", theme })} lineNumbers />`,
  demo: ex("demo", "Demo", "code-block/demo.tsx", CodeBlockDemo),
  examples: [
    ex("tabs", "Language tabs that sync", "code-block/tabs.tsx", CodeBlockTabs, "Two CodeTabs and an install line share group \"docs-sdk\"; persist remembers the choice. The block you click stays still while others change height."),
    ex("dark", "Dark window, wrapping, plain text", "code-block/dark.tsx", CodeBlockDark, "scheme=\"dark\" on a light page; wrap for long JSON; highlight={false} for terminal output."),
    ex("adapter", "Your own highlighter", "code-block/adapter.tsx", CodeBlockAdapter, "A highlight function returns one node per line (or an HTML string); line numbers keep working."),
  ],
  api: [
    { name: "CodeBlock", props: [
      { name: "code", type: "string", description: "Source text; the copy button copies it as-is." },
      { name: "language", type: "string", description: "Highlighter language and accessible name (\"ts code\")." },
      { name: "title", type: "ReactNode", description: "File name or title in the header bar (also the code area's name)." },
      { name: "caption", type: "ReactNode", description: "Text under the block (figcaption)." },
      { name: "lineNumbers", type: "boolean | number", description: "Show numbers; a number is the first one." },
      { name: "highlightLines", type: 'string | (number | [number, number])[]', description: 'Marked lines: "2,5-7" or [2, [5, 7]].' },
      { name: "highlight", type: "(code, language) => ReactNode[] | string | false", description: "Highlighter adapter (one node per line, or HTML). false: plain text. Default: the built-in highlighter." },
      { name: "html", type: "string", description: "Pre-highlighted HTML (Shiki codeToHtml…); a wrapping <pre><code> is removed. Trusted markup only." },
      { name: "wrap", type: "boolean", description: "Wrap long lines instead of scrolling sideways." },
      { name: "maxHeight", type: "number | string", description: "Cap the height; scrolls inside." },
      { name: "copy", type: "boolean", default: "true", description: "Copy button (polite \"Copied\" announcement, textarea fallback)." },
      { name: "scheme", type: '"inherit" | "dark"', default: '"inherit"', description: "A dark code window on any page." },
      { name: "actions", type: "ReactNode", description: "Extra header controls before the copy button." },
      { name: "labels", type: "Partial<CodeBlockLabels>", description: 'Dictionary namespace "codeBlock": copy, copied, copyFailed, codeIn, code, languages.' },
    ] },
    { name: "CodeTabs", props: [
      { name: "samples", type: "{ language, label?, code, title?, html?, highlightLines? }[]", description: "One tab per language." },
      { name: "group", type: "string | false", default: '"default"', description: "Every CodeTabs and useCodeLanguage with the same group shows the same language; false: independent." },
      { name: "persist", type: "boolean | string", description: "Remember the choice in localStorage (true: vui-code-language:<group>, string: your key)." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Controlled language, the starting one (default: first sample) and the change callback." },
      { name: "keepPosition", type: "boolean", default: "true", description: "Keep the clicked block still while blocks above it change height." },
      { name: "…", type: "CodeBlock display props", description: "lineNumbers, highlightLines, highlight, wrap, maxHeight, copy, scheme, title, caption, labels." },
    ] },
    { name: "Helpers", props: [
      { name: "useCodeLanguage(group?, { persist? })", type: "[language | undefined, set]", description: "Read or set the shared language from anything else on the page." },
      { name: "highlightCode(code, language)", type: "CodeToken[][]", description: "The built-in tokenizer: lines of { kind, text }." },
      { name: "copyText(text)", type: "Promise<boolean>", description: "Clipboard with a textarea fallback." },
    ] },
  ],
  notes: [
    "The code area is a focusable, named group so keyboard users can scroll long lines; line numbers are aria-hidden and not selectable.",
    "Colours come from tokens (accent-ink, success-ink, warning-ink, info-ink, fg-subtle), so the code follows theme, accent and dark mode.",
    "The built-in highlighter is deliberately small (comments, strings, numbers, keywords, calls). For full grammars use Shiki on the server and pass html.",
  ],
  covers: [],
};

export default entry;

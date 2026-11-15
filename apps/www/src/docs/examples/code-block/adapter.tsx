import { CodeBlock, type CodeHighlighter } from "@vamos-ui/react";

// Any highlighter fits: return one node per line (numbers and marked lines keep working) or an
// HTML string such as Shiki's codeToHtml output (pass it through `html` when it is made on the server).
const diff: CodeHighlighter = (code) =>
  code.split("\n").map((line, i) => (
    <span key={i} className={line.startsWith("+") ? "text-success-ink" : line.startsWith("-") ? "text-danger-ink" : undefined}>
      {line}
    </span>
  ));

export default function CodeBlockAdapter() {
  return (
    <div className="w-full max-w-2xl">
      <CodeBlock
        title="config.diff"
        language="diff"
        highlight={diff}
        lineNumbers
        code={` retries: 3\n-timeout: 10s\n+timeout: 30s\n+region: eu-central`}
      />
    </div>
  );
}

import { siteBlocks } from "./_site-blocks";

// The registry as JSON Schema: hand it to an LLM as a tool definition or to an external builder.
export default function BlocksApiJsonSchema() {
  const schema = siteBlocks.toJSONSchema({ target: "node" });
  const text = JSON.stringify(schema, null, 2);
  return (
    <div className="w-full min-w-0 rounded-ui border border-line bg-surface-2">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-3 text-small">
        <span className="font-medium text-fg">BlockNode · {siteBlocks.types.join(" | ")}</span>
        <span className="tabular text-fg-muted">{(text.length / 1024).toFixed(1)} KB</span>
      </div>
      <pre tabIndex={0} aria-label="Block JSON Schema" className="max-h-80 overflow-auto whitespace-pre-wrap px-5 py-4 font-mono [overflow-wrap:anywhere] text-[12px] leading-relaxed text-fg-muted focus-ring">{text}</pre>
    </div>
  );
}

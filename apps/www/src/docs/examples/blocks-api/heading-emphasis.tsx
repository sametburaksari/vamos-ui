import { BlockHeading } from "@vamos-ui/react/blocks";

const presets = ["editorial", "grotesk", "corporate", "system"] as const;

// One *emphasis* per heading: italic serif in editorial, accent ink in the sans presets.
export default function BlocksApiHeadingEmphasis() {
  return (
    <div className="grid w-full gap-px overflow-hidden rounded-ui border border-line bg-line @container">
      {presets.map((font) => (
        <div key={font} data-font={font} className="flex flex-col gap-2 bg-scene px-6 py-7">
          <span className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">{font}</span>
          <BlockHeading level={3} size="display-m" text="Treatments that take *their time*" />
        </div>
      ))}
    </div>
  );
}

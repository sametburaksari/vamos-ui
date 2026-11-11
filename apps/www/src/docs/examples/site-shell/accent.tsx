import { Badge, Button } from "@vamos-ui/react";
import { SiteShell, siteAccent } from "@vamos-ui/react/blocks";

const brands = [
  { name: "Clay", colour: "#B4532A" },
  { name: "Mustard", colour: "#CA8A04" },
  { name: "Ink blue", colour: "#2B4C7E" },
];

// One colour per site → fill, text on the fill and accent ink, each checked to 4.5:1.
// Yellow gets dark text; clay and blue get white. The numbers come from siteAccent().
export default function SiteShellAccent() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {brands.map((b) => {
        const p = siteAccent(b.colour);
        return (
          <SiteShell key={b.name} accent={b.colour} material="solid" routing="memory" className="surface flex flex-col gap-3 rounded-ui p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-fg-muted">
              {b.name} · {b.colour}
            </p>
            <Button variant="primary" className="self-start">Book a visit</Button>
            <p className="text-[13px] text-accent-ink">Accent ink for links and highlights</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="outline">text on fill {p.contrast.fgOnBase}:1</Badge>
              <Badge tone="outline">ink {p.contrast.inkLightOnLight}:1</Badge>
            </div>
          </SiteShell>
        );
      })}
    </div>
  );
}

import { Badge } from "@vamos-ui/react";
import { Container } from "@vamos-ui/react/blocks";

/** The caption above each section in the gallery: block · variant, plus one line on when to use it. */
export function VariantLabel({ id, block, variant, note }: { id: string; block: string; variant: string; note: string }) {
  return (
    <div id={id} className="scroll-mt-4 border-t border-line bg-scene py-4">
      <Container className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <code className="font-mono text-[12px] text-fg">
          {block}
          <span className="text-fg-muted"> · </span>
          <span className="text-accent-ink">{variant}</span>
        </code>
        <p className="text-small text-fg-muted">{note}</p>
      </Container>
    </div>
  );
}

/** Group heading in the gallery ("Heroes", "Calls to action"). */
export function GroupHeading({ id, title, count }: { id: string; title: string; count: number }) {
  return (
    <div id={id} className="scroll-mt-4 bg-surface-2 py-10">
      <Container className="flex items-end justify-between gap-4">
        <h2 className="font-display text-display-m">{title}</h2>
        <Badge tone="outline">{count} variants</Badge>
      </Container>
    </div>
  );
}

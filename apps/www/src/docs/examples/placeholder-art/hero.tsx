import { Calendar } from "lucide-react";
import { Button, PlaceholderArt } from "@vamos-ui/react";

// A site hero before the client sends photography: strength="bold" and a custom glyph.
export default function PlaceholderArtHero() {
  return (
    <section className="grid w-full overflow-hidden rounded-ui-lg border border-line md:grid-cols-2">
      <div className="flex flex-col justify-center gap-4 p-6 md:p-8">
        <span className="font-mono text-[11px] tracking-[0.08em] text-fg-subtle uppercase">Spring season</span>
        <h2 className="m-0 text-2xl leading-tight font-semibold text-balance text-fg">Ceramics evenings at Fernwood Studio</h2>
        <p className="m-0 text-sm text-fg-muted">Six Thursdays, small groups, clay and glazes included.</p>
        <div>
          <Button variant="primary">Book a seat</Button>
        </div>
      </div>
      <div className="min-h-56">
        <PlaceholderArt seed="fernwood-spring" pattern="glow" strength="bold" icon={<Calendar strokeWidth={1.5} />} caption="Photo · studio wheel room" />
      </div>
    </section>
  );
}

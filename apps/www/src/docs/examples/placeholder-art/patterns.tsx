import { PlaceholderArt, PLACEHOLDER_ART_PATTERNS } from "@vamos-ui/react";

// Five patterns. The seed picks one (and the tint, angle and focal point) unless you force it.
export default function PlaceholderArtPatterns() {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-5">
      {PLACEHOLDER_ART_PATTERNS.map((p) => (
        <figure key={p} className="m-0 flex flex-col gap-2">
          <div className="aspect-square overflow-hidden rounded-ui">
            <PlaceholderArt seed="spring-menu" pattern={p} icon={false} />
          </div>
          <figcaption className="font-mono text-[11px] tracking-wide text-fg-subtle">{p}</figcaption>
        </figure>
      ))}
    </div>
  );
}

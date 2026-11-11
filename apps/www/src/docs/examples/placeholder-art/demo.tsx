import { PlaceholderArt } from "@vamos-ui/react";

const listings = [
  { slug: "harbour-terrace", title: "Harbour terrace", meta: "Rooftop · 40 guests" },
  { slug: "linden-loft", title: "Linden loft", meta: "Studio · 12 guests" },
  { slug: "orchard-room", title: "Orchard room", meta: "Private dining · 18 guests" },
];

// Same seed → same art, on the server and in the browser. No assets, no network.
export default function PlaceholderArtDemo() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {listings.map((l) => (
        <article key={l.slug} className="surface overflow-hidden rounded-ui-lg">
          <div className="aspect-[4/3]">
            <PlaceholderArt seed={l.slug} label={`${l.title} (photo coming soon)`} />
          </div>
          <div className="flex flex-col gap-0.5 px-3.5 py-3">
            <span className="text-sm font-medium text-fg">{l.title}</span>
            <span className="text-[12px] text-fg-subtle">{l.meta}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

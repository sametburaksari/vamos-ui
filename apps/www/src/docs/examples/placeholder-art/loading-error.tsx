import { Image } from "@vamos-ui/react";

// placeholder="art": the art shows while the photo loads and stays if it fails.
export default function PlaceholderArtLoadingError() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <figure className="m-0 flex flex-col gap-2">
        <Image src="https://cdn.example.invalid/team/offsite-2026.jpg" alt="Team offsite in the hills" aspect="4/3" rounded="ui" placeholder="art" placeholderCaption />
        <figcaption className="text-[12px] text-fg-muted">Broken URL — the art is the fallback, named by alt.</figcaption>
      </figure>
      <figure className="m-0 flex flex-col gap-2">
        <Image src={null} alt="Workshop floor plan" aspect="4/3" rounded="ui" placeholderPattern="grid" placeholderIcon={false} />
        <figcaption className="text-[12px] text-fg-muted">No src, forced grid pattern, no glyph.</figcaption>
      </figure>
    </div>
  );
}

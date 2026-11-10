import { Image } from "@vamos-cms/ui";

// A slow source makes the placeholders visible; in production they show for a few hundred ms.
const photo = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0";
const src = `${photo}?w=900&q=80&auto=format&fit=crop`;
const lqip = `${photo}?w=24&q=20&blur=80&auto=format`;
const common = { src, alt: "Plated sea bass with fennel and lemon", width: 900, height: 600, aspect: "4/3", rounded: "ui" } as const;

export default function ImagePlaceholder() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
      <figure className="m-0">
        <Image {...common} placeholder="blur" blurDataURL={lqip} />
        <figcaption className="mt-2 text-[12px] text-fg-muted">blur — LQIP sharpens in</figcaption>
      </figure>
      <figure className="m-0">
        <Image {...common} placeholder="color" color="#c8b49a" />
        <figcaption className="mt-2 text-[12px] text-fg-muted">color — dominant colour</figcaption>
      </figure>
      <figure className="m-0">
        <Image {...common} placeholder="skeleton" />
        <figcaption className="mt-2 text-[12px] text-fg-muted">skeleton — shimmer</figcaption>
      </figure>
      <figure className="m-0">
        <Image {...common} placeholder="none" />
        <figcaption className="mt-2 text-[12px] text-fg-muted">none — transparent</figcaption>
      </figure>
    </div>
  );
}

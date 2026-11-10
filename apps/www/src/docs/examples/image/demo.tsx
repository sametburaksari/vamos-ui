import { Image } from "@vamos-ui/react";
import type { MediaAsset } from "@vamos-ui/react/media";

const cover: MediaAsset = {
  id: "m_4821",
  kind: "image",
  mime: "image/jpeg",
  filename: "moda-office-lounge.jpg",
  size: 612_480,
  url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&auto=format&fit=crop",
  width: 1600,
  height: 1067,
  alt: "Lounge of the Moda office with low sofas and tall windows",
  focalPoint: { x: 0.5, y: 0.55 },
  // A tiny, blurred version of the same photo (your server generates this once per upload).
  placeholder: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=32&q=30&blur=60&auto=format",
  createdAt: "2026-11-03T08:40:00Z",
};

export default function ImageDemo() {
  return (
    <article className="w-full max-w-xl">
      <Image src={cover} aspect="16/9" sizes="(min-width: 768px) 36rem, 100vw" rounded="ui-lg" frame="surface" priority />
      <p className="mt-4 text-[11px] font-medium tracking-[0.1em] text-fg-subtle uppercase">Workplace · 6 min read</p>
      <h3 className="mt-1.5 font-display text-2xl leading-tight text-balance text-fg">
        How we redesigned the Moda office around <em>quiet</em> work
      </h3>
    </article>
  );
}

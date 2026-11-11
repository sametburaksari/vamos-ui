"use client";

import * as React from "react";
import { cn, Image } from "@vamos-ui/react";
import { Lightbox, LightboxTrigger, type MediaSource } from "@vamos-ui/react/media";
import { Maximize2 } from "lucide-react";
import { photo, type GalleryPhoto } from "./catalogue";
import { useShop } from "./cart-store";

/**
 * Product gallery: thumbnails (a radio-like set of buttons), a main image that magnifies under
 * the pointer on hover-capable devices, and a full-screen lightbox with pinch / wheel / +− zoom.
 */
export function ProductGallery({ photos, label }: { photos: GalleryPhoto[]; label: string }) {
  const { t, c } = useShop();
  const [index, setIndex] = React.useState(0);
  const [lens, setLens] = React.useState<{ x: number; y: number } | null>(null);
  const current = photos[Math.min(index, photos.length - 1)]!;
  const key = photos.map((p) => p.id).join();
  React.useEffect(() => setIndex(0), [key]);

  const items: MediaSource[] = photos.map((p) => ({ src: photo(p.id, 1600), width: 1600, height: 2000, alt: t(p.alt), id: p.id }));

  const move = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setLens({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  return (
    <Lightbox items={items} index={index} onIndexChange={setIndex} zoom={{ max: 3 }}>
      <div className="grid content-start items-start gap-3 self-start md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-4">
        <div role="group" aria-label={c(`${label} photos`, `${label} fotoğrafları`)} className="order-2 -m-1 flex gap-2 overflow-x-auto p-1 scrollbar-none md:order-1 md:flex-col md:overflow-visible">
          {photos.map((p, i) => (
            <button
              key={`${p.id}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              aria-label={c(`Photo ${i + 1} of ${photos.length}: ${t(p.alt)}`, `Fotoğraf ${i + 1} / ${photos.length}: ${t(p.alt)}`)}
              className={cn(
                "w-16 shrink-0 overflow-hidden rounded-ui focus-ring transition-opacity md:w-[4.5rem]",
                i === index ? "ring-[1.5px] ring-fg ring-offset-2 ring-offset-scene" : "opacity-60 hover:opacity-100",
              )}
            >
              <Image src={photo(p.id, 160)} width={160} height={200} alt="" aspect="4/5" sizes="72px" />
            </button>
          ))}
        </div>
        <div className="relative order-1 md:order-2">
          <LightboxTrigger
            index={index}
            className="relative block w-full overflow-hidden rounded-ui-lg p-0 leading-none"
            onPointerMove={move}
            onPointerLeave={() => setLens(null)}
            aria-label={c(`Open full-screen zoom: ${t(current.alt)}`, `Tam ekran yakınlaştır: ${t(current.alt)}`)}
          >
            <Image
              key={current.id}
              src={photo(current.id, 1200)}
              width={1200}
              height={1500}
              alt=""
              aspect="4/5"
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="motion-safe:animate-[ui-fade_260ms_ease-out]"
            />
            {/* Hover magnifier: the same photo at 2×, following the pointer (mouse only). */}
            {lens ? (
              <span aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden [@media(hover:hover)]:block">
                <span className="absolute inset-0 block" style={{ transform: "scale(2)", transformOrigin: `${lens.x}% ${lens.y}%` }}>
                  <Image src={photo(current.id, 1800)} width={1800} height={2250} alt="" aspect="4/5" placeholder="none" sizes="100vw" />
                </span>
              </span>
            ) : null}
          </LightboxTrigger>
          <span className="surface-popover pointer-events-none absolute end-3 bottom-3 inline-flex items-center gap-1.5 rounded-ui px-2.5 py-1.5 text-[12px] text-fg">
            <Maximize2 aria-hidden className="size-3.5" />
            <span className="tabular">
              {index + 1} / {photos.length}
            </span>
          </span>
        </div>
      </div>
    </Lightbox>
  );
}

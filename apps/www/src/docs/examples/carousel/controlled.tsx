"use client";

import * as React from "react";
import { Carousel, CarouselSlide, CarouselViewport, Image } from "@vamos-cms/ui";

const rooms = [
  { id: "r1", name: "Hammam", photo: "photo-1540555700478-4be289fbecef", alt: "Rolled towel and tulips beside a lit candle" },
  { id: "r2", name: "Massage suite", photo: "photo-1544161515-4ab6ce6db874", alt: "Massage room with candles and towels" },
  { id: "r3", name: "Relaxation lounge", photo: "photo-1524758631624-e2822e304c36", alt: "Quiet lounge with armchairs and plants" },
  { id: "r4", name: "Reception", photo: "photo-1497366811353-6870744d04b2", alt: "Reception desk with a wooden counter" },
];
const url = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=75&auto=format&fit=crop`;

// Two carousels share one index: the big one and a strip of names.
export default function CarouselControlled() {
  const [index, setIndex] = React.useState(0);
  return (
    <div className="grid w-full gap-3">
      <Carousel label="Lena Spa rooms" index={index} onIndexChange={setIndex} controls="inside">
        <CarouselViewport className="rounded-ui-lg">
          {rooms.map((r) => (
            <CarouselSlide key={r.id}>
              <Image src={url(r.photo, 1200)} alt={r.alt} width={1200} height={800} aspect="21/9" sizes="100vw" />
            </CarouselSlide>
          ))}
        </CarouselViewport>
      </Carousel>
      <Carousel label="Room names" index={index} onIndexChange={setIndex} slidesPerView="auto" gap="sm" controls="hidden">
        <CarouselViewport>
          {rooms.map((r, i) => (
            <CarouselSlide key={r.id}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-pressed={i === index}
                className="focus-ring rounded-full border border-line px-3.5 py-1.5 text-[13px] text-fg-muted transition-colors hover:text-fg aria-pressed:border-transparent aria-pressed:bg-fg aria-pressed:text-scene"
              >
                {r.name}
              </button>
            </CarouselSlide>
          ))}
        </CarouselViewport>
      </Carousel>
    </div>
  );
}

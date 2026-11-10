"use client";

import { Image, ImageLoaderProvider } from "@vamos-ui/react";
import type { ImageLoader } from "@vamos-ui/react/media";

// Same signature as the Next.js loader, so one function serves both.
// Cloudflare Images:  `https://example.com/cdn-cgi/image/width=${width},quality=${quality ?? 75},format=auto/${src}`
// imgproxy:           `https://img.example.com/insecure/rs:fit:${width}/q:${quality ?? 75}/plain/${src}`
const unsplashLoader: ImageLoader = ({ src, width, quality, focal }) => {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  if (focal) {
    url.searchParams.set("fit", "crop");
    url.searchParams.set("fp-x", String(focal.x));
    url.searchParams.set("fp-y", String(focal.y));
    url.searchParams.set("crop", "focalpoint");
  }
  return url.toString();
};

export default function ImageLoaderExample() {
  return (
    <ImageLoaderProvider loader={unsplashLoader}>
      <div className="grid w-full gap-4 sm:grid-cols-[2fr_1fr]">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"
          alt="Two-storey villa with a pool in Çeşme"
          width={2400}
          height={1600}
          aspect="3/2"
          sizes="(min-width: 640px) 66vw, 100vw"
          rounded="ui"
        />
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
          alt="Villa terrace at dusk"
          width={2400}
          height={1600}
          aspect="4/5"
          widths={[320, 480, 640]}
          sizes="(min-width: 640px) 33vw, 100vw"
          rounded="ui"
        />
      </div>
    </ImageLoaderProvider>
  );
}

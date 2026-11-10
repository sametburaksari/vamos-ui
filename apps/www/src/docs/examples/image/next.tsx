"use client";

// app/providers.tsx — hand next/image to the kit once; every <Image> then renders through it.
// import NextImage from "next/image";
// <VamosProvider Image={NextImage}>…</VamosProvider>
// or: export const Providers = createVamosNextProvider({ Link, Image: NextImage, useRouter, usePathname });

import * as React from "react";
import NextImage from "next/image";
import { Image, VamosProvider, type VamosImageComponent, type VamosImageProps } from "@vamos-ui/react";

// A thin bridge: pass `unoptimized` here (or configure images.remotePatterns in next.config).
const NextImageBridge = React.forwardRef<HTMLImageElement, VamosImageProps>(function NextImageBridge(props, ref) {
  return <NextImage ref={ref} {...props} unoptimized />;
}) as VamosImageComponent;

export default function ImageNextBridge() {
  return (
    <VamosProvider Image={NextImageBridge}>
      <div className="w-full max-w-md">
        <Image
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop"
          alt="Product team planning the Q1 roadmap around a laptop"
          width={1200}
          height={800}
          aspect="16/9"
          rounded="ui-lg"
          sizes="28rem"
        />
        <p className="mt-2 text-[12.5px] text-fg-muted">Rendered by next/image (fill mode inside the kit's ratio box).</p>
      </div>
    </VamosProvider>
  );
}

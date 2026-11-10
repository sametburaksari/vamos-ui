"use client";

// Public API of @vamos-ui/react/next — Next.js App Router bindings for VamosProvider.
// The kit never imports `next/*` itself (it isn't a dependency); you hand the pieces in once.

import * as React from "react";
import { VamosProvider, type VamosImageComponent, type VamosLinkComponent, type VamosProviderProps } from "../lib/provider";

/** The parts of Next.js the bindings need — pass the real imports. */
export interface NextBindings {
  /** `import Link from "next/link"` */
  Link: React.ComponentType<any>;
  /** `import Image from "next/image"` (optional; default `<img>`). */
  Image?: React.ComponentType<any>;
  /** `import { useRouter } from "next/navigation"` */
  useRouter: () => { push: (href: string, options?: { scroll?: boolean }) => void; replace: (href: string, options?: { scroll?: boolean }) => void };
  /** `import { usePathname } from "next/navigation"` */
  usePathname: () => string | null;
}

export type NextVamosProviderProps = Omit<VamosProviderProps, "Link" | "Image" | "navigate">;

/**
 * Creates a `VamosProvider` wired to the Next.js App Router (Link, Image, `router.push/replace`,
 * `usePathname`). Do it once in a client file and use the result in your root layout:
 *
 * ```tsx
 * // app/providers.tsx
 * "use client";
 * import Link from "next/link";
 * import Image from "next/image";
 * import { usePathname, useRouter } from "next/navigation";
 * import { createVamosNextProvider } from "@vamos-ui/react/next";
 *
 * export const Providers = createVamosNextProvider({ Link, Image, useRouter, usePathname });
 *
 * // app/layout.tsx (server)
 * <Providers locale="tr-TR" messages={tr} timeZone="Europe/Istanbul" currency="TRY">{children}</Providers>
 * ```
 *
 * Pass `currentPath` from the server layout too if you need the active nav item on first paint.
 */
export function createVamosNextProvider(next: NextBindings) {
  const Link = next.Link as VamosLinkComponent;
  const Image = next.Image as VamosImageComponent | undefined;
  function NextVamosProvider({ currentPath, children, ...props }: NextVamosProviderProps) {
    const router = next.useRouter();
    const pathname = next.usePathname();
    const navigate = React.useCallback<NonNullable<VamosProviderProps["navigate"]>>(
      (href, options) => (options?.replace ? router.replace(href, { scroll: options.scroll }) : router.push(href, { scroll: options?.scroll })),
      [router],
    );
    return React.createElement(VamosProvider, { ...props, Link, Image, navigate, currentPath: pathname ?? currentPath, children });
  }
  return NextVamosProvider;
}

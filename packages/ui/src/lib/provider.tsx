"use client";

import * as React from "react";
import { LocaleProvider, type LocaleProviderProps } from "./locale";

/** Props every kit link accepts. Router links (Next `Link`) are compatible. */
export interface VamosLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  /** Router hint: replace the history entry. */
  replace?: boolean;
  /** Router hint: prefetch the target. */
  prefetch?: boolean | null;
  ref?: React.Ref<HTMLAnchorElement>;
}
export type VamosLinkComponent = React.ComponentType<VamosLinkProps>;

/** Props every kit image accepts. Next `Image` is compatible. */
export interface VamosImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  /** Fill the positioned parent (object-fit via className). */
  fill?: boolean;
  /** Above-the-fold image: eager loading + high fetch priority. */
  priority?: boolean;
  quality?: number;
  ref?: React.Ref<HTMLImageElement>;
}
export type VamosImageComponent = React.ComponentType<VamosImageProps>;

export interface NavigateOptions {
  replace?: boolean;
  scroll?: boolean;
}

export interface VamosContextValue {
  Link: VamosLinkComponent;
  Image: VamosImageComponent;
  navigate: (href: string, options?: NavigateOptions) => void;
  /** Current pathname, for active nav items. Pass it from the server layout to avoid a hydration flash. */
  currentPath?: string;
  /** Permission check used to hide nav items and actions. Hiding is not access control. */
  can: (permission: string, resource?: unknown) => boolean;
  /** Media adapter (see `@vamos-ui/react/media`). Typed by the consumer: `useMediaAdapter<MyAdapter>()`. */
  media?: unknown;
}

/** Default link: a plain `<a>` (router hints are dropped). */
export const DefaultLink = React.forwardRef<HTMLAnchorElement, VamosLinkProps>(function DefaultLink({ replace: _r, prefetch: _p, ...props }, ref) {
  return <a ref={ref} {...props} />;
});

/** Default image: a plain `<img>` with lazy loading; `fill` covers the positioned parent. */
export const DefaultImage = React.forwardRef<HTMLImageElement, VamosImageProps>(function DefaultImage(
  { fill, priority, quality: _q, style, loading, decoding, ...props },
  ref,
) {
  return (
    <img
      ref={ref}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding={decoding ?? "async"}
      fetchPriority={priority ? "high" : undefined}
      style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style}
      {...props}
    />
  );
});

const defaultNavigate = (href: string, o?: NavigateOptions) => {
  if (typeof window === "undefined") return;
  if (o?.replace) window.location.replace(href);
  else window.location.assign(href);
};

const VamosContext = React.createContext<VamosContextValue>({
  Link: DefaultLink,
  Image: DefaultImage,
  navigate: defaultNavigate,
  can: () => true,
});

export interface VamosProviderProps extends Omit<LocaleProviderProps, "children">, Partial<Omit<VamosContextValue, "currentPath">> {
  currentPath?: string;
  children: React.ReactNode;
}

/**
 * The app root bridge: locale + router + image + permissions + media, set once.
 * The kit never imports a framework; pass your router's pieces (or use `@vamos-ui/react/next`).
 *
 * ```tsx
 * "use client";
 * import Link from "next/link";
 * import { usePathname, useRouter } from "next/navigation";
 *
 * export function Providers({ children }) {
 *   const router = useRouter();
 *   return (
 *     <VamosProvider Link={Link} navigate={(href, o) => (o?.replace ? router.replace(href) : router.push(href))}
 *       currentPath={usePathname()} can={(p) => user.permissions.includes(p)} locale="en-US">
 *       {children}
 *     </VamosProvider>
 *   );
 * }
 * ```
 */
export function VamosProvider({ Link, Image, navigate, currentPath, can, media, locale, messages, dir, timeZone, currency, children }: VamosProviderProps) {
  const parent = React.useContext(VamosContext);
  const value = React.useMemo<VamosContextValue>(
    () => ({
      Link: Link ?? parent.Link,
      Image: Image ?? parent.Image,
      navigate: navigate ?? parent.navigate,
      currentPath: currentPath ?? parent.currentPath,
      can: can ?? parent.can,
      media: media ?? parent.media,
    }),
    [Link, Image, navigate, currentPath, can, media, parent],
  );
  return (
    <VamosContext.Provider value={value}>
      <LocaleProvider locale={locale} messages={messages} dir={dir} timeZone={timeZone} currency={currency}>
        {children}
      </LocaleProvider>
    </VamosContext.Provider>
  );
}

/** The whole bridge value. */
export const useVamos = (): VamosContextValue => React.useContext(VamosContext);
/** The app's link component (default `<a>`). */
export const useLink = (): VamosLinkComponent => React.useContext(VamosContext).Link;
/** The app's image component (default `<img>`). */
export const useImage = (): VamosImageComponent => React.useContext(VamosContext).Image;
/** The permission check (default: everything allowed). */
export const useCan = (): VamosContextValue["can"] => React.useContext(VamosContext).can;
/** The media adapter, typed by the caller. */
export const useMediaAdapter = <T = unknown,>(): T | undefined => React.useContext(VamosContext).media as T | undefined;

const normalise = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/** `navigate`, `currentPath` and an `isActive(href)` helper for nav items. */
export function useNavigation() {
  const { navigate, currentPath } = React.useContext(VamosContext);
  return React.useMemo(
    () => ({
      navigate,
      currentPath,
      /** `exact`: only the same path; otherwise the path or any child path (`/posts` is active on `/posts/12`). */
      isActive(href: string, options: { exact?: boolean } = {}) {
        if (!currentPath) return false;
        const path = normalise(currentPath.split(/[?#]/)[0]!);
        const target = normalise(href.split(/[?#]/)[0]!);
        if (options.exact || target === "/") return path === target;
        return path === target || path.startsWith(`${target}/`);
      },
    }),
    [navigate, currentPath],
  );
}

/** `true` for absolute URLs to another origin, `mailto:`, `tel:` and protocol-relative links. */
export function isExternalHref(href: string): boolean {
  return /^([a-z][a-z\d+.-]*:|\/\/)/i.test(href);
}

export interface SmartLinkProps extends VamosLinkProps {
  /** Force external behaviour (new tab + `rel="noopener noreferrer"`). Default: detected from `href`. */
  external?: boolean;
}

/**
 * Internal links go through the app's router `Link`; external ones render `<a target="_blank" rel="noopener noreferrer">`
 * (`mailto:` / `tel:` stay in the same tab).
 */
export const SmartLink = React.forwardRef<HTMLAnchorElement, SmartLinkProps>(function SmartLink({ href, external, target, rel, ...props }, ref) {
  const Link = useLink();
  const isExternal = external ?? isExternalHref(href);
  if (isExternal) {
    const newTab = !/^(mailto|tel|sms):/i.test(href);
    const { replace: _r, prefetch: _p, ...rest } = props;
    return <a ref={ref} href={href} target={target ?? (newTab ? "_blank" : undefined)} rel={rel ?? (newTab ? "noopener noreferrer" : undefined)} {...rest} />;
  }
  return <Link ref={ref} href={href} target={target} rel={rel} {...props} />;
});

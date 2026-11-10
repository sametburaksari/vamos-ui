// Brand marks for site blocks (lucide ships none). Pure inline SVG, 24×24, `currentColor`,
// decorative by default — the link around an icon carries the accessible name.

import * as React from "react";
import { cn2 as cn } from "./kit-2";
import type { SocialNetwork } from "../../schema/types";

export type BrandName = SocialNetwork | "waze" | "email" | "phone" | "messenger";

export interface BrandIconProps extends Omit<React.SVGProps<SVGSVGElement>, "name"> {
  name: BrandName;
  /** Accessible name; without it the icon is `aria-hidden`. */
  title?: string;
}

const PATHS: Record<BrandName, React.ReactNode> = {
  whatsapp: (
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.69.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.81 11.81 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41Z" />
  ),
  instagram: (
    <path
      fillRule="evenodd"
      d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"
    />
  ),
  facebook: <path d="M13.5 22v-8.2h2.75l.42-3.2H13.5V8.56c0-.93.26-1.56 1.59-1.56h1.7V4.14A22.6 22.6 0 0 0 14.31 4C11.86 4 10.2 5.49 10.2 8.24v2.36H7.44v3.2h2.76V22h3.3Z" />,
  linkedin: (
    <path d="M5.34 3A2.17 2.17 0 1 1 5.33 7.35 2.17 2.17 0 0 1 5.34 3ZM3.46 8.98h3.75V21H3.46V8.98ZM9.56 8.98h3.6v1.64h.05c.5-.95 1.72-1.95 3.55-1.95 3.8 0 4.5 2.5 4.5 5.75V21h-3.74v-5.84c0-1.4-.03-3.19-1.94-3.19-1.95 0-2.25 1.52-2.25 3.09V21H9.56V8.98Z" />
  ),
  x: <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.73H5.58l11.09 14.44Z" />,
  youtube: (
    <path
      fillRule="evenodd"
      d="M22.54 7.2a2.76 2.76 0 0 0-1.94-1.96C18.88 4.78 12 4.78 12 4.78s-6.88 0-8.6.46A2.76 2.76 0 0 0 1.46 7.2C1 8.93 1 12.5 1 12.5s0 3.57.46 5.3a2.76 2.76 0 0 0 1.94 1.96c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.76 2.76 0 0 0 1.94-1.96c.46-1.73.46-5.3.46-5.3s0-3.57-.46-5.3ZM9.75 15.77V9.23l5.75 3.27-5.75 3.27Z"
    />
  ),
  tiktok: <path d="M16.6 2h-3.3v13.17a2.85 2.85 0 1 1-2.85-2.85c.3 0 .59.05.86.13V9.1a6.19 6.19 0 1 0 5.29 6.12V8.68a7.6 7.6 0 0 0 4.4 1.4V6.77A4.4 4.4 0 0 1 16.6 2.4V2Z" />,
  telegram: (
    <path d="M21.94 4.3 18.8 19.13c-.24 1.05-.86 1.31-1.74.82l-4.8-3.54-2.32 2.23c-.26.26-.47.47-.97.47l.35-4.89 8.9-8.04c.39-.35-.08-.54-.6-.19l-11 6.93-4.74-1.48c-1.03-.32-1.05-1.03.21-1.52L20.6 2.82c.86-.32 1.6.19 1.34 1.48Z" />
  ),
  messenger: (
    <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.43 3.14 7.17.17.15.27.36.27.58l.06 1.78a.8.8 0 0 0 1.12.71l1.98-.88a.8.8 0 0 1 .54-.04c.91.25 1.87.38 2.89.38 5.64 0 10-4.13 10-9.7S17.64 2 12 2Zm6 7.46-2.94 4.66a1.5 1.5 0 0 1-2.17.4l-2.34-1.75a.6.6 0 0 0-.72 0l-3.16 2.4c-.42.32-.97-.18-.69-.63l2.94-4.66a1.5 1.5 0 0 1 2.17-.4l2.34 1.75a.6.6 0 0 0 .72 0l3.16-2.4c.42-.32.97.18.69.63Z" />
  ),
  "google-maps": (
    <path fillRule="evenodd" d="M12 1.5a7.5 7.5 0 0 0-7.5 7.5c0 5.4 6.27 12.4 6.84 13.03a.9.9 0 0 0 1.32 0C13.23 21.4 19.5 14.4 19.5 9A7.5 7.5 0 0 0 12 1.5Zm0 4.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
  ),
  "apple-maps": (
    <path fillRule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm10.9 4.1-9.6 4.1c-.6.26-.5 1.13.13 1.25l3.82.73.73 3.82c.12.64 1 .73 1.25.13l4.1-9.6a.33.33 0 0 0-.43-.43Z" />
  ),
  "yandex-maps": (
    <path fillRule="evenodd" d="M12 1.5a7.5 7.5 0 0 0-7.5 7.5c0 5.4 6.27 12.4 6.84 13.03a.9.9 0 0 0 1.32 0C13.23 21.4 19.5 14.4 19.5 9A7.5 7.5 0 0 0 12 1.5ZM10.4 5h1.9c1.9 0 3 .9 3 2.6 0 1.2-.6 2-1.6 2.4l1.9 3.6h-1.8l-1.7-3.3h-.2v3.3h-1.5V5Zm1.5 1.25v2.5h.4c.9 0 1.4-.4 1.4-1.25 0-.85-.5-1.25-1.4-1.25h-.4Z" />
  ),
  waze: (
    <path fillRule="evenodd" d="M12.5 2.5c5 0 9 3.6 9 8.2 0 2.9-1.6 5.3-4 6.8a2 2 0 1 1-3.9.9h-2.6a2 2 0 0 1-3.94-.35A7.6 7.6 0 0 1 3.5 15c.9-.3 1.5-1.1 1.5-2.3v-2C5 6.1 8.3 2.5 12.5 2.5Zm-2.25 6.25a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm4.5 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-5 3.6a.6.6 0 0 0-.5.9 3.6 3.6 0 0 0 6.1 0 .6.6 0 0 0-1-.65 2.4 2.4 0 0 1-4.1 0 .6.6 0 0 0-.5-.25Z" />
  ),
  email: <path fillRule="evenodd" d="M3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13A1.5 1.5 0 0 1 3.5 4Zm.5 2.3V18h16V6.3l-7.4 5.55a1 1 0 0 1-1.2 0L4 6.3ZM5.7 6l6.3 4.72L18.3 6H5.7Z" />,
  phone: (
    <path d="M7.2 2.5c.5 0 .95.32 1.1.8l1.2 3.6c.14.43 0 .9-.34 1.19L7.6 9.4a13 13 0 0 0 7 7l1.3-1.56c.29-.35.76-.48 1.19-.34l3.6 1.2c.48.15.8.6.8 1.1v3.2c0 .64-.52 1.17-1.17 1.16C10.9 21.06 2.94 13.1 2.84 3.67 2.83 3.02 3.36 2.5 4 2.5h3.2Z" />
  ),
};

/** Human names for networks ("LinkedIn", "Google Maps") — for aria-labels and link text. */
export const BRAND_NAMES: Record<BrandName, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
  tiktok: "TikTok",
  telegram: "Telegram",
  messenger: "Messenger",
  "google-maps": "Google Maps",
  "apple-maps": "Apple Maps",
  "yandex-maps": "Yandex Maps",
  waze: "Waze",
  email: "Email",
  phone: "Phone",
};

/**
 * A brand mark (WhatsApp, Instagram, LinkedIn, X, YouTube, TikTok, Telegram, maps providers…).
 * Monochrome `currentColor`, 20px by default, never boxed in a coloured tile (D6-3).
 *
 * ```tsx
 * <a href="https://instagram.com/meyhane" aria-label="Instagram"><BrandIcon name="instagram" /></a>
 * ```
 */
export function BrandIcon({ name, title, className, ...props }: BrandIconProps) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      className={cn("size-5 shrink-0", className)}
      {...props}
    >
      {path}
    </svg>
  );
}

/** `https://wa.me/<digits>?text=<encoded>` from an E.164 number. */
export function waLink(e164: string, text?: string): string {
  const digits = e164.replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

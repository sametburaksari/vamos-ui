import { cn } from "@vamos-ui/react";
import { Play, Smartphone } from "lucide-react";
import type { Copy } from "./content";

export const STORE_LINKS = {
  ios: "https://apps.example.com/tempo-run/ios",
  android: "https://apps.example.com/tempo-run/android",
};

/**
 * Generic, unbranded store badges: inverted pills with a two-line label. Swap for the official
 * badge artwork (and its usage rules) in a real app.
 */
export function StoreBadges({ c, className, size = "md" }: { c: Copy; className?: string; size?: "md" | "lg" }) {
  const { t } = c;
  const items = [
    { href: STORE_LINKS.ios, icon: Smartphone, top: t({ en: "Download on the", tr: "İndirin:" }), name: "App Store" },
    { href: STORE_LINKS.android, icon: Play, top: t({ en: "Get it on", tr: "Edinin:" }), name: "Google Play" },
  ];
  return (
    <ul className={cn("m-0 flex list-none flex-wrap gap-3 p-0", className)}>
      {items.map(({ href, icon: Icon, top, name }) => (
        <li key={name}>
          <a
            href={href}
            className={cn(
              "inline-flex items-center gap-3 rounded-ui border border-line bg-fg text-scene transition-opacity hover:opacity-90 focus-ring",
              size === "lg" ? "h-16 px-6" : "h-13 px-4",
            )}
          >
            <Icon aria-hidden className={size === "lg" ? "size-6" : "size-5"} strokeWidth={1.75} />
            <span className="flex flex-col items-start leading-none">
              <span className="text-[10.5px] font-medium opacity-75">{top}</span>
              <span className={cn("mt-1 font-semibold tracking-[-0.01em]", size === "lg" ? "text-lg" : "text-[15px]")}>{name}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

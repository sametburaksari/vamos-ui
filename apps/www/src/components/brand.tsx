import { cn } from "@vamos-ui/react";

/**
 * Vamos mark (traced from the official logo). Uses currentColor.
 * The name and the mark are trademarks of Vamos — see TRADEMARKS.md.
 */
export function VamosMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 496 432" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} fill="currentColor">
      {title && <title>{title}</title>}
      <g transform="translate(-1 455.586) scale(0.1 -0.1)">
        <path d="M53 4553 c-24 -2 -43 -9 -43 -14 0 -13 1413 -2429 1421 -2429 8 0 231 366 317 520 215 386 271 557 258 790 -30 563 -344 970 -854 1108 l-97 26 -480 2 c-264 0 -499 -1 -522 -3z" />
        <path d="M4600 4423 c-716 -27 -1282 -262 -1651 -686 -138 -158 -633 -941 -1078 -1704 l-182 -312 431 -740 c238 -408 435 -741 439 -741 3 0 549 933 1212 2072 1079 1854 1205 2075 1194 2093 -13 21 -139 27 -365 18z" />
      </g>
    </svg>
  );
}

/** "vamos UI" lockup. The wordmark keeps its own font so the font axis never changes the brand. */
export function VamosLogo({ className, product = "UI" }: { className?: string; product?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg", className)}>
      <VamosMark className="h-[19px] w-auto" />
      <span className="flex items-baseline gap-1.5 leading-none">
        <span className="font-[family-name:var(--ff-bricolage)] text-[21px] font-semibold tracking-[-0.045em] [font-variation-settings:'opsz'_48]">vamos</span>
        <span className="rounded-[5px] bg-fg px-[5px] py-[2px] text-[10.5px] font-semibold tracking-[0.04em] text-scene">{product}</span>
      </span>
    </span>
  );
}

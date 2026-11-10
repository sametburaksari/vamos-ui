import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      // Theme type scale (styles.css @theme --text-*): without these, `text-display-m text-fg`
      // reads as two colours and the size is dropped.
      "font-size": [{ text: ["2xs", "display-2xl", "display-xl", "display-l", "display-m", "h3", "lead", "body", "small", "eyebrow"] }],
      rounded: [{ rounded: ["ui", "ui-sm", "ui-lg"] }],
    },
  },
});

/** Merge class names; on Tailwind conflicts the last one wins. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

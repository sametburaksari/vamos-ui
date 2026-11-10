import { ex, type DocEntry } from "../types";
import ScrollAreaDemo from "../examples/scroll-area/demo";
import ScrollAreaHorizontal from "../examples/scroll-area/horizontal";
import ScrollAreaCode from "../examples/scroll-area/code";
import ScrollAreaInPanel from "../examples/scroll-area/in-panel";

const entry: DocEntry = {
  slug: "scroll-area",
  title: "Scroll Area",
  group: "Page layouts",
  description:
    "A consistent thin scrollbar for bounded regions — activity feeds, option lists, chip strips, code blocks — with optional edge fades. Native scrolling is kept.",
  source: ["components/scroll-area.tsx", "lib/use-edge-fade.ts", "styles/navigation.css"],
  basedOn: "Radix Scroll Area",
  usage: `import { ScrollArea } from "@vamos-ui/react";

<ScrollArea maxHeight={320} fade aria-label="Recent activity">…</ScrollArea>`,
  demo: ex("demo", "Demo", "scroll-area/demo.tsx", ScrollAreaDemo),
  examples: [
    ex("horizontal", "Horizontal chip strip", "scroll-area/horizontal.tsx", ScrollAreaHorizontal, "orientation=\"horizontal\" with fade: the mask disappears at each edge. Give the content w-max."),
    ex("code", "Both directions (code)", "scroll-area/code.tsx", ScrollAreaCode, "orientation=\"both\"; type=\"auto\" shows the bars whenever content overflows."),
    ex("in-panel", "In a floating panel", "scroll-area/in-panel.tsx", ScrollAreaInPanel, "Long option lists inside popovers and menus. The thumb uses the foreground at 25%, so it reads on glass and solid."),
  ],
  api: [
    { name: "ScrollArea", props: [
      { name: "orientation", type: '"vertical" | "horizontal" | "both"', default: '"vertical"', description: "Which scrollbars to render." },
      { name: "maxHeight", type: "number | string", description: "Max viewport height (number = px); grows with content up to it." },
      { name: "fade", type: "boolean", default: "false", description: "Edge fade mask on the scrolling axis (not for both)." },
      { name: "type", type: '"hover" | "scroll" | "auto" | "always"', default: '"hover"', description: "When the scrollbars are visible." },
      { name: "size", type: '"sm" | "md"', default: '"sm"', description: "Scrollbar thickness." },
      { name: "scrollHideDelay", type: "number", default: "600", description: "ms before hover / scroll bars hide." },
      { name: "viewportRef", type: "Ref<HTMLDivElement>", description: "The scrolling element (scroll position, virtualisation)." },
      { name: "viewportClassName", type: "string", description: "Class names for the viewport." },
      { name: "aria-label", type: "string", description: "Names the region (adds role=\"region\"). Recommended when the region is focusable." },
      { name: "dir", type: '"ltr" | "rtl"', description: "The vertical bar moves to the left in RTL." },
    ] },
    { name: "ScrollBar", props: [
      { name: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "For custom layouts; ScrollArea renders its bars automatically." },
      { name: "size", type: '"sm" | "md"', description: "Overrides the area's size." },
    ] },
  ],
  notes: [
    "Keep the page body and the Sidebar on native scrolling. ScrollArea is for embedded, bounded regions (performance, iOS momentum).",
    "The viewport is keyboard-focusable only when its content has nothing focusable of its own.",
  ],
  covers: ["Scroll Area"],
};

export default entry;

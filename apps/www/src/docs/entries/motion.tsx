import { ex, type DocEntry } from "../types";
import MotionDemo from "../examples/motion/demo";
import MotionReveal from "../examples/motion/reveal";
import MotionStagger from "../examples/motion/stagger";
import MotionCountUp from "../examples/motion/count-up";
import MotionTicker from "../examples/motion/ticker";
import MotionTextReveal from "../examples/motion/text-reveal";
import MotionPointer from "../examples/motion/pointer";
import MotionScroll from "../examples/motion/scroll";
import MotionTransitions from "../examples/motion/transitions";
import MotionLevels from "../examples/motion/levels";

const revealOptions = [
  { name: "once", type: "boolean", default: "true", description: "Reveal once and stop observing. With false it hides again when scrolled back above it." },
  { name: "rootMargin", type: "string", default: '"0px 0px -8% 0px"', description: "IntersectionObserver rootMargin — when “in view” starts." },
  { name: "threshold", type: "number", default: "0", description: "IntersectionObserver threshold." },
  { name: "disabled", type: "boolean", default: "false", description: "Skip the animation; the content just shows (blocks pass editMode here)." },
  { name: "onReveal", type: "() => void", description: "Called once the element starts revealing." },
];

const entry: DocEntry = {
  slug: "motion",
  title: "Motion",
  group: "Foundations",
  description:
    "A small, CSS-first motion kit: scroll reveals, staggered lists, count-ups, a ticker, scroll-linked parallax, word-by-word headings, pointer tilt, page transitions and micro-interactions. Opacity and transform only (no layout shift), never hides server-rendered content before hydration, and every primitive renders its final state under reduced motion or data-motion=\"off\".",
  source: [
    "motion/core.ts",
    "motion/reveal.tsx",
    "motion/count-up.tsx",
    "motion/ticker.tsx",
    "motion/parallax.tsx",
    "motion/text-reveal.tsx",
    "motion/pointer.tsx",
    "motion/page-transition.tsx",
    "motion/skeleton-swap.tsx",
    "motion/scroll-shrink.ts",
    "motion/motion-scope.tsx",
    "styles/motion.css",
  ],
  basedOn: "IntersectionObserver, CSS scroll-driven animations, View Transitions API",
  usage: `import { Reveal, Stagger, CountUp, Ticker } from "@vamos-ui/react/motion";

<Reveal effect="rise"><Card>…</Card></Reveal>
<Stagger asChild step={70}><ul>{rows}</ul></Stagger>
<CountUp value={1240} />

// A whole site: <SiteShell motion="full" | "subtle" | "off">`,
  demo: ex("demo", "Demo", "motion/demo.tsx", MotionDemo),
  examples: [
    ex("reveal", "Reveal effects", "motion/reveal.tsx", MotionReveal, "fade, rise, blur, scale and clip. Content already on screen when the page loads stays put; content below the fold is hidden just before paint and revealed on scroll."),
    ex("stagger", "Stagger", "motion/stagger.tsx", MotionStagger, "Children arrive in sequence. asChild keeps your list element; the step defaults to the level's --motion-stagger."),
    ex("count-up", "Count-up, per locale", "motion/count-up.tsx", MotionCountUp, "Intl formatting, tabular figures and a reserved width. Screen readers hear the final value only."),
    ex("ticker", "Ticker", "motion/ticker.tsx", MotionTicker, "Pure CSS marquee with a pause control; static and wrapped under reduced motion."),
    ex("text-reveal", "Text reveal", "motion/text-reveal.tsx", MotionTextReveal, "Word or line stagger for headings, read as one string by assistive tech."),
    ex("pointer", "Tilt, magnetic and micro-interactions", "motion/pointer.tsx", MotionPointer, "Pointer effects run for mouse and trackpad only. vm-press, vm-lift, vm-underline and vm-nudge are plain classes."),
    ex("scroll", "Parallax and scroll progress", "motion/scroll.tsx", MotionScroll, "animation-timeline where supported, a passive rAF fallback elsewhere."),
    ex("transitions", "Page transitions and skeleton swap", "motion/transitions.tsx", MotionTransitions, "View Transitions when available, a fade otherwise; loaded content cross-fades over its skeleton."),
    ex("levels", "SiteShell motion levels", "motion/levels.tsx", MotionLevels, "full, subtle (default) and off. off is also exactly what a visitor with reduced motion sees at any level."),
  ],
  api: [
    { name: "Reveal", props: [
      { name: "effect", type: '"fade" | "rise" | "blur" | "scale" | "clip"', default: '"rise"', description: "How it enters. Opacity, transform, filter or clip-path — never layout." },
      { name: "delay", type: "number (ms)", description: "Wait before starting." },
      { name: "duration", type: "number (ms)", description: "Override the level's --motion-reveal." },
      { name: "asChild", type: "boolean", default: "false", description: "Animate your element instead of a wrapping div." },
      ...revealOptions,
    ] },
    { name: "Stagger", props: [
      { name: "step", type: "number (ms)", default: "--motion-stagger (60 / 90)", description: "Time between children. The 13th child onwards shares the last slot." },
      { name: "effect · delay · duration · asChild", type: "as Reveal", description: "Applied to each direct child." },
      ...revealOptions,
    ] },
    { name: "CountUp", props: [
      { name: "value", type: "number", description: "Final value — what the server renders and screen readers hear." },
      { name: "from", type: "number", default: "0", description: "Start value." },
      { name: "duration", type: "number (ms)", default: "1400 subtle · 1800 full", description: "Length of the count." },
      { name: "delay", type: "number (ms)", default: "0", description: "Wait after it becomes visible." },
      { name: "locale", type: "string", default: "LocaleProvider", description: "BCP 47 locale for Intl.NumberFormat." },
      { name: "format", type: "Intl.NumberFormatOptions", description: "Default: the value's own decimals (max 2). Currency, percent, compact all work." },
    ] },
    { name: "Ticker", props: [
      { name: "duration", type: "number (s)", default: "40", description: "One full loop." },
      { name: "direction", type: '"start" | "end"', default: '"start"', description: "Travel direction; mirrors in RTL." },
      { name: "as", type: '"div" | "ul" | "ol"', default: '"div"', description: "Element for each copy of the items." },
      { name: "gap", type: "CSS length", default: "clamp(2.5rem, 6cqi, 4.5rem)", description: "Space between items." },
      { name: "fade", type: "boolean", default: "true", description: "Fade the start and end edges." },
      { name: "controls · pauseLabel", type: "boolean · string", default: 'true · "Pause animation"', description: "The pause control (a native checkbox, works without JS)." },
    ] },
    { name: "TextReveal", props: [
      { name: "children", type: "string", description: "The text; in line mode \\n separates lines." },
      { name: "as", type: '"h1" … "h4" | "p" | "span" | "div" | "blockquote"', default: '"h2"', description: "Element to render." },
      { name: "by", type: '"word" | "line"', default: '"word"', description: "Unit of the stagger." },
      { name: "effect", type: '"mask" | "fade" | "blur"', default: '"mask"', description: "mask: each unit rises from behind its baseline." },
      { name: "step · delay", type: "number (ms)", default: "45 words · 110 lines", description: "Time between units; wait before the first." },
    ] },
    { name: "Parallax", props: [
      { name: "shift", type: "number (px)", default: "40", description: "Travel each way while crossing the viewport. Negative moves faster than the page." },
      { name: "clip", type: "boolean", default: "true", description: "Clip to the frame and over-size the layer (give the frame an aspect ratio or height)." },
    ] },
    { name: "ScrollProgress", props: [{ name: "fixed", type: "boolean", default: "true", description: "Fixed to the top of the viewport; false keeps it in the flow." }] },
    { name: "Tilt", props: [
      { name: "max", type: "number (deg)", default: "5", description: "Maximum lean." },
      { name: "glare", type: "boolean", default: "false", description: "A soft light that follows the pointer." },
      { name: "level", type: '"subtle" | "full"', default: '"subtle"', description: "Lowest motion level that tilts." },
      { name: "asChild", type: "boolean", default: "false", description: "Tilt the child itself." },
    ] },
    { name: "Magnetic", props: [
      { name: "strength", type: "number (0–1)", default: "0.3", description: "Share of the pointer offset it follows." },
      { name: "limit", type: "number (px)", default: "10", description: "Cap on the travel." },
      { name: "level", type: '"subtle" | "full"', default: '"full"', description: "Lowest motion level that pulls." },
      { name: "asChild", type: "boolean", default: "false", description: "Pull the child itself (its own transition list is replaced while it moves)." },
    ] },
    { name: "PageTransition · startPageTransition", props: [
      { name: "pageKey", type: "string", description: "PageTransition: fades the content in on every change after the first render." },
      { name: "startPageTransition(update, { scope })", type: '=> "view-transition" | "none"', description: "Runs the update in a View Transition (only scope cross-fades) when supported and motion is allowed." },
    ] },
    { name: "SkeletonSwap", props: [
      { name: "loading", type: "boolean", description: "Skeleton while true; content cross-fades in when it turns false. aria-busy while loading." },
      { name: "skeleton", type: "ReactNode", description: "The placeholder — give it the content's size." },
    ] },
    { name: "MotionScope · motionLevel · useReveal · useScrollShrink", props: [
      { name: "MotionScope level", type: '"full" | "subtle" | "off"', description: "Sets data-motion for a subtree (SiteShell does it for a site)." },
      { name: "motionLevel(el)", type: '=> "full" | "subtle" | "off"', description: "The level that applies to an element, reduced motion included." },
      { name: "useReveal(ref, options)", type: "=> initial props", description: "The reveal state machine for your own element (data-reveal + the returned props)." },
      { name: "useScrollShrink(ref, { threshold })", type: "=> boolean", description: "Sets data-scrolled on a sticky header; pair with the vm-shrink class." },
    ] },
    { name: "CSS (styles/motion.css)", props: [
      { name: "--motion-fast · base · slow · reveal", type: "time", default: "140 · 240 · 420 · 680 ms", description: "Duration scale; full stretches reveals to 960 ms. Multiplied by --motion-k (compact 0.8, spacious 1.12)." },
      { name: "--ease-out-quint · --ease-out-expo · --ease-in-out · --ease-spring", type: "easing", description: "The kit's curves; --ease-spring is a damped linear() spring (~4% overshoot)." },
      { name: "vm-press · vm-lift · vm-underline · vm-nudge", type: "class", description: "Press scale, hover lift, drawn underline, nudging trailing icon." },
      { name: "vm-enter (+ --vm-i)", type: "class", description: "CSS-only entrance from the first paint — for above-the-fold copy (the Hero uses it)." },
      { name: "vm-expand · details.vm-details", type: "class", description: "Animated height: grid-rows for data-state panels, ::details-content for native details." },
      { name: "vm-shrink", type: "class", description: "Sticky header that tightens on scroll with transforms only." },
    ] },
  ],
  notes: [
    "Motion explains, it doesn't decorate. Use it where something changes or arrives — a page, a list, a number — and leave settled UI still. One expressive moment per screen is plenty.",
    "Admin panels: fade or a 6–8 px rise at most, no parallax, no tilt. Sites: subtle by default; full for portfolio-style pages where the motion is part of the brand.",
    "Never hide what is already on screen. Server-rendered content in view at load stays visible; reveals only start hidden for content below the fold or mounted later, so there is no flash and CLS stays 0.",
    "Respect the visitor: prefers-reduced-motion turns every primitive into its final state, data-motion=\"off\" on <html> stops all motion in the kit, and moving content (the Ticker) always has a pause control.",
    "Durations follow density (compact is 20% quicker). Keep entrances under a second and exits shorter than entrances.",
  ],
  covers: [],
};

export default entry;

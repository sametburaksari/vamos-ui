import { ex, type DocEntry } from "../types";
import CarouselDemo from "../examples/carousel/demo";
import CarouselHero from "../examples/carousel/hero";
import CarouselGalleryThumbs from "../examples/carousel/gallery-thumbs";
import CarouselResponsive from "../examples/carousel/responsive";
import CarouselVertical from "../examples/carousel/vertical";
import CarouselMarquee from "../examples/carousel/marquee";
import CarouselControlled from "../examples/carousel/controlled";
import CarouselApi from "../examples/carousel/api";

const entry: DocEntry = {
  slug: "carousel",
  title: "Carousel",
  group: "Media",
  description:
    "One scrolling core for panels and websites: card sliders, a fade + autoplay hero, a gallery with thumbnails, a KPI strip. Presets set the control layout; the WAI-ARIA carousel pattern, keyboard support, inert off-screen slides, a mandatory pause button and reduced motion come built in. Marquee is a pure-CSS logo band.",
  source: ["components/carousel.tsx", "styles/media.css"],
  basedOn: "Embla Carousel (+ fade, + autoplay)",
  usage: `import { Carousel, CarouselViewport, CarouselSlide, CarouselDots } from "@vamos-cms/ui";

<Carousel label="Featured stays" slidesPerView={{ base: 1, md: 2, lg: 3 }}>
  <CarouselViewport>
    {stays.map((s) => <CarouselSlide key={s.id}>…</CarouselSlide>)}
  </CarouselViewport>
  <CarouselDots />
</Carousel>`,
  demo: ex("demo", "Demo", "carousel/demo.tsx", CarouselDemo),
  examples: [
    ex("hero", "Hero (fade + autoplay)", "carousel/hero.tsx", CarouselHero, "preset=\"hero\": glass arrows inside, dots over the image, a pause button first in the tab order. Autoplay pauses on hover and focus and is off under reduced motion."),
    ex("gallery-thumbs", "Gallery with thumbnails", "carousel/gallery-thumbs.tsx", CarouselGalleryThumbs, "CarouselThumbs and CarouselCounter follow the selected slide."),
    ex("responsive", "Slides per breakpoint (KPI strip)", "carousel/responsive.tsx", CarouselResponsive, "slidesPerView takes a breakpoint map; widths are pure CSS, so the layout is right before hydration. preset=\"strip\" fades the edges."),
    ex("vertical", "Vertical", "carousel/vertical.tsx", CarouselVertical, "orientation=\"vertical\" with ↑/↓ keys. Set the height with --carousel-height."),
    ex("marquee", "Marquee (pure CSS)", "carousel/marquee.tsx", CarouselMarquee, "No JS, renders with SSR, pauses on hover. Listed once for screen readers; static under reduced motion."),
    ex("controlled", "Controlled, two in sync", "carousel/controlled.tsx", CarouselControlled, "index + onIndexChange keep two carousels on the same slide."),
    ex("use-carousel", "Custom controls (useCarousel)", "carousel/api.tsx", CarouselApi, "useCarousel() exposes index, count, canPrev/canNext and the commands for your own controls."),
  ],
  api: [
    { name: "Carousel", props: [
      { name: "label", type: "string", description: "Required accessible name (aria-label on the region)." },
      { name: "preset", type: '"default" | "gallery" | "hero" | "strip"', default: '"default"', description: "Control layout: hero = full-bleed with glass arrows inside and dots on the image; gallery = thumbnails below; strip = arrows outside, faded edges." },
      { name: "controls", type: '"inside" | "outside" | "hidden"', default: "inside for hero/gallery, else outside", description: "Arrow placement. Outside arrows hide below 640 px (swipe instead). Keyboard works in every mode." },
      { name: "slidesPerView", type: 'number | "auto" | { base?, sm?, md?, lg?, xl? }', default: "1", description: "Slides visible at once (CSS flex-basis). auto lets each slide size itself." },
      { name: "gap", type: '"none" | "sm" | "md" | "lg"', default: '"md"', description: "Space between slides, from --gap." },
      { name: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical uses ↑/↓ and --carousel-height." },
      { name: "loop", type: "boolean", default: "false", description: "Wrap around at the ends." },
      { name: "align", type: '"start" | "center"', default: '"start"', description: "Snap alignment." },
      { name: "transition", type: '"slide" | "fade"', default: '"slide"', description: "fade cross-fades one slide per view. Reduced motion: instant." },
      { name: "autoplay", type: "boolean | { delay?: number; stopOnInteraction?: boolean }", default: "false", description: "Advance on a timer (default 6 s). Adds a Play/Pause button; pauses on hover/focus; aria-live off while playing." },
      { name: "index / defaultIndex / onIndexChange", type: "number / number / (i) => void", default: "— / 0", description: "Controlled or uncontrolled selected slide." },
      { name: "loading", type: "boolean", default: "false", description: "A skeleton first slide while there are no slides yet." },
      { name: "options / plugins", type: "EmblaOptions / EmblaPlugin[]", description: "Escape hatch to the engine." },
      { name: "setApi", type: "(api) => void", description: "Receives the engine API once ready." },
      { name: "labels", type: "Partial<CarouselLabels>", description: "previous, next, goTo, pause, play, slideOf, counter… (dictionary namespace carousel)." },
    ] },
    { name: "CarouselViewport", props: [
      { name: "arrows", type: "boolean", default: "true", description: "Built-in prev/next on the stage (hidden with one slide or controls=\"hidden\")." },
      { name: "playPause", type: "boolean", default: "true", description: "Built-in pause button with autoplay. Turn off only when you render CarouselPlayPause yourself." },
      { name: "empty", type: "ReactNode", default: '"Nothing to show yet"', description: "Shown when there are no slides." },
      { name: "containerClassName", type: "string", description: "Class for the flex track." },
    ] },
    { name: "CarouselSlide", props: [
      { name: "…div props", type: "HTMLAttributes", description: "role=\"group\", aria-roledescription=\"slide\", labelled \"3 of 7\"; inert while off-screen." },
    ] },
    { name: "Controls", props: [
      { name: "CarouselPrev / CarouselNext", type: "IconButton props + label?", description: "Disabled at the edges unless loop. Glass buttons over images." },
      { name: "CarouselDots", type: "HTMLAttributes", description: "One button per snap; aria-current on the active one." },
      { name: "CarouselThumbs", type: "{ items: (string | { src; alt? })[]; aspect?: number }", description: "Thumbnail buttons; the selected one gets a --ring border." },
      { name: "CarouselPlayPause", type: "IconButton props", description: "Renders only while autoplay is configured." },
      { name: "CarouselCounter", type: "HTMLAttributes", description: "\"3 / 7\" in the locale's digits (with a full sentence for screen readers)." },
      { name: "useCarousel()", type: "→ { api, index, count, canPrev, canNext, playing, scrollTo, scrollPrev, scrollNext, play, pause, toggle }", description: "State and commands inside a Carousel." },
    ] },
    { name: "Marquee", props: [
      { name: "label", type: "string", description: "Accessible name of the list." },
      { name: "duration", type: "number", default: "40", description: "Seconds per loop." },
      { name: "reverse", type: "boolean", default: "false", description: "Scroll the other way." },
      { name: "pauseOnHover", type: "boolean", default: "true", description: "Pause while hovered or focused." },
      { name: "fade", type: "boolean", default: "true", description: "Fade the edges." },
      { name: "gap", type: '"sm" | "md" | "lg"', default: '"lg"', description: "Space between items." },
    ] },
  ],
  notes: [
    "Keys when focus is inside: ←/→ (↑/↓ vertical), Home, End. RTL flips the arrows and the direction.",
    "No backdrop-filter on slides: only the overlay controls blur (glass budget).",
  ],
  covers: ["Carousel"],
};

export default entry;

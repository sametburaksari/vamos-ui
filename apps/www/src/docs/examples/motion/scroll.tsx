import { Parallax, ScrollProgress } from "@vamos-ui/react/motion";

const photo = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=70&auto=format&fit=crop";

// Scroll-linked, no JavaScript on scroll where the browser has animation-timeline (view() for
// the parallax, scroll() for the bar); a passive rAF listener elsewhere. The frame keeps its
// size and clips an over-sized layer, so no edge ever shows. ScrollProgress is fixed to the
// top of the viewport by default; here it sits in the flow and follows this page's scroll.
export default function MotionScroll() {
  return (
    <div className="flex w-full flex-col gap-4">
      <ScrollProgress fixed={false} className="rounded-full bg-line" />
      <figure className="m-0 flex flex-col gap-3">
        <Parallax shift={56} className="aspect-[16/9] rounded-ui-lg">
          <img src={photo} alt="A long table set for dinner under warm pendant lights" width={1600} height={1067} loading="lazy" />
        </Parallax>
        <figcaption className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg-muted">The long table · Atlas Dining Room</figcaption>
      </figure>
    </div>
  );
}

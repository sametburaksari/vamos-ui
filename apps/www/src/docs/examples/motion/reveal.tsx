import { Reveal, type RevealEffect } from "@vamos-ui/react/motion";
import { Replay } from "./_replay";

const effects: { effect: RevealEffect; note: string }[] = [
  { effect: "fade", note: "Opacity only. The quietest choice — tables, settings, dense panels." },
  { effect: "rise", note: "Fade plus a short rise. The default for site sections." },
  { effect: "blur", note: "Comes into focus. Use once per page, for an image or a quote." },
  { effect: "scale", note: "Grows from 94%. Cards and tiles that sit on their own." },
  { effect: "clip", note: "Wipes down from the top edge. Photography and big type." },
];

// Five effects, opacity / transform / filter / clip-path only — the box never moves, so the
// page has no layout shift. `delay` staggers them by hand here; <Stagger> does it for you.
export default function MotionReveal() {
  return (
    <Replay>
      <div className="grid w-full gap-3 pt-10 sm:grid-cols-2 lg:grid-cols-5">
        {effects.map((e, i) => (
          <Reveal key={e.effect} effect={e.effect} delay={i * 90} className="flex min-h-40 flex-col justify-between gap-6 rounded-ui border border-line bg-surface p-5">
            <span className="font-mono text-eyebrow uppercase tracking-[0.08em] text-fg">{e.effect}</span>
            <p className="text-small text-fg-muted text-pretty">{e.note}</p>
          </Reveal>
        ))}
      </div>
    </Replay>
  );
}

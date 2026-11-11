import { ArrowRight } from "lucide-react";
import { Button } from "@vamos-ui/react";
import { Magnetic, MotionScope, Tilt } from "@vamos-ui/react/motion";

// Mouse and trackpad only (pointer: fine) — touch screens get the flat card. Magnetic is a
// "full"-level flourish, so this example opts in with MotionScope. The utility classes below
// work anywhere: vm-press, vm-lift, vm-underline, vm-nudge.
export default function MotionPointer() {
  return (
    <MotionScope level="full" className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,22rem)_1fr]">
      <Tilt max={6} glare className="rounded-ui-lg">
        <article className="flex aspect-[1.586] flex-col justify-between rounded-ui-lg border border-line bg-surface p-6 shadow-(--surface-shadow)">
          <div className="flex items-start justify-between">
            <span className="font-display text-h3 text-fg">Northwind Studio</span>
            <span className="rounded-full bg-accent px-2.5 py-0.5 font-mono text-eyebrow text-accent-fg">Member</span>
          </div>
          <div className="flex items-end justify-between font-mono text-small tabular text-fg-muted">
            <span>Ines Okafor</span>
            <span>Since 2019 · #0412</span>
          </div>
        </article>
      </Tilt>
      <div className="flex flex-col items-start gap-6">
        <Magnetic>
          <Button variant="primary" size="lg" className="vm-nudge">
            Book a studio tour <ArrowRight />
          </Button>
        </Magnetic>
        <div className="flex flex-wrap gap-3">
          <Button className="vm-press">Press me</Button>
          <a href="#motion-pointer" className="vm-lift rounded-ui border border-line bg-surface px-4 py-2.5 text-small text-fg">
            Lifts on hover
          </a>
        </div>
        <p className="text-small text-fg-muted">
          Read the <a href="#motion-pointer" className="vm-underline text-fg">membership terms</a> or <a href="#motion-pointer" className="vm-underline text-fg">house rules</a>.
        </p>
      </div>
    </MotionScope>
  );
}

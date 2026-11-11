import { TextReveal } from "@vamos-ui/react/motion";
import { Replay } from "./_replay";

// Word mode for headings, line mode (split on \n) for short statements. Screen readers and
// search engines get the sentence once, as plain text; the split copy is aria-hidden.
export default function MotionTextReveal() {
  return (
    <Replay>
      <div className="flex w-full flex-col gap-10 pt-10">
        <TextReveal as="h2" className="max-w-[22ch] font-display text-display-m text-fg text-balance">
          Small rooms, slow mornings, and nothing on the walls to scroll.
        </TextReveal>
        <TextReveal as="p" by="line" effect="blur" delay={300} className="font-mono text-small uppercase tracking-[0.08em] text-fg-muted">
          {"Open Tuesday to Sunday, 08:00–16:00\nKitchen closes at 15:30\nNo bookings for under six"}
        </TextReveal>
      </div>
    </Replay>
  );
}

import { CalendarDays } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@vamos-ui/react";

export default function HoverCardDemo() {
  return (
    <p className="max-w-sm text-sm text-fg-muted">
      Written by{" "}
      <HoverCard>
        <HoverCardTrigger href="/authors/leyla-aksoy" className="font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-fg focus-ring">
          Leyla Aksoy
        </HoverCardTrigger>
        <HoverCardContent align="start">
          <div className="flex gap-3">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent-ink">
              LA
            </span>
            <div className="grid min-w-0 gap-1">
              <p className="text-sm font-semibold text-fg">Leyla Aksoy</p>
              <p className="text-[13px] leading-snug text-fg-muted">Food editor. Writes the weekly market report and most of our recipe features.</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-fg-subtle">
                <CalendarDays className="size-3.5" /> 48 articles · joined March 2023
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{" "}
      · 6 min read
    </p>
  );
}

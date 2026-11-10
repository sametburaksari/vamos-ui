import { HoverCard, HoverCardContent, HoverCardTrigger } from "@vamos-ui/react";

const people = {
  daniel: { name: "Daniel Okafor", role: "Operations lead · Lagos office", status: "On leave until Nov 14" },
  mira: { name: "Mira Castell", role: "People partner · HR", status: "Available" },
};

function Mention({ id }: { id: keyof typeof people }) {
  const p = people[id];
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger href={`/people/${id}`} className="rounded-ui-sm bg-accent-soft px-1 font-medium text-accent-ink focus-ring">
        @{p.name.split(" ")[0]}
      </HoverCardTrigger>
      <HoverCardContent size="sm" side="top" arrow>
        <p className="text-sm font-semibold text-fg">{p.name}</p>
        <p className="text-[13px] text-fg-muted">{p.role}</p>
        <p className="mt-2 text-xs text-fg-subtle">{p.status}</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HoverCardMention() {
  return (
    <figure className="w-full max-w-md rounded-ui-lg surface p-4">
      <figcaption className="mb-1.5 flex items-baseline justify-between text-xs text-fg-subtle">
        <span className="font-medium text-fg">Selin Demir</span>
        <time dateTime="2026-11-10T09:12">09:12</time>
      </figcaption>
      <p className="text-sm leading-relaxed text-fg-muted">
        <Mention id="daniel" /> can you approve the overtime for the warehouse team? If you're still out, <Mention id="mira" /> said she can cover it.
      </p>
    </figure>
  );
}

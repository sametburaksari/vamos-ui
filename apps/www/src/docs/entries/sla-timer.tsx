import { ex, type DocEntry } from "../types";
import SlaTimerDemo from "../examples/sla-timer/demo";
import SlaTimerStates from "../examples/sla-timer/states";
import SlaTimerBar from "../examples/sla-timer/bar";
import SlaTimerInbox from "../examples/sla-timer/inbox";

const entry: DocEntry = {
  slug: "sla-timer",
  title: "SLA timer",
  group: "Data display",
  description:
    "A live countdown to a service-level deadline — first response, resolution, delivery window, approval. It turns at-risk and breached on its own, freezes as met or missed once the target is reached, pauses while you wait on the customer, and reads as a full sentence to screen readers.",
  source: ["components/sla-timer.tsx"],
  basedOn: "WAI-ARIA timer role",
  usage: `import { SlaTimer } from "@vamos-ui/react";

<SlaTimer label="First response" start={ticket.createdAt} due={ticket.firstResponseDue} />
<SlaTimer variant="bar" label="Resolution" start={ticket.createdAt} due={ticket.resolveDue} completedAt={ticket.solvedAt} />`,
  demo: ex("demo", "Demo", "sla-timer/demo.tsx", SlaTimerDemo),
  examples: [
    ex("states", "States", "sla-timer/states.tsx", SlaTimerStates, "On track → at risk (under warnAt of the window, default 25%) → breached; met / missed / paused are frozen."),
    ex("bar", "Bar (ticket side panel)", "sla-timer/bar.tsx", SlaTimerBar, "variant=\"bar\" shows how much of the window is used."),
    ex("inbox", "Support inbox", "sla-timer/inbox.tsx", SlaTimerInbox, "Badges in a queue list; a fixed now keeps rows stable while the list renders."),
  ],
  api: [
    { name: "SlaTimer", props: [
      { name: "due", type: "string | number | Date", description: "Deadline." },
      { name: "start", type: "string | number | Date", description: "When the clock started — enables the proportional warning and the bar fill." },
      { name: "completedAt", type: "string | number | Date | null", description: "Target reached → met / missed, frozen." },
      { name: "pausedAt", type: "string | number | Date | null", description: "Clock stopped → paused, frozen." },
      { name: "now", type: "number", description: "Fixed epoch ms for static screens and tests. Omit to tick (every second in the last hour, every 15 s before)." },
      { name: "warnAt", type: "number", default: "0.25", description: "At risk below this share of the window (needs start). Without start: 30 minutes." },
      { name: "warnMinutes", type: "number", description: "At risk below this many minutes (overrides warnAt)." },
      { name: "variant", type: '"badge" | "inline" | "bar"', default: '"badge"', description: "Pill, icon + text, or label row with a progress line." },
      { name: "label", type: "string", description: "What is measured; prefixes the accessible sentence (\"First response: Due in 12m\")." },
      { name: "seconds", type: "boolean", default: "true", description: "Seconds under an hour left." },
      { name: "hideIcon", type: "boolean", description: "Badge / inline without the icon." },
      { name: "labels", type: "Partial<SlaTimerLabels>", description: 'Dictionary namespace "slaTimer": dueIn, overdue, met, missed, paused, pausedOverdue and the state names.' },
    ] },
    { name: "slaState(input)", props: [
      { name: "input", type: "{ due, start?, completedAt?, pausedAt?, now, warnAt?, warnMinutes? }", description: "Pure model for sorting or filtering queues." },
      { name: "returns", type: "{ state, remaining (ms), used (0…1 | null) }", description: "state: on-track | at-risk | breached | met | missed | paused." },
    ] },
  ],
  notes: ["Durations come from the locale formatter: \"1h 35m\" in English, \"1 sa. 35 dk.\" in Turkish.", "role=\"timer\" is not a live region, so the ticking never floods a screen reader."],
  covers: [],
};

export default entry;

import { ex, type DocEntry } from "../types";
import SetupChecklistDemo from "../examples/setup-checklist/demo";
import SetupChecklistSidebar from "../examples/setup-checklist/sidebar";
import SetupChecklistLocked from "../examples/setup-checklist/locked";
import SetupChecklistDismiss from "../examples/setup-checklist/dismiss";
import SetupChecklistLoading from "../examples/setup-checklist/loading";

const entry: DocEntry = {
  slug: "setup-checklist",
  title: "Setup checklist",
  group: "Flows & wizards",
  description:
    "A \"Get started\" panel for onboarding: ordered setup steps with a progress ring, deep-link actions, estimates, optional and locked steps, skip with undo, a completion state and dismissal with a launcher pill to reopen it. Completion comes from the app.",
  source: ["business/setup-checklist.tsx"],
  basedOn: "Progress circle · disclosure pattern",
  usage: `import { SetupChecklist, SetupChecklistLauncher } from "@vamos-cms/ui/business";

<SetupChecklist items={steps} onSkip={skip} dismissed={hidden} onDismissedChange={setHidden} onAllDone={celebrate} />
{hidden ? <SetupChecklistLauncher items={steps} onOpen={() => setHidden(false)} floating /> : null}`,
  demo: ex("demo", "Demo", "setup-checklist/demo.tsx", SetupChecklistDemo),
  examples: [
    ex("sidebar", "In the sidebar", "setup-checklist/sidebar.tsx", SetupChecklistSidebar, "variant=\"sidebar\": a small ring and tight rows for the app shell."),
    ex("locked", "Dependent steps", "setup-checklist/locked.tsx", SetupChecklistLocked, "locked: { reason } shows a lock, disables the action and explains what unlocks it."),
    ex("dismiss", "Dismiss and reopen", "setup-checklist/dismiss.tsx", SetupChecklistDismiss, "Dismissal is controlled so you can persist it; the launcher pill shows progress and reopens the guide."),
    ex("states", "Loading and complete", "setup-checklist/loading.tsx", SetupChecklistLoading, "Skeleton rows while loading; when every required step is done or skipped the panel switches to its completion state."),
  ],
  api: [
    { name: "SetupChecklist", props: [
      { name: "items", type: "SetupItem[]", description: "{ id, title, description?, status: \"todo\" | \"in_progress\" | \"done\" | \"skipped\", action?: { label, href?, onSelect? }, optional?, locked?: { reason }, estimate? }." },
      { name: "title / description", type: "string", default: '"Get started" / "{done} of {total} complete"', description: "Header text." },
      { name: "variant", type: '"card" | "sidebar" | "popover"', default: '"card"', description: "Surface and density." },
      { name: "onSkip / onUndoSkip", type: "(id: string) => void", description: "Show Skip for now / Undo skip." },
      { name: "dismissed / onDismissedChange", type: "boolean / (d: boolean) => void", description: "Controlled dismissal; renders nothing while dismissed." },
      { name: "expandFirstIncomplete", type: "boolean", default: "true", description: "Open the first unfinished step; moves along as steps complete (focus never jumps)." },
      { name: "onAllDone", type: "() => void", description: "Called once when every required step is done or skipped." },
      { name: "loading", type: "boolean", default: "false", description: "Skeleton rows." },
      { name: "labels", type: "Partial<SetupChecklistLabels>", description: "Built-in strings (setupChecklist namespace)." },
    ] },
    { name: "SetupChecklistLauncher", props: [
      { name: "items", type: "SetupItem[]", description: "For the progress text." },
      { name: "onOpen", type: "() => void", description: "Reopen the checklist." },
      { name: "floating", type: "boolean", default: "false", description: "Fixed at the bottom end of the viewport." },
    ] },
  ],
  notes: ["Items are an <ol>; each title is a disclosure button whose name includes the status (\"Connect payments, in progress\"). Progress changes are announced politely."],
  covers: ["Setup checklist"],
};

export default entry;

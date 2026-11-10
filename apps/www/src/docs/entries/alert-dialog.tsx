import { ex, type DocEntry } from "../types";
import AlertDialogDemo from "../examples/alert-dialog/demo";
import AlertDialogDanger from "../examples/alert-dialog/danger";
import AlertDialogUseConfirm from "../examples/alert-dialog/use-confirm";
import AlertDialogRequireText from "../examples/alert-dialog/require-text";
import AlertDialogAsync from "../examples/alert-dialog/async";

const entry: DocEntry = {
  slug: "alert-dialog",
  title: "Alert Dialog",
  group: "Overlays & feedback",
  description:
    "Confirms an irreversible or high-stakes action. role=\"alertdialog\", the overlay never closes it, and a danger tone puts focus on Cancel so a stray Enter can't destroy anything. Comes with an imperative useConfirm() for one-line confirmations.",
  source: ["components/alert-dialog.tsx", "components/dialog.tsx"],
  basedOn: "Radix Alert Dialog",
  usage: `import { useConfirm } from "@vamos-ui/react";

const confirm = useConfirm();
if (await confirm({ title: "Delete 3 posts?", tone: "danger", confirmLabel: "Delete" })) {
  await deletePosts(ids);
}`,
  demo: ex("demo", "Demo", "alert-dialog/demo.tsx", AlertDialogDemo),
  examples: [
    ex("danger", "Danger", "alert-dialog/danger.tsx", AlertDialogDanger, 'tone="danger": warning icon well, danger action, initial focus on Cancel.'),
    ex("use-confirm", "useConfirm (HR)", "alert-dialog/use-confirm.tsx", AlertDialogUseConfirm, "await confirm({...}) resolves true or false. Needs a ConfirmProvider (App shell includes one)."),
    ex("require-text", "Type to confirm", "alert-dialog/require-text.tsx", AlertDialogRequireText, "requireText keeps the action disabled until the name is typed. Compared case-insensitively with the current locale's rules (Turkish İ/ı)."),
    ex("async", "Async with error (PRM)", "alert-dialog/async.tsx", AlertDialogAsync, "onConfirm can be async: the action shows loading, Cancel and Esc lock, and a thrown error stays inline instead of closing."),
  ],
  api: [
    { name: "AlertDialog", props: [
      { name: "open / defaultOpen / onOpenChange", type: "Radix root props", description: "Controlled or uncontrolled open state." },
    ] },
    { name: "AlertDialogContent", props: [
      { name: "tone", type: '"default" | "danger"', default: '"default"', description: "danger → icon well, danger action, focus on Cancel. default → focus on the action." },
      { name: "dismissible", type: "boolean", default: "true", description: "false locks Esc (e.g. while the action runs)." },
      { name: "container", type: "HTMLElement | null", description: "Portal target; defaults to the nearest ThemeScope." },
    ] },
    { name: "AlertDialogHeader", props: [
      { name: "title", type: "ReactNode", description: "Required accessible name." },
      { name: "description", type: "ReactNode", description: "What happens and whether it can be undone." },
      { name: "icon", type: "ReactNode | null", description: "Defaults to the warning well for tone=\"danger\"; null removes it." },
    ] },
    { name: "AlertDialogAction", props: [
      { name: "variant", type: "Button variant", description: "Defaults to danger or primary from the tone." },
      { name: "loading", type: "boolean", description: "Button loading state." },
      { name: "keepOpen", type: "boolean", default: "false", description: "Don't close on click — close yourself when async work ends." },
      { name: "children", type: "ReactNode", default: '"Confirm"', description: "Name the action with a verb (\"Delete post\")." },
    ] },
    { name: "AlertDialogCancel", props: [
      { name: "children", type: "ReactNode", default: '"Cancel"', description: "Dictionary confirm.cancel." },
    ] },
    { name: "useConfirm() options", props: [
      { name: "title", type: "ReactNode", description: "Required." },
      { name: "description", type: "ReactNode", description: "Consequences." },
      { name: "tone", type: '"default" | "danger"', default: '"default"', description: "As AlertDialogContent." },
      { name: "confirmLabel / cancelLabel", type: "string", description: "Button labels." },
      { name: "requireText", type: "string", description: "Text the user must type (locale-aware, case-insensitive)." },
      { name: "onConfirm", type: "() => Promise<void> | void", description: "Async work; throwing keeps the dialog open and shows the message." },
      { name: "→ returns", type: "Promise<boolean>", description: "true on confirm, false on cancel or Esc." },
    ] },
    { name: "Other exports", props: [
      { name: "ConfirmProvider", type: "{ labels? }", description: "Renders the shared confirmation dialog for useConfirm()." },
      { name: "ConfirmDialog", type: "ConfirmOptions & { open, onResult }", description: "The same dialog, controlled, without the hook." },
      { name: "AlertDialogBody / AlertDialogFooter / AlertDialogIcon", type: "layout parts", description: "Body for extra content, footer for buttons, icon well." },
    ] },
  ],
  notes: ["Name the action with what it does (\"Delete post\", \"End agreement\"), never \"Yes\" / \"OK\".", "On mobile the buttons stack with the action on top."],
  covers: ["Alert Dialog"],
};

export default entry;

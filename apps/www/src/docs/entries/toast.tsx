import { ex, type DocEntry } from "../types";
import ToastDemo from "../examples/toast/demo";
import ToastActionUndo from "../examples/toast/action-undo";
import ToastPromise from "../examples/toast/promise";
import ToastUpdateById from "../examples/toast/update-by-id";

const entry: DocEntry = {
  slug: "toast",
  title: "Toast",
  group: "Overlays & feedback",
  description:
    "Reports the result of an action without interrupting: \"Post published · View\", \"Moved to trash · Undo\". Six tones with a thin status edge, actions, in-place updates by id, promise tracking, and a stack where only the front toast blurs.",
  source: ["components/toast.tsx", "styles/overlays.css"],
  basedOn: "sonner (wrapped — import only from the kit)",
  usage: `import { toast, Toaster } from "@vamos-cms/ui";

// once, near the app root (App shell already includes it)
<Toaster />

toast.success("Post published", { action: { label: "View", onClick: openPost } });`,
  demo: ex("demo", "Tones", "toast/demo.tsx", ToastDemo),
  examples: [
    ex("action-undo", "Undo (CRM)", "toast/action-undo.tsx", ToastActionUndo, "A toast with an action stays at least 6 seconds. Undo should fully reverse the change."),
    ex("promise", "Promise", "toast/promise.tsx", ToastPromise, "toast.promise shows loading, then success or danger in the same toast, and returns the original promise."),
    ex("update-by-id", "Progress by id", "toast/update-by-id.tsx", ToastUpdateById, "Reuse the id to update one toast in place — a long export ends in a Download action."),
  ],
  api: [
    { name: "toast(title, options) · toast.success · .info · .warning · .danger · .loading", props: [
      { name: "title", type: "ReactNode", description: "Short past-tense result (\"Leave approved\")." },
      { name: "description", type: "ReactNode", description: "One line of detail." },
      { name: "action", type: "{ label: ReactNode; onClick: () => void }", description: "One follow-up (\"Undo\", \"View\")." },
      { name: "cancel", type: "{ label: ReactNode; onClick?: () => void }", description: "A secondary, dismissing button." },
      { name: "duration", type: "number", default: "4000 / 6000 / 8000 / ∞", description: "neutral, success, info 4 s · warning 6 s · danger 8 s · loading until updated. Infinity keeps it." },
      { name: "id", type: "string", description: "Same id updates the toast in place." },
      { name: "important", type: "boolean", default: "false", description: "Announce assertively (role=\"alert\"). Danger toasts always are." },
      { name: "closeButton", type: "boolean", default: "false", description: "× on this toast." },
      { name: "onDismiss / onAutoClose", type: "() => void", description: "Lifecycle callbacks." },
      { name: "→ returns", type: "string", description: "The toast id." },
    ] },
    { name: "toast.promise(promise, messages)", props: [
      { name: "loading", type: "ReactNode", description: "Shown while pending." },
      { name: "success", type: "ReactNode | (data) => ReactNode", description: "Shown on resolve." },
      { name: "error", type: "ReactNode | (error) => ReactNode", description: "Shown on reject." },
      { name: "→ returns", type: "Promise<T>", description: "The original promise (handle its rejection)." },
    ] },
    { name: "toast.dismiss(id?)", props: [{ name: "id", type: "string", description: "Dismiss one toast, or all without an id." }] },
    { name: "Toaster", props: [
      { name: "position", type: '"bottom-end" | "bottom-start" | "bottom-center" | "top-end" | "top-start" | "top-center"', default: '"bottom-end"', description: "Logical — end is the left edge in RTL." },
      { name: "mobilePosition", type: "same", default: '"top-center"', description: "Below 640px, away from the keyboard and bottom bars." },
      { name: "max", type: "number", default: "3", description: "Visible toasts before they stack." },
      { name: "expand", type: "boolean", default: "false", description: "Always show the stack expanded." },
      { name: "closeButton", type: "boolean", default: "false", description: "× on every toast." },
      { name: "hotkey", type: "string[]", default: '["altKey", "KeyT"]', description: "Focuses the toast region." },
      { name: "offset", type: "number | string", default: "24px", description: "Distance from the viewport edge." },
      { name: "labels", type: "{ region?: string; close?: string }", description: 'Dictionary namespace "toast".' },
    ] },
  ],
  notes: [
    "Critical information (\"Couldn't save\") must not live only in a toast — show an inline Alert too.",
    "Only the first mounted Toaster renders, so a page-level one next to the App shell's never doubles toasts.",
    "Import toast from @vamos-cms/ui, never from the engine package, so it can be swapped later.",
  ],
  covers: ["Toast"],
};

export default entry;

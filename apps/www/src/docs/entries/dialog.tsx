import { ex, type DocEntry } from "../types";
import DialogDemo from "../examples/dialog/demo";
import DialogSizes from "../examples/dialog/sizes";
import DialogScrollBody from "../examples/dialog/scroll-body";
import DialogFormDirty from "../examples/dialog/form-dirty";
import DialogSubmitting from "../examples/dialog/submitting";
import DialogMobile from "../examples/dialog/mobile";
import DialogNested from "../examples/dialog/nested";

const entry: DocEntry = {
  slug: "dialog",
  title: "Dialog",
  group: "Overlays & feedback",
  description:
    "A focused task that keeps the user in context — new contact, insert link, leave request. Fixed header and footer with a scrolling body, five sizes, a close guard for unsaved work, and a CSS-only bottom sheet below 640px.",
  source: ["components/dialog.tsx", "styles/overlays.css"],
  basedOn: "Radix Dialog",
  usage: `import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogClose, Button } from "@vamos-ui/react";

<Dialog>
  <DialogTrigger asChild><Button>New contact</Button></DialogTrigger>
  <DialogContent size="md">
    <DialogHeader title="New contact" description="Add a contact manually." />
    <DialogBody>…</DialogBody>
    <DialogFooter>
      <DialogClose asChild><Button>Cancel</Button></DialogClose>
      <Button variant="primary">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`,
  demo: ex("demo", "Demo", "dialog/demo.tsx", DialogDemo),
  examples: [
    ex("sizes", "Sizes", "dialog/sizes.tsx", DialogSizes, "sm 400 · md 520 · lg 680 · xl 880 px · full (viewport minus a 12px gutter on each side)."),
    ex("scroll-body", "Long content", "dialog/scroll-body.tsx", DialogScrollBody, "Only DialogBody scrolls; the header and footer stay put, and a hairline appears under the header once you scroll."),
    ex("form-dirty", "Unsaved changes (HR)", "dialog/form-dirty.tsx", DialogFormDirty, "onBeforeClose runs on every close attempt — Esc, overlay, × and DialogClose. Return a confirm() promise to ask first."),
    ex("submitting", "Submitting and error", "dialog/submitting.tsx", DialogSubmitting, "While saving: dismissible={false}, buttons locked, the primary shows loading. Errors go in an inline Alert at the top of the body."),
    ex("mobile", "Mobile behaviour", "dialog/mobile.tsx", DialogMobile, 'Below 640px: mobile="sheet" (default) anchors to the bottom, "center" stays a card, "fullscreen" is for long forms. CSS only — no component swap.'),
    ex("nested", "Menus inside a dialog", "dialog/nested.tsx", DialogNested, "Nested layers get data-layer-depth 2 and never blur; in glass mode only the overlay does."),
  ],
  api: [
    { name: "Dialog", props: [
      { name: "open", type: "boolean", description: "Controlled open state." },
      { name: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
      { name: "onOpenChange", type: "(open: boolean) => void", description: "Called after a change is allowed (close guards run first)." },
      { name: "modal", type: "boolean", default: "true", description: "false keeps the page interactive: no overlay, no focus trap." },
    ] },
    { name: "DialogContent", props: [
      { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"', description: "Maximum width: 400 / 520 / 680 / 880 px or the viewport minus 24px. Height follows content up to min(85dvh, --dialog-max-h)." },
      { name: "mobile", type: '"sheet" | "center" | "fullscreen"', default: '"sheet"', description: "Layout below 640px." },
      { name: "dismissible", type: "boolean", default: "true", description: "false → Esc and overlay clicks don't close; the × button and DialogClose still work." },
      { name: "onBeforeClose", type: "() => boolean | Promise<boolean>", description: "Runs on every close attempt. Return or resolve false to stay open." },
      { name: "hideClose", type: "boolean", default: "false", description: "Hide the built-in × button." },
      { name: "container", type: "HTMLElement | null", description: "Portal target. Defaults to the nearest ThemeScope / PortalContainer, else body." },
      { name: "labels", type: "{ close?: string }", description: 'Built-in strings (dictionary namespace "dialog").' },
      { name: "overlayClassName", type: "string", description: "Class of the overlay element." },
      { name: "onOpenAutoFocus", type: "(event: Event) => void", description: "Initial focus goes to [data-autofocus], else the first focusable. preventDefault to handle it yourself." },
      { name: "…", type: "Radix Dialog.Content props", description: "onEscapeKeyDown, onPointerDownOutside, onInteractOutside, forceMount…" },
    ] },
    { name: "DialogHeader (LayerHeader)", props: [
      { name: "title", type: "ReactNode", description: "Required. Becomes the accessible name (aria-labelledby)." },
      { name: "description", type: "ReactNode", description: "Linked with aria-describedby; omitted cleanly when absent." },
      { name: "icon", type: "ReactNode", description: "Leading icon or icon well." },
      { name: "action", type: "ReactNode", description: "Trailing element next to the title (badge, menu)." },
      { name: "srOnly", type: "boolean", default: "false", description: "Keep the title for screen readers only." },
    ] },
    { name: "DialogBody (LayerBody)", props: [
      { name: "flush", type: "boolean", default: "false", description: "Remove the padding (full-bleed lists, media)." },
    ] },
    { name: "DialogFooter (LayerFooter)", props: [
      { name: "align", type: '"end" | "between" | "stretch"', default: '"end"', description: "end groups buttons at the end; between pushes the first child to the start." },
    ] },
    { name: "Other exports", props: [
      { name: "DialogTrigger / DialogClose", type: "Radix parts", description: "Use asChild with a Button." },
      { name: "DialogOverlay", type: "component", description: "The backdrop (DialogContent renders its own). blurred prop controls the glass blur." },
      { name: "DialogTitle / DialogDescription", type: "Radix parts", description: "For fully custom headers." },
      { name: "useDialogRoot()", type: "() => { open, requestOpenChange, modal }", description: "Close from custom code; the guard still runs." },
    ] },
  ],
  notes: [
    "Title is required for accessibility. Use srOnly when it shouldn't be visible.",
    "Glass budget: the overlay blurs the page (--overlay-blur), so the panel drops its own blur and turns slightly more opaque. Nested layers never blur.",
    "Close order on mobile sheets: footer buttons stack with the primary on top.",
  ],
  covers: ["Dialog"],
};

export default entry;

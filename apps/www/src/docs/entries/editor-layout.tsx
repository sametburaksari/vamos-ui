import { ex, type DocEntry } from "../types";
import EditorLayoutDemo from "../examples/editor-layout/demo";
import EditorLayoutSaveStatus from "../examples/editor-layout/save-status";
import EditorLayoutPanelTabs from "../examples/editor-layout/panel-tabs";
import EditorLayoutFocusMode from "../examples/editor-layout/focus-mode";
import EditorLayoutMobile from "../examples/editor-layout/mobile";

const entry: DocEntry = {
  slug: "editor-layout",
  title: "Editor layout",
  group: "Page layouts",
  description:
    "The \"edit one thing\" page: a sticky publish bar (back, title, save status, actions), a wide content canvas, and a side panel of folding meta boxes — status, permalink, categories, SEO — that remember whether they're open. Below 44rem (704px) of its own width the panel opens as a non-modal sheet; focus mode hides the panel and fades the bar.",
  source: ["components/editor-layout.tsx", "styles/navigation.css"],
  basedOn: "CSS grid + container queries · Radix Collapsible · Tabs · Sheet",
  usage: `import { EditorLayout, EditorBar, SaveStatus, EditorCanvas, EditorPanel, EditorPanelSection } from "@vamos-cms/ui";

<EditorLayout>
  <EditorBar
    back={{ href: "/posts", label: "Posts" }}
    title={title}
    status={<SaveStatus state="saved" at={savedAt} />}
    actions={<Button size="sm" variant="primary">Publish</Button>}
  />
  <EditorCanvas width="prose">{editor}</EditorCanvas>
  <EditorPanel>
    <EditorPanelSection id="status" title="Status & visibility" summary="Draft · Public" defaultOpen>…</EditorPanelSection>
    <EditorPanelSection id="permalink" title="Permalink" summary="/blog/spring-menu">…</EditorPanelSection>
  </EditorPanel>
</EditorLayout>`,
  demo: ex("demo", "Demo", "editor-layout/demo.tsx", EditorLayoutDemo),
  examples: [
    ex("save-status", "Save status", "editor-layout/save-status.tsx", EditorLayoutSaveStatus, "Every SaveState. A polite status; the error is an alert with Retry. \"Saved 2 min. ago\" uses Intl.RelativeTimeFormat. While dirty or saving it guards beforeunload (guard={false} to opt out)."),
    ex("panel-tabs", "Panel tabs", "editor-layout/panel-tabs.tsx", EditorLayoutPanelTabs, "tabs splits the panel into Document / Block; put each tab's sections in an EditorPanelContent. tone=\"scene\" drops the canvas surface."),
    ex("focus-mode", "Focus mode", "editor-layout/focus-mode.tsx", EditorLayoutFocusMode, "Hides the panel and fades the bar until the pointer moves; ⌘/Ctrl+Shift+F toggles, Esc leaves. Hide the App shell sidebar from onFocusModeChange."),
    ex("mobile", "Narrow and read-only", "editor-layout/mobile.tsx", EditorLayoutMobile, "On narrow layouts the panel toggle opens a non-modal sheet, secondary actions hide (mirror them in menu). readOnly hides actions and disables every panel control."),
  ],
  api: [
    { name: "EditorLayout", props: [
      { name: "panelOpen · defaultPanelOpen · onPanelOpenChange", type: "boolean", default: "true", description: "Panel visibility; drives the sheet on narrow layouts." },
      { name: "panelWidth · defaultPanelWidth · onPanelWidthChange", type: "number", default: "320", description: "Panel width in px." },
      { name: "resizable", type: "boolean", default: "false", description: "Drag or arrow-key the panel edge." },
      { name: "focusMode · defaultFocusMode · onFocusModeChange", type: "boolean", default: "false", description: "Distraction-free mode." },
      { name: "readOnly", type: "boolean", default: "false", description: "Locked version: bar actions hidden, panel disabled." },
      { name: "scroll", type: '"page" | "panes"', default: '"page"', description: "Page scroll with sticky bar/panel, or fill the parent with independently scrolling panes." },
      { name: "stickyTop", type: "number | string", default: '"var(--topbar-h)"', description: "Sticky offset in page mode." },
      { name: "shortcuts", type: "boolean", default: "true", description: "⌘/Ctrl+Shift+, toggles the panel; ⌘/Ctrl+Shift+F focus mode." },
      { name: "labels", type: "EditorLayoutLabels", description: "Overrides for the editor namespace." },
    ] },
    { name: "EditorBar", props: [
      { name: "back", type: "{ href: string; label: string }", description: "Back link; the label hides on narrow layouts." },
      { name: "title · status", type: "ReactNode", description: "Document title and a SaveStatus." },
      { name: "actions", type: "ReactNode", description: "Primary actions, always shown (hidden when readOnly)." },
      { name: "secondaryActions", type: "ReactNode", description: "Hidden below 640px — mirror them in menu." },
      { name: "menu", type: "MenuEntry[]", description: "\"⋯\" menu at the end." },
      { name: "panelToggle", type: "boolean", default: "true", description: "Panel toggle (aria-expanded, aria-controls)." },
      { name: "focusToggle", type: "boolean", default: "false", description: "A visible focus-mode button." },
    ] },
    { name: "SaveStatus", props: [
      { name: "state", type: '"idle" | "dirty" | "saving" | "saved" | "error" | "offline"', description: "Where the changes are." },
      { name: "at", type: "Date | number", description: "Last save, for \"Saved 2 min. ago\"." },
      { name: "onRetry", type: "() => void", description: "Retry button in the error state." },
      { name: "guard", type: "boolean", default: "true", description: "beforeunload warning while dirty or saving." },
      { name: "now", type: "Date | number", description: "Fixed reference time (docs, tests)." },
    ] },
    { name: "EditorCanvas", props: [
      { name: "width", type: '"prose" | "wide" | "full"', default: '"prose"', description: "720 / 1080 px / full." },
      { name: "tone", type: '"surface" | "scene"', default: '"surface"', description: "Canvas background." },
      { name: "notice", type: "ReactNode", description: "Banner above the content (read-only Alert)." },
      { name: "loading", type: "boolean", description: "Skeleton title and paragraphs." },
    ] },
    { name: "EditorPanel · EditorPanelContent", props: [
      { name: "tabs", type: "{ id: string; label: string }[]", description: "Panel tabs; EditorPanelContent value matches an id." },
      { name: "value · defaultValue · onValueChange", type: "string", description: "Selected tab." },
      { name: "footer", type: "ReactNode", description: "Sticky footer inside the panel." },
      { name: "aria-label", type: "string", default: '"Settings"', description: "Name of the complementary landmark." },
    ] },
    { name: "EditorPanelSection", props: [
      { name: "id", type: "string", description: "Open state is remembered per id (localStorage)." },
      { name: "title · summary", type: "ReactNode", description: "Header and the one-line summary shown while folded." },
      { name: "defaultOpen · open · onOpenChange", type: "boolean", default: "false", description: "Open state." },
      { name: "actions", type: "ReactNode", description: "Controls next to the toggle." },
      { name: "headingLevel", type: "2 | 3", default: "2", description: "Heading level." },
    ] },
  ],
  notes: ["Autosave scheduling (debounce, conflicts) is your app's job — feed the result into SaveStatus."],
  covers: ["Editor layout (content + side panel)"],
};

export default entry;

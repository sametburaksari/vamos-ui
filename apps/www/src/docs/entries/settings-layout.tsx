import { ex, type DocEntry } from "../types";
import SettingsLayoutDemo from "../examples/settings-layout/demo";
import SettingsLayoutSaveBar from "../examples/settings-layout/save-bar";
import SettingsLayoutSplit from "../examples/settings-layout/split";
import SettingsLayoutDangerZone from "../examples/settings-layout/danger-zone";
import SettingsLayoutStates from "../examples/settings-layout/states";

const entry: DocEntry = {
  slug: "settings-layout",
  title: "Settings layout",
  group: "Page layouts",
  description:
    "A shared skeleton for settings pages: section nav with scroll-spy, titled sections of label | control rows, a sticky save bar that rises when there are unsaved changes, and a danger zone. Rows act like a Field, so kit controls are labelled and described without extra ids. Not bound to a form library — pass dirty from your form state.",
  source: ["components/settings-layout.tsx"],
  basedOn: "Field context · IntersectionObserver (scroll-spy) · container queries",
  usage: `import { SettingsLayout, SettingsNav, SettingsSection, SettingsRow, SettingsSaveBar } from "@vamos-cms/ui";

<SettingsLayout nav={<SettingsNav items={[{ id: "general", label: "General" }, { id: "danger", label: "Danger zone", tone: "danger" }]} />}>
  <SettingsSection id="general" title="General" description="Basic information about the site.">
    <SettingsRow label="Site name" description="Shown in the browser tab.">
      <Input {...register("name")} />
    </SettingsRow>
    <SettingsRow label="Maintenance mode" layout="inline"><Switch /></SettingsRow>
  </SettingsSection>
  <SettingsSection id="danger" tone="danger" title="Danger zone">…</SettingsSection>
  <SettingsSaveBar dirty={formState.isDirty} saving={formState.isSubmitting} onSave={handleSubmit(save)} onReset={() => reset()} />
</SettingsLayout>`,
  demo: ex("demo", "Demo", "settings-layout/demo.tsx", SettingsLayoutDemo),
  examples: [
    ex("save-bar", "Save bar", "settings-layout/save-bar.tsx", SettingsLayoutSaveBar, "The bar rises while dirty, saving or error, announces itself politely and saves with ⌘/Ctrl+S. Every third save here fails to show the error state."),
    ex("split", "Split sections", "settings-layout/split.tsx", SettingsLayoutSplit, "layout=\"split\" puts the title and description in a start column on wide layouts and stacks them when narrow."),
    ex("danger-zone", "Danger zone", "settings-layout/danger-zone.tsx", SettingsLayoutDangerZone, "tone=\"danger\" with a typed confirmation from useConfirm({ requireText })."),
    ex("states", "Loading and read-only", "settings-layout/states.tsx", SettingsLayoutStates, "loading renders skeleton rows; readOnly disables every control through the row's field context — pair it with an Alert in notice."),
  ],
  api: [
    { name: "SettingsLayout", props: [
      { name: "nav", type: "ReactNode", description: "A SettingsNav: a start column on wide layouts, a scrolling strip below 672px of layout width. Rows stack when their card is under 32rem." },
      { name: "width", type: '"md" | "lg"', default: '"md"', description: "64rem or 80rem overall." },
      { name: "readOnly", type: "boolean", default: "false", description: "Disables every row control." },
      { name: "notice", type: "ReactNode", description: "Banner above the first section." },
      { name: "stickyTop", type: "number | string", default: '"var(--topbar-h)"', description: "Where the nav sticks." },
      { name: "labels", type: "SettingsLayoutLabels", description: "Overrides for the settings namespace." },
    ] },
    { name: "SettingsNav", props: [
      { name: "items", type: "{ id; label; href?; icon?; badge?; permission?; tone? }[]", description: "Anchors (#id, scroll-spy) or route links (href). permission is checked with can()." },
      { name: "value · defaultValue · onValueChange", type: "string", description: "Active item." },
      { name: "scrollSpy", type: "boolean", default: "true", description: "Follow the section in view." },
      { name: "aria-label", type: "string", default: '"Settings sections"', description: "Name of the nav." },
    ] },
    { name: "SettingsSection", props: [
      { name: "id", type: "string", description: "Anchor for SettingsNav." },
      { name: "title · description", type: "ReactNode", description: "Heading (<section aria-labelledby>) and help text." },
      { name: "layout", type: '"stacked" | "split"', default: '"stacked"', description: "Title above the card, or in a start column." },
      { name: "tone", type: '"default" | "danger"', default: '"default"', description: "Danger hairline and title." },
      { name: "footer", type: "ReactNode", description: "Card footer — a hint or a section button." },
      { name: "loading", type: "boolean | number", description: "Skeleton rows (number = row count)." },
      { name: "headingLevel", type: "2 | 3", default: "2", description: "Heading level." },
    ] },
    { name: "SettingsRow", props: [
      { name: "label · description", type: "ReactNode", description: "Wired to the control (label for, aria-describedby)." },
      { name: "layout", type: '"split" | "inline" | "stacked"', default: '"split"', description: "Side by side (stacks when narrow), control at the end (switches), or full width." },
      { name: "htmlFor", type: "string", description: "Control id. Default: generated and passed to kit controls." },
      { name: "badge", type: "ReactNode", description: "Next to the label." },
      { name: "error", type: "ReactNode", description: "Error text; marks kit controls invalid." },
      { name: "disabled", type: "boolean", description: "Disables kit controls in the row." },
    ] },
    { name: "SettingsSaveBar", props: [
      { name: "dirty", type: "boolean", description: "Unsaved changes — shows the bar." },
      { name: "saving", type: "boolean", description: "Save button loading." },
      { name: "onSave · onReset", type: "() => void", description: "Save (also ⌘/Ctrl+S) and Discard." },
      { name: "message", type: "ReactNode", description: "Replace \"You have unsaved changes\"." },
      { name: "error", type: "ReactNode | true", description: "Save failed: danger tone and an alert." },
      { name: "blockNavigation", type: "boolean", default: "true", description: "beforeunload warning while dirty." },
      { name: "shortcuts", type: "boolean", default: "true", description: "⌘/Ctrl+S saves." },
      { name: "saveLabel", type: "string", default: '"Save changes"', description: "Save button text." },
    ] },
  ],
  covers: ["Settings layout"],
};

export default entry;

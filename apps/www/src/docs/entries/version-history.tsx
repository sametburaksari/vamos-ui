import { ex, type DocEntry } from "../types";
import VersionHistoryDemo from "../examples/version-history/demo";
import VersionHistoryTextDiff from "../examples/version-history/text-diff";
import VersionHistoryFieldDiff from "../examples/version-history/field-diff";
import VersionHistoryLargeDiff from "../examples/version-history/large-diff";

const entry: DocEntry = {
  slug: "version-history",
  title: "Version history & diff",
  group: "Data display",
  description:
    "Revisions of a record: pick two, see what changed and restore an older one. Text diffs highlight changed words inside changed lines (jsdiff), side by side or unified, with collapsed unchanged runs and change navigation. Records diff field by field with locale formatting.",
  source: ["components/version-history.tsx", "styles/data.css"],
  basedOn: "jsdiff (diff) + listbox pattern",
  usage: `import { VersionHistory, DiffView, FieldDiff } from "@vamos-ui/react";

<VersionHistory
  versions={revisions}
  loadVersion={(id) => api.revision(id).then((r) => r.body)}
  onRestore={(id) => api.restore(postId, id)}
/>

<DiffView before={a} after={b} mode="split" />
<FieldDiff before={v1} after={v2} fields={[{ key: "amount", label: "Amount", format: "currency" }]} />`,
  demo: ex("demo", "Post revisions (CMS)", "version-history/demo.tsx", VersionHistoryDemo, "Defaults to the newest older version vs current. Restore asks for confirmation, then a new version appears on top."),
  examples: [
    ex("text-diff", "Word, character and line diff", "version-history/text-diff.tsx", VersionHistoryTextDiff, "mode=\"split\" puts before at the start side; granularity controls the in-line highlights."),
    ex("field-diff", "Record changes (CRM quote)", "version-history/field-diff.tsx", VersionHistoryFieldDiff, "Values use the field's format; long text fields (type=\"text-long\") get a word diff."),
    ex("large-diff", "Long document, collapsed hunks (HR policy)", "version-history/large-diff.tsx", VersionHistoryLargeDiff, "context sets the unchanged lines kept around each change. Focus the diff and press n / p to jump between changes."),
  ],
  api: [
    { name: "VersionHistory", props: [
      { name: "versions", type: "Version[]", description: "Revisions (any order; shown newest first)." },
      { name: "loadVersion", type: "(id) => string | Record<string, unknown> | Promise<…>", description: "Content of one version: text → DiffView, record → FieldDiff. Cached per id." },
      { name: "compare / defaultCompare / onCompareChange", type: "[string, string] / … / (pair) => void", description: "The pair being compared; older is \"before\"." },
      { name: "fields", type: "FieldDiffField[]", description: "Record versions: fields to compare." },
      { name: "onRestore", type: "(id) => void | Promise<void>", description: "\"Restore this version\" with a confirm dialog, then a success toast." },
      { name: "layout", type: '"page" | "panel"', default: '"page"', description: "List beside the diff, or stacked for a Sheet." },
      { name: "defaultMode", type: '"split" | "unified"', default: 'page: "split", panel: "unified"', description: "Text diff layout." },
      { name: "granularity", type: '"word" | "char" | "line"', default: '"word"', description: "In-line highlights." },
      { name: "context", type: "number", default: "3", description: "Unchanged lines kept around changes." },
      { name: "labels", type: "Partial<VersionHistoryLabels>", description: "All built-in strings." },
    ] },
    { name: "Version", props: [
      { name: "id / createdAt", type: "string / ISO instant", description: "Identity and time." },
      { name: "label / summary", type: "string", description: "\"v12 · Pricing update\" and a short note." },
      { name: "author", type: "{ name; avatar? }", description: "Who saved it." },
      { name: "kind", type: '"manual" | "autosave" | "published" | "system"', default: '"manual"', description: "Badge." },
      { name: "current", type: "boolean", description: "The live version." },
    ] },
    { name: "DiffView", props: [
      { name: "before / after", type: "string", description: "Texts to compare." },
      { name: "mode", type: '"unified" | "split"', default: '"unified"', description: "Layout." },
      { name: "granularity", type: '"word" | "char" | "line"', default: '"word"', description: "In-line highlights." },
      { name: "context", type: "number", default: "3", description: "Collapsed context; Infinity shows all." },
      { name: "beforeLabel / afterLabel", type: "string", description: "Column and region names." },
      { name: "lineNumbers / toolbar / wrap", type: "boolean", default: "true", description: "Gutters; summary + prev/next; wrap long lines." },
      { name: "actions", type: "ReactNode", description: "Extra toolbar content." },
    ] },
    { name: "FieldDiff", props: [
      { name: "before / after", type: "Record<string, unknown>", description: "Records to compare." },
      { name: "fields", type: '{ key; label; format?; type?: "text" | "text-long" | "boolean" | "list" | "json"; render? }[]', description: "Fields in order. Default: every key, humanized." },
      { name: "onlyChanges", type: "boolean", default: "true", description: "Hide unchanged fields." },
      { name: "beforeLabel / afterLabel", type: "string", description: "Column headers." },
    ] },
    { name: "Helpers", props: [
      { name: "diffText(before, after, granularity)", type: "DiffLine[]", description: "The line model behind DiffView." },
      { name: "diffRecords(a, b, fields?)", type: "{ key; change; before; after }[]", description: "added / removed / changed / same per field." },
    ] },
  ],
  notes: ["Colour is never the only signal: +/− gutters, <ins>/<del> and screen-reader text (\"Added line\"). Diff panels are surface-2 and never blurred in glass mode."],
  covers: ["Version history & diff"],
};

export default entry;

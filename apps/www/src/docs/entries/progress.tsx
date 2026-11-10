import { ex, type DocEntry } from "../types";
import ProgressDemo from "../examples/progress/demo";
import ProgressSizesTones from "../examples/progress/sizes-tones";
import ProgressIndeterminate from "../examples/progress/indeterminate";
import ProgressQuota from "../examples/progress/quota";
import ProgressUploadList from "../examples/progress/upload-list";
import ProgressCircleExample from "../examples/progress/circle";

const entry: DocEntry = {
  slug: "progress",
  title: "Progress",
  group: "Overlays & feedback",
  description:
    "Task progress and quota use — uploads, imports, leave balance, plan limits. Linear and circular, indeterminate, an automatic quota tone, and values formatted for the current locale (42% / %42).",
  source: ["components/progress.tsx", "styles/overlays.css"],
  basedOn: "WAI-ARIA progressbar",
  usage: `import { Progress, ProgressCircle } from "@vamos-ui/react";

<Progress label="Uploading" value={42} showValue />
<ProgressCircle aria-label="Profile complete" value={72} size="lg" />`,
  demo: ex("demo", "Demo", "progress/demo.tsx", ProgressDemo),
  examples: [
    ex("sizes-tones", "Sizes and states", "progress/sizes-tones.tsx", ProgressSizesTones, "2 / 4 / 8 px. The accent bar turns success when it completes; a failed task uses tone=\"danger\"."),
    ex("indeterminate", "Indeterminate", "progress/indeterminate.tsx", ProgressIndeterminate, "value={null} slides a bar and drops aria-valuenow. With reduced motion it shows a static hatched half fill."),
    ex("quota", "Quota", "progress/quota.tsx", ProgressQuota, 'tone="auto": over 80% warning, at or over the limit danger. display="fraction" reads "52,400 of 50,000".'),
    ex("upload-list", "Upload list (CMS)", "progress/upload-list.tsx", ProgressUploadList, "xs bars in file rows; each one is named for its file."),
    ex("circle", "Circular", "progress/circle.tsx", ProgressCircleExample, "sm sits inline next to text; md and lg can show the value or your own content in the centre."),
  ],
  api: [
    { name: "Progress", props: [
      { name: "value", type: "number | null", description: "Current value. null → indeterminate. Values above max are allowed (quota overrun)." },
      { name: "max", type: "number", default: "100", description: "Upper bound." },
      { name: "tone", type: '"accent" | "success" | "warning" | "danger" | "auto"', default: '"accent"', description: "auto: > 80% warning, ≥ 100% danger. accent turns success when complete." },
      { name: "size", type: '"xs" | "sm" | "md"', default: '"sm"', description: "Bar height 2 / 4 / 8 px." },
      { name: "label", type: "ReactNode", description: "Visible label, linked with aria-labelledby. Without it pass aria-label." },
      { name: "showValue", type: "boolean | (value, max) => ReactNode", default: "false", description: "Value at the end of the label row, or your own." },
      { name: "display", type: '"percent" | "fraction"', default: '"percent"', description: 'How the value reads, visibly and in aria-valuetext: "42%" or "1,240 of 5,000".' },
      { name: "valueText", type: "string", description: "Override the announced value text." },
      { name: "hint", type: "ReactNode", description: "Small text under the bar, linked with aria-describedby." },
      { name: "labels", type: "{ of?: string; loading?: string }", description: 'Dictionary namespace "progress".' },
    ] },
    { name: "ProgressCircle", props: [
      { name: "value / max / tone / display / valueText", type: "as Progress", description: "Same model." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "18 / 40 / 64 px." },
      { name: "showValue", type: "boolean", default: "true for lg", description: "Value in the centre (md, lg)." },
      { name: "children", type: "ReactNode", description: "Centre content instead of the value (an icon)." },
      { name: "aria-label", type: "string", description: "Required accessible name." },
    ] },
  ],
  notes: ["Animates transform: scaleX, never width.", "Segmented step progress is the Stepper component, not a Progress variant."],
  covers: ["Progress"],
};

export default entry;

import { DonutChart, type ChartConfig } from "@vamos-cms/ui/charts";

const storage = [
  { kind: "images", bytes: 41_200_000_000 },
  { kind: "video", bytes: 28_700_000_000 },
  { kind: "documents", bytes: 6_300_000_000 },
  { kind: "free", bytes: 23_800_000_000 },
];

const config = {
  images: { label: "Images", format: "bytes" },
  video: { label: "Video", format: "bytes" },
  documents: { label: "Documents", format: "bytes" },
  free: { label: "Free", color: "fg-subtle", format: "bytes" },
} satisfies ChartConfig;

export default function DonutChartCenterCustom() {
  return (
    <DonutChart
      title="Media library storage"
      data={storage}
      nameKey="kind"
      valueKey="bytes"
      config={config}
      size="md"
      center={
        <>
          <span className="font-mono text-[22px] leading-none font-medium tracking-[-0.02em] tabular">76%</span>
          <span className="text-[11.5px] text-fg-muted">of 100 GB used</span>
        </>
      }
      className="w-full max-w-xl"
    />
  );
}

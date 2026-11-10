import { Gauge } from "@vamos-cms/ui/charts";

const bands = [
  { at: 0, color: "danger", label: "Poor" },
  { at: 50, color: "warning", label: "Fair" },
  { at: 80, color: "success", label: "Good" },
] as const;

export default function GaugeDemo() {
  return (
    <div className="flex flex-wrap items-end gap-10">
      <Gauge value={64} aria-label="SEO score, /pricing" thresholds={[...bands]} color="auto" showThresholdBands />
      <Gauge value={88} arc={180} aria-label="SEO score, /blog" thresholds={[...bands]} color="auto" showThresholdBands size={140} />
    </div>
  );
}

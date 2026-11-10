import { Sparkline, sparklineSummary } from "@vamos-ui/react";

const visits = [42, 48, 45, 61, 58, 66, 74, 70, 88, 84, 96];
const results = [1, 1, -1, 1, 0, -1, 1, 1, 1, -1, 1, 1];

export default function SparklineDemo() {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-xs text-fg-muted sm:grid-cols-4">
      <figure className="grid gap-2">
        <Sparkline values={visits} className="text-accent-ink" label={sparklineSummary(visits)} />
        <figcaption>line</figcaption>
      </figure>
      <figure className="grid gap-2">
        <Sparkline values={visits} variant="area" color="chart-2" showLast />
        <figcaption>area + last</figcaption>
      </figure>
      <figure className="grid gap-2">
        <Sparkline values={visits} variant="bars" className="text-fg-muted" showLast />
        <figcaption>bars</figcaption>
      </figure>
      <figure className="grid gap-2">
        <Sparkline values={results} variant="winloss" />
        <figcaption>win / loss</figcaption>
      </figure>
    </div>
  );
}

import { BarList } from "@vamos-cms/ui/charts";

const sources = [
  { key: "google", label: "google.com", value: 18_420, delta: 0.124 },
  { key: "direct", label: "Direct", value: 9_860, delta: 0.031 },
  { key: "linkedin", label: "linkedin.com", value: 4_210, delta: -0.082 },
  { key: "newsletter", label: "Weekly newsletter", value: 3_180, delta: 0.21 },
  { key: "hn", label: "news.ycombinator.com", value: 1_940 },
  { key: "bing", label: "bing.com", value: 820 },
  { key: "duck", label: "duckduckgo.com", value: 610 },
  { key: "reddit", label: "reddit.com", value: 480 },
];

export default function BarListDemo() {
  return (
    <div className="grid w-full gap-8 md:grid-cols-2">
      <div>
        <p className="mb-2 text-[13px] font-medium">Top sources</p>
        <BarList aria-label="Top sources" data={sources} max={5} showShare />
      </div>
      <div>
        <p className="mb-2 text-[13px] font-medium">Track variant</p>
        <BarList aria-label="Top sources" data={sources.slice(0, 4)} variant="track" size="sm" color="chart-2" />
      </div>
    </div>
  );
}

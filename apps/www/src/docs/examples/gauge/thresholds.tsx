import { ProgressRing } from "@vamos-ui/react/charts";

const bands = [
  { at: 0, color: "danger", label: "At risk" },
  { at: 60, color: "warning", label: "Watch" },
  { at: 85, color: "success", label: "Healthy" },
] as const;

const accounts = [
  { name: "Northwind Traders", health: 92 },
  { name: "Kale Bakery", health: 71 },
  { name: "Atlas Logistics", health: 44 },
];

export default function GaugeThresholds() {
  // color="auto" takes the colour of the band the value falls in.
  return (
    <div className="flex flex-wrap gap-8">
      {accounts.map((a) => (
        <div key={a.name} className="grid justify-items-center gap-2 text-center">
          <ProgressRing value={a.health} size="lg" thresholds={[...bands]} color="auto" semantic="meter" aria-label={`${a.name} health score`} />
          <span className="text-[13px]">{a.name}</span>
        </div>
      ))}
    </div>
  );
}

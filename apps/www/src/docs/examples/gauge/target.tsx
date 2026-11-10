import { Gauge } from "@vamos-ui/react/charts";

export default function GaugeTarget() {
  // A quota with a target marker; past max the arc stays full and a ring marks the overshoot.
  return (
    <div className="flex flex-wrap items-end gap-10">
      <div className="grid justify-items-center gap-2">
        <Gauge value={412_000} max={500_000} target={450_000} format={{ currency: "USD", compact: true }} semantic="progress" aria-label="Q4 quota, Maya Chen" size={150} />
        <span className="text-[13px] text-fg-muted">Maya Chen · quota $500K</span>
      </div>
      <div className="grid justify-items-center gap-2">
        <Gauge value={118} max={100} target={100} format="percent" arc={180} semantic="progress" aria-label="Partner target attainment" color="success" size={150} />
        <span className="text-[13px] text-fg-muted">Partner target · 118%</span>
      </div>
    </div>
  );
}

import { Button, DeviceFrame } from "@vamos-ui/react";

function PricingPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-10">
      <h3 className="m-0 text-display-m font-semibold text-fg">Simple plans</h3>
      <div className="grid gap-4 @2xl:grid-cols-3">
        {["Starter", "Team", "Business"].map((p, i) => (
          <div key={p} className="flex flex-col gap-3 rounded-ui border border-line bg-surface p-5">
            <span className="font-semibold text-fg">{p}</span>
            <span className="text-h3 text-fg tabular">€{(i + 1) * 9}</span>
            <Button variant={i === 1 ? "primary" : "secondary"} size="sm">
              Choose {p}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/** The same page at a tablet and a desktop width; the content's own container queries switch the columns. */
export default function DeviceFrameDevices() {
  return (
    <div className="grid w-full items-end gap-6 md:grid-cols-[2fr_3fr]">
      <DeviceFrame device="tablet" label="Pricing page on a tablet: plans stacked">
        <PricingPage />
      </DeviceFrame>
      <DeviceFrame device="desktop" url="example.com/pricing" interactive label="Pricing page preview">
        <PricingPage />
      </DeviceFrame>
    </div>
  );
}

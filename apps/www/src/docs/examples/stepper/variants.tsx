import { Stepper } from "@vamos-cms/ui";

const checkout = [{ title: "Cart" }, { title: "Shipping" }, { title: "Payment" }, { title: "Confirmation" }];

// Web checkout: dots for a light header, bar for segments, compact for small spaces.
export default function StepperVariants() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-9">
      <Stepper value={2} variant="dots" steps={checkout} aria-label="Checkout" responsive={false} className="max-w-xs" />
      <Stepper value={2} variant="bar" steps={checkout} aria-label="Checkout" responsive={false} />
      <Stepper value={2} variant="compact" steps={checkout} aria-label="Checkout" className="max-w-sm" />
    </div>
  );
}

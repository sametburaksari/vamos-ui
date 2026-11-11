"use client";

import * as React from "react";
import { Badge, Button, Input, Tour, type TourStep } from "@vamos-ui/react";

export default function TourControlled() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [result, setResult] = React.useState<string | null>(null);
  const name = React.useRef<HTMLInputElement>(null);
  const price = React.useRef<HTMLInputElement>(null);
  const publish = React.useRef<HTMLButtonElement>(null);

  const steps: TourStep[] = [
    { target: name, title: "Name the product", description: "Shown on the shop, receipts and marketplace listings.", side: "right" },
    { target: price, title: "Set the price", description: "Including VAT. Channel prices can differ — set them on the Pricing tab.", side: "right" },
    { target: publish, title: "Publish when ready", description: "Drafts stay hidden from the shop until you publish.", side: "top" },
  ];

  return (
    <div className="grid w-full max-w-sm gap-3">
      <label className="grid gap-1.5 text-[13px] font-medium text-fg">
        Product name
        <Input ref={name} defaultValue="Washed linen duvet cover" />
      </label>
      <label className="grid gap-1.5 text-[13px] font-medium text-fg">
        Price (₺)
        <Input ref={price} defaultValue="2490.00" inputMode="decimal" />
      </label>
      <div className="flex items-center gap-2">
        <Button ref={publish} variant="primary">
          Publish
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setStep(0);
            setResult(null);
            setOpen(true);
          }}
        >
          How does this work?
        </Button>
      </div>
      <p className="flex items-center gap-2 text-xs text-fg-muted">
        Step <Badge>{step + 1}</Badge> {result ? <Badge tone={result === "completed" ? "success" : "neutral"}>{result}</Badge> : null}
      </p>
      <Tour steps={steps} open={open} onOpenChange={setOpen} step={step} onStepChange={setStep} onComplete={() => setResult("completed")} onSkip={(i) => setResult(`skipped at ${i + 1}`)} />
    </div>
  );
}

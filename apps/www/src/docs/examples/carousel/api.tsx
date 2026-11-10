"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Carousel, CarouselSlide, CarouselViewport, IconButton, Progress, useCarousel } from "@vamos-ui/react";

const steps = [
  { title: "Connect your calendar", body: "Google or Outlook. We read busy times only, never event details." },
  { title: "Set your working hours", body: "Different hours per location? Add them once, we handle the rest." },
  { title: "Share your booking link", body: "Paste it on Instagram, WhatsApp or your website — no app needed." },
  { title: "Get paid upfront", body: "Optional deposits through iyzico or Stripe, refunded automatically on cancel." },
];

function Controls() {
  const { index, count, canPrev, canNext, scrollPrev, scrollNext } = useCarousel();
  return (
    <div className="mt-5 flex items-center gap-4">
      <span className="tabular text-[13px] text-fg-muted">
        Step <span className="font-medium text-fg">{index + 1}</span> of {count}
      </span>
      <Progress value={((index + 1) / Math.max(1, count)) * 100} className="flex-1" aria-label="Onboarding progress" />
      <div className="flex gap-1">
        <IconButton label="Previous step" variant="secondary" size="sm" disabled={!canPrev} onClick={scrollPrev}>
          <ArrowLeft className="rtl:-scale-x-100" />
        </IconButton>
        <IconButton label="Next step" variant="secondary" size="sm" disabled={!canNext} onClick={scrollNext}>
          <ArrowRight className="rtl:-scale-x-100" />
        </IconButton>
      </div>
    </div>
  );
}

export default function CarouselApi() {
  return (
    <Carousel label="Getting started" controls="hidden" className="surface w-full max-w-lg rounded-ui-lg p-6">
      <CarouselViewport arrows={false}>
        {steps.map((s, i) => (
          <CarouselSlide key={s.title}>
            <p className="tabular text-[11px] font-medium tracking-[0.12em] text-fg-subtle uppercase">0{i + 1}</p>
            <h4 className="mt-2 font-display text-2xl text-fg">{s.title}</h4>
            <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{s.body}</p>
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <Controls />
    </Carousel>
  );
}

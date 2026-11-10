import { Carousel, CarouselSlide, CarouselViewport } from "@vamos-ui/react";

// A KPI strip: one card per view on phones, four on desktop. Arrows sit outside with faded edges.
const kpis = [
  { label: "Revenue (Nov)", value: "$84,210", delta: "+12.4%" },
  { label: "New leads", value: "318", delta: "+8.1%" },
  { label: "Win rate", value: "27%", delta: "+2.3 pts" },
  { label: "Avg. deal size", value: "$6,940", delta: "−1.8%" },
  { label: "Open tickets", value: "41", delta: "−14%" },
  { label: "NPS", value: "62", delta: "+4" },
];

export default function CarouselResponsive() {
  return (
    <Carousel label="Key metrics" preset="strip" slidesPerView={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="sm" className="w-full">
      <CarouselViewport>
        {kpis.map((k) => (
          <CarouselSlide key={k.label}>
            <div className="surface-2 rounded-ui p-4">
              <p className="text-[12.5px] text-fg-muted">{k.label}</p>
              <p className="tabular mt-1 font-display text-2xl text-fg">{k.value}</p>
              <p className={`tabular mt-0.5 text-[12px] ${k.delta.startsWith("−") ? "text-danger" : "text-success"}`}>{k.delta} vs Oct</p>
            </div>
          </CarouselSlide>
        ))}
      </CarouselViewport>
    </Carousel>
  );
}

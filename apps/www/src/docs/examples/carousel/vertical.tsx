import { Avatar, Carousel, CarouselDots, CarouselSlide, CarouselViewport } from "@vamos-ui/react";

const quotes = [
  { name: "Deniz Arslan", role: "Head of Ops, Atlas Lojistik", text: "We moved 40 dispatchers onto one panel in a week. Nobody asked for the old tool back.", photo: "photo-1500648767791-00dcc994a43e" },
  { name: "Ayşe Korkmaz", role: "Founder, Lena Spa", text: "Bookings come in at night now, while we sleep. The calendar just fills up.", photo: "photo-1494790108377-be9c29b29330" },
  { name: "Mert Çelik", role: "CTO, Kargo Hızlı", text: "The block editor is the first CMS our marketing team didn't need a ticket for.", photo: "photo-1507003211169-0a1dd7228f2d" },
];

export default function CarouselVertical() {
  return (
    <Carousel label="Customer quotes" orientation="vertical" controls="hidden" loop className="w-full max-w-md [--carousel-height:11rem]">
      <CarouselViewport>
        {quotes.map((q) => (
          <CarouselSlide key={q.name} className="h-full">
            <figure className="m-0 flex h-full flex-col justify-center gap-4">
              <blockquote className="font-display text-xl leading-snug text-balance text-fg">“{q.text}”</blockquote>
              <figcaption className="flex items-center gap-3">
                <Avatar src={`https://images.unsplash.com/${q.photo}?w=96&h=96&fit=crop&crop=faces`} name={q.name} size="sm" />
                <span className="text-[13px]">
                  <span className="font-medium text-fg">{q.name}</span>
                  <span className="text-fg-muted"> · {q.role}</span>
                </span>
              </figcaption>
            </figure>
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <CarouselDots className="mt-2 justify-start" />
    </Carousel>
  );
}

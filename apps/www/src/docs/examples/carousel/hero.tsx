import { Button, Carousel, CarouselDots, CarouselSlide, CarouselViewport, Image } from "@vamos-ui/react";

const slides = [
  {
    id: "h1",
    eyebrow: "Autumn menu",
    title: <>Slow-cooked, <em>seasonal</em>, made for long tables</>,
    cta: "Book a table",
    photo: "photo-1414235077428-338989a2e8c0",
    alt: "Plated sea bass with fennel on a dark table",
  },
  {
    id: "h2",
    eyebrow: "Private dining",
    title: <>A room of your own for <em>twelve</em> guests</>,
    cta: "Plan an event",
    photo: "photo-1517248135467-4c7edcad34c4",
    alt: "Restaurant dining room with warm pendant lights",
  },
  {
    id: "h3",
    eyebrow: "Sunday brunch",
    title: <>Brunch on the terrace, <em>every</em> Sunday from ten</>,
    cta: "See the brunch menu",
    photo: "photo-1504674900247-0877df9cc836",
    alt: "Brunch spread with eggs, bread and fresh fruit",
  },
];

export default function CarouselHero() {
  return (
    <Carousel label="Kalamış Bistro highlights" preset="hero" transition="fade" autoplay={{ delay: 6000 }} loop className="w-full rounded-ui-lg">
      <CarouselViewport>
        {slides.map((s, i) => (
          <CarouselSlide key={s.id}>
            <div className="relative">
              <Image
                src={`https://images.unsplash.com/${s.photo}?w=1600&q=80&auto=format&fit=crop`}
                alt={s.alt}
                width={1600}
                height={900}
                aspect="16/9"
                priority={i === 0}
                sizes="100vw"
                className="max-h-[28rem] w-full"
              />
              <div className="dark absolute inset-0 flex flex-col justify-end bg-linear-to-t from-scene/85 via-scene/30 to-transparent p-6 sm:p-10">
                <p className="text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">{s.eyebrow}</p>
                <h3 className="mt-2 max-w-lg font-display text-3xl leading-[1.05] text-balance text-fg sm:text-4xl">{s.title}</h3>
                <div className="mt-5">
                  <Button variant="primary">{s.cta}</Button>
                </div>
              </div>
            </div>
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <CarouselDots />
    </Carousel>
  );
}

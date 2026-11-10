import { Badge, Carousel, CarouselDots, CarouselSlide, CarouselViewport, Image } from "@vamos-ui/react";

const stays = [
  { id: "s1", name: "Moda loft with sea view", area: "Kadıköy", price: "$142", rating: "4.92", photo: "photo-1502672260266-1c1ef2d93688", alt: "Bright living room with a grey sofa and tall windows" },
  { id: "s2", name: "Cihangir studio near the steps", area: "Beyoğlu", price: "$96", rating: "4.81", photo: "photo-1505691938895-1758d7feb511", alt: "Bedroom with white linen and a reading lamp" },
  { id: "s3", name: "Bebek garden flat", area: "Beşiktaş", price: "$188", rating: "4.97", photo: "photo-1493809842364-78817add7ffb", alt: "Living room opening onto a green garden" },
  { id: "s4", name: "Karaköy rooftop apartment", area: "Beyoğlu", price: "$164", rating: "4.88", photo: "photo-1484154218962-a197022b5858", alt: "Kitchen with white cabinets and a wooden table" },
  { id: "s5", name: "Nişantaşı classic two-bed", area: "Şişli", price: "$131", rating: "4.76", photo: "photo-1560448204-e02f11c3d0e2", alt: "Living room with parquet floors and a fireplace" },
];

export default function CarouselDemo() {
  return (
    <Carousel label="Featured stays" slidesPerView={{ base: 1, sm: 2, lg: 3 }} className="w-full">
      <CarouselViewport>
        {stays.map((s) => (
          <CarouselSlide key={s.id}>
            <article className="group">
              <Image
                src={`https://images.unsplash.com/${s.photo}?w=800&q=75&auto=format&fit=crop`}
                alt={s.alt}
                width={800}
                height={600}
                aspect="4/3"
                rounded="ui"
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
              />
              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-[15px] font-medium text-fg">{s.name}</h4>
                  <p className="text-[13px] text-fg-muted">{s.area}, Istanbul</p>
                </div>
                <Badge tone="outline" className="tabular shrink-0">★ {s.rating}</Badge>
              </div>
              <p className="mt-1.5 text-[13.5px] text-fg">
                <span className="tabular font-semibold">{s.price}</span> <span className="text-fg-muted">night</span>
              </p>
            </article>
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <CarouselDots />
    </Carousel>
  );
}

import { Carousel, CarouselCounter, CarouselSlide, CarouselThumbs, CarouselViewport, Image } from "@vamos-cms/ui";

const photos = [
  { id: "p1", photo: "photo-1600596542815-ffad4c1539a9", alt: "Front of the villa with the pool lit at dusk" },
  { id: "p2", photo: "photo-1600585154340-be6161a56a0c", alt: "Terrace with sun loungers facing the garden" },
  { id: "p3", photo: "photo-1512917774080-9991f1c4c750", alt: "White villa facade with palm trees" },
  { id: "p4", photo: "photo-1493809842364-78817add7ffb", alt: "Living room opening onto the garden" },
  { id: "p5", photo: "photo-1484154218962-a197022b5858", alt: "Kitchen with an island and bar stools" },
  { id: "p6", photo: "photo-1505691938895-1758d7feb511", alt: "Main bedroom with linen bedding" },
];
const url = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=78&auto=format&fit=crop`;

export default function CarouselGalleryThumbs() {
  return (
    <Carousel label="Villa Alaçatı photos" preset="gallery" loop className="w-full max-w-2xl">
      <CarouselViewport className="rounded-ui-lg">
        {photos.map((p) => (
          <CarouselSlide key={p.id}>
            <Image src={url(p.photo, 1400)} alt={p.alt} width={1400} height={933} aspect="3/2" sizes="42rem" />
          </CarouselSlide>
        ))}
      </CarouselViewport>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-[13px] text-fg-muted">Villa Alaçatı · 4 bedrooms · private pool</p>
        <CarouselCounter />
      </div>
      <CarouselThumbs items={photos.map((p) => ({ src: url(p.photo, 200), alt: p.alt }))} />
    </Carousel>
  );
}

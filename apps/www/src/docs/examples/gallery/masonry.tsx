import { Gallery, type MediaSource } from "@vamos-ui/react/media";

const url = (id: string, w: number, h: number) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&q=78&auto=format&fit=crop`;

// Ratios are known up front (width/height), so the columns are computed on the server.
const work: MediaSource[] = [
  { id: "w1", src: url("photo-1600596542815-ffad4c1539a9", 900, 600), width: 900, height: 600, alt: "Villa with a lit pool at dusk" },
  { id: "w2", src: url("photo-1486406146926-c627a92ad1ab", 700, 1050), width: 700, height: 1050, alt: "Office tower seen from below" },
  { id: "w3", src: url("photo-1493809842364-78817add7ffb", 900, 700), width: 900, height: 700, alt: "Living room opening onto a garden" },
  { id: "w4", src: url("photo-1484154218962-a197022b5858", 800, 1000), width: 800, height: 1000, alt: "Kitchen with white cabinets" },
  { id: "w5", src: url("photo-1512917774080-9991f1c4c750", 900, 600), width: 900, height: 600, alt: "White villa facade with palm trees" },
  { id: "w6", src: url("photo-1505691938895-1758d7feb511", 800, 1100), width: 800, height: 1100, alt: "Bedroom with linen bedding" },
  { id: "w7", src: url("photo-1449824913935-59a10b8d2000", 900, 600), width: 900, height: 600, alt: "City skyline from the air" },
  { id: "w8", src: url("photo-1502672260266-1c1ef2d93688", 900, 900), width: 900, height: 900, alt: "Bright living room with a grey sofa" },
];

export default function GalleryMasonry() {
  return <Gallery items={work} layout="masonry" columns={{ base: 2, md: 3 }} gap="sm" lightbox label="Studio Ardıç portfolio" className="w-full" />;
}

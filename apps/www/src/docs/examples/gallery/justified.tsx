import { Gallery, type MediaSource } from "@vamos-cms/ui/media";

const url = (id: string, w: number, h: number) => `https://images.unsplash.com/${id}?w=${w}&h=${h}&q=75&auto=format&fit=crop`;

const trip: MediaSource[] = [
  { id: "t1", src: url("photo-1506905925346-21bda4d32df4", 1200, 800), width: 1200, height: 800, alt: "Mountain ridge above the clouds" },
  { id: "t2", src: url("photo-1469474968028-56623f02e42e", 800, 1000), width: 800, height: 1000, alt: "Sunlight through a valley" },
  { id: "t3", src: url("photo-1501785888041-af3ef285b470", 1200, 700), width: 1200, height: 700, alt: "Lake with mountains at sunrise" },
  { id: "t4", src: url("photo-1470071459604-3b5ec3a7fe05", 1000, 1000), width: 1000, height: 1000, alt: "Foggy green hills" },
  { id: "t5", src: url("photo-1441974231531-c6227db76b6e", 1200, 800), width: 1200, height: 800, alt: "Path through a pine forest" },
  { id: "t6", src: url("photo-1506905925346-21bda4d32df4", 700, 1000), width: 700, height: 1000, alt: "Peak in the morning light" },
  { id: "t7", src: url("photo-1501785888041-af3ef285b470", 1400, 700), width: 1400, height: 700, alt: "Wide view of the lake" },
];

export default function GalleryJustified() {
  return <Gallery items={trip} layout="justified" rowHeight={180} gap="sm" rounded="ui" label="Kaçkar trek, September 2026" className="w-full" />;
}

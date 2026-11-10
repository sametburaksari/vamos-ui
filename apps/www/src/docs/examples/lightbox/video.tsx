import { Gallery, type MediaSource } from "@vamos-ui/react/media";

const url = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

// Images and video in one viewer. Video slides use the kit's Video player.
const items: MediaSource[] = [
  { id: "v0", kind: "video", src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", poster: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1280&q=75&auto=format&fit=crop", width: 1280, height: 720, alt: "Flower opening in the courtyard garden", caption: "Courtyard garden, spring 2026 (sample video)" },
  { id: "v1", src: url("photo-1600596542815-ffad4c1539a9", 1800), width: 1800, height: 1200, alt: "Villa with a lit pool at dusk", caption: "Villa Alaçatı — exterior" },
  { id: "v2", src: url("photo-1493809842364-78817add7ffb", 1800), width: 1800, height: 1200, alt: "Living room facing the garden", caption: "Villa Alaçatı — living room" },
];

export default function LightboxVideo() {
  return <Gallery items={items} columns={3} aspect="4/3" lightbox={{ backdrop: "blur" }} label="Villa Alaçatı media" className="w-full" />;
}

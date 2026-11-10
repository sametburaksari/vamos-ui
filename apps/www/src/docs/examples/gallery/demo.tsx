import { Gallery, type MediaSource } from "@vamos-ui/react/media";

const url = (id: string, w = 900) => `https://images.unsplash.com/${id}?w=${w}&q=78&auto=format&fit=crop`;

const photos: MediaSource[] = [
  { id: "k1", src: url("photo-1517248135467-4c7edcad34c4", 1600), width: 1600, height: 1067, alt: "Dining room with pendant lights and wooden tables", caption: "Main dining room" },
  { id: "k2", src: url("photo-1414235077428-338989a2e8c0", 1600), width: 1600, height: 1067, alt: "Sea bass with fennel and lemon on a dark plate", caption: "Sea bass, fennel, lemon" },
  { id: "k3", src: url("photo-1504674900247-0877df9cc836", 1600), width: 1600, height: 1067, alt: "Brunch spread with eggs and fresh bread", caption: "Sunday brunch" },
  { id: "k4", src: url("photo-1540189549336-e6e99c3679fe", 1600), width: 1600, height: 1067, alt: "Bowl of grilled vegetables and herbs", caption: "Garden bowl" },
  { id: "k5", src: url("photo-1565299624946-b28f40a0ae38", 1600), width: 1600, height: 1067, alt: "Wood-fired pizza with basil", caption: "Wood oven, Friday nights" },
  { id: "k6", src: url("photo-1555396273-367ea4eb4db5", 1600), width: 1600, height: 1067, alt: "Terrace tables under string lights", caption: "The terrace" },
];

export default function GalleryDemo() {
  return <Gallery items={photos} columns={{ base: 2, md: 3 }} lightbox label="Kalamış Bistro photos" className="w-full" />;
}

import { Gallery, type MediaSource } from "@vamos-ui/react/media";

const url = (id: string) => `https://images.unsplash.com/${id}?w=900&q=78&auto=format&fit=crop`;

const rooms: MediaSource[] = [
  { id: "c1", src: url("photo-1540555700478-4be289fbecef"), width: 900, height: 600, alt: "Marble hammam with warm light", caption: "Hammam · 75 min ritual" },
  { id: "c2", src: url("photo-1544161515-4ab6ce6db874"), width: 900, height: 600, alt: "Massage room with candles", caption: "Massage suite for two" },
  { id: "c3", src: url("photo-1524758631624-e2822e304c36"), width: 900, height: 600, alt: "Lounge with armchairs and plants", caption: "Tea lounge" },
];

export default function GalleryCaptions() {
  return (
    <div className="grid w-full gap-10">
      <Gallery items={rooms} columns={3} aspect="4/3" captions="below" label="Spa rooms with captions below" />
      <Gallery items={rooms} columns={3} aspect="4/5" captions="overlay" lightbox label="Spa rooms with overlay captions" />
    </div>
  );
}

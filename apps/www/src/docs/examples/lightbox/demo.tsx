import { Image } from "@vamos-cms/ui";
import { Lightbox, LightboxTrigger, type MediaSource } from "@vamos-cms/ui/media";

const url = (id: string, w: number) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

const ids = ["photo-1497366216548-37526070297c", "photo-1497366811353-6870744d04b2", "photo-1524758631624-e2822e304c36", "photo-1556761175-b413da4baf72"];

const photos: MediaSource[] = [
  { id: "o1", src: url(ids[0]!, 2000), width: 2000, height: 1333, alt: "Open-plan office with long desks", caption: "Second floor, open plan — 48 desks" },
  { id: "o2", src: url(ids[1]!, 2000), width: 2000, height: 1333, alt: "Reception with a wooden counter", caption: "Reception, Bağdat Avenue entrance" },
  { id: "o3", src: url(ids[2]!, 2000), width: 2000, height: 1333, alt: "Quiet room with armchairs", caption: "Quiet room — no calls, no meetings" },
  { id: "o4", src: url(ids[3]!, 2000), width: 2000, height: 1333, alt: "Team meeting around a table", caption: "Friday product review" },
];

export default function LightboxDemo() {
  return (
    <Lightbox items={photos} download>
      <div className="grid w-full grid-cols-[minmax(0,2fr)_minmax(0,1fr)] grid-rows-2 gap-2">
        {photos.slice(0, 3).map((p, i) => (
          <LightboxTrigger key={p.id} index={i} aria-label={`Enlarge image: ${p.alt}`} className={i === 0 ? "row-span-2 rounded-ui-lg" : "rounded-ui"}>
            <Image src={url(ids[i]!, 900)} alt="" width={900} height={600} aspect="4/3" rounded={i === 0 ? "ui-lg" : "ui"} className="h-full" />
          </LightboxTrigger>
        ))}
      </div>
      <p className="mt-3 text-[13px] text-fg-muted">Moda office · 4 photos · click to view, ← → to browse, + − to zoom</p>
    </Lightbox>
  );
}

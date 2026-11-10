import { Image } from "@vamos-ui/react";
import { Lightbox, LightboxTrigger, type MediaAsset } from "@vamos-ui/react/media";

// Media library preview: assets carry file details for the info panel (toggle with the ⓘ button).
const assets: MediaAsset[] = [
  {
    id: "m_1042",
    kind: "image",
    mime: "image/jpeg",
    filename: "q4-offsite-group-photo.jpg",
    size: 3_284_112,
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=2000&q=82&auto=format&fit=crop",
    width: 4000,
    height: 2667,
    alt: "Eight people from the product team gathered around laptops",
    caption: "Q4 offsite, Şile",
    description: "Use for the careers page and LinkedIn posts. Faces cleared with everyone pictured.",
    createdAt: "2026-10-18T14:22:00Z",
    uploadedBy: { id: "u_7", name: "Elif Demir" },
  },
  {
    id: "m_1043",
    kind: "image",
    mime: "image/png",
    filename: "dashboard-dark-hero.png",
    size: 1_102_448,
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=2000&q=82&auto=format&fit=crop",
    width: 2880,
    height: 1800,
    alt: "",
    createdAt: "2026-11-02T09:05:00Z",
    uploadedBy: { id: "u_3", name: "Kerem Aydın" },
  },
];

export default function LightboxInfoPanel() {
  return (
    <Lightbox items={assets} info download>
      <div className="grid w-full max-w-lg grid-cols-2 gap-3">
        {assets.map((a, i) => (
          <LightboxTrigger key={a.id} index={i} aria-label={`Preview ${a.filename}`} className="rounded-ui">
            <Image src={a} alt="" aspect="4/3" rounded="ui" frame="surface" sizes="16rem" />
            <span className="mt-1.5 block truncate text-start text-[12.5px] text-fg-muted">{a.filename}</span>
          </LightboxTrigger>
        ))}
      </div>
    </Lightbox>
  );
}

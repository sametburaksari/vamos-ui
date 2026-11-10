import { Image } from "@vamos-cms/ui";

const src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop";
const ratios = ["1/1", "4/5", "4/3", "3/2", "16/9", "1.91/1"] as const;

export default function ImageAspect() {
  return (
    <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
      {ratios.map((r) => (
        <figure key={r} className="m-0">
          <Image src={src} alt="Dining room of Kalamış Bistro at lunch" width={1200} height={800} aspect={r} rounded="ui" sizes="(min-width: 640px) 33vw, 50vw" />
          <figcaption className="tabular mt-2 text-[12px] text-fg-muted">{r.replace("/", ":")}</figcaption>
        </figure>
      ))}
    </div>
  );
}

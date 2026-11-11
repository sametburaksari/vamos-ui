import { AspectRatio, PlaceholderArt } from "@vamos-ui/react";

const ratios = ["1/1", "4/5", "4/3", "16/9", "21/9"] as const;

// The width follows the container; the height follows the ratio.
export default function AspectRatioRatios() {
  return (
    <div className="grid w-full grid-cols-2 items-start gap-4 md:grid-cols-5">
      {ratios.map((r) => (
        <figure key={r} className="m-0 flex flex-col gap-2">
          <AspectRatio ratio={r} rounded="ui">
            <PlaceholderArt seed={`ratio-${r}`} icon={false} />
          </AspectRatio>
          <figcaption className="font-mono text-[11px] tracking-wide text-fg-subtle">{r}</figcaption>
        </figure>
      ))}
    </div>
  );
}

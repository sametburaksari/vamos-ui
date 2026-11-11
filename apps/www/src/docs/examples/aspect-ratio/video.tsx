import { AspectRatio, Badge } from "@vamos-ui/react";

// A course page: the player keeps 16:9 at every width, the overlay sits on top.
export default function AspectRatioVideo() {
  return (
    <div className="w-full max-w-xl">
      <AspectRatio ratio="16/9" rounded="ui-lg" tone="inset">
        <video controls preload="none" aria-label="Lesson 3: Pricing your first workshop">
          <track kind="captions" srcLang="en" label="English" />
        </video>
      </AspectRatio>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-fg">Lesson 3 · Pricing your first workshop</span>
        <Badge>18 min</Badge>
      </div>
    </div>
  );
}

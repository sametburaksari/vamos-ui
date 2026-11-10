import { BackgroundVideo } from "@vamos-cms/ui/media";
import { Button } from "@vamos-cms/ui";

// Decorative, muted and looping, with a visible pause button. Reduced motion shows the poster only.
export default function VideoPlayerBackground() {
  return (
    <BackgroundVideo
      className="dark w-full rounded-ui-lg"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      poster="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1280&q=75&auto=format&fit=crop"
    >
      <div className="flex min-h-80 flex-col justify-end bg-linear-to-t from-scene/90 via-scene/40 to-transparent p-8">
        <p className="text-[11px] font-medium tracking-[0.14em] text-fg-muted uppercase">Kalamış Bistro</p>
        <h3 className="mt-2 max-w-md font-display text-4xl leading-[1.02] text-balance text-fg">
          The courtyard opens, <em>every</em> evening from six
        </h3>
        <div className="mt-5">
          <Button variant="primary">Reserve a table</Button>
        </div>
      </div>
    </BackgroundVideo>
  );
}

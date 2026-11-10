import { VideoPlayer } from "@vamos-ui/react/media";

export default function VideoPlayerDemo() {
  return (
    <div className="w-full max-w-2xl">
      <VideoPlayer
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
        poster="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1280&q=75&auto=format&fit=crop"
        title="Spring in the courtyard garden (CC0 sample)"
        aspect="16/9"
      />
      <p className="mt-3 text-[13px] text-fg-muted">Space or K to play · ← → seek 5 s · ↑ ↓ volume · M mute · F full screen</p>
    </div>
  );
}

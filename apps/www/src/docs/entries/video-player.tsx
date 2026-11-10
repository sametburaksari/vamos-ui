import { ex, type DocEntry } from "../types";
import VideoPlayerDemo from "../examples/video-player/demo";
import VideoPlayerCaptions from "../examples/video-player/captions";
import VideoPlayerYoutubeLite from "../examples/video-player/youtube-lite";
import VideoPlayerBackground from "../examples/video-player/background";
import VideoPlayerHls from "../examples/video-player/hls";

const entry: DocEntry = {
  slug: "video-player",
  title: "Video player",
  group: "Media",
  description:
    "Consistent controls for self-hosted video (play, seek, time, volume, captions, speed, picture-in-picture, full screen) with full keyboard support; a privacy-friendly lite embed for YouTube and Vimeo; and a decorative background video with a pause button. HLS loads hls.js only when it is needed.",
  source: ["media/video-player.tsx"],
  basedOn: "Native <video> · hls.js (optional, lazy)",
  usage: `import { VideoPlayer, VideoEmbed } from "@vamos-cms/ui/media";

<VideoPlayer src="/media/onboarding.mp4" poster="/media/onboarding.jpg" title="Onboarding: your first week" />
<VideoEmbed provider="youtube" id="aqz-KE-bpKQ" title="Product tour" />`,
  demo: ex("demo", "Demo", "video-player/demo.tsx", VideoPlayerDemo),
  examples: [
    ex("captions", "Captions and subtitles (HR training)", "video-player/captions.tsx", VideoPlayerCaptions, "WebVTT tracks; C toggles captions. chrome=\"bar\" keeps the controls visible."),
    ex("youtube-lite", "YouTube / Vimeo lite embed", "video-player/youtube-lite.tsx", VideoPlayerYoutubeLite, "A poster and a play button until clicked, then a youtube-nocookie.com (or Vimeo dnt=1) iframe. No third-party request before consent."),
    ex("background", "Background video (website hero)", "video-player/background.tsx", VideoPlayerBackground, "Muted, looping, aria-hidden, with a visible pause button (WCAG 2.2.2). Reduced motion shows the poster only."),
    ex("hls", "HLS stream", "video-player/hls.tsx", VideoPlayerHls, "Pass hls={() => import(\"hls.js\")}; Safari plays HLS natively and never loads it."),
  ],
  api: [
    { name: "VideoPlayer", props: [
      { name: "src", type: 'string | MediaAsset | { url; type: "mp4" | "webm" | "hls" }[]', description: "One file, an asset, or several sources. .m3u8 is detected as HLS." },
      { name: "poster", type: "string | MediaAsset", description: "Shown before playback." },
      { name: "title", type: "string", description: "Accessible name (\"Video player: {title}\") and the play button label." },
      { name: "aspect", type: "ImageAspect", default: "asset ratio, else 16/9", description: "Box ratio." },
      { name: "tracks", type: "{ src; lang; label; kind?; default? }[]", description: "WebVTT captions / subtitles." },
      { name: "controls", type: '"custom" | "native" | "none"', default: '"custom"', description: "Kit controls, browser controls, or none." },
      { name: "chrome", type: '"overlay" | "bar"', default: '"overlay"', description: "overlay hides while playing and idle; bar stays visible." },
      { name: "rounded", type: '"none" | "ui" | "ui-lg"', default: '"ui"', description: "Corners." },
      { name: "autoPlay / muted / loop / playsInline", type: "boolean", default: "false / false / false / true", description: "Native flags. autoPlay is ignored under reduced motion." },
      { name: "preload", type: '"none" | "metadata" | "auto"', default: '"metadata"', description: "Native preload." },
      { name: "hls", type: "() => Promise<{ default: Hls }>", description: "Lazy hls.js loader for browsers without native HLS." },
      { name: "onEnded / onTimeUpdate", type: "() => void / (t: number) => void", description: "Playback callbacks." },
      { name: "videoRef", type: "Ref<HTMLVideoElement>", description: "The underlying element." },
      { name: "labels", type: "Partial<VideoPlayerLabels>", description: "play, pause, seek, mute, captionsOn, speed… (dictionary namespace videoPlayer)." },
    ] },
    { name: "VideoEmbed", props: [
      { name: "provider", type: '"youtube" | "vimeo"', description: "Where the video lives." },
      { name: "id", type: "string", description: "Video id." },
      { name: "title", type: "string", description: "Required: names the play button and the iframe." },
      { name: "poster", type: "string", default: "YouTube thumbnail", description: "Facade image (needed for Vimeo)." },
      { name: "start", type: "number", description: "Start at this second." },
      { name: "aspect / rounded", type: "ImageAspect / string", default: '"16/9" / "ui"', description: "Box." },
    ] },
    { name: "BackgroundVideo", props: [
      { name: "src", type: "string | { url; type }[]", description: "Muted, looping source." },
      { name: "poster", type: "string", description: "Required: first frame, and the only image under reduced motion." },
      { name: "children", type: "ReactNode", description: "Content on top." },
    ] },
  ],
  notes: [
    "Keys (focus inside the player): Space / K play, ← → 5 s, ↑ ↓ volume, M mute, C captions, F full screen.",
    "The chrome is always dark: video content is treated as dark in every theme. Progress uses --accent. The seek bar stays left-to-right in RTL.",
  ],
  covers: ["Video player"],
};

export default entry;

import { VideoPlaylist, type VideoPlaylistItem } from "@vamos-ui/react/media";

const videos: VideoPlaylistItem[] = [
  { id: "bunny", title: "Big Buck Bunny (open movie)", description: "Blender Foundation · 2008", provider: "youtube", videoId: "aqz-KE-bpKQ", duration: 635 },
  {
    id: "vimeo",
    title: "Player walkthrough",
    description: "Hosted on Vimeo, loads on click",
    provider: "vimeo",
    videoId: "76979871",
    poster: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=960&q=75&auto=format&fit=crop",
    duration: 62,
  },
  {
    id: "garden",
    title: "Spring in the courtyard garden",
    description: "Self-hosted MP4 (CC0 sample)",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    poster: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1280&q=75&auto=format&fit=crop",
    duration: 6,
  },
];

/** Nothing loads from YouTube or Vimeo until play is pressed; the list swaps the video in the player. */
export default function VideoPlaylistDemo() {
  return <VideoPlaylist layout="side" items={videos} className="w-full" />;
}

import { ex, type DocEntry } from "../types";
import VideoPlaylistDemo from "../examples/video-playlist/demo";
import VideoPlaylistBelow from "../examples/video-playlist/below";

const entry: DocEntry = {
  slug: "video-playlist",
  title: "Video playlist",
  group: "Media",
  description:
    "One player and a list that swaps which video sits in it: trailers, talks, sessions, a channel's latest uploads. YouTube and Vimeo stay behind the privacy-friendly lite embed until the visitor presses play; self-hosted files use the kit's video player. The list sits under the player or beside it on wide containers.",
  source: ["media/video-playlist.tsx"],
  basedOn: "VideoEmbed · VideoPlayer",
  usage: `import { VideoPlaylist } from "@vamos-ui/react/media";

<VideoPlaylist layout="side" items={[
  { id: "trailer", title: "Launch trailer", provider: "youtube", videoId: "aqz-KE-bpKQ", duration: 74 },
  { id: "walkthrough", title: "Walkthrough", src: "/media/walkthrough.mp4", poster: "/media/walkthrough.jpg" },
]} />`,
  demo: ex("demo", "Demo", "video-playlist/demo.tsx", VideoPlaylistDemo),
  examples: [
    ex("below", "List below, controlled, play on select", "video-playlist/below.tsx", VideoPlaylistBelow, "value / onValueChange from outside; playOnSelect starts a self-hosted file once picked (embeds always wait for a click)."),
  ],
  api: [
    { name: "VideoPlaylist", props: [
      { name: "items", type: "VideoPlaylistItem[]", description: "{ id, title, description?, duration? (s or text), thumbnail? } plus either { provider: \"youtube\" | \"vimeo\", videoId, poster?, start? } or { src, poster?, tracks? }." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Selected video id (default: the first)." },
      { name: "layout", type: '"below" | "side"', default: '"below"', description: "List under the player, or beside it when the container is wide." },
      { name: "aspect", type: "ImageAspect", default: '"16/9"', description: "Player aspect ratio." },
      { name: "showDetails", type: "boolean", default: "true", description: "Title and description of the selected video under the player." },
      { name: "headingLevel", type: "2 | 3 | 4", default: "3", description: "Level of that title." },
      { name: "numbered", type: "boolean", default: "true", description: "01, 02 … before each row." },
      { name: "playOnSelect", type: "boolean", description: "Start a self-hosted video as soon as it is picked." },
      { name: "labels", type: "Partial<VideoPlaylistLabels>", description: 'Dictionary namespace "videoPlaylist": list, nowShowing, duration.' },
      { name: "playerLabels", type: "Partial<VideoPlayerLabels>", description: "Passed to the player / embed." },
    ] },
  ],
  notes: [
    "The list is an ordered list of buttons; the selected one has aria-current. Picking another video announces \"Now showing: …\" and keeps focus in the list.",
    "Nothing is requested from YouTube or Vimeo until play is pressed, not even after switching; YouTube rows use the video's thumbnail unless you pass one.",
  ],
  covers: [],
};

export default entry;

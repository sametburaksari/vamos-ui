import { VideoEmbed } from "@vamos-cms/ui/media";

// No request to YouTube until the visitor clicks play; then a youtube-nocookie.com iframe loads.
export default function VideoPlayerYoutubeLite() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <VideoEmbed provider="youtube" id="aqz-KE-bpKQ" title="Big Buck Bunny 60fps 4K — Official Blender Foundation Short Film" />
      <VideoEmbed
        provider="vimeo"
        id="76979871"
        title="The New Vimeo Player (you'll only see it after you click)"
        poster="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=960&q=75&auto=format&fit=crop"
      />
    </div>
  );
}

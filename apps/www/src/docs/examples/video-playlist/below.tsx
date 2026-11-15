"use client";

import * as React from "react";
import { VideoPlaylist, type VideoPlaylistItem } from "@vamos-ui/react/media";

const poster = "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1280&q=75&auto=format&fit=crop";
const src = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

const sessions: VideoPlaylistItem[] = [
  { id: "s1", title: "Session 1: Getting started", description: "Room A · 24 min", src, poster, duration: 1440 },
  { id: "s2", title: "Session 2: Working in teams", description: "Room B · 31 min", src, poster, duration: 1860 },
  { id: "s3", title: "Session 3: Questions from the floor", description: "Main hall · 18 min", src, poster, duration: 1080 },
];

/** List under the player, controlled from outside, and self-hosted files start playing once picked. */
export default function VideoPlaylistBelow() {
  const [id, setId] = React.useState("s1");
  return (
    <div className="grid w-full max-w-3xl gap-3">
      <VideoPlaylist items={sessions} value={id} onValueChange={setId} playOnSelect headingLevel={4} />
      <p className="m-0 text-small text-fg-muted">Selected: {id}</p>
    </div>
  );
}

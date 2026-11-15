"use client";

import { AudioPlayer } from "@vamos-ui/react";
import { useSampleAudio } from "./sample-audio";

const chapters = [
  { start: 0, title: "Welcome and this week's question" },
  { start: 74, title: "Packing a flat in one weekend" },
  { start: 161, title: "Listener notes: the new street" },
  { start: 268, title: "What we would do differently" },
];

export default function AudioPlayerDemo() {
  const src = useSampleAudio(330);
  return (
    <AudioPlayer
      key={src}
      src={src ?? []}
      title="Episode 12: Moving house"
      description="Small Rooms · 5 min 30 s"
      duration={330}
      chapters={chapters}
      transcriptHref="#transcript"
      download="#download"
      className="w-full max-w-lg"
    />
  );
}

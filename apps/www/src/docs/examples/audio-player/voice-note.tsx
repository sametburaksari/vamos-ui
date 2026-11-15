"use client";

import { AudioPlayer } from "@vamos-ui/react";
import { useSampleAudio } from "./sample-audio";

/** A short clip in a thread: no header, no speed button, smaller skips. */
export default function AudioPlayerVoiceNote() {
  const src = useSampleAudio(48);
  return <AudioPlayer key={src} src={src ?? []} duration={48} rates={[1]} skipBack={5} skipForward={10} mediaSession={false} aria-label="Voice note from Deniz, 0:48" className="w-full max-w-sm" />;
}

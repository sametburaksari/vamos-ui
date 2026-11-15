import { ex, type DocEntry } from "../types";
import AudioPlayerDemo from "../examples/audio-player/demo";
import AudioPlayerVoiceNote from "../examples/audio-player/voice-note";
import AudioPlayerLabelsExample from "../examples/audio-player/labels";

const entry: DocEntry = {
  slug: "audio-player",
  title: "Audio player",
  group: "Media",
  description:
    "A player for spoken audio — episodes, talks, lessons, voice notes. Play, a seek bar with chapter marks, skip back and forward, playback speed, and a chapter list that seeks and follows playback, with optional transcript and download links. It also hooks into the OS media controls.",
  source: ["components/audio-player.tsx"],
  basedOn: "HTML audio element, Media Session API",
  usage: `import { AudioPlayer } from "@vamos-ui/react";

<AudioPlayer
  src="/audio/episode-12.mp3"
  title="Episode 12: Moving house"
  duration={2710}
  chapters={[{ start: 0, title: "Welcome" }, { start: 312, title: "Packing" }]}
  transcriptHref="/episodes/12/transcript"
  download
/>`,
  demo: ex("demo", "Demo", "audio-player/demo.tsx", AudioPlayerDemo, "The docs use a silent generated file; pass your own URL."),
  examples: [
    ex("voice-note", "Voice note", "audio-player/voice-note.tsx", AudioPlayerVoiceNote, "No title or speed button (rates={[1]}), shorter skips, no media session."),
    ex("labels", "Translated labels", "audio-player/labels.tsx", AudioPlayerLabelsExample, 'Pass labels, or put them under "audioPlayer" in your LocaleProvider messages.'),
  ],
  api: [
    { name: "AudioPlayer", props: [
      { name: "src", type: "string | { url, type? }[]", description: "File URL or several sources." },
      { name: "title", type: "string", description: "Visible title; names the player and the media session." },
      { name: "description", type: "ReactNode", description: "Line under the title." },
      { name: "artwork", type: "string", description: "Cover image URL." },
      { name: "chapters", type: "{ start: number; title: string }[]", description: "Seconds from the start. Marks on the seek bar plus a list that seeks; the current one gets aria-current." },
      { name: "hideChapterList", type: "boolean", description: "Keep only the marks." },
      { name: "duration", type: "number", description: "Known length (s) before metadata loads and on the server." },
      { name: "skipBack / skipForward", type: "number", default: "15 / 30", description: "Seconds for the skip buttons and J / L." },
      { name: "rates", type: "number[]", default: "[1, 1.25, 1.5, 2]", description: "Speeds the speed button cycles. One value hides it." },
      { name: "transcriptHref", type: "string", description: "Transcript link." },
      { name: "download", type: "string | boolean", description: "Download link; true uses the source URL." },
      { name: "mediaSession", type: "boolean", default: "true", description: "Lock-screen / headset controls while playing; previous / next jump between chapters." },
      { name: "onTimeUpdate / onEnded / onChapterChange", type: "callbacks", description: "Playback events; onChapterChange gets the chapter index." },
      { name: "audioRef", type: "Ref<HTMLAudioElement>", description: "The audio element." },
      { name: "labels", type: "Partial<AudioPlayerLabels>", description: 'Dictionary namespace "audioPlayer".' },
    ] },
    { name: "chapterAt(chapters, time)", props: [
      { name: "returns", type: "number", description: "Index of the chapter at a time (-1 before the first)." },
    ] },
  ],
  notes: ["Keyboard anywhere in the player: Space / K play and pause, ← / → 5 s, J / L skip back / forward. The seek bar keeps its own arrow keys.", "Times use the locale's digits; the seek bar reads \"1:05 of 45:10\"."],
  covers: [],
};

export default entry;

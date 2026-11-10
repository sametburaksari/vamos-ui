import { VideoPlayer } from "@vamos-cms/ui/media";

// WebVTT files usually live next to the video. Inlined here so the example is self-contained.
const vtt = (cues: [string, string, string][]) =>
  `data:text/vtt;charset=utf-8,${encodeURIComponent(`WEBVTT\n\n${cues.map(([a, b, t]) => `${a} --> ${b}\n${t}`).join("\n\n")}`)}`;

const english = vtt([
  ["00:00:01.000", "00:00:04.000", "Welcome to Lena Spa. This is your first-week guide."],
  ["00:00:04.500", "00:00:08.000", "We'll start with the booking calendar and the front desk."],
  ["00:00:08.500", "00:00:12.000", "Then we'll walk through the treatment rooms."],
]);
const turkish = vtt([
  ["00:00:01.000", "00:00:04.000", "Lena Spa'ya hoş geldiniz. İlk hafta rehberiniz bu."],
  ["00:00:04.500", "00:00:08.000", "Önce rezervasyon takvimi ve resepsiyonla başlıyoruz."],
  ["00:00:08.500", "00:00:12.000", "Sonra bakım odalarını birlikte geziyoruz."],
]);

export default function VideoPlayerCaptions() {
  return (
    <VideoPlayer
      className="w-full max-w-2xl"
      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
      poster="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1280&q=75&auto=format&fit=crop"
      title="Onboarding: your first week"
      tracks={[
        { src: english, lang: "en", label: "English", kind: "captions", default: true },
        { src: turkish, lang: "tr", label: "Türkçe", kind: "subtitles" },
      ]}
      chrome="bar"
    />
  );
}

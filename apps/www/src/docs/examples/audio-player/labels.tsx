"use client";

import { AudioPlayer } from "@vamos-ui/react";
import { useSampleAudio } from "./sample-audio";

const tr = {
  player: "Ses oynatıcı",
  play: "Oynat",
  pause: "Duraklat",
  seek: "Konum",
  time: "{current} / {duration}",
  skipBack: "{seconds} saniye geri",
  skipForward: "{seconds} saniye ileri",
  speed: "Oynatma hızı {rate}×, değiştir",
  chapters: "Bölümler",
  chapterOf: "Bölüm {index} / {count}",
  transcript: "Döküm",
  download: "İndir",
};

export default function AudioPlayerLabelsExample() {
  const src = useSampleAudio(200);
  return (
    <AudioPlayer
      key={src}
      src={src ?? []}
      title="Ders 3: Kesirler"
      duration={200}
      chapters={[
        { start: 0, title: "Giriş" },
        { start: 90, title: "Payda eşitleme" },
      ]}
      labels={tr}
      className="w-full max-w-lg"
    />
  );
}

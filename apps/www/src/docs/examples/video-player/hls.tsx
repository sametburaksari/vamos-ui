"use client";

import { VideoPlayer, type HlsConstructor } from "@vamos-ui/react/media";

// In your app:  hls={() => import("hls.js")}  — the library loads only for HLS sources, only in
// browsers without native HLS (Safari plays it directly). Here it comes from a CDN instead.
function loadHlsFromCdn(): Promise<{ default: HlsConstructor }> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { Hls?: HlsConstructor };
    if (w.Hls) return resolve({ default: w.Hls });
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
    s.onload = () => (w.Hls ? resolve({ default: w.Hls }) : reject(new Error("hls.js failed to load")));
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function VideoPlayerHls() {
  return (
    <VideoPlayer
      className="w-full max-w-2xl"
      src={[{ url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", type: "hls" }]}
      poster="https://i.ytimg.com/vi/aqz-KE-bpKQ/maxresdefault.jpg"
      title="Big Buck Bunny — adaptive HLS stream"
      aspect="16/9"
      hls={loadHlsFromCdn}
    />
  );
}

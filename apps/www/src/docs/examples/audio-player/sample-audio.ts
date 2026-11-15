"use client";

import * as React from "react";

/**
 * Docs-only stand-in for a real episode file: a silent WAV of `seconds`, made in the browser
 * (no binary in the repo, no third-party request). In your app pass the file URL instead.
 */
export function useSampleAudio(seconds: number): string | undefined {
  const [url, setUrl] = React.useState<string>();
  React.useEffect(() => {
    const rate = 4000;
    const samples = rate * seconds;
    const buf = new ArrayBuffer(44 + samples);
    const v = new DataView(buf);
    const str = (o: number, s: string) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    str(0, "RIFF");
    v.setUint32(4, 36 + samples, true);
    str(8, "WAVEfmt ");
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); // PCM
    v.setUint16(22, 1, true); // mono
    v.setUint32(24, rate, true);
    v.setUint32(28, rate, true);
    v.setUint16(32, 1, true);
    v.setUint16(34, 8, true); // 8-bit
    str(36, "data");
    v.setUint32(40, samples, true);
    new Uint8Array(buf, 44).fill(128); // silence
    const u = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [seconds]);
  return url;
}

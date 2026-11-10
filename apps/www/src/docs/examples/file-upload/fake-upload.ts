import type { UploadHandler } from "@vamos-ui/react";

/** Simulated upload with progress — swap for your S3 / API call. */
export const fakeUpload: UploadHandler = (file, { signal, onProgress }) =>
  new Promise((resolve, reject) => {
    let pct = 0;
    const timer = setInterval(() => {
      pct = Math.min(100, pct + 6 + Math.random() * 14);
      onProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        if (/fail/i.test(file.name)) reject(new Error("The server rejected this file"));
        else resolve({ id: crypto.randomUUID() });
      }
    }, 180);
    signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(signal.reason);
    });
  });

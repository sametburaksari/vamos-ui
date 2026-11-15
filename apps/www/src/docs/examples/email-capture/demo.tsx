"use client";

import { EmailCapture } from "@vamos-ui/react";

export default function EmailCaptureDemo() {
  return (
    <div className="w-full max-w-xl">
      <EmailCapture
        hint="One letter every other Sunday. Unsubscribe in one click."
        privacyLink={{ href: "#privacy" }}
        onSubmit={() => new Promise((resolve) => setTimeout(resolve, 700))}
      />
    </div>
  );
}

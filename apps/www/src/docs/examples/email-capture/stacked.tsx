"use client";

import { EmailCapture } from "@vamos-ui/react";

export default function EmailCaptureStacked() {
  return (
    <div className="w-full max-w-sm rounded-ui-lg border border-line bg-surface p-5">
      <h3 className="m-0 text-base font-semibold text-fg">Get the next issue</h3>
      <p className="m-0 mt-1 mb-4 text-sm text-fg-muted">New essays on small-scale gardening, once a month.</p>
      <EmailCapture
        layout="stacked"
        hideLabel
        submitLabel="Sign me up"
        privacyCheckbox
        privacyLink={{ href: "#privacy", version: "2026-01" }}
        successMessage="Almost done — confirm the link we just sent you."
        onSubmit={() => new Promise((resolve) => setTimeout(resolve, 700))}
      />
    </div>
  );
}

"use client";

import { Button, toast, Toaster } from "@vamos-cms/ui";

export default function ToastDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {/* Mount one Toaster near the app root (App shell already does). Extra ones render nothing. */}
      <Toaster />
      <Button onClick={() => toast("Draft saved", { description: "Autosaved at 10:42." })}>Neutral</Button>
      <Button onClick={() => toast.success("Leave approved", { description: "Elif Demir · Dec 22 – Dec 31" })}>Success</Button>
      <Button onClick={() => toast.info("New version available", { description: "Reload to get Vamos CMS 4.12." })}>Info</Button>
      <Button onClick={() => toast.warning("Storage almost full", { description: "9.2 of 10 GB used on the media library." })}>Warning</Button>
      <Button onClick={() => toast.danger("Couldn't sync the calendar", { description: "Google returned 503. We'll retry in 5 minutes." })}>Danger</Button>
    </div>
  );
}

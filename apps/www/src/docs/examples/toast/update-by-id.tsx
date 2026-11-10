"use client";

import { Button, toast, Toaster } from "@vamos-ui/react";

export default function ToastUpdateById() {
  const exportContacts = () => {
    const id = toast.loading("Preparing export…", { description: "0 of 5,000 contacts" });
    let done = 0;
    const timer = setInterval(() => {
      done += 1250;
      if (done < 5000) {
        // Same id → the toast updates in place.
        toast.loading("Preparing export…", { id, description: `${done.toLocaleString("en-US")} of 5,000 contacts` });
        return;
      }
      clearInterval(timer);
      toast.success("Export ready", {
        id,
        description: "contacts-2026-11-10.csv · 412 KB",
        action: { label: "Download", onClick: () => {} },
      });
    }, 700);
  };

  return (
    <>
      <Toaster />
      <Button onClick={exportContacts}>Export 5,000 contacts</Button>
    </>
  );
}

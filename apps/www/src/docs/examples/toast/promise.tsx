"use client";

import { Button, toast, Toaster } from "@vamos-ui/react";

function savePost(fail: boolean) {
  return new Promise<{ title: string }>((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error("Network timeout")) : resolve({ title: "Q4 newsletter" })), 1600),
  );
}

export default function ToastPromise() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Toaster />
      <Button
        variant="primary"
        onClick={() =>
          toast
            .promise(savePost(false), {
              loading: "Publishing…",
              success: (post) => `“${post.title}” is live`,
              error: "Couldn't publish",
            })
            .catch(() => {})
        }
      >
        Publish
      </Button>
      <Button
        onClick={() =>
          toast
            .promise(savePost(true), {
              loading: "Publishing…",
              success: "Published",
              error: (e) => `Couldn't publish — ${(e as Error).message}`,
            })
            .catch(() => {})
        }
      >
        Publish (fails)
      </Button>
    </div>
  );
}

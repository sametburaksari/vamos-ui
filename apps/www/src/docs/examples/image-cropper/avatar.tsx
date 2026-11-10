"use client";

import * as React from "react";
import { ImageCropper } from "@vamos-ui/react/media";

// HR profile photo: round mask, fixed 1:1, no rotate / flip.
export default function ImageCropperAvatar() {
  return (
    <ImageCropper
      className="w-full max-w-sm"
      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80&auto=format&fit=crop"
      shape="round"
      transform={false}
      grid={false}
      height="18rem"
      labels={{ avatar: "Profile photo" }}
    />
  );
}

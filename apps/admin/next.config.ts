import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@vamos-ui/react"],
  images: { remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }] },
};

export default config;

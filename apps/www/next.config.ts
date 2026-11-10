import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a fully static site (out/) for ui.vamos.ist — see scripts/deploy-www.sh.
const isExport = process.env.STATIC_EXPORT === "1";

const config: NextConfig = {
  transpilePackages: ["@vamos-cms/ui"],
  ...(isExport ? { output: "export" as const, trailingSlash: true, images: { unoptimized: true } } : {}),
};

export default config;

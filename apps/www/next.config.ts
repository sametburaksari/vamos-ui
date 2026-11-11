import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a fully static site (out/) for ui.vamos.ist — see scripts/deploy-www.sh.
const isExport = process.env.STATIC_EXPORT === "1";

const config: NextConfig = {
  transpilePackages: ["@vamos-ui/react"],
  // The kit root is a barrel of ~150 client modules; without this every admin preview that
  // imports one Card from "@vamos-ui/react" ships all of them.
  experimental: { optimizePackageImports: ["@vamos-ui/react"] },
  // 143 docs pages with heavy examples: the 60s default fails on a busy build machine.
  staticPageGenerationTimeout: 300,
  ...(isExport ? { output: "export" as const, trailingSlash: true, images: { unoptimized: true } } : {}),
  webpack(config) {
    // react-resizable-panels 4.21 reads `React.Activity` behind a runtime check (React >= 19.2,
    // falls back otherwise). On React 19.1 webpack's strict export check turns that namespace
    // access into a production build error ("'Activity' is not exported from 'react'").
    // Downgrade missing-export checks to warnings; remove once the apps are on React >= 19.2.
    config.module.strictExportPresence = false;
    config.module.parser = {
      ...config.module.parser,
      javascript: { ...config.module.parser?.javascript, exportsPresence: "warn" },
    };
    return config;
  },
};

export default config;

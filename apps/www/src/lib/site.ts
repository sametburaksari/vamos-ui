export const site = {
  name: "Vamos UI",
  version: "0.1.0",
  github: "https://github.com/sametburaksari/vamos-ui",
  adminDemo: process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3100",
};

export const mainNav = [
  { label: "Docs", href: "/docs" },
  { label: "Components", href: "/docs/components" },
  { label: "Blocks", href: "/blocks" },
  { label: "Websites", href: "/websites" },
  { label: "Charts", href: "/charts" },
  { label: "Directory", href: "/directory" },
  { label: "Changelog", href: "/docs/changelog" },
];

/** "Sections" in the docs sidebar, above the component list. */
export const docSections = [
  { label: "Introduction", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
  { label: "Theming", href: "/docs/theming" },
  { label: "Localization", href: "/docs/localization" },
  { label: "CLI & registry", href: "/docs/cli" },
  { label: "Blocks", href: "/blocks" },
  { label: "Websites", href: "/websites" },
  { label: "Directory", href: "/directory" },
  { label: "License", href: "/docs/license" },
  { label: "Changelog", href: "/docs/changelog" },
];

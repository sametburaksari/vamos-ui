import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Changelog website",
  description: "Release notes for a webhooks API: a narrow editorial column with a sticky date rail beside every release, feature / improvement / fix filters, email + RSS subscribe, and each release as an article with older / newer links. EN / TR.",
  category: "Website pages",
  order: 51,
  tags: ["site"],
  files: [
    "site-changelog-01/page.tsx",
    "site-changelog-01/components/changelog-site.tsx",
    "site-changelog-01/components/release-list.tsx",
    "site-changelog-01/components/entry-page.tsx",
    "site-changelog-01/components/subscribe.tsx",
    "site-changelog-01/components/changelog-provider.tsx",
    "site-changelog-01/components/content.ts",
  ],
};

export default meta;

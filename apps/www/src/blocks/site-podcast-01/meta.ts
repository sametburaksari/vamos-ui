import type { BlockMeta } from "../types";

const meta: BlockMeta = {
  title: "Podcast website",
  description: "A food-culture podcast: the latest episode in a player with chapter markers, a waveform scrubber and a live caption, a searchable archive with topic filter, hosts, follow links and a guest suggestion form; an episode page whose transcript follows playback, plus notes, recipes and credits. Dark, glass. EN / TR.",
  category: "Website pages",
  order: 62,
  tags: ["site"],
  files: [
    "site-podcast-01/page.tsx",
    "site-podcast-01/components/podcast-site.tsx",
    "site-podcast-01/components/player.tsx",
    "site-podcast-01/components/episode-page.tsx",
    "site-podcast-01/components/episode-list.tsx",
    "site-podcast-01/components/listen-links.tsx",
    "site-podcast-01/components/guest-form.tsx",
    "site-podcast-01/components/content.ts",
  ],
};

export default meta;

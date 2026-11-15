import { ex, type DocEntry } from "../types";
import SubscribeLinksDemo from "../examples/subscribe-links/demo";
import SubscribeLinksList from "../examples/subscribe-links/list";
import SubscribeLinksFeedOnly from "../examples/subscribe-links/feed-only";

const entry: DocEntry = {
  slug: "subscribe-links",
  title: "Subscribe links",
  group: "Navigation",
  description:
    "\"Listen on / follow on\" links for a podcast, a channel, a blog or a changelog: the platforms you pass, with your own icons (no logos are bundled), plus a Copy RSS feed button and the feed address for people who paste it into an app. Buttons in a row, or a list with one line per channel.",
  source: ["components/subscribe-links.tsx"],
  usage: `import { SubscribeLinks } from "@vamos-ui/react";

<SubscribeLinks
  title="Listen on"
  feedUrl="https://example.com/feed.xml"
  links={[
    { label: "Your podcast app", href: "podcast://example.com/feed.xml" },
    { label: "Episodes by email", href: "/subscribe" },
  ]}
/>`,
  demo: ex("demo", "Buttons with a feed", "subscribe-links/demo.tsx", SubscribeLinksDemo, "The first link is primary unless one sets primary. External links open a new tab and say so to screen readers."),
  examples: [
    ex("list", "List with descriptions", "subscribe-links/list.tsx", SubscribeLinksList, "variant=\"list\": one row per channel, with a line on what people get there."),
    ex("feed-only", "Feed only", "subscribe-links/feed-only.tsx", SubscribeLinksFeedOnly, "An empty links array leaves just the copy button and address — a changelog or a blog."),
  ],
  api: [
    { name: "SubscribeLinks", props: [
      { name: "links", type: "{ label; href; icon?; description?; newTab?; primary? }[]", description: "Where people can follow, best first. newTab defaults to true for absolute http(s) links." },
      { name: "feedUrl", type: "string", description: "RSS / Atom feed: adds the copy button and the visible address." },
      { name: "showFeedUrl", type: "boolean", default: "true", description: "Show the address under the links." },
      { name: "variant", type: '"buttons" | "list"', default: '"buttons"', description: "A wrapping row of buttons, or rows with descriptions." },
      { name: "title / headingLevel", type: "ReactNode / 2 | 3 | 4", description: "Heading that names the group; without it the group is named \"Follow\"." },
      { name: "onCopyFeed", type: "(url: string) => void", description: "After the feed address was copied." },
      { name: "labels", type: "Partial<SubscribeLinksLabels>", description: 'Dictionary namespace "subscribeLinks" (en, tr, de, fr, es, ar built in).' },
    ] },
  ],
  notes: ["Platform names and logos are trademarks of their owners: pass text and, if you have the rights, your own icons.", "The copy result is announced in a status region; a failed copy shows a visible hint to select the address."],
  covers: [],
};

export default entry;

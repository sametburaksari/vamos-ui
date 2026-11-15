import { ex, type DocEntry } from "../types";
import TopicListDemo from "../examples/topic-list/demo";
import TopicListSorted from "../examples/topic-list/sorted";
import TopicListRows from "../examples/topic-list/rows";

const entry: DocEntry = {
  slug: "topic-list",
  title: "Topic list",
  group: "Data display",
  description:
    "Forum and discussion topics: each TopicRow has the title (the whole row is a link), category and tags, reply and view counts, and who posted last and when — with pinned, solved, locked and unread states. TopicList adds column heads on wide containers and an empty state; sorting, filtering and paging stay in the app.",
  source: ["components/topic-list.tsx"],
  usage: `import { TopicList, TopicRow } from "@vamos-ui/react";

<TopicList aria-label="Latest topics" topics={topics} />

<ul>
  <li><TopicRow title="Quiet fans for a compact case" href="/t/88" replies={7} views={402} lastPost={{ name: "Jonas Ek", at: post.createdAt }} /></li>
</ul>`,
  demo: ex("demo", "Latest topics", "topic-list/demo.tsx", TopicListDemo, "Column heads are for sighted readers only; every cell says its own words (\"23 replies\", \"Last post by …, 12 min. ago\")."),
  examples: [
    ex("sorted", "Sorting and an empty state", "topic-list/sorted.tsx", TopicListSorted, "The app sorts and filters; ToggleGroup drives it. empty replaces the list when nothing matches."),
    ex("rows", "TopicRow on its own", "topic-list/rows.tsx", TopicListRows, "In a narrow sidebar the row folds: counts at the end, last post underneath. tagHref turns tags into links."),
  ],
  api: [
    { name: "TopicList", props: [
      { name: "topics", type: "TopicListItem[]", description: "Rows: TopicRow props plus an id." },
      { name: "aria-label / aria-labelledby", type: "string", description: "Name of the list." },
      { name: "showHeader", type: "boolean", default: "true", description: "Column heads on wide containers." },
      { name: "empty", type: "ReactNode", default: '"No topics yet."', description: "Shown when topics is empty." },
      { name: "headingLevel", type: "2 | 3 | 4 | 5", default: "3", description: "Level of every title." },
      { name: "now", type: "number", description: "Fixed epoch ms for relative times (static pages, tests)." },
    ] },
    { name: "TopicRow", props: [
      { name: "title / href", type: "string", description: "The topic and its page; the link covers the row." },
      { name: "excerpt", type: "string", description: "One line of the first post (wider containers)." },
      { name: "category", type: "{ label; href? }", description: "Board or category." },
      { name: "tags / tagHref", type: "string[] / (tag) => string", description: "Shown as #tag; links with tagHref." },
      { name: "replies / views", type: "number", description: "Counts, compact on screen (1.8K), spoken in full." },
      { name: "lastPost", type: "{ name; src?; at }", description: "Avatar, name and relative time of the latest post." },
      { name: "pinned / solved / locked / unread", type: "boolean", description: "States: pin and lock icons, Solved and New badges." },
      { name: "labels", type: "Partial<TopicListLabels>", description: 'Dictionary namespace "topicList" (en, tr, de, fr, es, ar built in).' },
    ] },
  ],
  notes: ["Relative times render as a date on the server and switch to \"3 hr. ago\" after hydration unless now is passed.", "Category and tag links sit above the row link, so each stays its own tab stop."],
  covers: [],
};

export default entry;

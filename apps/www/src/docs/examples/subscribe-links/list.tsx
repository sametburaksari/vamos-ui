import { SubscribeLinks } from "@vamos-ui/react";
import { BookOpen, Mail, Rss } from "lucide-react";

export default function SubscribeLinksList() {
  return (
    <div className="w-full max-w-md">
      <SubscribeLinks
        variant="list"
        title="Follow the journal"
        feedUrl="https://example.com/journal/atom.xml"
        links={[
          { label: "Weekly email", href: "#subscribe", icon: <Mail />, description: "Every Friday, the week's posts in one letter" },
          { label: "Feed reader", href: "https://example.com/journal/atom.xml", icon: <Rss />, description: "Atom feed for any reader app" },
          { label: "Reading list", href: "#reading-list", icon: <BookOpen />, description: "Saved pieces, updated monthly" },
        ]}
      />
    </div>
  );
}

import { SubscribeLinks } from "@vamos-ui/react";
import { Headphones, Mail, Play } from "lucide-react";

export default function SubscribeLinksDemo() {
  return (
    <div className="w-full max-w-xl">
      <SubscribeLinks
        title="Listen on"
        feedUrl="https://example.com/podcast/feed.xml"
        links={[
          { label: "Your podcast app", href: "podcast://example.com/podcast/feed.xml", icon: <Headphones /> },
          { label: "Video channel", href: "https://video.example.com/c/sample-show", icon: <Play /> },
          { label: "Episodes by email", href: "#subscribe", icon: <Mail /> },
        ]}
      />
    </div>
  );
}

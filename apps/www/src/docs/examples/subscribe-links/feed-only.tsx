import { SubscribeLinks } from "@vamos-ui/react";

export default function SubscribeLinksFeedOnly() {
  return (
    <div className="w-full max-w-xl">
      <SubscribeLinks links={[]} feedUrl="https://example.com/changelog/rss.xml" labels={{ copyFeed: "Copy changelog feed" }} />
    </div>
  );
}

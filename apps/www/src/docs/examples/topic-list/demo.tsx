import { TopicList } from "@vamos-ui/react";
import { NOW, topics } from "./data";

export default function TopicListDemo() {
  return (
    <div className="w-full max-w-4xl">
      <TopicList aria-label="Latest topics" topics={topics} now={NOW} />
    </div>
  );
}

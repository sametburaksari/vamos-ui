"use client";

import Shell01 from "../shell-01/page";
import { PostsFirstRun } from "./components/posts-first-run";

/** First-run Posts page: no posts yet, inside the multi-app shell. */
export default function Empty01() {
  return (
    <Shell01 initialPath="/site/posts">
      <PostsFirstRun />
    </Shell01>
  );
}

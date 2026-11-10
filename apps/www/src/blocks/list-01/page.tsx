"use client";

import { Toaster } from "@vamos-ui/react";
import Shell01 from "../shell-01/page";
import { PostsList } from "./components/posts-list";

/** CMS posts index inside the multi-app shell. */
export default function List01() {
  return (
    <Shell01 initialPath="/site/posts">
      <PostsList />
      <Toaster />
    </Shell01>
  );
}

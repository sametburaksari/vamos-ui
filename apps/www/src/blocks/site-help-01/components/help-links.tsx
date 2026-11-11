"use client";

import * as React from "react";
import type { CategoryId } from "./content";
import { useHelp } from "./help-provider";

type AnchorProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const plainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/** A real link to an article (`?article=…`) that opens it inside the site. */
export function ArticleLink({ id, onClick, ...props }: AnchorProps & { id: string }) {
  const { openArticle } = useHelp();
  return (
    <a
      href={`?article=${id}`}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !plainClick(e)) return;
        e.preventDefault();
        openArticle(id);
      }}
      {...props}
    />
  );
}

/** A real link to a category (`?topic=…`) that opens it inside the site. */
export function CategoryLink({ id, onClick, ...props }: AnchorProps & { id: CategoryId }) {
  const { openCategory } = useHelp();
  return (
    <a
      href={`?topic=${id}`}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || !plainClick(e)) return;
        e.preventDefault();
        openCategory(id);
      }}
      {...props}
    />
  );
}

"use client";

import { NewsHeader, sitePageHref, useSiteShell, type NewsHeaderProps } from "@vamos-ui/react/blocks";

/**
 * The masthead with the current section marked. A real site passes its route as `currentPath`;
 * here the pages are SiteShell pages, so the current item follows the shell's page: the section
 * front and the story both belong to City.
 */
export function Masthead(props: Omit<NewsHeaderProps, "currentPath">) {
  const { page } = useSiteShell();
  const currentPath = page === "home" ? sitePageHref("home") : sitePageHref("category", "city");
  return <NewsHeader {...props} currentPath={currentPath} />;
}

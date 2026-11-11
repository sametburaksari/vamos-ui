"use client";

import * as React from "react";
import { useSiteShell } from "@vamos-ui/react/blocks";
import { articleById, categoryById, type CategoryId } from "./content";

interface HelpState {
  articleId: string;
  categoryId: CategoryId;
  openArticle: (id: string) => void;
  openCategory: (id: CategoryId) => void;
}

const HelpContext = React.createContext<HelpState | null>(null);

export function useHelp() {
  const ctx = React.useContext(HelpContext);
  if (!ctx) throw new Error("useHelp must be used inside <HelpProvider>.");
  return ctx;
}

const ARTICLE = "article";
const TOPIC = "topic";

/** Puts `?article=` / `?topic=` on the current history entry (after the shell has pushed it). State `null` lets the framework router pick the new URL up. */
function setParam(key: string, value: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState(null, "", url);
}

/**
 * Which article and category the inner pages show. Lives inside the SiteShell so it can
 * navigate; deep links (`?page=article&article=frost-date`, `?page=category&topic=soil`) and
 * back/forward are read from the URL.
 */
export function HelpProvider({ children }: { children: React.ReactNode }) {
  const { navigate, page } = useSiteShell();
  const [articleId, setArticleId] = React.useState("frost-date");
  const [categoryId, setCategoryId] = React.useState<CategoryId>("calendar");

  React.useEffect(() => {
    const read = (initial: boolean) => {
      const q = new URLSearchParams(window.location.search);
      const a = articleById(q.get(ARTICLE));
      const c = categoryById(q.get(TOPIC));
      if (a) setArticleId(a.id);
      if (c) setCategoryId(c.id);
      // A shared link without a page (`?article=frost-date`, `?topic=soil`) opens that page.
      if (initial && !q.get("page")) {
        if (a) navigate({ page: "article" });
        else if (c) navigate({ page: "category" });
      }
    };
    read(true);
    const onPop = () => read(false);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL tidy: only the param the current page needs.
  React.useEffect(() => {
    const url = new URL(window.location.href);
    const before = url.search;
    if (page !== "article") url.searchParams.delete(ARTICLE);
    if (page !== "category") url.searchParams.delete(TOPIC);
    if (url.search !== before) window.history.replaceState(null, "", url);
  }, [page]);

  const value = React.useMemo<HelpState>(
    () => ({
      articleId,
      categoryId,
      openArticle: (id) => {
        const a = articleById(id);
        if (!a) return;
        setArticleId(a.id);
        setCategoryId(a.category);
        if (page === "article") {
          // Same inner page, new article: the shell won't scroll, so do it here.
          window.history.pushState(null, "", window.location.href);
          document.querySelector("[data-site-shell]")?.scrollIntoView({ block: "start" });
          window.requestAnimationFrame(() => document.querySelector<HTMLElement>('[data-site-page="article"] h1')?.focus({ preventScroll: true }));
        } else navigate({ page: "article" });
        setParam(ARTICLE, a.id);
      },
      openCategory: (id) => {
        setCategoryId(id);
        if (page === "category") {
          window.history.pushState(null, "", window.location.href);
          document.querySelector("[data-site-shell]")?.scrollIntoView({ block: "start" });
        } else navigate({ page: "category" });
        setParam(TOPIC, id);
      },
    }),
    [articleId, categoryId, navigate, page],
  );
  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
}

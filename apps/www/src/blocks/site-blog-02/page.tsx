import { LocaleProvider } from "@vamos-ui/react";
import { SiteShellLocale } from "@vamos-ui/react/blocks";
import { tr } from "@vamos-ui/react/locale/tr";
import { BlogFrame } from "./components/blog-frame";
import { BlogSite } from "./components/blog-site";
import { blogPages } from "./components/content";

/**
 * Engineering blog, three pages: home (plain-text masthead beside the latest post shown as
 * code, the keyboard-first post index, topics and authors, subscribe), the article (code
 * samples in Go / Rust / TypeScript that switch language together, benchmark table, margin
 * contents) and the archive (by year, `/` filter, tag strip). System type, solid, compact,
 * amber accent; dark by default with a reader-controlled light mode. EN / TR.
 */
export default function SiteBlog02() {
  return (
    <BlogFrame pages={blogPages}>
      <SiteShellLocale code="en">
        <LocaleProvider locale="en-GB">
          <BlogSite locale="en" />
        </LocaleProvider>
      </SiteShellLocale>
      <SiteShellLocale code="tr">
        <LocaleProvider locale="tr-TR" messages={tr}>
          <BlogSite locale="tr" />
        </LocaleProvider>
      </SiteShellLocale>
    </BlogFrame>
  );
}

/**
 * Site-type groups for the "Website pages" filter on /websites. A site block's type is the middle
 * of its name (`site-store-01` → "store"); unknown types fall into "Other" until listed here.
 */
export const siteTypeGroups = [
  { id: "software", label: "Software & apps", types: ["saas"] },
  { id: "commerce", label: "Shops & commerce", types: ["store"] },
  { id: "business", label: "Business & B2B", types: ["agency", "estate"] },
  { id: "media", label: "News & publishing", types: ["news"] },
] as const;

/** Website pages that are not whole sites (a pricing page, a contact page). */
export const PAGE_GROUP = { id: "pages", label: "Single pages" } as const;
export const OTHER_SITE_GROUP = { id: "other", label: "Other sites" } as const;

/** `site-store-02` → "store"; `null` for names that are not site blocks. */
export function siteTypeOf(name: string): string | null {
  const m = /^site-(.+?)-\d+$/.exec(name);
  return m ? m[1]! : null;
}

/** The group id of a website block: a listed group, `"other"` for unlisted site types, `"pages"` for single pages. */
export function siteGroupOf(name: string): string {
  const type = siteTypeOf(name);
  if (!type) return PAGE_GROUP.id;
  return siteTypeGroups.find((g) => (g.types as readonly string[]).includes(type))?.id ?? OTHER_SITE_GROUP.id;
}

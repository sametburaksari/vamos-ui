import { filterNav, findNavItem, flattenNav, matchPath, navTrailItems, normaliseBadge, parseSidebarCookie, resolveActive, type NavNode } from "./nav";

const Icon = () => null;

const nav: NavNode[] = [
  { id: "dashboard", label: "Dashboard", href: "/site", icon: Icon },
  {
    type: "group",
    id: "content",
    label: "Content",
    items: [
      {
        id: "posts",
        label: "Posts",
        href: "/site/posts",
        icon: Icon,
        children: [
          { id: "posts.all", label: "All posts", href: "/site/posts" },
          { id: "posts.categories", label: "Categories", href: "/site/posts/categories" },
        ],
      },
      { id: "media", label: "Media", href: "/site/media", match: ["/site/uploads/*"], permission: "media.view" },
    ],
  },
  { type: "separator" },
  { type: "group", id: "labs", label: "Labs", items: [{ id: "ai", label: "AI writer", href: "/site/ai", feature: "ai" }] },
  { type: "separator" },
  {
    id: "settings",
    label: "Settings",
    children: [
      { id: "settings.general", label: "General", href: "/settings" },
      { id: "settings.email", label: "Email", children: [{ id: "settings.email.templates", label: "Templates", href: "/settings/email/templates" }] },
    ],
  },
];

describe("matchPath", () => {
  it("matches prefixes, exact root and child-only patterns", () => {
    expect(matchPath("/site", "/site/posts")).toBe(5);
    expect(matchPath("/", "/site")).toBe(-1);
    expect(matchPath("/", "/")).toBe(1);
    expect(matchPath("/site/posts", "/site/postsx")).toBe(-1);
    expect(matchPath("/site/uploads/*", "/site/uploads")).toBe(-1);
    expect(matchPath("/site/uploads/*", "/site/uploads/2026/a.png")).toBeGreaterThan(0);
    expect(matchPath("https://vamos.ist", "/")).toBe(-1);
  });
});

describe("resolveActive", () => {
  it("picks the longest prefix, so the dashboard is not active on a child page", () => {
    expect(resolveActive(nav, "/site/posts/categories").trail).toEqual(["posts", "posts.categories"]);
    expect(resolveActive(nav, "/site").trail).toEqual(["dashboard"]);
    expect(resolveActive(nav, "/site/posts/42/edit").trail).toEqual(["posts", "posts.all"]);
  });
  it("uses match patterns and level-3 items", () => {
    expect(resolveActive(nav, "/site/uploads/2026").leafId).toBe("media");
    expect(resolveActive(nav, "/settings/email/templates").trail).toEqual(["settings", "settings.email", "settings.email.templates"]);
  });
  it("ignores query strings and trailing slashes; no match → empty", () => {
    expect(resolveActive(nav, "/site/posts/?status=draft").leafId).toBe("posts.all");
    expect(resolveActive(nav, "/crm").trail).toEqual([]);
    expect(resolveActive(nav, undefined).trail).toEqual([]);
  });
});

describe("filterNav", () => {
  it("drops items by permission and feature, empty groups and orphan separators", () => {
    const out = filterNav(nav, { can: () => false, features: {} });
    const ids = out.map((n) => ("id" in n ? n.id : "sep"));
    expect(ids).toEqual(["dashboard", "content", "sep", "settings"]);
    const content = out[1] as Extract<NavNode, { type: "group" }>;
    expect(content.items.map((i) => i.id)).toEqual(["posts"]);
  });
  it("keeps everything when allowed", () => {
    const out = filterNav(nav, { can: () => true, features: { ai: true } });
    expect(out).toHaveLength(nav.length);
  });
});

describe("flattenNav", () => {
  it("lists navigable items with label trails and folds index children into the parent", () => {
    const flat = flattenNav(nav);
    expect(flat.map((f) => f.id)).toEqual(["dashboard", "posts", "posts.categories", "media", "ai", "settings.general", "settings.email.templates"]);
    expect(flat.find((f) => f.id === "settings.email.templates")!.trail).toEqual(["Settings", "Email", "Templates"]);
    expect(flat.find((f) => f.id === "posts")!.group).toBe("Content");
  });
});

describe("helpers", () => {
  it("finds items and builds breadcrumb trails", () => {
    expect(findNavItem(nav, "settings.email")?.label).toBe("Email");
    expect(navTrailItems(nav, ["posts", "posts.categories"]).map((c) => c.label)).toEqual(["Posts", "Categories"]);
  });
  it("normalises badges", () => {
    expect(normaliseBadge(0)).toBeUndefined();
    expect(normaliseBadge(4)).toMatchObject({ count: 4, tone: "accent" });
    expect(normaliseBadge({ count: 12, tone: "danger" })).toMatchObject({ count: 12, tone: "danger" });
    expect(normaliseBadge({ dot: true })).toMatchObject({ dot: true });
    expect(normaliseBadge({})).toBeUndefined();
  });
  it("parses the sidebar cookie from a value or a header", () => {
    expect(parseSidebarCookie("1")).toBe(true);
    expect(parseSidebarCookie("theme=dark; ui-sidebar=0; x=1")).toBe(false);
    expect(parseSidebarCookie(undefined)).toBeUndefined();
  });
});

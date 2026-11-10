import { ex, type DocEntry } from "../types";
import TopBarDemo from "../examples/top-bar/demo";
import TopBarWithBreadcrumb from "../examples/top-bar/with-breadcrumb";
import TopBarMobile from "../examples/top-bar/mobile";
import TopBarUserMenu from "../examples/top-bar/user-menu";

const entry: DocEntry = {
  slug: "top-bar",
  title: "Top bar",
  group: "Navigation",
  description:
    "The sticky bar above the content: mobile menu button, a ⌘K search trigger, contextual actions, notifications and the user menu. Translucent on glass, a hairline on solid, the same in every app.",
  source: ["components/top-bar.tsx", "styles/navigation.css"],
  basedOn: "Radix Dropdown Menu (user menu)",
  usage: `import { TopBar, TopBarStart, TopBarMenuButton, TopBarSearch, TopBarSpacer, TopBarActions, UserMenu } from "@vamos-ui/react";

<TopBar>
  <TopBarStart><TopBarMenuButton /></TopBarStart>
  <TopBarSearch />
  <TopBarSpacer />
  <TopBarActions>
    <NotificationCenter adapter={inbox} />
    <UserMenu name="Ada Lovelace" email="ada@northwind.io" items={account} />
  </TopBarActions>
</TopBar>`,
  demo: ex("demo", "Demo", "top-bar/demo.tsx", TopBarDemo),
  examples: [
    ex("with-breadcrumb", "With breadcrumb", "top-bar/with-breadcrumb.tsx", TopBarWithBreadcrumb, "Put a Breadcrumb in TopBarStart for record screens; the search trigger can sit at the end."),
    ex("mobile", "Narrow bar", "top-bar/mobile.tsx", TopBarMobile, "The search collapses to an icon below 560px of bar width (a container query, so it works in any layout). TopBarMenuButton shows below 768px and opens the App shell's nav sheet."),
    ex("user-menu", "User menu", "top-bar/user-menu.tsx", TopBarUserMenu, "Takes the shared MenuEntry model: links, checkboxes, radio groups, separators, danger items. showName adds the name for wide bars; children go under the header."),
  ],
  api: [
    { name: "TopBar", props: [
      { name: "sticky", type: "boolean", default: "true", description: "Sticks to the top of the scrolling area (z --z-sticky)." },
      { name: "variant", type: '"bar" | "transparent"', default: '"bar"', description: "transparent blends into the page until it scrolls (data-scrolled)." },
      { name: "scrollTarget", type: "RefObject<HTMLElement>", default: "window", description: "Scroll container for data-scrolled." },
    ] },
    { name: "TopBarSearch", props: [
      { name: "placeholder", type: "string", default: '"Search or run a command…"', description: "From the dictionary (topBar.search)." },
      { name: "shortcut", type: "string | false", default: '"mod+k"', description: "Keycap hint; also aria-keyshortcuts." },
      { name: "onOpen", type: "() => void", default: "useCommandPalette().open", description: "What the button opens." },
    ] },
    { name: "TopBarMenuButton", props: [
      { name: "onClick", type: "MouseEventHandler", description: "Outside App shell; inside it opens the mobile nav." },
      { name: "labels", type: "Partial<TopBarLabels>", default: '{ menu: "Open menu" }', description: "Accessible name." },
    ] },
    { name: "UserMenu", props: [
      { name: "name", type: "string", description: "Initials, avatar colour and the trigger's name (“Account menu for …”)." },
      { name: "email", type: "string", description: "Under the name in the menu header." },
      { name: "avatar", type: "string | null", description: "Photo URL." },
      { name: "items", type: "MenuEntry[]", description: "Account entries (shared Dropdown Menu model)." },
      { name: "showName", type: "boolean", default: "false", description: "Name + chevron next to the avatar." },
      { name: "children", type: "ReactNode", description: "Extra content under the header." },
      { name: "align", type: '"start" | "center" | "end"', default: '"end"', description: "Menu alignment." },
    ] },
    { name: "TopBarStart · TopBarSpacer · TopBarActions · TopBarSeparator", props: [
      { name: "className", type: "string", description: "Layout slots; TopBarSpacer pushes the rest to the end." },
    ] },
  ],
  covers: ["Top bar"],
};

export default entry;

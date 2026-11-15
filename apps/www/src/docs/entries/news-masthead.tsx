import { ex, type DocEntry } from "../types";
import Demo from "../examples/news-masthead/demo";
import Mobile from "../examples/news-masthead/mobile";
import Auth from "../examples/news-masthead/auth-dialog";

const entry: DocEntry = {
  slug: "news-masthead",
  title: "News masthead",
  group: "Site blocks",
  description:
    "The top of a newspaper. NewsTopBar: today's date, a weather slot (static data or a loadWeather adapter), utility links, “Sign in / Join” opening AuthDialog, social links. NewsHeader: the wordmark row with an optional leaderboard, then a sticky section bar with mega menus — hover or focus a sub-section in the panel and its latest stories swap in — a “More” menu, inline search and, on narrow screens, the kit MobileNav drawer. AuthDialog: reader sign-in with a password-recovery view in the same dialog.",
  source: ["blocks/site/news-masthead.tsx", "blocks/site/auth-dialog.tsx", "blocks/site/post-card.tsx", "blocks/site/shared/labels-news.ts"],
  basedOn: "Navigation menu, Mobile nav, Dialog",
  usage: `import { NewsTopBar, NewsHeader, AuthDialog, AdSlot } from "@vamos-ui/react/blocks";

<NewsTopBar weather={{ temp: 14, place: "Harbourside", condition: "partly-cloudy" }}
  loadWeather={() => fetch("/api/weather").then((r) => r.json())}
  social={[{ network: "x", href: "https://x.com/example" }]}
  auth={{ onSignIn, onRecover, joinHref: "/join" }} />
<NewsHeader brand="The Harbour Ledger" aside={<AdSlot size="leaderboard" />}
  nav={[{ label: "City", href: "/city", mega: [{ id: "all", label: "All", href: "/city", posts }] }]}
  more={[{ label: "Puzzles", href: "/puzzles" }]} />

// Without JavaScript handlers the forms post to URLs
<AuthDialog trigger={<button>Sign in</button>} signInAction="/login" recoverAction="/reset" />`,
  demo: ex("demo", "Top bar + masthead with mega menus", "news-masthead/demo.tsx", Demo),
  examples: [
    ex("mobile", "Phone width, Turkish", "news-masthead/mobile.tsx", Mobile, "The wordmark row hides under 56rem; the section bar keeps a small wordmark and the drawer lists every section with its sub-sections."),
    ex("auth-dialog", "Auth dialog", "news-masthead/auth-dialog.tsx", Auth, "Errors sit on the fields and focus moves to the first invalid one; a returned string becomes the form error (role=alert); switching view focuses its first field; autocomplete hints for password managers."),
  ],
  api: [
    {
      name: "NewsTopBar",
      props: [
        { name: "date / timeZone", type: "string (ISO) / string", description: "Shown date; default today after hydration." },
        { name: "weather / loadWeather", type: "WeatherData / () => Promise<WeatherData>", description: "{ temp, place, condition?, conditionLabel? }. The adapter runs once on mount." },
        { name: "links / social", type: "{ label; href }[] / { network; href }[]", description: "Utility links (hidden on phones) and social icons (named)." },
        { name: "auth", type: "AuthDialogProps | false", description: "Props for the dialog behind “Sign in / Join”." },
      ],
    },
    {
      name: "NewsHeader",
      props: [
        { name: "brand / brandLabel / homeHref / tagline", type: "ReactNode / string / string / ReactNode", description: "Wordmark (text or inline SVG)." },
        { name: "aside", type: "ReactNode", description: "Beside the wordmark on wide screens (a leaderboard AdSlot)." },
        { name: "nav", type: "NewsNavItem[]", description: "{ label, href, mega?: { id, label, href, posts }[], children? }." },
        { name: "more", type: "{ label; href }[]", description: "A final “More” dropdown." },
        { name: "search", type: "{ action; param? } | false", default: '{ action: "/search", param: "q" }', description: "GET search form (Escape closes, focus returns)." },
        { name: "sticky / currentPath / mobileFooter", type: "boolean / string / ReactNode", description: "Sticky section bar (default on), aria-current, drawer footer." },
      ],
    },
    {
      name: "AuthDialog",
      props: [
        { name: "trigger / open / defaultOpen / onOpenChange", type: "ReactElement / boolean", description: "Uncontrolled with a trigger, or controlled." },
        { name: "defaultView", type: '"signIn" | "recover"', default: '"signIn"', description: "View on open." },
        { name: "onSignIn / onRecover", type: "(data) => Promise<void | string>", description: "Return a string to show it as the error." },
        { name: "signInAction / recoverAction", type: "string", description: "Plain form posts when there are no handlers." },
        { name: "joinHref / brand", type: "string / ReactNode", description: "Registration link; publication name above the title." },
      ],
    },
  ],
  notes: ["Keyboard: Tab through the bar, Enter or ↓ opens a panel, Tab moves into the sub-section list (focus swaps the stories) and on to the stories, Escape closes."],
  covers: ["News masthead (top bar, mega menu, auth dialog)"],
};

export default entry;

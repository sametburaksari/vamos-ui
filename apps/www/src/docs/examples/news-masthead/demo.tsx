"use client";

import { AdSlot, NewsHeader, NewsTopBar, type NewsMegaSection } from "@vamos-ui/react/blocks";
import { SiteFrame } from "../_site-1/frame";
import { stories } from "../_news/data";

const city: NewsMegaSection[] = [
  { id: "all", label: "All", href: "/city", posts: stories.slice(0, 4) },
  { id: "transport", label: "Transport", href: "/city/transport", posts: [stories[0]!, stories[1]!] },
  { id: "housing", label: "Housing", href: "/city/housing", posts: [stories[4]!] },
  { id: "schools", label: "Schools", href: "/city/schools", posts: [stories[7]!, stories[6]!] },
];

// Top bar (date, weather adapter, sign in / join, social) over the masthead with mega menus.
// Hover or focus "City", then a sub-section, to swap its latest stories in.
export default function NewsMastheadDemo() {
  return (
    <SiteFrame>
      <div className="min-h-[34rem]">
        <NewsTopBar
          date="2026-11-15"
          weather={{ temp: 13, place: "Harbourside", condition: "cloudy" }}
          loadWeather={async () => ({ temp: 14, place: "Harbourside", condition: "partly-cloudy", conditionLabel: "partly cloudy" })}
          links={[{ label: "Newsletters", href: "/newsletters" }, { label: "Print edition", href: "/print" }]}
          social={[{ network: "x", href: "https://x.com/example" }, { network: "instagram", href: "https://instagram.com/example" }]}
          auth={{ brand: "The Harbour Ledger", joinHref: "/join", onSignIn: async () => "This is a demo: nothing is signed in.", onRecover: async () => undefined }}
        />
        <NewsHeader
          brand="The Harbour Ledger"
          tagline="Independent news from the coast since 1987"
          aside={<AdSlot size="leaderboard" consent={false} center={false} className="items-end" />}
          nav={[
            { label: "City", href: "/city", mega: city },
            { label: "Economy", href: "/economy", mega: [{ id: "all", label: "All", href: "/economy", posts: stories.slice(1, 5) }] },
            { label: "Science", href: "/science" },
            { label: "Opinion", href: "/opinion" },
          ]}
          more={[{ label: "Letters", href: "/letters" }, { label: "Puzzles", href: "/puzzles" }, { label: "Obituaries", href: "/obituaries" }]}
          currentPath="/science"
          sticky={false}
        />
      </div>
    </SiteFrame>
  );
}

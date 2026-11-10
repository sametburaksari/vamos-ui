import { BookOpenText, Megaphone, Trophy, type LucideIcon } from "lucide-react";

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  sections: number;
  words: number;
  icon: LucideIcon;
}

export const templates: StarterTemplate[] = [
  { id: "how-to", name: "How-to guide", description: "Steps, a checklist and a short FAQ. Ranks well for “how do I…” searches.", sections: 5, words: 1200, icon: BookOpenText },
  { id: "announcement", name: "Announcement", description: "A launch, a new service or opening hours. Short, with one call to action.", sections: 3, words: 450, icon: Megaphone },
  { id: "case-study", name: "Case study", description: "Client, problem, what you did and the numbers. Pairs with a quote.", sections: 4, words: 900, icon: Trophy },
];

export interface SetupTask {
  id: string;
  title: string;
  description: string;
  done: boolean;
  action: string;
}

export const setupTasks: SetupTask[] = [
  { id: "title", title: "Site title and tagline", description: "Harbor & Pine Dental · Family dentistry in Portland", done: true, action: "Edit" },
  { id: "author", title: "Author profile", description: "Shown under every post with a photo and short bio.", done: true, action: "Edit" },
  { id: "categories", title: "Create categories", description: "Three or four are enough to start: Tips, News, Treatments.", done: false, action: "Add" },
  { id: "search-console", title: "Connect Google Search Console", description: "See which posts bring visitors from search.", done: false, action: "Connect" },
];

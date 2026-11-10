import type { TreeNode } from "@vamos-ui/react";
import type { MediaAsset } from "@vamos-ui/react/media";
import type { VamosDoc } from "@vamos-ui/react/blocks/schema";

export const SITE = { name: "Kalamış Bistro", url: "https://kalamisbistro.com" };

export const initialTitle = "Spring Menu 2027: Twelve New Plates from Our Garden";

/** The post body as a portable document (text blocks only — no site block registry needed). */
export const initialDoc: VamosDoc = {
  version: 1,
  lang: "en",
  blocks: [
    { id: "p_intro_1", type: "paragraph", content: [{ text: "Spring at the marina means the first broad beans, wild garlic from the hills above Kartal and the season's last blood oranges. Our kitchen spent six weeks testing what would make it onto the new menu — here are the twelve plates that did, and the small decisions behind them." }] },
    { id: "h_garden_1", type: "heading", props: { level: 2 }, content: [{ text: "From the garden, not the catalogue" }] },
    { id: "p_garden_1", type: "paragraph", content: [{ text: "Eight of the twelve dishes start in our own beds in Sapanca. We plant for the menu in January, so every plate is built around what is actually ready in March — " }, { text: "not what a supplier can ship", marks: [{ type: "italic" }] }, { text: "." }] },
    {
      id: "l_plates_1",
      type: "list",
      slots: {
        items: [
          { id: "li_beans_1", type: "list-item", content: [{ text: "Charred broad beans, whipped feta, mint oil", marks: [{ type: "bold" }] }] },
          { id: "li_garlic_1", type: "list-item", content: [{ text: "Wild garlic börek with aged kaşar" }] },
          { id: "li_bass_1", type: "list-item", content: [{ text: "Line-caught sea bass, blood orange and fennel" }] },
          { id: "li_lamb_1", type: "list-item", content: [{ text: "Slow lamb shoulder, spring onion pilaf" }] },
        ],
      },
    },
    { id: "q_chef_1", type: "quote", props: { cite: "Chef Elif Demir" }, content: [{ text: "If an ingredient needs a lot of help, it isn't in season yet. Spring is when we cook the least." }] },
    { id: "h_book_1", type: "heading", props: { level: 2 }, content: [{ text: "When to book" }] },
    { id: "p_book_1", type: "paragraph", content: [{ text: "The spring menu is served from 1 March, lunch and dinner. Weekend terrace tables go fast — book two weeks ahead, or join the waitlist and we'll text you when a table opens." }] },
  ],
};

export const categories: TreeNode[] = [
  { id: "menu", label: "Menu", children: [{ id: "menu-seasonal", label: "Seasonal menus" }, { id: "menu-wine", label: "Wine list" }, { id: "menu-brunch", label: "Brunch" }] },
  { id: "kitchen", label: "Kitchen notes", children: [{ id: "kitchen-recipes", label: "Recipes" }, { id: "kitchen-suppliers", label: "Suppliers" }] },
  { id: "events", label: "Events", children: [{ id: "events-private", label: "Private dining" }, { id: "events-tastings", label: "Tastings" }] },
  { id: "news", label: "News" },
];

export const tagSuggestions = ["Spring", "Seasonal", "Vegetarian", "Seafood", "Garden", "Chef's table", "Terrace", "Sapanca", "Wild garlic"];

export const authors = [
  { value: "elif", label: "Elif Demir" },
  { value: "mert", label: "Mert Aksoy" },
  { value: "deniz", label: "Deniz Yalçın" },
];

export const coverAsset: MediaAsset = {
  id: "m_bistro",
  kind: "image",
  mime: "image/jpeg",
  filename: "bistro-dining-room.jpg",
  size: 248_000,
  url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=78&auto=format&fit=crop",
  width: 1600,
  height: 1067,
  alt: "Dining room with pendant lights and wooden tables",
  createdAt: "2026-11-05T19:22:00Z",
  uploadedBy: { id: "u_elif", name: "Elif Demir" },
  folderId: null,
  status: "ready",
  variants: { thumb: { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=78&auto=format&fit=crop", width: 400, height: 267 } },
};

export const libraryAssets: MediaAsset[] = [
  coverAsset,
  {
    ...coverAsset,
    id: "m_kitchen",
    filename: "garden-harvest.jpg",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1600&q=78&auto=format&fit=crop",
    alt: "Spring flowers and herbs on a wooden table",
    createdAt: "2026-11-02T08:30:00Z",
    variants: { thumb: { url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&q=78&auto=format&fit=crop", width: 400, height: 267 } },
  },
  {
    ...coverAsset,
    id: "m_plate",
    filename: "sea-bass-plate.jpg",
    url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=78&auto=format&fit=crop",
    alt: "Plated fish course on a white dish",
    createdAt: "2026-10-30T12:10:00Z",
    variants: { thumb: { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=78&auto=format&fit=crop", width: 400, height: 267 } },
  },
];

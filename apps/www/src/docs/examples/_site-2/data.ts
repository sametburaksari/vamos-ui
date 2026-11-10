// Docs-only sample content for the registry-2 site-block examples (fictional businesses, real
// sector copy). Replace with your own data.
import type { Branch, OpeningHours, PostSummary, ArticlePost, RichDoc } from "@vamos-ui/react/blocks";
import { photos } from "../_site-1/assets";

export { photos };

const u = (id: string, w: number, h: number, alt: string) => ({ src: `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`, width: w, height: h, alt });

export const more = {
  portrait1: u("1594824476967-48c8b964273f", 800, 1000, "Elif Aydın in a linen apron, smiling"),
  portrait2: u("1500648767791-00dcc994a43e", 800, 1000, "Mert Kaya in the hammam, arms folded"),
  portrait3: u("1559839734-2b71ea197ec2", 800, 1000, "Dr. Selin Öztürk in a white coat"),
  portrait4: u("1507003211169-0a1dd7228f2d", 800, 1000, "Kerem Yıldız by the studio window"),
  portrait5: u("1580489944761-15a19d654956", 800, 1000, "Deniz Uçar in a white T-shirt, hair tied up"),
  avatar1: u("1438761681033-6461ffad8d80", 160, 160, "Deniz Arslan"),
  avatar2: u("1472099645785-5658abf4ff4e", 160, 160, "Can Demir"),
  map: { ...u("1524661135-423995f22d0b", 1200, 900, ""), alt: "" },
  terrace: u("1555396273-367ea4eb4db5", 1600, 1067, "The terrace in May, strings of bulbs over the tables"),
  bar: u("1514933651103-005eec06c04b", 1200, 1500, "The rakı shelf behind the bar"),
  grill: u("1555939594-58d7cb561ad1", 1600, 1067, "Bonito on the charcoal grill"),
  bread: u("1509440159596-0249088772ff", 1200, 1500, "Sourdough pide fresh from the oven"),
  meze: u("1541529086526-db283c563270", 1200, 1200, "Haydari, fava and pickled sea beans"),
  clinic: u("1629909613654-28e377c37b09", 1600, 1067, "A bright clinic reception with oak benches"),
  laptop: u("1499951360447-b19be8fe80f5", 1600, 1067, "A site layout open on a laptop beside sketches"),
};

/** Istanbul restaurant: closed Mondays, late on weekends, a holiday closure. */
export const meyhaneHours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    tue: [{ open: "17:00", close: "23:30" }],
    wed: [{ open: "17:00", close: "23:30" }],
    thu: [{ open: "17:00", close: "23:30" }],
    fri: [{ open: "17:00", close: "01:00" }],
    sat: [{ open: "12:00", close: "01:00" }],
    sun: [{ open: "12:00", close: "22:00" }],
  },
  special: [
    { date: "2026-12-31", ranges: [{ open: "19:00", close: "03:00" }], note: "New Year’s Eve — set menu" },
    { date: "2027-01-01", closed: true, note: "New Year’s Day" },
  ],
};

export const spaHours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "10:00", close: "21:00" }],
    tue: [{ open: "10:00", close: "21:00" }],
    wed: [{ open: "10:00", close: "21:00" }],
    thu: [{ open: "10:00", close: "21:00" }],
    fri: [{ open: "10:00", close: "22:00" }],
    sat: [{ open: "09:00", close: "22:00" }],
    sun: [{ open: "09:00", close: "20:00" }],
  },
};

export const clinicHours: OpeningHours = {
  timeZone: "Europe/Istanbul",
  weekly: {
    mon: [{ open: "09:00", close: "13:00" }, { open: "14:00", close: "19:00" }],
    tue: [{ open: "09:00", close: "13:00" }, { open: "14:00", close: "19:00" }],
    wed: [{ open: "09:00", close: "13:00" }, { open: "14:00", close: "19:00" }],
    thu: [{ open: "09:00", close: "13:00" }, { open: "14:00", close: "19:00" }],
    fri: [{ open: "09:00", close: "13:00" }, { open: "14:00", close: "17:00" }],
    sat: [{ open: "10:00", close: "14:00" }],
  },
};

export const meyhane: Branch = {
  name: "Kıyı Meyhane",
  address: { line: "Bağdat Caddesi 412", district: "Caddebostan", city: "Kadıköy", region: "İstanbul", postalCode: "34728", country: "TR", geo: { lat: 40.9656, lng: 29.0647 } },
  phone: "+902168072907",
  email: "masa@kiyimeyhane.com",
  hours: meyhaneHours,
  mapImage: more.map,
  notes: "Valet from 18:00. The closest ferry pier is Caddebostan, a seven-minute walk.",
};

export const clinicBranches: Branch[] = [
  { name: "Lena Clinic Nişantaşı", address: { line: "Abdi İpekçi Caddesi 21, Kat 3", district: "Nişantaşı", city: "Şişli", region: "İstanbul", postalCode: "34367", country: "TR", geo: { lat: 41.0523, lng: 28.9946 } }, phone: "+902122304455", hours: clinicHours, mapImage: more.map, notes: "Entrance next to the pharmacy; lift to the third floor." },
  { name: "Lena Clinic Moda", address: { line: "Moda Caddesi 88", district: "Moda", city: "Kadıköy", region: "İstanbul", postalCode: "34710", country: "TR", geo: { lat: 40.9842, lng: 29.0264 } }, phone: "+902163380011", hours: clinicHours, mapImage: more.map },
  { name: "Lena Clinic Ataşehir", address: { line: "Barbaros Mahallesi, Ardıç Sokak 5", district: "Ataşehir", city: "Ataşehir", region: "İstanbul", postalCode: "34746", country: "TR", geo: { lat: 40.9923, lng: 29.1244 } }, phone: "+902165557788", hours: { ...clinicHours, weekly: { ...clinicHours.weekly, sat: [] } }, mapImage: more.map, notes: "Free parking under the building, level −1." },
];

export const posts: PostSummary[] = [
  { href: "/journal/morning-boats", title: "How we plan a menu around the morning boats", excerpt: "Twelve years of buying fish at Kumkapı before sunrise, and why the menu is only printed at four.", cover: photos.plated, category: { label: "Kitchen", href: "/journal/kitchen" }, publishedAt: "2026-10-28", readingMinutes: 6, author: { name: "Deniz Arslan" } },
  { href: "/journal/raki-list", title: "Reading our rakı list", excerpt: "From the single-distilled Tekirdağ to the aged Efe Gold: what to order with what.", cover: more.bar, category: { label: "Drinks", href: "/journal/drinks" }, publishedAt: "2026-10-14", readingMinutes: 4 },
  { href: "/journal/private-dining", title: "Private dining for twelve, upstairs", excerpt: "The room above the kitchen now takes bookings for birthdays and team dinners.", cover: photos.diningRoom, category: { label: "News", href: "/journal/news" }, publishedAt: "2026-09-30", readingMinutes: 3 },
  { href: "/journal/bonito-season", title: "Bonito season, week by week", excerpt: "Palamut in September, torik in October, and why lakerda waits until winter.", cover: more.grill, category: { label: "Kitchen", href: "/journal/kitchen" }, publishedAt: "2026-09-12", readingMinutes: 5 },
  { href: "/journal/sourdough-pide", title: "The sourdough pide we bake at five", cover: more.bread, category: { label: "Kitchen", href: "/journal/kitchen" }, publishedAt: "2026-08-26", readingMinutes: 4 },
  { href: "/journal/terrace", title: "The terrace opens for the season", cover: more.terrace, category: { label: "News", href: "/journal/news" }, publishedAt: "2026-05-02", readingMinutes: 2 },
];

const p = (text: string) => ({ type: "paragraph" as const, content: [{ text }] });
const h2 = (text: string) => ({ type: "heading" as const, level: 2 as const, content: [{ text }] });

export const articleBody: RichDoc = {
  type: "doc",
  content: [
    p("We decide the evening’s menu at six in the morning, standing on the wet concrete of the Kumkapı market with a thermos of tea. Whatever came in on the boats sets the tone; the rest of the menu bends around it."),
    h2("Six o’clock at Kumkapı"),
    p("The first boats tie up around five. By six the best bonito is gone to the hotels, so we buy what the hotels don’t want: smaller fish, odd sizes, the mackerel nobody else looked at twice."),
    { type: "blockquote", content: [p("If you ask the fishmonger what’s good, he’ll tell you what’s expensive. Ask him what he’s eating tonight.")], cite: "Hasan Usta, Kumkapı, 31 years at the market" },
    h2("What makes the cut"),
    { type: "list", items: [{ content: [p("Anything still stiff, with clear eyes and red gills.")] }, { content: [p("Fish we can serve three ways: grilled, cured, and in the pilaki.")] }, { content: [p("Nothing farmed, unless the menu says so.")] }] },
    p("We price the board at two in the afternoon, once we know the yield. That’s why the fish section is the only part of the menu printed daily."),
    h2("Curing for the winter"),
    p("Autumn bonito is fat enough to cure. We salt it for three days, then press it under olive oil; by January it becomes the lakerda that carries the cold-meze table through the slow months."),
    { type: "code", language: "text", text: "Lakerda, per 5 kg bonito\n  coarse sea salt   1.2 kg\n  cure              72 h, 4 °C\n  rinse, press      12 h\n  olive oil         to cover" },
    p("Come before eight if you want to see the board before it’s chalked up — and ask for the fish the kitchen is eating tonight."),
  ],
};

export const article: ArticlePost = {
  title: "How we plan a *menu* around the morning boats",
  dek: "Twelve years of buying fish at Kumkapı before sunrise, and why the menu is only printed at four.",
  body: articleBody,
  cover: photos.plated,
  coverCaption: "Grilled bonito with charred lemon — the dish that sets the board most autumn nights.",
  publishedAt: "2026-10-28",
  updatedAt: "2026-11-03",
  category: { href: "/journal/kitchen", label: "Kitchen" },
  tags: [{ href: "/journal/tags/fish", label: "Fish" }, { href: "/journal/tags/seasonal", label: "Seasonal" }, { href: "/journal/tags/kumkapi", label: "Kumkapı" }],
  breadcrumb: [{ href: "/", label: "Home" }, { href: "/journal", label: "Journal" }],
  author: { name: "Deniz Arslan", role: "Chef-owner", avatar: more.avatar1, href: "/about#deniz", bio: "Deniz has cooked at Kıyı Meyhane since it opened in 2014. Before that: eight years on the line in İzmir’s fish restaurants." },
};

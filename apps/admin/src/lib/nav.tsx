import { LayoutDashboard, Users, CalendarDays, ListChecks, ClipboardList, Plus, Bus, Ticket, HandCoins } from "lucide-react";
import type { AppDefinition, NavNode } from "@vamos-cms/ui";
import { FIXTURE, MEMBERS } from "./no17-data";

const awayCount = FIXTURE.filter((f) => f.ha === "Dep").length;

/** Tek uygulama: NO:17 taraftar grubu yönetimi. */
export const apps: AppDefinition[] = [
  {
    id: "no17",
    name: "NO:17",
    icon: Ticket,
    logo: <img src="/logo-dark.png" alt="NO:17" className="h-7 w-auto" />,
    href: "/no17",
    newMenu: [
      { id: "no17-new-list", label: "Yeni liste", icon: <Plus />, href: "/no17/listeler/yeni" },
      { id: "no17-new-campaign", label: "Yeni kampanya", icon: <HandCoins />, href: "/no17/bagis/yeni" },
    ],
    nav: [
      { id: "no17.dashboard", label: "Genel bakış", href: "/no17", icon: LayoutDashboard },
      {
        type: "group",
        id: "no17.grp",
        label: "Grup",
        items: [
          { id: "no17.members", label: "Üyeler", href: "/no17/uyeler", icon: Users, keywords: ["üye", "kişi", "tc", "telefon"] },
          {
            id: "no17.matches",
            label: "Maçlar",
            href: "/no17/maclar",
            icon: CalendarDays,
            keywords: ["fikstür", "maç"],
            children: [
              { id: "no17.matches.all", label: "Tüm maçlar", href: "/no17/maclar" },
              { id: "no17.matches.home", label: "İç saha", href: "/no17/maclar?saha=ic" },
              { id: "no17.matches.away", label: "Deplasman", href: "/no17/maclar?saha=dep" },
            ],
          },
          { id: "no17.attendance", label: "Katılımlar", href: "/no17/katilimlar", icon: ListChecks, keywords: ["gelen", "katılım", "matris"] },
          { id: "no17.campaigns", label: "Bağış & kampanyalar", href: "/no17/bagis", icon: HandCoins, keywords: ["bağış", "para", "kampanya", "köy okulu", "pankart", "cenaze", "yardım"] },
        ],
      },
      {
        type: "group",
        id: "no17.grpListeler",
        label: "Listeler",
        items: [
          { id: "no17.lists", label: "Tüm listeler", href: "/no17/listeler", icon: ClipboardList },
          { id: "no17.listsNew", label: "Yeni liste", href: "/no17/listeler/yeni", icon: Plus },
          { id: "no17.away", label: "Deplasman listeleri", href: "/no17/deplasman", icon: Bus, keywords: ["deplasman", "liste"] },
        ],
      },
    ],
  },
];

/** Alt (paylaşılan) menü yok. */
export const sharedNav: NavNode[] = [];

/** Kenar çubuğundaki canlı sayaçlar (statik olanlar). */
export const badges = {
  "no17.members": MEMBERS.length,
  "no17.matches": FIXTURE.length,
  "no17.matches.away": { count: awayCount, tone: "warning" as const },
};

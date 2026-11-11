// Saved views for the contacts list: who owns them, who they are shared with, what they store.
import { ME, createListState, toViewState, type FilterClause, type SavedView } from "@vamos-ui/react/data-table";
import type { L } from "../../_shared/l10n";
import { day } from "../../_shared/time";

export type Audience = "private" | "sales" | "workspace";

/** A saved view plus the sharing details this screen shows. */
export interface ContactView extends SavedView {
  label: L;
  description: L;
  audience: Audience;
  /** people.ts id of the person who made it. */
  ownerId: string;
  /** Teammates it was shared with directly (people.ts ids). */
  sharedWith?: string[];
}

export const audienceLabels: Record<Audience, L> = {
  private: { en: "Only me", tr: "Yalnızca ben" },
  sales: { en: "Sales team", tr: "Satış ekibi" },
  workspace: { en: "Everyone in the workspace", tr: "Çalışma alanındaki herkes" },
};

export const salesTeam = ["p-aylin", "p-tomas", "p-noah", "p-ines"];

const base = toViewState(createListState({ sort: [{ id: "lastTouch", desc: true }] }));
const where = (clauses: FilterClause[], extra: Partial<SavedView["state"]> = {}) => ({ ...base, filters: { logic: "and" as const, clauses }, ...extra });

export const initialViews: ContactView[] = [
  {
    id: "mine",
    name: "My contacts",
    label: { en: "My contacts", tr: "Kişilerim" },
    description: { en: "Everyone you own, most recently touched first.", tr: "Size ait herkes, son temas edilen önce." },
    scope: "personal",
    audience: "private",
    ownerId: "p-defne",
    isDefault: true,
    state: where([{ id: "o", field: "owner", op: "in", value: [ME] }]),
  },
  {
    id: "hot",
    name: "Hot leads",
    label: { en: "Hot leads", tr: "Sıcak adaylar" },
    description: { en: "Qualified or in a deal, score 70 and up.", tr: "Nitelikli ya da fırsat aşamasında, puanı 70 ve üzeri." },
    scope: "personal",
    audience: "private",
    ownerId: "p-defne",
    state: where(
      [
        { id: "s", field: "stage", op: "in", value: ["qualified", "opportunity"] },
        { id: "sc", field: "score", op: "gte", value: 70 },
      ],
      { sort: [{ id: "score", desc: true }] },
    ),
  },
  {
    id: "unassigned",
    name: "Unassigned inbound",
    label: { en: "Unassigned inbound", tr: "Atanmamış gelen adaylar" },
    description: { en: "Form fills and webinar sign-ups nobody owns yet.", tr: "Henüz kimseye atanmamış form ve webinar kayıtları." },
    scope: "team",
    audience: "sales",
    ownerId: "p-noah",
    system: true,
    state: where([
      { id: "o", field: "owner", op: "isEmpty" },
      { id: "src", field: "source", op: "in", value: ["website", "webinar"] },
    ]),
  },
  {
    id: "decision",
    name: "Decision makers · Türkiye",
    label: { en: "Decision makers · Türkiye", tr: "Karar vericiler · Türkiye" },
    description: { en: "Tagged decision makers at Turkish accounts.", tr: "Türkiye'deki hesaplarda karar verici etiketli kişiler." },
    scope: "team",
    audience: "workspace",
    ownerId: "p-aylin",
    state: where(
      [
        { id: "t", field: "tags", op: "in", value: ["decision-maker"] },
        { id: "c", field: "country", op: "in", value: ["TR"] },
      ],
      { columns: { ...base.columns, visible: { country: true, phone: true, source: false } } },
    ),
  },
  {
    id: "cold",
    name: "Going cold",
    label: { en: "Going cold", tr: "Soğuyanlar" },
    description: { en: "Open contacts with no touch in 30 days.", tr: "30 gündür temas edilmemiş açık kişiler." },
    scope: "team",
    audience: "sales",
    ownerId: "p-tomas",
    sharedWith: ["p-defne", "p-ines"],
    state: where(
      [
        { id: "lt", field: "lastTouch", op: "before", value: day(-30) },
        { id: "s", field: "stage", op: "notIn", value: ["customer", "churned", "subscriber"] },
      ],
      { sort: [{ id: "lastTouch", desc: false }] },
    ),
  },
  {
    id: "renewals",
    name: "Renewal due",
    label: { en: "Renewal due", tr: "Yenilemesi yaklaşanlar" },
    description: { en: "Customers tagged for renewal this quarter.", tr: "Bu çeyrek yenileme için etiketlenmiş müşteriler." },
    scope: "team",
    audience: "sales",
    ownerId: "p-ines",
    sharedWith: ["p-defne"],
    state: where([{ id: "t", field: "tags", op: "in", value: ["renewal"] }]),
  },
];

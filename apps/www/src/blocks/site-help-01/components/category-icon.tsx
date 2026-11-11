import { CalendarDays, CreditCard, Layers, LayoutGrid, Sprout, Users } from "lucide-react";
import type { CategoryId } from "./content";

const icons = { start: Sprout, plots: LayoutGrid, calendar: CalendarDays, soil: Layers, household: Users, account: CreditCard } as const;

/** The line icon for a help category (decorative). */
export function CategoryIcon({ id, className }: { id: CategoryId; className?: string }) {
  const Icon = icons[id];
  return <Icon aria-hidden className={className} strokeWidth={1.7} />;
}

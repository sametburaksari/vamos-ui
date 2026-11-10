import { CalendarDays, Kanban, List } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@vamos-ui/react";

export default function ButtonGroupToggleGroup() {
  return (
    <div className="grid gap-4">
      {/* View state → ToggleGroup (a form value would be RadioGroup variant="segmented") */}
      <ToggleGroup aria-label="Deals view" defaultValue="board">
        <ToggleGroupItem value="list">
          <List /> List
        </ToggleGroupItem>
        <ToggleGroupItem value="board">
          <Kanban /> Board
        </ToggleGroupItem>
        <ToggleGroupItem value="calendar">
          <CalendarDays /> Calendar
        </ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup aria-label="Chart range" size="sm" defaultValue="30d">
        {["7d", "30d", "90d", "12m"].map((r) => (
          <ToggleGroupItem key={r} value={r} className="font-mono">
            {r}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

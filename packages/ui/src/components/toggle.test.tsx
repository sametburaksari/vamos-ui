import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Bold, Italic, List, Kanban } from "lucide-react";
import { Toggle, ToggleGroup, ToggleGroupItem } from "./toggle";

describe("Toggle", () => {
  it("icon-only toggle uses label as its name and flips aria-pressed", async () => {
    const { container } = render(
      <Toggle label="Bold">
        <Bold />
      </Toggle>,
    );
    const b = screen.getByRole("button", { name: "Bold" });
    expect(b).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(b);
    expect(b).toHaveAttribute("aria-pressed", "true");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("ToggleGroup", () => {
  it("single: roving focus, arrows move, Space selects, never empties by default", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <ToggleGroup aria-label="View" defaultValue="list" onValueChange={onChange}>
        <ToggleGroupItem value="list">
          <List /> List
        </ToggleGroupItem>
        <ToggleGroupItem value="board">
          <Kanban /> Board
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "List" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Board" })).toHaveFocus();
    await userEvent.keyboard(" ");
    expect(onChange).toHaveBeenLastCalledWith("board");
    expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "true");
    // pressing the active item again keeps it
    await userEvent.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Board" })).toHaveAttribute("aria-checked", "true");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("multiple: independent pressed states", async () => {
    const onChange = vi.fn();
    render(
      <ToggleGroup type="multiple" variant="ghost" aria-label="Formatting" onValueChange={onChange}>
        <ToggleGroupItem value="bold" label="Bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" label="Italic">
          <Italic />
        </ToggleGroupItem>
      </ToggleGroup>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    await userEvent.click(screen.getByRole("button", { name: "Italic" }));
    expect(onChange).toHaveBeenLastCalledWith(["bold", "italic"]);
  });
});

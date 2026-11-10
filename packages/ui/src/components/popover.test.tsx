import { screen } from "@testing-library/react";
import { Popover, PopoverClose, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

function TagPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>Add tag</Button>
      </PopoverTrigger>
      <PopoverContent size="sm" arrow>
        <PopoverHeader title="Add tag" description="Tags group contacts for campaigns." />
        <label className="grid gap-1 text-sm">
          Tag name
          <input defaultValue="Enterprise" />
        </label>
        <PopoverFooter>
          <PopoverClose asChild>
            <Button size="sm">Cancel</Button>
          </PopoverClose>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("opens from the trigger as a labelled dialog and passes axe", async () => {
    const { user } = renderWithProviders(<TagPopover />);
    const trigger = screen.getByRole("button", { name: "Add tag" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Add tag" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    expect(dialog).toHaveAttribute("data-layer-depth", "1");
    await expectNoA11yViolations();
  });

  it("Escape closes and returns focus to the trigger", async () => {
    const { user } = renderWithProviders(<TagPopover />);
    const trigger = screen.getByRole("button", { name: "Add tag" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("PopoverClose closes it", async () => {
    const { user } = renderWithProviders(<TagPopover />);
    await user.click(screen.getByRole("button", { name: "Add tag" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("portals into the ThemeScope and nests deeper layers", async () => {
    const { user } = renderWithProviders(
      <Popover defaultOpen>
        <PopoverTrigger>Outer</PopoverTrigger>
        <PopoverContent>
          <PopoverHeader title="Outer" />
          <Popover>
            <PopoverTrigger>Inner</PopoverTrigger>
            <PopoverContent>
              <PopoverHeader title="Inner" />
            </PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>,
      { theme: { dark: true } },
    );
    const outer = await screen.findByRole("dialog", { name: "Outer" });
    expect(outer.closest('[data-slot="theme-scope"]')).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Inner" }));
    expect(await screen.findByRole("dialog", { name: "Inner" })).toHaveAttribute("data-layer-depth", "2");
  });
});

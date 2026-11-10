import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pencil, Trash2 } from "lucide-react";
import { Tooltip, TooltipProvider } from "./tooltip";
import { Button, IconButton } from "./button";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";

describe("Tooltip", () => {
  it("opens on keyboard focus, describes the trigger and closes on Escape", async () => {
    const { user } = renderWithProviders(
      <Tooltip content="Edit post" shortcut="mod+e" delay={0}>
        <Button>Edit</Button>
      </Tooltip>,
    );
    await user.tab();
    const trigger = screen.getByRole("button", { name: "Edit" });
    expect(trigger).toHaveFocus();
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Edit post");
    expect(trigger).toHaveAttribute("aria-describedby", tip.id);
    expect(document.querySelector('[data-slot="tooltip-content"] [data-slot="kbd-group"]')).not.toBeNull();
    await expectNoA11yViolations();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("renders the bare trigger when disabled or empty", () => {
    render(
      <>
        <Tooltip content="Hidden" disabled>
          <Button>One</Button>
        </Tooltip>
        <Tooltip content="">
          <Button>Two</Button>
        </Tooltip>
      </>,
    );
    expect(screen.getByRole("button", { name: "One" })).not.toHaveAttribute("data-state");
    expect(screen.getByRole("button", { name: "Two" })).not.toHaveAttribute("data-state");
  });

  it("wraps a disabled trigger in a focusable span so the reason can be read", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Only editors can publish" delay={0}>
        <Button disabled>Publish</Button>
      </Tooltip>,
    );
    await user.tab();
    const wrapper = document.querySelector('[data-slot="tooltip-disabled-trigger"]');
    expect(wrapper).toHaveFocus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Only editors can publish");
  });

  it("is controllable", () => {
    render(
      <Tooltip content="Archived 3 days ago" open>
        <Button>Status</Button>
      </Tooltip>,
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Archived 3 days ago");
  });
});

describe("IconButton tooltip", () => {
  it("falls back to title without a provider", () => {
    render(
      <IconButton label="Delete post">
        <Trash2 />
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Delete post" })).toHaveAttribute("title", "Delete post");
  });

  it("shows the label as a Tooltip inside a TooltipProvider", async () => {
    const user = userEvent.setup();
    render(
      <TooltipProvider delayDuration={0}>
        <IconButton label="Edit post" shortcut="mod+e">
          <Pencil />
        </IconButton>
      </TooltipProvider>,
    );
    const b = screen.getByRole("button", { name: "Edit post" });
    expect(b).not.toHaveAttribute("title");
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Edit post");
  });

  it("tooltip={false} keeps the native title", () => {
    render(
      <TooltipProvider>
        <IconButton label="Delete" tooltip={false}>
          <Trash2 />
        </IconButton>
      </TooltipProvider>,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toHaveAttribute("title", "Delete");
  });
});

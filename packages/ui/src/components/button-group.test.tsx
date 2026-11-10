import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./button-group";
import { Button, IconButton } from "./button";

describe("ButtonGroup", () => {
  it("renders a labelled group and passes variant/size down", async () => {
    const { container } = render(
      <ButtonGroup aria-label="Pagination" size="sm" variant="secondary">
        <IconButton label="Previous page">
          <ChevronLeft />
        </IconButton>
        <ButtonGroupText>21–40 of 340</ButtonGroupText>
        <IconButton label="Next page">
          <ChevronRight />
        </IconButton>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Pagination" });
    expect(group).toHaveAttribute("data-attached");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveAttribute("data-size", "icon-sm");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveAttribute("data-variant", "secondary");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("child props win over the group defaults and every button is a tab stop", async () => {
    render(
      <ButtonGroup aria-label="Save" variant="primary">
        <Button>Save</Button>
        <ButtonGroupSeparator />
        <Button variant="secondary">Schedule</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("data-variant", "primary");
    expect(screen.getByRole("button", { name: "Schedule" })).toHaveAttribute("data-variant", "secondary");
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Schedule" })).toHaveFocus();
  });
});

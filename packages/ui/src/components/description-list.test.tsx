import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { DescriptionGroup, DescriptionItem, DescriptionList } from "./description-list";

describe("DescriptionList", () => {
  it("renders items as dt/dd with formatting and an empty value", async () => {
    const { container } = render(
      <DescriptionList
        items={[
          { key: "owner", label: "Owner", value: "Ayşe Kaya" },
          { key: "amount", label: "Amount", value: 48500, format: "currency" },
          { key: "close", label: "Expected close", value: "2026-12-15", format: "date" },
          { key: "source", label: "Source", value: null },
        ]}
      />,
    );
    expect(container.querySelector("dl")).toHaveAttribute("data-layout", "horizontal");
    expect(screen.getByText("Owner").tagName).toBe("DT");
    expect(screen.getByText("$48,500.00")).toBeInTheDocument();
    expect(screen.getByText("Dec 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("Not set")).toHaveClass("sr-only");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("copies a value and confirms", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { container } = render(
      <DescriptionList>
        <DescriptionItem label="IBAN" copyable="TR330006100519786457841326">
          TR33 0006 1005 1978 6457 8413 26
        </DescriptionItem>
      </DescriptionList>,
    );
    const button = screen.getByRole("button", { name: "Copy IBAN" });
    await user.click(button);
    expect(writeText).toHaveBeenCalledWith("TR330006100519786457841326");
    expect(screen.getByRole("status")).toHaveTextContent("Copied");
    expect(button).toHaveAttribute("data-copied");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("inline edit: Enter saves, Escape cancels, errors are announced", async () => {
    const user = userEvent.setup();
    let fail = false;
    const onEdit = vi.fn(async () => {
      if (fail) throw new Error("nope");
    });
    render(<DescriptionList onEdit={onEdit} items={[{ key: "phone", label: "Phone", value: "+90 532 555 01 22", editable: true, inputType: "tel" }]} />);
    await user.click(screen.getByRole("button", { name: /Edit Phone/ }));
    const input = screen.getByRole("textbox", { name: "Phone" });
    await user.clear(input);
    await user.type(input, "+90 216 000 00 00{Enter}");
    expect(onEdit).toHaveBeenCalledWith("phone", "+90 216 000 00 00");
    await waitFor(() => expect(screen.getByRole("button", { name: /Edit Phone/ })).toHaveFocus());

    await user.click(screen.getByRole("button", { name: /Edit Phone/ }));
    await user.keyboard("x{Escape}");
    expect(screen.queryByRole("textbox")).toBeNull();

    fail = true;
    await user.click(screen.getByRole("button", { name: /Edit Phone/ }));
    await act(async () => {
      await user.keyboard("9{Enter}");
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save");
    expect(screen.getByRole("textbox", { name: "Phone" })).toHaveAttribute("aria-invalid", "true");
  });

  it("grid layout with spans, groups and loading", async () => {
    const { container } = render(
      <div>
        <DescriptionGroup title="Employment">
          <DescriptionList
            layout="grid"
            columns={3}
            items={[
              { key: "dept", label: "Department", value: "Engineering" },
              { key: "manager", label: "Manager", value: "Meltem Aydın" },
              { key: "notes", label: "Notes", value: "Remote, Istanbul office twice a week.", span: "full" },
            ]}
          />
        </DescriptionGroup>
        <DescriptionList loading={3} data-testid="loading" />
      </div>,
    );
    expect(screen.getByRole("region", { name: "Employment" })).toBeInTheDocument();
    expect(screen.getByText("Notes").parentElement).toHaveClass("col-span-full");
    expect(screen.getByTestId("loading")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("loading").children).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });
});

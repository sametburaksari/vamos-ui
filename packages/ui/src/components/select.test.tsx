import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { NativeSelect } from "./native-select";
import { Select, SelectContent, SelectGroup, SelectItem, SelectRoot, SelectTrigger, SelectValue } from "./select";

const statuses = [
  { value: "draft", label: "Draft", description: "Only editors can see it" },
  { value: "review", label: "In review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived", disabled: true },
];

describe("Select", () => {
  it("renders a labelled combobox with placeholder and passes axe", async () => {
    const { container } = render(
      <Field label="Status" hint="Who can see this post.">
        <Select items={statuses} placeholder="Choose status" />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Status" });
    expect(trigger).toHaveTextContent("Choose status");
    expect(trigger).toHaveAccessibleDescription("Who can see this post.");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens with the keyboard and selects an option", async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Status" items={statuses} onValueChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Status" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Archived/ })).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(screen.getByRole("option", { name: /Published/ }));
    expect(onChange).toHaveBeenCalledWith("published");
    expect(trigger).toHaveTextContent("Published");
  });

  it("clearable yields null and returns to the placeholder", async () => {
    const onChange = vi.fn();
    render(<Select aria-label="Status" items={statuses} defaultValue="review" clearable onValueChange={onChange} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("In review");
    await userEvent.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.getByRole("combobox")).toHaveTextContent("Select…");
  });

  it("read-only does not open and is announced", async () => {
    render(<Select aria-label="Status" items={statuses} defaultValue="draft" readOnly />);
    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-readonly", "true");
    await userEvent.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders groups from the items shorthand and composite parts", async () => {
    render(
      <SelectRoot defaultOpen>
        <SelectTrigger aria-label="Currency">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup label="Common">
            <SelectItem value="usd">US dollar</SelectItem>
            <SelectItem value="eur">Euro</SelectItem>
          </SelectGroup>
        </SelectContent>
      </SelectRoot>,
    );
    expect(await screen.findByRole("group", { name: "Common" })).toBeInTheDocument();
  });

  it("wires Field errors", () => {
    render(
      <Field label="Department" error="Pick a department.">
        <Select items={[{ value: "sales", label: "Sales" }]} />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Department" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("Pick a department.");
  });
});

describe("NativeSelect", () => {
  it("is a styled native select with placeholder, groups and FormData", async () => {
    const { container } = render(
      <form aria-label="Booking">
        <Field label="Branch">
          <NativeSelect
            name="branch"
            defaultValue=""
            placeholder="Choose a branch"
            items={[
              { value: "kadikoy", label: "Kadıköy", group: "Asian side" },
              { value: "besiktas", label: "Beşiktaş", group: "European side" },
            ]}
          />
        </Field>
      </form>,
    );
    const select = screen.getByRole("combobox", { name: "Branch" });
    expect(screen.getAllByRole("group")).toHaveLength(2);
    await userEvent.selectOptions(select, "besiktas");
    expect(new FormData(container.querySelector("form")!).get("branch")).toBe("besiktas");
    expect(await axe(container)).toHaveNoViolations();
  });
});

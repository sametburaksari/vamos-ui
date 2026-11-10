import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field } from "./input";
import { TagInput } from "./tag-input";

describe("TagInput", () => {
  it("adds tags with Enter and comma, is labelled by the Field and passes axe", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Field label="Tags" hint="Readers can browse posts by tag.">
        <TagInput onValueChange={onChange} />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Tags" });
    expect(input).toHaveAccessibleDescription("Readers can browse posts by tag.");
    await user.type(input, "Product design{Enter}");
    await user.type(input, "Research,");
    expect(onChange).toHaveBeenLastCalledWith(["Product design", "Research"]);
    expect(screen.getByRole("list", { name: "Tags" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("“Research” added")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("dedupes with locale folding and splits pasted lists", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput aria-label="Keywords" defaultValue={["İstanbul"]} onValueChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Keywords" });
    await user.type(input, "istanbul{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("“İstanbul” is already added")).toBeInTheDocument();
    // the duplicate stays in the input so it can be edited
    expect(input).toHaveValue("istanbul");
    await user.clear(input);
    await user.paste("seo, analytics\ncontent marketing");
    expect(onChange).toHaveBeenLastCalledWith(["İstanbul", "seo", "analytics", "content marketing"]);
  });

  it("Backspace moves to the last chip, a second Backspace removes it; arrows move between chips", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput aria-label="Skills" defaultValue={["Figma", "React", "SQL"]} onValueChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Skills" });
    await user.click(input);
    await user.keyboard("{Backspace}");
    expect(screen.getByRole("button", { name: "Remove SQL" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Remove React" })).toHaveFocus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(input).toHaveFocus();
    await user.keyboard("{Backspace}{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["Figma", "React"]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Remove React" })).toHaveFocus());
  });

  it("respects max and submits repeated hidden inputs", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form aria-label="Post">
        <TagInput aria-label="Keywords" name="keywords" max={2} defaultValue={["seo"]} />
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Keywords" });
    expect(input).toHaveAccessibleDescription("Up to 2 tags");
    await user.type(input, "growth{Enter}");
    expect(input).toHaveAttribute("readonly");
    expect(new FormData(container.querySelector("form")!).getAll("keywords")).toEqual(["seo", "growth"]);
  });

  it("marks invalid tags and the field", async () => {
    const user = userEvent.setup();
    render(<TagInput aria-label="Recipients" validate={(v) => /^\S+@\S+\.\S+$/.test(v) || "Not an email address"} />);
    const input = screen.getByRole("textbox", { name: "Recipients" });
    await user.type(input, "maria@northwind.com{Enter}hello{Enter}");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("hello").closest("[data-slot=badge]")).toHaveAttribute("data-tone", "danger");
  });

  it("suggestions: combobox with arrow-key selection", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput aria-label="Segments" suggestions={["Enterprise", "Event attendees", "Newsletter"]} onValueChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "Segments" });
    await user.type(input, "e");
    const list = await screen.findByRole("listbox", { name: "Suggestions" });
    expect(list).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: "Event attendees" }).id);
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["Event attendees"]);
  });

  it("allowCustom=false rejects unknown text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagInput aria-label="Department" allowCustom={false} suggestions={["Sales", "Support"]} onValueChange={onChange} />);
    await user.type(screen.getByRole("combobox"), "Legal{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText("“Legal” isn't one of the options")).toBeInTheDocument();
  });
});

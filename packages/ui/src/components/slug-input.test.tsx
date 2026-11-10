import * as React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { Field, Input } from "./input";
import { SlugInput } from "./slug-input";
import { LocaleProvider } from "../lib/locale";

function Editor({ initialTitle = "", slugProps = {} }: { initialTitle?: string; slugProps?: Partial<React.ComponentProps<typeof SlugInput>> }) {
  const [title, setTitle] = React.useState(initialTitle);
  return (
    <>
      <Field label="Title">
        <Input value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
      </Field>
      <Field label="URL">
        <SlugInput source={title} prefix="vamos.ist/blog/" {...slugProps} />
      </Field>
    </>
  );
}

describe("SlugInput", () => {
  it("follows the title with locale rules until edited, then locks", async () => {
    const user = userEvent.setup();
    const onLockedChange = vi.fn();
    const { container } = render(
      <LocaleProvider locale="tr-TR">
        <Editor slugProps={{ onLockedChange }} />
      </LocaleProvider>,
    );
    await user.type(screen.getByLabelText("Title"), "İşe Alım & Oryantasyon");
    const slug = screen.getByLabelText("URL") as HTMLInputElement;
    expect(slug.value).toBe("ise-alim-ve-oryantasyon");
    expect(screen.getByText("Auto")).toBeInTheDocument();
    await user.type(slug, " rehberi");
    expect(slug.value).toBe("ise-alim-ve-oryantasyon-rehberi");
    expect(onLockedChange).toHaveBeenLastCalledWith(true);
    await user.type(screen.getByLabelText("Title"), " 2026");
    expect(slug.value).toBe("ise-alim-ve-oryantasyon-rehberi");
    await user.click(screen.getByRole("button", { name: "Regenerate from title" }));
    expect(slug.value).toBe("ise-alim-ve-oryantasyon-2026");
    expect(await axe(container)).toHaveNoViolations();
  });

  it("keeps the caret when spaces turn into dashes", async () => {
    const user = userEvent.setup();
    render(<SlugInput aria-label="Slug" />);
    const input = screen.getByLabelText("Slug") as HTMLInputElement;
    await user.type(input, "Spring Menu");
    expect(input.value).toBe("spring-menu");
    await user.tab();
    expect(input.value).toBe("spring-menu");
  });

  it("checks uniqueness and offers a suggestion", async () => {
    const user = userEvent.setup();
    const validate = vi.fn(async (s: string) => (s === "spring-menu" ? "Used by “Spring menu 2025”" : true));
    const onValueChange = vi.fn();
    render(<SlugInput aria-label="Slug" defaultValue="spring-menu" validate={validate} validateDelay={0} suggestUnique={async (s) => `${s}-2`} onValueChange={onValueChange} />);
    const input = screen.getByLabelText("Slug");
    expect(await screen.findByText("Used by “Spring menu 2025”", { selector: "[data-slot=slug-input-message] span" })).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    await user.click(await screen.findByRole("button", { name: "Use spring-menu-2" }));
    expect(onValueChange).toHaveBeenLastCalledWith("spring-menu-2");
    await waitFor(() => expect(input).not.toHaveAttribute("aria-invalid", "true"));
  });

  it("permalink: Edit opens the field, Escape restores, Enter confirms", async () => {
    const user = userEvent.setup();
    const { container } = render(<SlugInput variant="permalink" prefix="https://vamos.ist/blog/" defaultValue="launch-notes" name="slug" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://vamos.ist/blog/launch-notes");
    await user.click(screen.getByRole("button", { name: "Edit URL" }));
    const input = screen.getByRole("textbox", { name: "URL slug" });
    expect(input).toHaveFocus();
    await user.type(input, "-v2{Escape}");
    expect(screen.getByRole("button", { name: "Edit URL" })).toHaveFocus();
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://vamos.ist/blog/launch-notes");
    await user.click(screen.getByRole("button", { name: "Edit URL" }));
    await user.type(screen.getByRole("textbox", { name: "URL slug" }), "-v2{Enter}");
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://vamos.ist/blog/launch-notes-v2");
    expect(container.querySelector<HTMLInputElement>('input[name="slug"]')!.value).toBe("launch-notes-v2");
    await act(async () => {});
    expect(await axe(container)).toHaveNoViolations();
  });
});

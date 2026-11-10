import * as React from "react";
import { screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { FontPicker, FontPickerList } from "./font-picker";
import { expectNoA11yViolations, keys, renderWithProviders } from "../../test/utils";

describe("FontPickerList", () => {
  it("renders a labelled combobox, category filter and grouped listbox, and passes axe", async () => {
    renderWithProviders(<FontPickerList defaultValue="Onest" loadPreviews={false} />);
    const input = screen.getByRole("combobox", { name: "Search fonts" });
    const list = screen.getByRole("listbox", { name: "Fonts" });
    expect(input).toHaveAttribute("aria-controls", list.id);
    expect(within(list).getByRole("group", { name: "Mono" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Onest/ })).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option", { name: /Onest/ }).id);
    await expectNoA11yViolations();
  });

  it("filters with a Turkish-aware search and highlights the match", async () => {
    const { user } = renderWithProviders(<FontPickerList loadPreviews={false} />, { locale: "tr-TR" });
    await user.type(screen.getByRole("combobox"), "PLEX");
    const opts = screen.getAllByRole("option");
    expect(opts.map((o) => o.textContent)).toEqual(expect.arrayContaining([expect.stringContaining("IBM Plex Sans"), expect.stringContaining("IBM Plex Mono")]));
    expect(opts[0]!.querySelector("mark")).toHaveTextContent("Plex");
    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "zzzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/No fonts match/)).toBeInTheDocument();
  });

  it("restricts to categories and switches category chips", async () => {
    const { user } = renderWithProviders(<FontPickerList categories={["serif", "mono"]} loadPreviews={false} />);
    const chips = screen.getByRole("group", { name: "Category" });
    expect(within(chips).getAllByRole("button").map((b) => b.textContent)).toEqual(["All", "Serif", "Mono"]);
    await user.click(within(chips).getByRole("button", { name: "Mono" }));
    expect(within(chips).getByRole("button", { name: "Mono" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("option").every((o) => /Mono|Code/.test(o.textContent ?? ""))).toBe(true);
  });

  it("moves with the arrow keys and selects with Enter", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<FontPickerList categories={["mono"]} onValueChange={onValueChange} loadPreviews={false} />);
    const input = screen.getByRole("combobox");
    await user.click(input);
    const opts = screen.getAllByRole("option");
    expect(input).toHaveAttribute("aria-activedescendant", opts[0]!.id);
    await user.keyboard(keys.down + keys.down);
    expect(input).toHaveAttribute("aria-activedescendant", opts[2]!.id);
    await user.keyboard(keys.up);
    await user.keyboard(keys.enter);
    expect(onValueChange).toHaveBeenCalledWith("Geist Mono", expect.objectContaining({ id: "geist-mono" }));
    await user.keyboard("{Control>}{End}{/Control}");
    expect(input).toHaveAttribute("aria-activedescendant", opts[opts.length - 1]!.id);
  });
});

describe("FontPicker", () => {
  it("opens from the trigger, focuses search, selects and closes", async () => {
    const onValueChange = vi.fn();
    const { user } = renderWithProviders(<FontPicker aria-label="Heading font" defaultValue="Fraunces" onValueChange={onValueChange} loadPreviews={false} />);
    const trigger = screen.getByRole("button", { name: "Heading font" });
    expect(trigger).toHaveTextContent("Fraunces");
    expect(trigger).toHaveTextContent("Serif · Display");
    await user.click(trigger);
    const search = await screen.findByRole("combobox", { name: "Search fonts" });
    expect(search).toHaveFocus();
    await expectNoA11yViolations();
    await user.type(search, "newsreader");
    await user.keyboard(keys.enter);
    expect(onValueChange).toHaveBeenCalledWith("Newsreader", expect.anything());
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveTextContent("Newsreader");
    expect(trigger).toHaveFocus();
  });

  it("Escape closes without changing the value; works controlled with a hidden input", async () => {
    function Controlled() {
      const [v, setV] = React.useState<string | null>("Geist");
      return (
        <form aria-label="Brand">
          <FontPicker aria-label="Body font" name="bodyFont" value={v} onValueChange={setV} loadPreviews={false} />
        </form>
      );
    }
    const { user, container } = renderWithProviders(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Body font" }));
    await screen.findByRole("listbox");
    await user.keyboard(keys.escape);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(container.querySelector<HTMLInputElement>('input[name="bodyFont"]')!.value).toBe("Geist");
  });

  it("loads glyph previews from Google Fonts when opened", async () => {
    document.head.innerHTML = "";
    const { user } = renderWithProviders(<FontPicker aria-label="Font" defaultValue="Syne" />);
    expect(document.head.querySelector('link[href*="family=Syne"][href*="text="]')).not.toBeNull();
    await user.click(screen.getByRole("button", { name: "Font" }));
    await screen.findByRole("listbox");
    const preview = [...document.head.querySelectorAll("link[rel=stylesheet]")].some((l) => (l.getAttribute("href") ?? "").includes("family=Onest"));
    expect(preview).toBe(true);
  });
});

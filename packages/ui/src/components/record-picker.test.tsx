import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { RecordPicker, arrayRecordSource, clearRecordPickerCache, type RecordSource } from "./record-picker";
import { LocaleProvider } from "../lib/locale";

function setup(ui: React.ReactElement, locale = "en-US") {
  return { ...render(<LocaleProvider locale={locale}>{ui}</LocaleProvider>), user: userEvent.setup() };
}
const noViolations = async () => expect(await axe(document.body, { rules: { region: { enabled: false } } })).toHaveNoViolations();

interface Company {
  id: string;
  name: string;
  domain: string;
}
const companies: Company[] = [
  { id: "c1", name: "Northwind Traders", domain: "northwind.com" },
  { id: "c2", name: "Bosphorus Dental", domain: "bosphorusdental.com.tr" },
  { id: "c3", name: "Kadıköy Roasters", domain: "kadikoyroasters.com" },
  { id: "c4", name: "Lumen Architects", domain: "lumen.studio" },
];
const source = () =>
  arrayRecordSource<Company>("companies", companies, {
    getId: (c) => c.id,
    getLabel: (c) => c.name,
    getDescription: (c) => c.domain,
    getAvatar: (c) => ({ name: c.name, shape: "square" }),
    href: (c) => `/companies/${c.id}`,
  });

beforeEach(() => clearRecordPickerCache());

describe("RecordPicker", () => {
  it("searches, picks with the keyboard and shows the record in the trigger", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<RecordPicker aria-label="Company" source={source()} onValueChange={onValueChange} name="companyId" />);
    const trigger = screen.getByRole("button", { name: "Company" });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    await user.click(trigger);
    const input = await screen.findByRole("combobox");
    expect(input).toHaveFocus();
    await screen.findByRole("option", { name: /Northwind Traders/ });
    await user.type(input, "kadikoy");
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    // Accent / dotless-ı folding: "kadikoy" finds "Kadıköy"
    expect(screen.getByRole("option", { name: /Kadıköy Roasters/ })).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-activedescendant", screen.getByRole("option").id);
    await noViolations();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenCalledWith("c3", expect.objectContaining({ name: "Kadıköy Roasters" }));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger).toHaveTextContent("Kadıköy Roasters");
    expect(document.querySelector<HTMLInputElement>('input[name="companyId"]')?.value).toBe("c3");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null, null);
  });

  it("arrow keys move the active option; recent picks show on reopen", async () => {
    const { user } = setup(<RecordPicker aria-label="Company" source={source()} />);
    await user.click(screen.getByRole("button", { name: "Company" }));
    const input = await screen.findByRole("combobox");
    await screen.findByRole("option", { name: /Northwind/ });
    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: /Kadıköy/ }).id);
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Company" }));
    const recent = await screen.findByRole("group", { name: "Recent" });
    expect(within(recent).getByRole("option", { name: /Kadıköy/ })).toHaveAttribute("aria-selected", "true");
  });

  it("multiple: chips with links, remove buttons, Backspace removes the last, max", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(
      <RecordPicker aria-label="Related companies" multiple max={2} source={source()} defaultValue={["c1"]} selectedRecords={[companies[0]!]} onValueChange={onValueChange} />,
    );
    expect(screen.getByRole("link", { name: "Northwind Traders" })).toHaveAttribute("href", "/companies/c1");
    await user.click(screen.getByRole("button", { name: "Related companies" }));
    expect(await screen.findByRole("listbox")).toHaveAttribute("aria-multiselectable", "true");
    await user.click(await screen.findByRole("option", { name: /Lumen/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["c1", "c4"], expect.any(Array));
    // max reached → the rest are disabled
    expect(screen.getByRole("option", { name: /Bosphorus/ })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("You can pick up to 2 records")).toBeInTheDocument();
    await user.keyboard("{Backspace}");
    expect(onValueChange).toHaveBeenLastCalledWith(["c1"], expect.any(Array));
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Remove Northwind Traders" }));
    expect(onValueChange).toHaveBeenLastCalledWith([], []);
  });

  it("creates a record inline from the query", async () => {
    const onCreate = vi.fn(async (name: string) => ({ id: "new", name, domain: "—" }));
    const onValueChange = vi.fn();
    const { user } = setup(<RecordPicker aria-label="Company" source={source()} onCreate={onCreate} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Company" }));
    await user.type(await screen.findByRole("combobox"), "Moda Bakery");
    const create = await screen.findByRole("option", { name: "Create “Moda Bakery”" });
    await user.click(create);
    expect(onCreate).toHaveBeenCalledWith("Moda Bakery");
    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith("new", expect.objectContaining({ name: "Moda Bakery" })));
  });

  it("resolves initial ids through getByIds and flags deleted records", async () => {
    const src: RecordSource<Company> = { ...source(), key: "companies-remote" };
    const getByIds = vi.fn(async (ids: string[]) => companies.filter((c) => ids.includes(c.id)));
    const { user } = setup(<RecordPicker aria-label="Companies" multiple source={{ ...src, getByIds }} defaultValue={["c2", "deleted-9"]} />);
    expect(await screen.findByText("Bosphorus Dental")).toBeInTheDocument();
    expect(await screen.findByText("Unknown record")).toBeInTheDocument();
    expect(getByIds).toHaveBeenCalledWith(["c2", "deleted-9"], expect.any(AbortSignal));
    await user.click(screen.getByRole("button", { name: "Remove Unknown record" }));
    expect(screen.queryByText("Unknown record")).toBeNull();
  });

  it("shows an error with retry, and an empty state", async () => {
    let fail = true;
    const src: RecordSource<Company> = {
      ...source(),
      key: "flaky",
      search: async (q) => {
        if (fail) throw new Error("503");
        return { items: companies.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())) };
      },
    };
    const { user } = setup(<RecordPicker aria-label="Company" source={src} />);
    await user.click(screen.getByRole("button", { name: "Company" }));
    expect(await screen.findByText("Couldn't load results")).toBeInTheDocument();
    fail = false;
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    expect(await screen.findByRole("option", { name: /Northwind/ })).toBeInTheDocument();
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(await screen.findByText("No results for “zzz”")).toBeInTheDocument();
  });

  it("browse dialog picks several records", async () => {
    const onValueChange = vi.fn();
    const { user } = setup(<RecordPicker aria-label="Companies" multiple browse source={source()} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Companies" }));
    await user.click(await screen.findByRole("button", { name: /Browse all/ }));
    const dialog = await screen.findByRole("dialog", { name: "Browse" });
    await user.click(await within(dialog).findByRole("checkbox", { name: "Lumen Architects" }));
    await user.click(within(dialog).getByRole("checkbox", { name: "Northwind Traders" }));
    await user.click(within(dialog).getByRole("button", { name: "Select 2 records" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["c4", "c1"], expect.any(Array));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("card display and read-only links", async () => {
    setup(<RecordPicker aria-label="Account" source={source()} display="card" readOnly defaultValue="c4" selectedRecords={[companies[3]!]} />);
    expect(await screen.findByText("Lumen Architects")).toBeInTheDocument();
    expect(screen.getByText("lumen.studio")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Lumen Architects" })).toHaveAttribute("href", "/companies/c4");
    expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
    await noViolations();
  });
});

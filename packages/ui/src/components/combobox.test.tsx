import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { LocaleProvider } from "../lib/locale";
import { useAsyncList } from "../lib/use-async-list";
import { Combobox } from "./combobox";
import { Field } from "./input";

const cities = [
  { value: "istanbul", label: "İstanbul" },
  { value: "izmir", label: "İzmir" },
  { value: "canakkale", label: "Çanakkale" },
  { value: "ankara", label: "Ankara", keywords: ["capital"] },
  { value: "mugla", label: "Muğla", disabled: true },
];

describe("Combobox", () => {
  it("opens from a labelled trigger, filters with locale folding and selects", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { baseElement } = render(
      <LocaleProvider locale="tr-TR">
        <Field label="City" hint="Where the event takes place.">
          <Combobox items={cities} onValueChange={onChange} />
        </Field>
      </LocaleProvider>,
    );
    const trigger = screen.getByRole("combobox", { name: "City" });
    expect(trigger).toHaveAccessibleDescription("Where the event takes place.");
    await user.click(trigger);
    const search = await screen.findByRole("combobox", { name: /Search|Ara/ });
    expect(search).toHaveFocus();
    await user.keyboard("canak");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: /Çanakkale/ })).toBeInTheDocument();
    expect(await axe(baseElement, { rules: { region: { enabled: false } } })).toHaveNoViolations();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("canakkale", cities[2]);
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent("Çanakkale");
  });

  it("matches keywords and shows an empty state", async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="City" items={cities} defaultOpen />);
    const search = screen.getByRole("combobox", { name: "Search…" });
    await user.type(search, "capital");
    expect(screen.getByRole("option", { name: /Ankara/ })).toBeInTheDocument();
    await user.clear(search);
    await user.type(search, "zzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(document.querySelector('[data-slot="combobox-empty"]')).toHaveTextContent("No results");
  });

  it("multiple: toggles chips, Backspace removes the last chip, submits repeated inputs", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <form aria-label="Event">
        <Combobox multiple aria-label="Cities" name="cities" items={cities} defaultValue={["ankara"]} onValueChange={onChange} />
      </form>,
    );
    expect(screen.getByRole("button", { name: "Remove Ankara" })).toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Cities" }));
    await user.click(await screen.findByRole("option", { name: /İzmir/ }));
    expect(onChange).toHaveBeenLastCalledWith(["ankara", "izmir"], [cities[3], cities[1]]);
    // list stays open in multi mode
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["ankara"], [cities[3]]);
    expect(new FormData(container.querySelector("form")!).getAll("cities")).toEqual(["ankara"]);
  });

  it("multiple: removes a chip with its button and moves between chips with arrows", async () => {
    const user = userEvent.setup();
    render(<Combobox multiple aria-label="Cities" items={cities} defaultValue={["ankara", "izmir"]} />);
    const trigger = screen.getByRole("combobox", { name: "Cities" });
    trigger.focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Remove İzmir" })).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: "Remove Ankara" })).toHaveFocus();
    await user.keyboard("{Delete}");
    expect(screen.queryByRole("button", { name: "Remove Ankara" })).not.toBeInTheDocument();
  });

  it("async: debounces, aborts superseded requests and pages", async () => {
    const user = userEvent.setup();
    const calls: Array<{ q: string; cursor?: string; signal: AbortSignal }> = [];
    const loadItems = vi.fn((q: string, signal: AbortSignal, cursor?: string) => {
      calls.push({ q, cursor, signal });
      const page = cursor ? 2 : 1;
      return Promise.resolve({
        items: [1, 2].map((n) => ({ value: `${q}-${page}-${n}`, label: `${q || "All"} result ${page}.${n}` })),
        cursor: page === 1 ? "p2" : null,
      });
    });
    render(<Combobox aria-label="Assignee" loadItems={loadItems} debounce={30} defaultOpen />);
    expect(await screen.findByRole("option", { name: /All result 1.1/ })).toBeInTheDocument();
    await user.type(screen.getByRole("combobox", { name: "Search…" }), "ada");
    expect(await screen.findByRole("option", { name: /ada result 1.1/ })).toBeInTheDocument();
    const adaCalls = calls.filter((c) => c.q === "ada");
    expect(adaCalls).toHaveLength(1);
    await user.click(screen.getByRole("option", { name: "Show more results" }));
    expect(await screen.findByRole("option", { name: /ada result 2.1/ })).toBeInTheDocument();
    expect(calls.at(-1)).toMatchObject({ q: "ada", cursor: "p2" });
  });

  it("creatable: offers to create unknown text and selects the new item", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCreate = vi.fn(async (label: string) => ({ value: label.toLowerCase(), label }));
    render(<Combobox aria-label="Category" items={cities} onCreate={onCreate} onValueChange={onChange} defaultOpen />);
    await user.type(screen.getByRole("combobox", { name: "Search…" }), "Bursa");
    await user.click(screen.getByRole("option", { name: "Create “Bursa”" }));
    expect(onCreate).toHaveBeenCalledWith("Bursa");
    await waitFor(() => expect(onChange).toHaveBeenCalledWith("bursa", { value: "bursa", label: "Bursa" }));
  });

  it("inline mode renders the list in place and is named by the Field", async () => {
    const { container } = render(
      <Field label="Team">
        <Combobox mode="inline" items={cities.slice(0, 3)} />
      </Field>,
    );
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Team" })).toBeInTheDocument());
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("useAsyncList", () => {
  it("aborts the request in flight when the query changes", async () => {
    vi.useFakeTimers();
    const signals: AbortSignal[] = [];
    const load = vi.fn((q: string, signal: AbortSignal) => {
      signals.push(signal);
      return new Promise<string[]>((resolve) => setTimeout(() => resolve([q]), 100));
    });
    const { result, rerender } = renderHook(({ query }) => useAsyncList({ load, query, debounce: 50 }), { initialProps: { query: "" } });
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    rerender({ query: "a" });
    expect(signals[0]!.aborted).toBe(true);
    rerender({ query: "ab" });
    await act(async () => {
      vi.advanceTimersByTime(60);
    });
    // "a" never fired (debounced away)
    expect(load.mock.calls.map((c) => c[0])).toEqual(["", "ab"]);
    await act(async () => {
      vi.advanceTimersByTime(120);
    });
    expect(result.current.items).toEqual(["ab"]);
    expect(result.current.loading).toBe(false);
    vi.useRealTimers();
  });
});

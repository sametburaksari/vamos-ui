import * as React from "react";
import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";
import {
  Sortable,
  SortableContainer,
  SortableGrid,
  SortableHandle,
  SortableItem,
  SortableList,
  SortableMoveMenu,
  SortableOverlay,
  type SortableMoveBetweenEvent,
} from "./index";

interface Page {
  id: string;
  title: string;
  locked?: boolean;
}

const PAGES: Page[] = [
  { id: "home", title: "Home" },
  { id: "about", title: "About us" },
  { id: "pricing", title: "Pricing" },
  { id: "blog", title: "Blog" },
  { id: "contact", title: "Contact", locked: true },
];

function MenuList(props: { onReorder?: (next: Page[]) => void; locale?: string }) {
  const [pages, setPages] = React.useState(PAGES);
  return (
    <SortableList
      aria-label="Main menu"
      items={pages}
      getLabel={(p) => p.title}
      disabled={(p) => !!p.locked}
      onReorder={(next) => {
        setPages(next);
        props.onReorder?.(next);
      }}
      renderItem={(p) => <span>{p.title}</span>}
    />
  );
}

const titles = () => within(screen.getByRole("list", { name: "Main menu" })).getAllByRole("listitem").map((li) => li.textContent);

describe("SortableList", () => {
  it("renders a labelled list with handles and move menus", async () => {
    renderWithProviders(<MenuList />);
    expect(screen.getByRole("list", { name: "Main menu" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("button", { name: "Reorder About us" })).toHaveAttribute("aria-roledescription", "sortable");
    expect(screen.getByRole("button", { name: "Move About us" })).toBeInTheDocument();
    // Disabled (locked) item has no handle and no menu.
    expect(screen.queryByRole("button", { name: "Reorder Contact" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Move Contact" })).toBeNull();
    await expectNoA11yViolations();
  });

  it("has no a11y violations in RTL and dark glass", async () => {
    renderWithProviders(<MenuList />, { dir: "rtl", locale: "ar-EG", theme: { dark: true, material: "glass" } });
    await expectNoA11yViolations();
  });

  it("reorders through the Move menu and announces the result", async () => {
    const onReorder = vi.fn();
    const { user } = renderWithProviders(<MenuList onReorder={onReorder} />);
    await user.click(screen.getByRole("button", { name: "Move About us" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Move up" })).not.toHaveAttribute("data-disabled");
    await user.click(within(menu).getByRole("menuitem", { name: "Move to bottom" }));
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(titles()).toEqual(["Home", "Pricing", "Blog", "Contact", "About us"]);
    await waitFor(() => expect(document.querySelector('[data-slot="sortable-status"]')).toHaveTextContent("About us moved to position 5 of 5."));
  });

  it("disables impossible moves at the edges", async () => {
    const { user } = renderWithProviders(<MenuList />);
    await user.click(screen.getByRole("button", { name: "Move Home" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Move up" })).toHaveAttribute("data-disabled");
    expect(within(menu).getByRole("menuitem", { name: "Move to top" })).toHaveAttribute("data-disabled");
  });

  it("lifts with the keyboard, announces and cancels with Escape", async () => {
    const spoken: string[] = [];
    const observer = new MutationObserver(() => {
      const text = document.querySelector('[id^="DndLiveRegion"]')?.textContent ?? "";
      if (text && spoken.at(-1) !== text) spoken.push(text);
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true });
    // A single row: without layout (jsdom) every row overlaps, so only then is "over" the item itself.
    const { user } = renderWithProviders(
      <SortableList aria-label="Main menu" items={[PAGES[1]!]} getLabel={(p) => p.title} onReorder={() => {}} renderItem={(p) => p.title} />,
    );
    const handle = screen.getByRole("button", { name: "Reorder About us" });
    expect(handle).toHaveAttribute("aria-describedby");
    expect(document.getElementById(handle.getAttribute("aria-describedby")!)).toHaveTextContent("press Space or Enter");
    act(() => handle.focus());
    await user.keyboard(" ");
    await waitFor(() => expect(spoken).toContain("Picked up About us. Position 1 of 1."));
    expect(document.documentElement).toHaveAttribute("data-dragging");
    expect(handle).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(spoken).toContain("Moving About us cancelled. It is back at position 1 of 1."));
    expect(document.documentElement).not.toHaveAttribute("data-dragging");
    expect(handle).not.toHaveAttribute("aria-pressed", "true");
    observer.disconnect();
  });

  it("speaks Turkish from the dictionary-free labels prop", async () => {
    renderWithProviders(
      <SortableList
        aria-label="Menü"
        items={[{ id: "a", title: "Hakkımızda" }]}
        getLabel={(p) => p.title}
        onReorder={() => {}}
        renderItem={(p) => p.title}
        labels={{ handle: "{item} sırasını değiştir", moveMenu: "{item} öğesini taşı" }}
      />,
      { locale: "tr-TR" },
    );
    expect(screen.getByRole("button", { name: "Hakkımızda sırasını değiştir" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hakkımızda öğesini taşı" })).toBeInTheDocument();
  });

  it("shows the empty slot", () => {
    renderWithProviders(<SortableList aria-label="Steps" items={[] as Page[]} onReorder={() => {}} renderItem={(p) => p.title} empty={<p>No steps yet</p>} />);
    expect(screen.getByText("No steps yet")).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });
});

describe("SortableGrid", () => {
  const photos = [
    { id: "p1", alt: "Harbour at dawn" },
    { id: "p2", alt: "Market stalls" },
    { id: "p3", alt: "Old town rooftops" },
  ];
  it("makes whole tiles draggable and stays accessible", async () => {
    const onReorder = vi.fn();
    const { user } = renderWithProviders(
      <SortableGrid aria-label="Gallery" items={photos} getLabel={(p) => p.alt} onReorder={onReorder} renderItem={(p) => <span>{p.alt}</span>} />,
    );
    const tiles = within(screen.getByRole("list", { name: "Gallery" })).getAllByRole("listitem");
    expect(tiles).toHaveLength(3);
    const activator = tiles[0]!.querySelector('[data-slot="sortable-activator"]')!;
    expect(activator).toHaveAttribute("role", "button");
    expect(activator).toHaveAttribute("tabindex", "0");
    await expectNoA11yViolations();
    await user.click(screen.getByRole("button", { name: "Move Market stalls" }));
    await user.click(await screen.findByRole("menuitem", { name: "Move earlier" }));
    expect(onReorder.mock.calls[0]![0].map((p: { id: string }) => p.id)).toEqual(["p2", "p1", "p3"]);
  });
});

describe("Sortable (composable)", () => {
  it("works with SortableItem + SortableHandle + overlay", async () => {
    renderWithProviders(
      <Sortable items={PAGES} getLabel={(p) => p.title} onReorder={() => {}}>
        <ol aria-label="Pages">
          {PAGES.map((p) => (
            <SortableItem key={p.id} id={p.id} as="li">
              <SortableHandle /> {p.title} <SortableMoveMenu />
            </SortableItem>
          ))}
        </ol>
        <SortableOverlay>{(id) => <div>{id}</div>}</SortableOverlay>
      </Sortable>,
    );
    expect(screen.getByRole("button", { name: "Reorder Pricing" })).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("moves between containers from the Move menu", async () => {
    const onMoveBetween = vi.fn<(e: SortableMoveBetweenEvent) => void>();
    const items = [
      { id: "t1", title: "Draft release notes" },
      { id: "t2", title: "Review pricing page" },
      { id: "t3", title: "Publish case study" },
    ];
    function Board() {
      const [cols, setCols] = React.useState([
        { id: "todo", label: "To do", items: ["t1", "t2"] },
        { id: "done", label: "Done", items: ["t3"] },
      ]);
      return (
        <Sortable
          items={items}
          getLabel={(i) => i.title}
          containers={cols}
          onMoveBetween={(e) => {
            onMoveBetween(e);
            setCols((prev) => {
              const without = prev.map((c) => ({ ...c, items: c.items.filter((x) => x !== e.id) }));
              return without.map((c) => (c.id === e.to ? { ...c, items: [...c.items.slice(0, e.index), e.id, ...c.items.slice(e.index)] } : c));
            });
          }}
        >
          {cols.map((c) => (
            <SortableContainer key={c.id} id={c.id} as="section" aria-label={c.label}>
              {(ids) => (
                <ul>
                  {ids.map((id) => (
                    <SortableItem key={id} id={id} as="li">
                      <SortableHandle /> {items.find((i) => i.id === id)!.title} <SortableMoveMenu />
                    </SortableItem>
                  ))}
                </ul>
              )}
            </SortableContainer>
          ))}
        </Sortable>
      );
    }
    const { user } = renderWithProviders(<Board />);
    await user.click(screen.getByRole("button", { name: "Move Review pricing page" }));
    await user.click(await screen.findByRole("menuitem", { name: "Move to Done" }));
    expect(onMoveBetween).toHaveBeenCalledWith({ id: "t2", from: "todo", to: "done", index: 1, fromIndex: 1 });
    expect(within(screen.getByRole("region", { name: "Done" })).getAllByRole("listitem").map((li) => li.textContent?.trim())).toEqual([
      "Publish case study",
      "Review pricing page",
    ]);
    await waitFor(() => expect(document.querySelector('[data-slot="sortable-status"]')).toHaveTextContent("Review pricing page moved to Done, position 2 of 2."));
    await expectNoA11yViolations();
  });
});

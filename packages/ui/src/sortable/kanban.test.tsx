import * as React from "react";
import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";
import { Kanban, KanbanCardTitle, applyKanbanMove, groupByStage, weightedSum, type KanbanMoveEvent, type Stage } from "./index";

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: string;
  owner: string;
}

const STAGES: Stage[] = [
  { key: "lead", label: "Lead", tone: "chart-1", probability: 0.1 },
  { key: "proposal", label: "Proposal", tone: "chart-3", probability: 0.5, wipLimit: 1 },
  { key: "won", label: "Won", tone: "success", category: "done", probability: 1 },
];

const DEALS: Deal[] = [
  { id: "d1", title: "Northwind renewal", stage: "lead", value: "12000.00", owner: "ana" },
  { id: "d2", title: "Northpoint onboarding", stage: "lead", value: "8500.00", owner: "ben" },
  { id: "d3", title: "Corvane expansion", stage: "proposal", value: "42000.00", owner: "ana" },
];

const opts = { getId: (d: Deal) => d.id, getStageKey: (d: Deal) => d.stage, update: (d: Deal, stage: string) => ({ ...d, stage }) };

function Board(props: { onMove?: (e: KanbanMoveEvent) => void | Promise<void>; canMove?: (e: KanbanMoveEvent) => true | string; onQuickAdd?: (s: string, t: string) => void; lanes?: boolean }) {
  const [deals, setDeals] = React.useState(DEALS);
  return (
    <Kanban
      aria-label="Sales pipeline"
      stages={STAGES}
      items={deals}
      getStageKey={(d) => d.stage}
      renderCard={(d) => <KanbanCardTitle>{d.title}</KanbanCardTitle>}
      summary={(items) => `${items.length} open`}
      canMove={props.canMove}
      onQuickAdd={props.onQuickAdd}
      lanes={props.lanes ? [{ key: "ana", label: "Ana Ruiz" }, { key: "ben", label: "Ben Okafor" }] : undefined}
      getLaneKey={(d) => d.owner}
      onMove={(e) => {
        const r = props.onMove?.(e);
        if (r instanceof Promise) return r;
        setDeals((all) => applyKanbanMove(all, e, { ...opts, getLaneKey: (d) => d.owner, update: (d, stage, lane) => ({ ...d, stage, owner: lane ?? d.owner }) }));
      }}
    />
  );
}

const column = (name: RegExp) => screen.getByRole("group", { name });
const cardsIn = (name: RegExp) => within(column(name)).queryAllByRole("article").map((a) => a.getAttribute("aria-label"));

describe("kanban core", () => {
  it("groups, sums and applies moves exactly", () => {
    const g = groupByStage(DEALS, STAGES, (d) => d.stage);
    expect(g.get("lead")!.map((d) => d.id)).toEqual(["d1", "d2"]);
    expect(weightedSum(g.get("lead")!, STAGES[0]!, (d) => d.value)).toBe("2050.00");
    const next = applyKanbanMove(DEALS, { id: "d3", from: "proposal", to: "lead", index: 1, fromIndex: 0 }, opts);
    expect(next.filter((d) => d.stage === "lead").map((d) => d.id)).toEqual(["d1", "d3", "d2"]);
  });
});

describe("Kanban", () => {
  it("renders named columns with counts, WIP and summaries, and is accessible", async () => {
    renderWithProviders(<Board />);
    expect(screen.getByRole("region", { name: "Sales pipeline" })).toBeInTheDocument();
    const lead = column(/^Lead, 2 items/);
    expect(lead).toHaveAccessibleDescription("2 open");
    expect(within(lead).getAllByRole("article")).toHaveLength(2);
    expect(column(/^Won, no items/)).toHaveTextContent("Drop items here");
    expect(within(column(/^Proposal/)).getByText("1 of 1")).toBeInTheDocument();
    await expectNoA11yViolations();
  });

  it("is accessible in dark glass RTL", async () => {
    renderWithProviders(<Board />, { dir: "rtl", locale: "ar-EG", theme: { dark: true, material: "glass" } });
    await expectNoA11yViolations();
  });

  it("moves a card with the card menu, announces it and keeps focus on the card", async () => {
    const onMove = vi.fn();
    const { user } = renderWithProviders(<Board onMove={onMove} />);
    await user.click(screen.getByRole("button", { name: "Actions for Northpoint onboarding" }));
    await user.click(await screen.findByRole("menuitem", { name: "Won" }));
    expect(onMove).toHaveBeenCalledWith({ id: "d2", from: "lead", to: "won", index: 0, fromIndex: 1 });
    expect(cardsIn(/^Won/)).toEqual(["Northpoint onboarding"]);
    await waitFor(() => expect(document.querySelector('[data-slot="kanban-status"]')).toHaveTextContent("Northpoint onboarding moved to Won, position 1 of 1."));
    await waitFor(() => expect(document.activeElement).toHaveAttribute("aria-label", "Northpoint onboarding"));
  });

  it("moves with Alt + arrow shortcuts", async () => {
    const { user } = renderWithProviders(<Board />);
    const card = screen.getByRole("article", { name: "Northwind renewal" });
    act(() => card.focus());
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(cardsIn(/^Lead/)).toEqual(["Northpoint onboarding", "Northwind renewal"]);
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(cardsIn(/^Proposal/)).toEqual(["Corvane expansion", "Northwind renewal"]);
    expect(within(column(/^Proposal/)).getByText("Over the work-in-progress limit of 1")).toBeInTheDocument();
  });

  it("mirrors Alt + arrows in RTL", async () => {
    const { user } = renderWithProviders(<Board />, { dir: "rtl", locale: "ar-EG" });
    act(() => screen.getByRole("article", { name: "Northpoint onboarding" }).focus());
    await user.keyboard("{Alt>}{ArrowLeft}{/Alt}");
    expect(cardsIn(/^Proposal/)).toContain("Northpoint onboarding");
  });

  it("disables blocked moves with the reason", async () => {
    const canMove = (e: KanbanMoveEvent) => (e.to === "won" ? "Add a signed contract before marking as Won" : true);
    const onMove = vi.fn();
    const { user } = renderWithProviders(<Board canMove={canMove} onMove={onMove} />);
    await user.click(screen.getByRole("button", { name: "Actions for Corvane expansion" }));
    const won = await screen.findByRole("menuitem", { name: /Won/ });
    expect(won).toHaveAttribute("data-disabled");
    expect(won).toHaveTextContent("Add a signed contract before marking as Won");
    await user.keyboard("{Escape}");
    act(() => screen.getByRole("article", { name: "Corvane expansion" }).focus());
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(onMove).not.toHaveBeenCalled();
    await waitFor(() => expect(document.querySelector('[data-slot="kanban-status"]')).toHaveTextContent("Can't move Corvane expansion to Won"));
  });

  it("keeps an async move optimistic and rolls it back on failure", async () => {
    let reject!: () => void;
    const onMove = vi.fn(() => new Promise<void>((_, r) => (reject = () => r(new Error("offline")))));
    const { user } = renderWithProviders(<Board onMove={onMove} />);
    await user.click(screen.getByRole("button", { name: "Actions for Northwind renewal" }));
    await user.click(await screen.findByRole("menuitem", { name: "Proposal" }));
    expect(cardsIn(/^Proposal/)).toContain("Northwind renewal");
    expect(screen.getByRole("article", { name: "Northwind renewal" })).toHaveAttribute("aria-busy", "true");
    await act(async () => reject());
    await waitFor(() => expect(cardsIn(/^Lead/)).toContain("Northwind renewal"));
  });

  it("adds a card with quick add", async () => {
    const onQuickAdd = vi.fn();
    const { user } = renderWithProviders(<Board onQuickAdd={onQuickAdd} />);
    const lead = column(/^Lead/);
    await user.click(within(lead).getAllByRole("button", { name: "Add card to Lead" }).at(-1)!);
    await user.type(within(lead).getByRole("textbox", { name: "Card title" }), "Halden pilot{Enter}");
    expect(onQuickAdd).toHaveBeenCalledWith("lead", "Halden pilot");
    await user.keyboard("{Escape}");
    expect(within(lead).queryByRole("textbox")).toBeNull();
  });

  it("collapses and expands a column", async () => {
    const { user } = renderWithProviders(<Board />);
    await user.click(screen.getByRole("button", { name: "Lead options" }));
    await user.click(await screen.findByRole("menuitem", { name: "Collapse column" }));
    const expand = screen.getByTitle("Expand Lead");
    expect(expand).toHaveAttribute("aria-expanded", "false");
    expect(within(column(/^Lead/)).queryAllByRole("article")).toHaveLength(0);
    await user.click(expand);
    expect(within(column(/^Lead/)).getAllByRole("article")).toHaveLength(2);
  });

  it("renders swimlanes as lane × stage cells", async () => {
    const onMove = vi.fn();
    const { user } = renderWithProviders(<Board lanes onMove={onMove} />);
    expect(screen.getByRole("group", { name: "Lead, Ana Ruiz, 1 item" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Proposal, Ben Okafor, no items" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Actions for Northpoint onboarding" }));
    await user.click(await screen.findByRole("menuitem", { name: "Proposal" }));
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({ id: "d2", to: "proposal", lane: "ben", fromLane: "ben" }));
    await expectNoA11yViolations();
  });

  it("shows skeletons while loading and a filtered-empty message", () => {
    const { rerender } = renderWithProviders(
      <Kanban aria-label="Board" stages={STAGES} items={[] as Deal[]} getStageKey={(d) => d.stage} renderCard={(d) => d.title} onMove={() => {}} loading />,
    );
    expect(screen.getByText("Loading board")).toBeInTheDocument();
    rerender(<Kanban aria-label="Board" stages={STAGES} items={[] as Deal[]} getStageKey={(d) => d.stage} renderCard={(d) => d.title} onMove={() => {}} filtered />);
    expect(screen.getAllByText("No items match")).toHaveLength(3);
  });
});

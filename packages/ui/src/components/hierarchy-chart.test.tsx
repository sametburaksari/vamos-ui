import * as React from "react";
import { act, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations, renderWithProviders } from "../../test/utils";
import { HierarchyChart, HierarchyPersonNode, layoutHierarchy, type HierarchyChartHandle, type HierarchyReparentEvent } from "./hierarchy-chart";

interface Person {
  id: string;
  parentId: string | null;
  name: string;
  title: string;
}

const PEOPLE: Person[] = [
  { id: "ceo", parentId: null, name: "Leyla Aksoy", title: "Chief Executive Officer" },
  { id: "cto", parentId: "ceo", name: "Marcus Lee", title: "Chief Technology Officer" },
  { id: "cfo", parentId: "ceo", name: "Priya Raman", title: "Chief Financial Officer" },
  { id: "eng1", parentId: "cto", name: "Jonas Berg", title: "Engineering Manager" },
  { id: "eng2", parentId: "cto", name: "Sofia Marino", title: "Staff Engineer" },
  { id: "fin1", parentId: "cfo", name: "Daniel Okoye", title: "Controller" },
];

function Org(props: Partial<React.ComponentProps<typeof HierarchyChart<Person>>> & { chartRef?: React.Ref<HierarchyChartHandle> }) {
  const { chartRef, ...rest } = props;
  return (
    <HierarchyChart
      ref={chartRef}
      aria-label="Organization"
      nodes={PEOPLE}
      getLabel={(p) => p.name}
      getDescription={(p) => p.title}
      renderNode={(p) => <HierarchyPersonNode name={p.name} title={p.title} />}
      {...rest}
    />
  );
}

const node = (name: RegExp) => screen.getByRole("treeitem", { name });

describe("layoutHierarchy", () => {
  it("places children below parents and mirrors in RTL", () => {
    const l = layoutHierarchy(PEOPLE, { size: { width: 200, height: 80 }, gap: { x: 20, y: 40 } });
    const at = (id: string) => l.nodes.find((n) => n.id === id)!;
    expect(at("cto").y).toBe(120);
    expect(at("cto").x).toBeLessThan(at("cfo").x);
    expect(at("ceo").x + 100).toBeCloseTo((at("cto").x + at("cfo").x) / 2 + 100, 0);
    const rtl = layoutHierarchy(PEOPLE, { size: { width: 200, height: 80 }, gap: { x: 20, y: 40 }, dir: "rtl" });
    const r = (id: string) => rtl.nodes.find((n) => n.id === id)!;
    expect(r("cto").x).toBeGreaterThan(r("cfo").x);
    const collapsed = layoutHierarchy(PEOPLE, { collapsed: new Set(["cto"]) });
    expect(collapsed.nodes.map((n) => n.id)).not.toContain("eng1");
  });
});

describe("HierarchyChart", () => {
  it("renders a tree of person nodes and is accessible", async () => {
    renderWithProviders(<Org />);
    const tree = screen.getByRole("tree", { name: "Organization" });
    expect(within(tree).getAllByRole("treeitem")).toHaveLength(6);
    const ceo = node(/Leyla Aksoy/);
    expect(ceo).toHaveAttribute("aria-level", "1");
    expect(ceo).toHaveAttribute("aria-expanded", "true");
    expect(node(/Priya Raman/)).toHaveAttribute("aria-posinset", "2");
    expect(screen.getByRole("group", { name: "Organization · Chart canvas" })).toHaveAccessibleDescription(/Arrow keys pan/);
    await expectNoA11yViolations();
  });

  it("is accessible in dark glass RTL", async () => {
    renderWithProviders(<Org />, { dir: "rtl", locale: "ar-EG", theme: { dark: true, material: "glass" } });
    await expectNoA11yViolations();
  });

  it("follows the Tree view keyboard model and selects", async () => {
    const onSelectedChange = vi.fn();
    const { user } = renderWithProviders(<Org onSelectedChange={onSelectedChange} />);
    act(() => node(/Leyla Aksoy/).focus());
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(document.activeElement).toBe(node(/Marcus Lee/)));
    await user.keyboard("{ArrowLeft}");
    expect(node(/Marcus Lee/)).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: /Jonas Berg/ })).toBeNull();
    expect(node(/Marcus Lee/)).toHaveTextContent("2 hidden below");
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("treeitem", { name: /Jonas Berg/ })).toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(onSelectedChange).toHaveBeenCalledWith("cto");
    expect(node(/Marcus Lee/)).toHaveAttribute("aria-selected", "true");
    await user.keyboard("p");
    await waitFor(() => expect(document.activeElement).toBe(node(/Priya Raman/)));
  });

  it("collapses by depth and highlights search matches with their ancestors opened", () => {
    renderWithProviders(<Org defaultCollapsed={{ depth: 1 }} highlight="okoye" />);
    expect(node(/Daniel Okoye/)).toHaveAttribute("data-match");
    expect(screen.queryByRole("treeitem", { name: /Jonas Berg/ })).toBeNull();
  });

  it("changes parent from the node menu (non-drag alternative)", async () => {
    const onReparent = vi.fn<(e: HierarchyReparentEvent) => void>();
    const { user } = renderWithProviders(<Org onReparent={onReparent} canReparent={(e) => (e.newParentId === "fin1" ? "Controllers have no reports" : true)} />);
    act(() => node(/Sofia Marino/).focus());
    await user.keyboard("{Shift>}{F10}{/Shift}");
    await user.click(await screen.findByRole("menuitem", { name: "Change parent…" }));
    const dialog = await screen.findByRole("dialog", { name: "Move Sofia Marino under…" });
    expect(within(dialog).queryByRole("option", { name: /Marcus Lee/ })).toBeNull();
    expect(within(dialog).queryByRole("option", { name: /Sofia Marino/ })).toBeNull();
    expect(within(dialog).getByRole("option", { name: /Daniel Okoye/ })).toHaveAttribute("aria-disabled", "true");
    await user.click(within(dialog).getByRole("option", { name: /Priya Raman/ }));
    expect(onReparent).toHaveBeenCalledWith({ id: "eng2", newParentId: "cfo", oldParentId: "cto" });
    await waitFor(() => expect(document.querySelector('[data-slot="hierarchy-status"]')).toHaveTextContent("Sofia Marino moved under Priya Raman."));
  });

  it("blocks cycles in the parent picker", async () => {
    const { user } = renderWithProviders(<Org onReparent={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Actions for Marcus Lee" }));
    await user.click(await screen.findByRole("menuitem", { name: "Change parent…" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByRole("option", { name: /Jonas Berg/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("renders the same data as a list view", async () => {
    renderWithProviders(<Org view="list" />);
    const tree = screen.getByRole("tree", { name: "Organization" });
    expect(within(tree).getAllByRole("treeitem").length).toBeGreaterThanOrEqual(6);
    await expectNoA11yViolations();
  });

  it("exports a standalone SVG through the ref", () => {
    const ref = React.createRef<HierarchyChartHandle>();
    renderWithProviders(<Org chartRef={ref} />);
    const svg = ref.current!.toSVG();
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("Leyla Aksoy");
    expect(svg).toContain("Chief Financial Officer");
    expect((svg.match(/<path /g) ?? []).length).toBe(5);
  });

  it("shows loading and empty states", () => {
    const { rerender } = renderWithProviders(<Org loading />);
    expect(screen.getByText("Loading chart")).toBeInTheDocument();
    rerender(<Org nodes={[]} empty="No people in this department yet" />);
    expect(screen.getByText("No people in this department yet")).toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { arrayMove, descendantIds, flattenTree, keepMountedRange, moveBetweenContainers, moveTargetIndex, moveTreeNode, projectTreeMove, type SortableTreeNode } from "./core";

describe("arrayMove", () => {
  it("moves and clamps", () => {
    expect(arrayMove(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(arrayMove(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(arrayMove(["a", "b", "c"], 1, 99)).toEqual(["a", "c", "b"]);
    expect(arrayMove(["a"], 5, 0)).toEqual(["a"]);
  });

  it("is a permutation that puts the item at `to` (property)", () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer(), { minLength: 1, maxLength: 30 }), fc.nat(), fc.nat(), (a, f, t) => {
        const from = f % a.length;
        const to = t % a.length;
        const out = arrayMove(a, from, to);
        expect([...out].sort()).toEqual([...a].sort());
        expect(out[to]).toBe(a[from]);
        expect(arrayMove(out, to, from)).toEqual(a);
      }),
    );
  });
});

describe("move menu targets", () => {
  it("returns null for impossible moves", () => {
    expect(moveTargetIndex(0, 3, "up")).toBeNull();
    expect(moveTargetIndex(0, 3, "top")).toBeNull();
    expect(moveTargetIndex(2, 3, "down")).toBeNull();
    expect(moveTargetIndex(1, 3, "bottom")).toBe(2);
  });
});

describe("containers", () => {
  it("moves between containers", () => {
    const out = moveBetweenContainers([{ id: "a", items: ["1", "2"] }, { id: "b", items: ["3"] }], "1", "b", 0);
    expect(out).toEqual([{ id: "a", items: ["2"] }, { id: "b", items: ["1", "3"] }]);
  });
});

const tree: SortableTreeNode[] = [
  { id: "home" },
  { id: "products", children: [{ id: "shoes" }, { id: "bags", children: [{ id: "totes" }] }] },
  { id: "about" },
];

describe("trees", () => {
  it("flattens depth-first", () => {
    expect(flattenTree(tree).map((f) => `${f.id}:${f.depth}:${f.parentId}`)).toEqual([
      "home:0:null",
      "products:0:null",
      "shoes:1:products",
      "bags:1:products",
      "totes:2:bags",
      "about:0:null",
    ]);
    expect([...descendantIds(tree, "products")]).toEqual(["shoes", "bags", "totes"]);
  });

  it("projects depth from the horizontal offset (RTL mirrored)", () => {
    const flat = flattenTree(tree);
    // Drag "about" right by one indent: last child of "products"; two indents: child of "bags".
    expect(projectTreeMove(flat, "about", "about", 24, 24)).toEqual({ parentId: "products", depth: 1, index: 2 });
    expect(projectTreeMove(flat, "about", "about", 48, 24)).toEqual({ parentId: "bags", depth: 2, index: 1 });
    expect(projectTreeMove(flat, "about", "about", -48, 24, { dir: "rtl" })).toEqual({ parentId: "bags", depth: 2, index: 1 });
    expect(projectTreeMove(flat, "about", "about", 0, 24)).toEqual({ parentId: null, depth: 0, index: 2 });
    // Capped by maxDepth.
    expect(projectTreeMove(flat, "about", "about", 96, 24, { maxDepth: 2 })).toEqual({ parentId: "products", depth: 1, index: 2 });
    expect(projectTreeMove(flat, "missing", "about", 0, 24)).toBeNull();
  });

  it("moves nodes immutably", () => {
    const out = moveTreeNode(tree, "about", "bags", 0);
    expect(flattenTree(out).map((f) => f.id)).toEqual(["home", "products", "shoes", "bags", "about", "totes"]);
    expect(tree[2]!.id).toBe("about");
  });
});

describe("keepMountedRange", () => {
  it("adds the active index outside the window", () => {
    expect(keepMountedRange(50)({ startIndex: 0, endIndex: 3, overscan: 1, count: 100 })).toEqual([0, 1, 2, 3, 4, 50]);
    expect(keepMountedRange(null)({ startIndex: 5, endIndex: 6, overscan: 0, count: 10 })).toEqual([5, 6]);
  });
});

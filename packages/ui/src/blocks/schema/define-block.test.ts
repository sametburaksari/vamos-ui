import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineBlock, createRegistry, BlockDefinitionError } from "./define-block";
import { f } from "./fields";
import { migrateNode, migrateDoc } from "./migrate";
import { validateNode } from "./validate";
import { VamosDocSchema, BlockNodeSchema } from "./nodes";
import { introBlock, faqBlock, testRegistry, sampleDoc } from "../../render/_fixtures";

describe("defineBlock", () => {
  it("rejects bad definitions", () => {
    const schema = z.object({ title: f.heading() });
    expect(() => defineBlock({ type: "Hero", version: 1, title: "Hero", category: "intro", schema })).toThrow(BlockDefinitionError);
    expect(() => defineBlock({ type: "hero", version: 0, title: "Hero", category: "intro", schema })).toThrow(/version/);
    expect(() => defineBlock({ type: "hero", version: 2, title: "Hero", category: "intro", schema })).toThrow(/migrate\[1\]/);
    expect(() => defineBlock({ type: "hero", version: 1, title: "Hero", category: "intro", schema, variants: ["a"], defaultVariant: "b" as "a" })).toThrow(/defaultVariant/);
  });

  it("fills defaults and samples", () => {
    expect(introBlock.region).toBe("body");
    expect(introBlock.supports).toMatchObject({ anchor: true, theme: true, pageTitle: true });
    expect(introBlock.sample()).toMatchObject({ title: "Dinner, *slowly*." });
    expect(Object.isFrozen(introBlock)).toBe(true);
  });
});

describe("registry", () => {
  it("looks up, filters, extends, refuses duplicates", () => {
    expect(testRegistry.types).toEqual(["intro", "faq", "post-list"]);
    expect(testRegistry.knows("paragraph")).toBe(true);
    expect(testRegistry.has("paragraph")).toBe(false);
    expect(testRegistry.list({ category: "blog" }).map((d) => d.type)).toEqual(["post-list"]);
    expect(() => createRegistry([faqBlock, faqBlock])).toThrow(/twice/);
    expect(() => testRegistry.extend([faqBlock])).toThrow(/already/);
    expect(testRegistry.extend([faqBlock], { override: true }).types).toHaveLength(3);
  });

  it("validates whole docs strictly", () => {
    expect(VamosDocSchema.safeParse(sampleDoc).success).toBe(true);
    expect(testRegistry.docSchema().safeParse(sampleDoc).success).toBe(true);
    const bad = { ...sampleDoc, blocks: [{ id: "b_x0001", type: "faq", props: { title: "x", items: [] } }] };
    expect(testRegistry.docSchema().safeParse(bad).success).toBe(false);
    expect(BlockNodeSchema.safeParse({ id: "ab", type: "faq" }).success).toBe(false);
  });

  it("exports JSON Schema for tool definitions", () => {
    const json = testRegistry.toJSONSchema() as { $id: string; properties: Record<string, unknown> };
    expect(json.$id).toMatch(/doc-1\.json$/);
    expect(json.properties.blocks).toBeTruthy();
    expect(JSON.stringify(json)).toContain('"const":"faq"');
  });
});

describe("migrations", () => {
  it("upgrades props step by step", () => {
    const r = migrateNode({ id: "b_old001", type: "intro", v: 1, props: { heading: "Old title" } }, introBlock);
    expect(r.migrated).toBe(true);
    expect(r.node.v).toBe(2);
    expect(r.node.props).toMatchObject({ title: "Old title" });
  });
  it("never downgrades newer content", () => {
    const r = migrateNode({ id: "b_new001", type: "intro", v: 9, props: {} }, introBlock);
    expect(r).toMatchObject({ newer: true, migrated: false });
  });
  it("migrates docs, accepting the { v: 1 } alias", () => {
    const doc = migrateDoc({ v: 1, blocks: [{ id: "b_old001", type: "intro", v: 1, props: { heading: "Hi" } }] }, testRegistry);
    expect(doc.version).toBe(1);
    expect(doc.blocks[0]!.props).toMatchObject({ title: "Hi" });
  });
});

describe("validateNode", () => {
  it("salvages only broken fields", () => {
    const r = validateNode({ id: "b_faq001", type: "faq", props: { title: "Our *hours*", items: "nope" } }, faqBlock);
    expect(r.ok).toBe(true);
    expect(r.replaced).toEqual(["items"]);
    expect(r.data).toMatchObject({ title: "Our *hours*" });
    expect((r.data as { items: unknown[] }).items).toHaveLength(1);
  });
});

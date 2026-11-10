"use client";

import * as React from "react";
import { Field, TreeSelect, type TreeNode } from "@vamos-ui/react";

const categories: TreeNode[] = [
  {
    id: "electronics",
    label: "Electronics",
    children: [
      { id: "phones", label: "Phones & accessories", children: [{ id: "smartphones", label: "Smartphones" }, { id: "cases", label: "Cases & covers" }, { id: "chargers", label: "Chargers" }] },
      { id: "computers", label: "Computers", children: [{ id: "laptops", label: "Laptops" }, { id: "monitors", label: "Monitors" }] },
      { id: "audio", label: "Audio" },
    ],
  },
  {
    id: "home",
    label: "Home & kitchen",
    children: [
      { id: "coffee", label: "Coffee & tea", children: [{ id: "espresso", label: "Espresso machines" }, { id: "grinders", label: "Grinders" }] },
      { id: "textiles", label: "Home textiles" },
    ],
  },
  { id: "garden", label: "Garden & outdoor", children: [{ id: "furniture", label: "Outdoor furniture" }, { id: "bbq", label: "Barbecues" }] },
  { id: "gift-cards", label: "Gift cards" },
];

export default function TreeSelectDemo() {
  const [category, setCategory] = React.useState<string | null>("espresso");
  return (
    <div className="w-full max-w-sm">
      <Field label="Category" hint="Products appear under this category in the store menu.">
        <TreeSelect nodes={categories} value={category} onValueChange={setCategory} searchPlaceholder="Search categories…" placeholder="Choose a category" />
      </Field>
    </div>
  );
}

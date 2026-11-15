/**
 * Site recipes (data) and the engine that picks one from the interview answers. See ./types.ts
 * for the format; the JSON files live in ./data, one recipe each.
 */

import type { Recipe } from "./types";
import { RECIPE_DATA } from "./data";

export type * from "./types";
export * from "./engine";

/** Every recipe, sorted by id. */
export const RECIPES: readonly Recipe[] = [...(RECIPE_DATA as unknown as Recipe[])].sort((a, b) => a.id.localeCompare(b.id));

export const recipeById = (id: string): Recipe | undefined => RECIPES.find((r) => r.id === id);

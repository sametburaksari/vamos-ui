import { fileURLToPath } from "node:url";
import { Registry } from "../src/registry.js";

export const FIXTURE_DIR = fileURLToPath(new URL("./fixtures/r", import.meta.url));

export function fixtureRegistry(): Registry {
  return new Registry({ source: FIXTURE_DIR });
}

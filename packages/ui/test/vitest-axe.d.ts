// vitest-axe 0.1 augments the legacy global `Vi` namespace; vitest 5 reads matchers from the module.
import type { AxeMatchers } from "vitest-axe/matchers";

declare module "vitest" {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

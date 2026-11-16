import type { EstimatorInput, EstimatorValue, EstimatorValues } from "./estimator";

function initialValue(input: EstimatorInput): EstimatorValue {
  switch (input.type) {
    case "number":
      return input.defaultValue ?? input.min ?? 0;
    case "slider":
      return input.defaultValue ?? input.min;
    case "select":
    case "options":
      return input.defaultValue ?? input.options.find((o) => !o.disabled)?.value ?? "";
    case "toggle":
      return input.defaultValue ?? false;
    case "addons":
      return input.defaultValue ?? [];
  }
}

/** Default values for a set of inputs (each input's `defaultValue`, then min / first option / false / []), merged with `overrides`. */
export function estimatorDefaults(inputs: EstimatorInput[], overrides?: EstimatorValues): EstimatorValues {
  const out: EstimatorValues = {};
  for (const input of inputs) out[input.id] = initialValue(input);
  return { ...out, ...overrides };
}

/**
 * The values the formula sees: add-ons whose `when` fails are dropped, and a single choice whose
 * option is hidden falls back to the first visible one.
 */
export function effectiveEstimatorValues(inputs: EstimatorInput[], values: EstimatorValues): EstimatorValues {
  const out = { ...values };
  for (const input of inputs) {
    if (input.type === "addons") {
      const list = Array.isArray(out[input.id]) ? (out[input.id] as string[]) : [];
      out[input.id] = list.filter((v) => {
        const o = input.options.find((x) => x.value === v);
        return o && !o.disabled && (!o.when || o.when(values));
      });
    } else if (input.type === "options" || input.type === "select") {
      const visible = input.options.filter((o) => !o.when || o.when(values));
      if (!visible.some((o) => o.value === out[input.id])) out[input.id] = visible.find((o) => !o.disabled)?.value ?? "";
    }
  }
  return out;
}

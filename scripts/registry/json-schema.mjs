// @ts-check
/**
 * Tiny JSON Schema validator covering the keywords our published schemas use:
 * type, enum, const, required, properties, additionalProperties (false), items, pattern,
 * minLength. Dependency-free so the build and its tests can validate output directly.
 */

/**
 * @param {unknown} value
 * @param {Record<string, any>} schema
 * @param {string} [at] JSON pointer-ish location for messages
 * @returns {string[]} error messages (empty = valid)
 */
export function validateSchema(value, schema, at = "$") {
  /** @type {string[]} */
  const errors = [];
  const typeOf = (/** @type {unknown} */ v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v === "number" && Number.isInteger(v) ? "integer" : typeof v);
  if ("const" in schema && value !== schema.const) errors.push(`${at}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${at}: must be one of ${schema.enum.map((/** @type {unknown} */ v) => JSON.stringify(v)).join(", ")}`);
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const t = typeOf(value);
    const ok = types.some((/** @type {string} */ want) => want === t || (want === "number" && t === "integer"));
    if (!ok) {
      errors.push(`${at}: expected ${types.join(" | ")}, got ${t}`);
      return errors;
    }
  }
  if (typeof value === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) errors.push(`${at}: shorter than ${schema.minLength}`);
    if (schema.pattern && !new RegExp(schema.pattern, "u").test(value)) errors.push(`${at}: does not match ${schema.pattern}`);
  }
  if (Array.isArray(value) && schema.items) value.forEach((v, i) => errors.push(...validateSchema(v, schema.items, `${at}[${i}]`)));
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const obj = /** @type {Record<string, unknown>} */ (value);
    for (const key of schema.required ?? []) if (!(key in obj)) errors.push(`${at}: missing "${key}"`);
    const props = schema.properties ?? {};
    for (const [key, v] of Object.entries(obj)) {
      if (props[key]) errors.push(...validateSchema(v, props[key], `${at}.${key}`));
      else if (schema.additionalProperties === false) errors.push(`${at}: unknown property "${key}"`);
    }
  }
  return errors;
}

// @ts-check
/**
 * Static evaluation of TypeScript object literals — enough to read docs entries and block
 * metadata without executing them (they import React components and example modules).
 *
 * Supported: string / number / boolean / null literals, template literals (no substitutions,
 * or substitutions that are themselves static), arrays, objects, `as` / `satisfies` / parens,
 * string concatenation, local `const` identifiers and calls to known helper functions (`ex`).
 * Anything else evaluates to the UNKNOWN sentinel so callers can report it precisely.
 */
import ts from "typescript";

export const UNKNOWN = Symbol("unknown");

/**
 * @typedef {object} EvalContext
 * @property {ts.SourceFile} sourceFile
 * @property {Map<string, ts.Expression>} consts Top-level `const x = …` initialisers.
 * @property {Record<string, (args: unknown[], node: ts.CallExpression) => unknown>} calls Known helpers.
 * @property {(node: ts.Node, reason: string) => void} [onUnknown]
 */

/** @param {string} file @param {string} code */
export function parseSource(file, code) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  return ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, kind);
}

/**
 * Collects top-level `const name = <expr>` declarations (including `export const`).
 * @param {ts.SourceFile} sf
 */
export function collectConsts(sf) {
  /** @type {Map<string, ts.Expression>} */
  const consts = new Map();
  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (ts.isIdentifier(decl.name) && decl.initializer) consts.set(decl.name.text, decl.initializer);
    }
  }
  return consts;
}

/** @param {ts.Node} node @param {ts.SourceFile} sf */
export function lineOf(node, sf) {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

/**
 * @param {ts.Expression} node
 * @param {EvalContext} ctx
 * @param {Set<string>} [seen] identifiers currently being resolved (cycle guard)
 * @returns {unknown}
 */
export function evaluate(node, ctx, seen = new Set()) {
  const fail = (/** @type {string} */ reason) => {
    ctx.onUnknown?.(node, reason);
    return UNKNOWN;
  };
  if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node) || ts.isTypeAssertionExpression(node)) {
    return evaluate(node.expression, ctx, seen);
  }
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const v = evaluate(node.operand, ctx, seen);
    return typeof v === "number" ? -v : fail("unary minus on non-number");
  }
  if (ts.isTemplateExpression(node)) {
    let out = node.head.text;
    const quiet = { ...ctx, onUnknown: undefined };
    for (const span of node.templateSpans) {
      const v = evaluate(span.expression, quiet, seen);
      if (v === UNKNOWN || (typeof v !== "string" && typeof v !== "number")) return fail("dynamic template substitution");
      out += String(v) + span.literal.text;
    }
    return out;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const a = evaluate(node.left, ctx, seen);
    const b = evaluate(node.right, ctx, seen);
    if (a === UNKNOWN || b === UNKNOWN) return UNKNOWN;
    if (typeof a === "number" && typeof b === "number") return a + b;
    return String(a) + String(b);
  }
  if (ts.isArrayLiteralExpression(node)) {
    /** @type {unknown[]} */
    const out = [];
    for (const el of node.elements) {
      if (ts.isSpreadElement(el)) {
        const v = evaluate(el.expression, ctx, seen);
        if (Array.isArray(v)) out.push(...v);
        else out.push(fail("spread of non-static array"));
      } else out.push(evaluate(el, ctx, seen));
    }
    return out;
  }
  if (ts.isObjectLiteralExpression(node)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const prop of node.properties) {
      if (ts.isPropertyAssignment(prop)) {
        const key = propName(prop.name);
        if (key === undefined) {
          fail("computed property key");
          continue;
        }
        out[key] = evaluate(prop.initializer, ctx, seen);
      } else if (ts.isShorthandPropertyAssignment(prop)) {
        out[prop.name.text] = evaluate(prop.name, ctx, seen);
      } else if (ts.isSpreadAssignment(prop)) {
        const v = evaluate(prop.expression, ctx, seen);
        if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, v);
        else fail("spread of non-static object");
      } else {
        // methods / accessors: not data
        const key = prop.name ? propName(prop.name) : undefined;
        if (key) out[key] = UNKNOWN;
      }
    }
    return out;
  }
  if (ts.isIdentifier(node)) {
    if (node.text === "undefined") return undefined;
    const init = ctx.consts.get(node.text);
    if (!init || seen.has(node.text)) return fail(`identifier "${node.text}" is not a static const`);
    const next = new Set(seen).add(node.text);
    return evaluate(init, ctx, next);
  }
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const fn = ctx.calls[node.expression.text];
    if (!fn) return fail(`call to unknown function "${node.expression.text}"`);
    // Arguments that are not static (e.g. a React component) become UNKNOWN silently.
    const quiet = { ...ctx, onUnknown: undefined };
    return fn(node.arguments.map((a) => evaluate(a, quiet, seen)), node);
  }
  return fail(`unsupported expression (${ts.SyntaxKind[node.kind]})`);
}

/** @param {ts.PropertyName} name */
function propName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) return name.text;
  return undefined;
}

/**
 * Finds the object literal a module exports as default — either `export default { … }`
 * or `const x: T = { … }; export default x;`.
 * @param {ts.SourceFile} sf
 * @returns {ts.Expression | undefined}
 */
export function findDefaultExport(sf) {
  const consts = collectConsts(sf);
  for (const stmt of sf.statements) {
    if (ts.isExportAssignment(stmt) && !stmt.isExportEquals) {
      let expr = stmt.expression;
      while (ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr) || ts.isParenthesizedExpression(expr)) expr = expr.expression;
      if (ts.isIdentifier(expr)) return consts.get(expr.text);
      return expr;
    }
  }
  return undefined;
}

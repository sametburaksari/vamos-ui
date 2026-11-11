// Tap-target sizing for site blocks (WCAG 2.5.8 + touch comfort). Padding/min-size only — the
// visual stays the same on a mouse; on touch (`pointer: coarse`) primary controls grow to 44px.

/** ≥ 24×24 CSS px everywhere (WCAG 2.5.8), ≥ 44px tall on touch. For text links in lists. */
export const TAP = "inline-flex min-h-6 items-center pointer-coarse:min-h-11";
/** A square icon control: ≥ 24px everywhere, 44×44 on touch. Combine with the control's own size. */
export const TAP_ICON = "min-h-6 min-w-6 pointer-coarse:min-h-11 pointer-coarse:min-w-11";

/**
 * WCAG 2.5.3 Label in Name: an `aria-label` must contain the visible label. Returns `name` when
 * it already does (case-insensitive), else `"<visible>, <name>"`.
 */
export function nameWithLabel(visible: string | undefined, name: string): string {
  const v = visible?.trim();
  if (!v) return name;
  return name.toLocaleLowerCase().includes(v.toLocaleLowerCase()) ? name : `${v}, ${name}`;
}
